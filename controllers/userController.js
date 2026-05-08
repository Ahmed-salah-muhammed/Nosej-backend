import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select(
      "-password -passwordResetToken -passwordResetExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const {
      firstName,
      lastName,
      phone,
      profilePhoto,
      dateOfBirth,
      gender,
      address,
      preferences,
    } = req.body;

    // Prevent updating sensitive fields
    const updateData = {
      firstName,
      lastName,
      phone,
      profilePhoto,
      dateOfBirth,
      gender,
      address,
      preferences,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -passwordResetToken -passwordResetExpires");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, passwordConfirm } = req.body;

    if (!currentPassword || !newPassword || !passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: "Please provide all password fields",
      });
    }

    if (newPassword !== passwordConfirm) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordCorrect = await user.correctPassword(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please provide your password to delete account",
      });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordCorrect = await user.correctPassword(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
