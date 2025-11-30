import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStatusStore } from "../store/useStatusStore";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { ArrowLeft, Eye, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const ViewStatus = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { authUser } = useAuthStore();
  const { getStatusByUserId, getMyStatus, deleteStatus, userStatus, isLoading } = useStatusStore();

  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      let data;
      // If viewing own status, fetch using getMyStatus
      if (userId === authUser?._id) {
        data = await getMyStatus();
      } else {
        data = await getStatusByUserId(userId);
      }
      if (data) {
        setStatus(data);
      } else {
        navigate("/");
      }
    };

    fetchStatus();
  }, [userId, getStatusByUserId, getMyStatus, authUser?._id, navigate]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        handleBack();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDeleteStatus = async () => {
    if (confirm("Are you sure you want to delete your status?")) {
      try {
        await deleteStatus();
        toast.success("Status deleted successfully");
        navigate("/");
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`w-full h-screen flex items-center justify-center ${theme === "light" ? "bg-gray-900" : "bg-black"}`}>
        <div className={`text-center ${theme === "light" ? "text-white" : "text-white"}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading status...</p>
        </div>
      </div>
    );
  }

  if (!status && !userStatus) {
    return (
      <div className={`w-full h-screen flex items-center justify-center ${theme === "light" ? "bg-gray-900" : "bg-black"}`}>
        <div className={`text-center ${theme === "light" ? "text-white" : "text-white"}`}>
          <p className="text-xl font-semibold">Status not found or expired</p>
        </div>
      </div>
    );
  }

  const displayStatus = status || userStatus;
  const isVideo = displayStatus.mediaType === "video";
  const formattedTime = new Date(displayStatus.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const formattedDate = new Date(displayStatus.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const viewerCount = displayStatus.viewers?.length || 0;

  return (
    <div className={`w-full h-screen relative overflow-hidden ${theme === "light" ? "bg-gray-900" : "bg-black"}`}>
      {/* Media Display Container */}
      <div className="w-full h-full flex items-center justify-center bg-black">
        {isVideo ? (
          <video
            src={displayStatus.mediaUrl}
            autoPlay
            controls
            controlsList="nodownload"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <img
            src={displayStatus.mediaUrl}
            alt="Status"
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Top Left Corner - User Info and View Count */}
      <div className="absolute top-6 left-6 z-20 flex items-start gap-4">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="hover:bg-white/20 p-2 rounded-full transition-colors duration-200 flex-shrink-0"
        >
          <ArrowLeft size={24} className="text-white" />
        </button>

        {/* User Info Section */}
        <div className="flex items-center gap-3">
          <img
            src={displayStatus.userId.profilePic || "/avatar.png"}
            alt={displayStatus.userId.fullName}
            className="w-12 h-12 rounded-full border-2 border-white object-cover flex-shrink-0"
          />
          <div className="text-white">
            <p className="font-semibold text-sm">{displayStatus.userId.fullName}</p>
            <p className="text-xs opacity-75">
              {formattedDate}, {formattedTime}
            </p>
          </div>
        </div>
      </div>

      {/* Top Right Corner - View Count and Delete Button */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
        {/* View Count */}
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
          <Eye size={20} className="text-white" />
          <span className="text-white font-semibold text-sm">
            {viewerCount}
          </span>
        </div>

        {/* Delete Button (only for own status) */}
        {displayStatus.userId._id === authUser?._id && (
          <button
            onClick={handleDeleteStatus}
            className="hover:bg-red-500/20 p-2 rounded-full transition-colors duration-200 flex-shrink-0"
          >
            <Trash2 size={24} className="text-red-400" />
          </button>
        )}
      </div>

      {/* Bottom Section - Viewers List (if viewing own status) */}
      {displayStatus.userId._id === authUser?._id && viewerCount > 0 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-12 pb-6 px-6">
          <div>
            <p className="text-white text-sm font-semibold mb-4">Seen by</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {displayStatus.viewers?.map((viewer) => (
                <div key={viewer.userId._id} className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={viewer.userId.profilePic || "/avatar.png"}
                      alt={viewer.userId.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium">{viewer.userId.fullName}</span>
                  </div>
                  <span className="text-gray-300 text-xs">
                    {new Date(viewer.viewedAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Navigation Hint */}
      <div className="absolute bottom-4 left-6 z-20 text-white text-xs opacity-60">
        <p>Press ESC to go back</p>
      </div>
    </div>
  );
};

export default ViewStatus;
