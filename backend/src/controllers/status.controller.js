import Status from "../models/status.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const uploadStatus = async (req, res) => {
  try {
    const { media } = req.body; // base64 encoded media
    const userId = req.user._id;

    if (!media) {
      return res.status(400).json({ message: "Media is required" });
    }

    // Detect media type from base64 string
    let mediaType = "image";
    if (media.includes("data:video")) {
      mediaType = "video";
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(media, {
      resource_type: "auto",
      folder: "status",
    });

    // Calculate expiry time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Delete old status if exists
    await Status.findOneAndDelete({ userId });

    // Create new status
    const newStatus = new Status({
      userId,
      mediaUrl: result.secure_url,
      mediaType,
      expiresAt,
    });

    await newStatus.save();

    res.status(201).json({
      _id: newStatus._id,
      mediaUrl: newStatus.mediaUrl,
      mediaType: newStatus.mediaType,
      createdAt: newStatus.createdAt,
      viewers: newStatus.viewers,
    });
  } catch (error) {
    console.log("Error in uploadStatus controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const status = await Status.findOne({ userId })
      .populate("viewers.userId", "fullName profilePic email")
      .lean();

    if (!status) {
      return res.status(200).json({ status: null });
    }

    res.status(200).json({ status });
  } catch (error) {
    console.log("Error in getMyStatus controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStatusByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const status = await Status.findOne({
      userId,
      expiresAt: { $gt: new Date() }, // Only get active statuses
    })
      .populate("userId", "fullName profilePic email")
      .populate("viewers.userId", "fullName profilePic email");

    if (!status) {
      return res.status(404).json({ message: "Status not found or expired" });
    }

    // Record view - only if not viewing own status
    if (userId !== currentUserId.toString()) {
      const viewerExists = status.viewers.some(
        (v) => v.userId._id.toString() === currentUserId.toString()
      );

      if (!viewerExists) {
        status.viewers.push({
          userId: currentUserId,
          viewedAt: new Date(),
        });
        await status.save();
      }
    }

    res.status(200).json(status);
  } catch (error) {
    console.log("Error in getStatusByUserId controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const status = await Status.findOneAndDelete({ userId });

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    // Delete from cloudinary
    if (status.mediaUrl) {
      try {
        // Extract public ID from URL: https://res.cloudinary.com/.../status/filename
        const urlParts = status.mediaUrl.split("/");
        const filename = urlParts[urlParts.length - 1]; // Get filename with extension
        const publicId = `status/${filename.split(".")[0]}`; // Remove extension and prepend folder
        
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "auto",
        });
      } catch (cloudinaryError) {
        console.log("Warning: Could not delete from Cloudinary:", cloudinaryError.message);
        // Don't fail the delete operation if Cloudinary deletion fails
      }
    }

    res.status(200).json({ message: "Status deleted successfully" });
  } catch (error) {
    console.log("Error in deleteStatus controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUsersWithStatus = async (req, res) => {
  try {
    // Find all statuses that haven't expired, excluding current user
    const currentUserId = req.user._id;

    const statuses = await Status.find({
      expiresAt: { $gt: new Date() },
      userId: { $ne: currentUserId },
    }).select("userId");

    const userIds = statuses.map((s) => s.userId);

    // Get unique user IDs and fetch user details
    const uniqueUserIds = [...new Set(userIds.map((id) => id.toString()))];

    const users = await User.find({ _id: { $in: uniqueUserIds } })
      .select("_id fullName profilePic email")
      .lean();

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in getUsersWithStatus controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("_id fullName email profilePic createdAt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has active status
    const hasStatus = await Status.findOne({
      userId,
      expiresAt: { $gt: new Date() },
    });

    res.status(200).json({
      ...user.toObject(),
      hasStatus: !!hasStatus,
    });
  } catch (error) {
    console.log("Error in getUserInfo controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
