import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import {
  Menu,
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  VolumeX,
  User,
  ShieldCheck,
} from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'alert':
        return {
          bg: 'bg-red-950/30 border-red-500/20 text-red-400',
          icon: AlertTriangle,
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/30 border-amber-500/20 text-amber-400',
          icon: AlertTriangle,
        };
      case 'success':
        return {
          bg: 'bg-green-950/30 border-green-500/20 text-green-400',
          icon: CheckCircle,
        };
      default:
        return {
          bg: 'bg-slate-950/40 border-slate-800 text-sky-400',
          icon: Info,
        };
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between w-full px-6 py-4 bg-slate-950/35 backdrop-blur-md border-b border-slate-900 shadow-sm">
      {/* Left side actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-slate-400 hover:text-white lg:hidden focus:outline-none cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Farm Name Display */}
        <div>
          <h2 className="text-lg font-bold text-white font-sans hidden sm:block">
            {user?.farmName || 'BioSecure Farm Hub'}
          </h2>
          <p className="text-xs text-slate-400 hidden sm:block">
            MERN Protection Level: <span className="text-farm-500 font-semibold">Active & Secured</span>
          </p>
        </div>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-4">
        {/* Role Quick Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-semibold tracking-wide uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-farm-500" />
          <span>{user?.role === 'admin' ? 'Security Admin' : 'Field Operator'}</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 flex w-5 h-5 -mt-1.5 -mr-1.5">
                <span className="absolute inline-flex w-full h-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex items-center justify-center w-5 h-5 text-[9px] font-bold text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 w-80 sm:w-96 mt-3 origin-top-right rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl glass-panel overflow-hidden z-50">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/30">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <span>Farm Security Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] bg-red-500 text-white font-bold rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-farm-500 hover:text-farm-400 font-medium cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/40">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-slate-500">
                    <VolumeX className="w-8 h-8 text-slate-600 mb-2" />
                    <p className="text-xs">No active alerts at the moment.</p>
                    <p className="text-[10px] text-slate-600 mt-1">Shed parameters are fully stable.</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const styles = getNotificationStyles(notif.type);
                    const NotifIcon = styles.icon;
                    return (
                      <div
                        key={notif._id}
                        className={`flex gap-3 p-4 transition-all duration-200 hover:bg-slate-950/20 border-l-2 cursor-pointer ${
                          notif.read ? 'border-transparent opacity-60' : 'border-farm-500 bg-slate-900/10'
                        }`}
                        onClick={() => markAsRead(notif._id)}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${styles.bg}`}>
                          <NotifIcon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className={`text-xs font-semibold text-white truncate ${!notif.read ? 'font-bold' : ''}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[9px] text-slate-500 whitespace-nowrap">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="px-5 py-3.5 border-t border-slate-800 text-center bg-slate-950/20">
                <span className="text-[10px] text-slate-500">
                  Secured Biosecurity Telemetry Feed
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Profile details */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-center overflow-hidden transition-all group-hover:border-farm-500/40">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-slate-400 group-hover:text-white" />
            )}
          </div>
          <div className="hidden lg:block text-left">
            <h5 className="text-xs font-bold text-slate-200 group-hover:text-white truncate max-w-28 leading-none">
              {user?.name}
            </h5>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold leading-none mt-1 inline-block">
              View Profile
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
