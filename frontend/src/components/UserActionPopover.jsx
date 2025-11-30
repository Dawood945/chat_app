import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, User } from "lucide-react";

const UserActionPopover = ({ userId, hasStatus, profilePic, fullName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { onlineUsers } = useAuthStore();
  const popoverRef = useRef(null);
  
  const isOnline = onlineUsers.includes(userId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewStatus = (e) => {
    e.stopPropagation();
    navigate(`/view-status/${userId}`);
    setIsOpen(false);
  };

  const handleViewProfile = (e) => {
    e.stopPropagation();
    navigate(`/user-info/${userId}`);
    setIsOpen(false);
  };

  const togglePopover = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Profile Picture with Click Handler */}
      <div
        onClick={togglePopover}
        className={`cursor-pointer rounded-full border-2 transition-all relative ${
          hasStatus ? "border-green-500" : theme === "light" ? "border-gray-300" : "border-gray-600"
        }`}
      >
        <img
          src={profilePic || "/avatar.png"}
          alt={fullName}
          className="w-12 h-12 rounded-full object-cover"
        />
        
        {/* Online Indicator Dot */}
        {isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100" />
        )}
      </div>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className={`absolute top-full mt-2 left-0 rounded-lg shadow-lg z-50 w-48 overflow-hidden ${
            theme === "light"
              ? "bg-white border border-gray-200"
              : "bg-gray-800 border border-gray-700"
          }`}
        >
          {/* Menu Items */}
          <div className="py-2">
            {hasStatus && (
              <button
                onClick={handleViewStatus}
                className={`w-full px-4 py-2 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                  theme === "light"
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                <Eye size={16} />
                View Status
              </button>
            )}

            <button
              onClick={handleViewProfile}
              className={`w-full px-4 py-2 text-left text-sm font-medium flex items-center gap-3 transition-colors ${
                theme === "light"
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <User size={16} />
              View Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActionPopover;
