import FeedManagement from '../models/FeedManagement.js';

// @desc    Get all feed logs
// @route   GET /api/feed
// @access  Private
export const getFeeds = async (req, res) => {
  try {
    const feeds = await FeedManagement.find({}).sort({ deliveryDate: -1 });
    res.json(feeds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record a new feed batch
// @route   POST /api/feed
// @access  Private
export const createFeed = async (req, res) => {
  const { feedType, species, quantityKg, batchNumber, deliveryDate, qualityCheck, storageTemp, notes } = req.body;

  try {
    const feed = await FeedManagement.create({
      feedType,
      species,
      quantityKg: Number(quantityKg),
      batchNumber,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
      qualityCheck: qualityCheck !== undefined ? qualityCheck : true,
      storageTemp: storageTemp !== undefined ? Number(storageTemp) : 20,
      notes: notes || '',
    });

    res.status(201).json(feed);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a feed record
// @route   DELETE /api/feed/:id
// @access  Private/Admin Only
export const deleteFeed = async (req, res) => {
  try {
    const feed = await FeedManagement.findById(req.params.id);
    if (feed) {
      await feed.deleteOne();
      res.json({ message: 'Feed record deleted successfully' });
    } else {
      res.status(404).json({ message: 'Feed record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
