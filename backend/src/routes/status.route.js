import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  uploadStatus,
  getMyStatus,
  getStatusByUserId,
  deleteStatus,
  getUsersWithStatus,
  getUserInfo,
} from "../controllers/status.controller.js";

const router = express.Router();

router.post("/upload", protectRoute, uploadStatus);
router.get("/my-status", protectRoute, getMyStatus);
router.get("/users-with-status", protectRoute, getUsersWithStatus);
router.get("/user-info/:userId", protectRoute, getUserInfo);
router.get("/:userId", protectRoute, getStatusByUserId);
router.delete("/", protectRoute, deleteStatus);

export default router;
