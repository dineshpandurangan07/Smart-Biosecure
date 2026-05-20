import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  Shield,
  Activity,
  Syringe,
  Users,
  AlertTriangle,
  Flame,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  X,
  Compass,
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    // Shared Public info
    { path: '/about', label: 'Biosecurity Protocols', icon: Compass, roles: ['admin', 'farmer'] },
    
    // Dashboards
    { path: '/admin-dashboard', label: 'Admin Terminal', icon: Shield, roles: ['admin'] },
    { path: '/farmer-dashboard', label: 'Operations Hub', icon: LayoutDashboard, roles: ['admin', 'farmer'] },
    
    // Core Modules
    { path: '/animals', label: 'Livestock Tracking', icon: Activity, roles: ['admin', 'farmer'] },
    { path: '/vaccinations', label: 'Vaccines System', icon: Syringe, roles: ['admin', 'farmer'] },
    { path: '/visitors', label: 'Visitor Disinfection', icon: Users, roles: ['admin', 'farmer'] },
    { path: '/diseases', label: 'AI Disease Alerts', icon: AlertTriangle, roles: ['admin', 'farmer'] },
    { path: '/feed', label: 'Feed Inventory', icon: Flame, roles: ['admin', 'farmer'] },
    { path: '/sanitation', label: 'Sanitation Audits', icon: ClipboardList, roles: ['admin', 'farmer'] },
    { path: '/analytics', label: 'Analytics Center', icon: BarChart3, roles: ['admin', 'farmer'] },
  ];

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 h-screen transition-transform duration-300 transform bg-slate-900 border-r border-slate-800/80 shadow-2xl lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full'
        }`}
      >
        {/* Header Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-950/20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-farm-600 flex items-center justify-center shadow-glow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-tight text-white font-sans leading-none">Smart BioSecure</h1>
              <span className="text-[10px] text-farm-500 font-semibold tracking-wider uppercase">Farm Portal</span>
            </div>
          </div>
          <button onClick={toggleSidebar} className="text-slate-400 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 mx-4 my-5 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center gap-3">
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
              alt="User profile"
              className="w-11 h-11 rounded-full border border-farm-500/20 object-cover bg-slate-800"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-white truncate leading-tight">{user.name}</h4>
              <p className="text-xs text-slate-400 font-medium capitalize mt-0.5">{user.role}</p>
            </div>
          </div>
        )}

        {/* Navigation list */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
          {navItems
            .filter((item) => item.roles.includes(user?.role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => isOpen && toggleSidebar()}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${
                      isActive
                        ? 'bg-farm-600/90 text-white shadow-glow'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/20">
          <NavLink
            to="/profile"
            onClick={() => isOpen && toggleSidebar()}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group mb-1 ${
                isActive
                  ? 'bg-slate-800 text-slate-100 border border-slate-700/50'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
              }`
            }
          >
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-200" />
            <span>Profile Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/20 transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
