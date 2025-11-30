import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStatusStore } from "../store/useStatusStore";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { Upload, Loader, X, Eye, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const Status = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { theme } = useThemeStore();
  const { myStatus, isUploadingStatus, uploadStatus, getMyStatus, deleteStatus } = useStatusStore();

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getMyStatus();
  }, [getMyStatus]);

  const handleFileSelect = (file) => {
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo"];

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast.error("Only images (JPEG, PNG, GIF, WebP) and videos (MP4, MOV, AVI) are allowed");
      return;
    }

    // Validate file size
    if (ALLOWED_IMAGE_TYPES.includes(file.type) && file.size > MAX_IMAGE_SIZE) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    if (ALLOWED_VIDEO_TYPES.includes(file.type) && file.size > MAX_VIDEO_SIZE) {
      toast.error("Video size must be less than 50MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        await uploadStatus(base64);
        setSelectedFile(null);
        setPreview(null);
        await getMyStatus();
        navigate("/");
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleDeleteStatus = async () => {
    if (confirm("Are you sure you want to delete your status?")) {
      try {
        await deleteStatus();
        await getMyStatus();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleViewStatus = () => {
    navigate(`/view-status/${authUser._id}`);
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">My Status</h2>
            <p className="text-sm text-base-content/70">Upload and manage your status</p>
          </div>

          {/* Upload Section */}
          <div
            className={`p-8 rounded-lg border-2 border-dashed transition-colors ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-base-300 bg-base-100"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            {!preview ? (
              <div
                className="text-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto mb-4 text-primary" size={32} />
                <h3 className="text-lg font-semibold mb-2">Drop your photo or video here</h3>
                <p className="text-sm text-base-content/70">
                  or click to select. Max 10MB for images, 50MB for videos
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative w-full h-64 bg-base-200 rounded-lg overflow-hidden">
                  {selectedFile?.type.startsWith("image") ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <video src={preview} controls className="w-full h-full object-cover" />
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={isUploadingStatus}
                    className="btn btn-primary flex-1 disabled:opacity-50"
                  >
                    {isUploadingStatus ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Status"
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    disabled={isUploadingStatus}
                    className="btn btn-outline disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Current Status Preview */}
          {myStatus && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="card-title">Your Current Status</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleViewStatus}
                      className="btn btn-sm btn-primary"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={handleDeleteStatus}
                      className="btn btn-sm btn-error"
                    >
                      <X size={16} />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Media Preview */}
                <div className="w-full rounded-lg overflow-hidden bg-base-200 h-64">
                  {myStatus.mediaType === "image" ? (
                    <img src={myStatus.mediaUrl} alt="Status" className="w-full h-full object-cover" />
                  ) : (
                    <video
                      src={myStatus.mediaUrl}
                      controls
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* View Counter */}
                <div className="flex items-center gap-2 text-base-content/70">
                  <Eye size={18} className="text-primary" />
                  <span className="font-semibold">{myStatus.viewers?.length || 0}</span>
                  <span>{myStatus.viewers?.length === 1 ? "view" : "views"}</span>
                </div>

                {/* Viewers List */}
                {myStatus.viewers && myStatus.viewers.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-base-300">
                    <h3 className="text-sm font-semibold mb-3">Viewers</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {myStatus.viewers.map((viewer) => (
                        <div
                          key={viewer.userId._id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors"
                        >
                          <img
                            src={viewer.userId.profilePic || "/avatar.png"}
                            alt={viewer.userId.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{viewer.userId.fullName}</p>
                            <p className="text-xs text-base-content/70">
                              {new Date(viewer.viewedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Status Message */}
          {!myStatus && !isUploadingStatus && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body text-center">
                <p className="text-base-content/70">
                  You haven't uploaded a status yet. Upload one above to get started!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Status;
