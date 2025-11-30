import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useStatusStore = create((set, get) => ({
  // State
  myStatus: null,
  userStatus: null,
  usersWithStatus: [],
  isLoading: false,
  isUploadingStatus: false,

  // Upload status
  uploadStatus: async (media) => {
    set({ isUploadingStatus: true });
    try {
      const res = await axiosInstance.post("/status/upload", { media });
      set({ myStatus: res.data });
      toast.success("Status uploaded successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to upload status");
      throw error;
    } finally {
      set({ isUploadingStatus: false });
    }
  },

  // Get my status
  getMyStatus: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/status/my-status");
      set({ myStatus: res.data.status });
      return res.data.status;
    } catch (error) {
      console.log("Error fetching my status:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Get status by user ID (also records the view)
  getStatusByUserId: async (userId) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(`/status/${userId}`);
      set({ userStatus: res.data });
      return res.data;
    } catch (error) {
      console.log("Error fetching status:", error);
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  // Delete status
  deleteStatus: async () => {
    try {
      await axiosInstance.delete("/status");
      set({ myStatus: null });
      toast.success("Status deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete status");
      throw error;
    }
  },

  // Get all users with active statuses
  getUsersWithStatus: async () => {
    try {
      const res = await axiosInstance.get("/status/users-with-status");
      set({ usersWithStatus: res.data });
      return res.data;
    } catch (error) {
      console.log("Error fetching users with status:", error);
    }
  },

  // Get user info (includes hasStatus flag)
  getUserInfo: async (userId) => {
    try {
      const res = await axiosInstance.get(`/status/user-info/${userId}`);
      return res.data;
    } catch (error) {
      console.log("Error fetching user info:", error);
      return null;
    }
  },
}));
