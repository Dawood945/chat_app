import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useStatusStore } from "../store/useStatusStore";
import { MessageCircle, Calendar, Loader, ArrowLeft } from "lucide-react";

const UserInfoPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { authUser, onlineUsers } = useAuthStore();
  const { getUserInfo } = useStatusStore();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isOnline = onlineUsers.includes(userId);

  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      try {
        const data = await getUserInfo(userId);
        if (data) {
          setUser(data);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId, getUserInfo, navigate]);

  const handleSendMessage = () => {
    // Navigate to chat with this user
    navigate(`/?selectedUserId=${userId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-base-content/70">User not found</p>
      </div>
    );
  }

  const memberSinceDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-base-content hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Profile Card */}
        <div className="card bg-base-100 shadow-lg">
          {/* Gradient Header */}
          <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 rounded-t-lg"></div>

          <div className="card-body pt-0">
            {/* Avatar Section */}
            <div className="flex justify-center -mt-16 mb-6">
              <div className="relative">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="w-32 h-32 rounded-full border-4 border-base-100 object-cover"
                />
                {/* Online Indicator */}
                <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-base-100 ${isOnline ? "bg-success" : "bg-gray-500"}`} />
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold">{user.fullName}</h1>
              <p className="text-base-content/70 mt-1">{isOnline ? "Active now" : "Offline"}</p>
            </div>

            {/* Status Alert */}
            {user.hasStatus && (
              <div className="alert alert-info mb-6">
                <span className="text-sm">Has an active status</span>
              </div>
            )}

            {/* Information Sections */}
            <div className="space-y-4 mb-6">
              {/* Member Since */}
              <div className="bg-base-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-primary" size={20} />
                  <span className="font-semibold text-sm">Member Since</span>
                </div>
                <p className="ml-8 text-base-content/70 text-sm">{memberSinceDate}</p>
              </div>

              {/* Email */}
              <div className="bg-base-200 rounded-lg p-4">
                <p className="font-semibold text-sm mb-1">Email</p>
                <p className="text-base-content/70 text-sm">{user.email}</p>
              </div>
            </div>

            {/* Send Message Button */}
            <button
              onClick={handleSendMessage}
              className="btn btn-primary w-full gap-2"
            >
              <MessageCircle size={20} />
              Send Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoPage;
