import Visitor from '../models/Visitor.js';

// @desc    Get all visitor logs
// @route   GET /api/visitors
// @access  Private
export const getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find({})
      .populate('approvedBy', 'name role')
      .sort({ entryTime: -1 });
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Log a new visitor entry
// @route   POST /api/visitors
// @access  Private
export const createVisitor = async (req, res) => {
  const { fullName, purpose, vehicleNumber, disinfectionStatus, contactNumber, allowedAccess } = req.body;

  try {
    const visitor = await Visitor.create({
      fullName,
      purpose,
      vehicleNumber: vehicleNumber || '',
      disinfectionStatus: disinfectionStatus === true,
      contactNumber,
      allowedAccess: allowedAccess === true,
      approvedBy: allowedAccess === true ? req.user._id : null,
      entryTime: new Date(),
    });

    res.status(201).json(visitor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Record visitor exit time
// @route   PUT /api/visitors/:id/exit
// @access  Private
export const checkoutVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (visitor) {
      if (visitor.exitTime) {
        return res.status(400).json({ message: 'Visitor has already checked out' });
      }

      visitor.exitTime = new Date();
      const updatedVisitor = await visitor.save();
      res.json(updatedVisitor);
    } else {
      res.status(404).json({ message: 'Visitor record not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Approve/Deny visitor access and disinfection
// @route   PUT /api/visitors/:id/approve
// @access  Private
export const approveVisitor = async (req, res) => {
  const { disinfectionStatus, allowedAccess } = req.body;

  try {
    const visitor = await Visitor.findById(req.params.id);

    if (visitor) {
      visitor.disinfectionStatus = disinfectionStatus !== undefined ? disinfectionStatus : visitor.disinfectionStatus;
      visitor.allowedAccess = allowedAccess !== undefined ? allowedAccess : visitor.allowedAccess;
      
      if (visitor.allowedAccess) {
        visitor.approvedBy = req.user._id;
      } else {
        visitor.approvedBy = null;
      }

      const updatedVisitor = await visitor.save();
      res.json(updatedVisitor);
    } else {
      res.status(404).json({ message: 'Visitor record not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete visitor log
// @route   DELETE /api/visitors/:id
// @access  Private/Admin Only
export const deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (visitor) {
      await visitor.deleteOne();
      res.json({ message: 'Visitor record deleted successfully' });
    } else {
      res.status(404).json({ message: 'Visitor record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
