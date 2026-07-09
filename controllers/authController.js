import ExpressError from '../middleware/ExpressError.js';
import User from '../models/userSchema.js';
import jwt from 'jsonwebtoken';
import { userSchemaValidate } from "../schemaValidation/userSchemaValidate.js"
import cloudinary from "../middlewares/cloudinary.js";

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "uploads" }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });

    stream.end(buffer);
  });

// Generate JWT
const generateToken = (user) => jwt.sign({ id: user?._id, roles: user?.roles, name: user?.name }, process.env.JWT_SECRET, { expiresIn: '1d' });
const isProd = process.env.NODE_ENV === 'production';
// Login user
export const login = async (req, res, next) => {
    const { error, value } = userSchemaValidate.validate(req.body, { abortEarly: false, stripUnknown: true })
    if (error) return next(new ExpressError(400, error.details[0].message))
    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) return next(new ExpressError(401, "User not found"));
    // console.log("found user",user)

    // const isMatch = await user.matchPassword(password);
    // console.log(isMatch)
    // if (!isMatch) return next(new ExpressError(401, "Invalid password"));
    const token = generateToken(user);
    res.cookie('cookie', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
    }).status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || "",
    });
};
export const currentUser = async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user) return next(new ExpressError(401, "Unauthorized"));
    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || "",
    });
}
export const portfolioProfile = async (req, res) => {
    const user = await User.findOne({}, { name: 1, email: 1, profileImage: 1 }).sort({ createdAt: 1 });
    res.status(200).json({
        profileImage: user?.profileImage || "",
        name: user?.name || "",
        email: user?.email || "",
    });
}
export const updateProfileImage = async (req, res, next) => {
    if (!req.file) return next(new ExpressError(400, "Please upload an image"));
    const uploadedImage = await uploadToCloudinary(req.file.buffer);
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileImage: uploadedImage?.secure_url || "" },
        { new: true }
    );

    if (!user) return next(new ExpressError(401, "Unauthorized"));

    res.status(200).json({
        message: "Profile image updated successfully",
        profileImage: user.profileImage || "",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage || "",
        },
    });
}
export const logout = async (req, res, next) => {
    res.clearCookie('cookie', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
    })
    res.status(200).json({ message: "Logged out successfully" });
}
