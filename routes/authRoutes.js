import express from 'express';
import { login, currentUser, logout, portfolioProfile, updateProfileImage } from '../controllers/authController.js';
import WrapAsync from '../middleware/WrapAsync.js';
import { verifyAuth } from '../middleware/verifyAuth.js';
import uploads from '../middlewares/multer.js';

const router = express.Router();
router.post('/login', WrapAsync(login));
router.get("/portfolio-profile", WrapAsync(portfolioProfile))
router.get("/me", verifyAuth, WrapAsync(currentUser))
router.patch("/profile-image", verifyAuth, uploads.single("image"), WrapAsync(updateProfileImage))
router.post("/logout", verifyAuth, WrapAsync(logout));
export default router;
