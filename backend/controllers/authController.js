import { User } from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../mailtrap/emails.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    //check data from client
    if (!email || !password || !name) {
      throw new Error("All fields are required!");
    }
    //check for already registered user
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists!" });
    }

    //hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    //6 digit verification code
    const verificationToken = Math.floor(
      10000 + Math.random() * 900000
    ).toString();

    //create new user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, //24 hours in ms
    });

    await user.save();

    //jwt token auth
    generateTokenAndSetCookie(res, user._id);

    //send verification email with verification token
    await sendVerificationEmail(user.email, verificationToken);

    return res.status(201).json({
      success: true,
      message: "user created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in signup function", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() }, //check if its expired
    });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid code or code expired!" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    //after verification code send welcome email
    await sendWelcomeEmail(user.email, user.name);
    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log("error in verifyEmail function", error);
    return res
      .status(400)
      .json({ success: false, message: "Invalid code or code expired!" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("email & pwd : ", email, "+", password);
    const user = await User.findOne({ email });
    // console.log("User : ", user);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }
    //check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      // console.log("isPasswordValid : ", isPasswordValid);
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials!",
      });
    }
    // console.log("isPasswordValid : ", isPasswordValid);
    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in login function", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  // res.send("logout route");
  res.clearCookie("token");
  console.log("logged out successfully!");
  return res.status(200).json({
    success: true,
    message: "Logged out successfully!",
  });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found!");
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }
    if (user) {
      //generate reset token
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetTokenExpiry = Date.now() + 1 * 60 * 60 * 1000; //1 hour

      user.resetPasswordToken = resetToken;
      user.resetPasswordExpiresAt = resetTokenExpiry;

      await user.save();

      await sendPasswordResetEmail(
        user.email,
        `${process.env.CLIENT_URL}/reset-password/${resetToken}`
      );
      return res.status(200).json({
        success: true,
        message: "Password Reset Link send!",
      });
    }
  } catch (error) {
    console.log("Error in forgot password : ", error.message);
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    // console.log(" toooken : ", token);
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      console.log("Invalid Token!");
      return res
        .status(400)
        .json({ success: false, message: "Invalid Token!" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();

    await sendResetSuccessEmail(user.email);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    console.log("Error in reset password: ", error.message);
    return res.status(401).json({
      success: false,
      message: "Password change Unsuccessful!",
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("error in check auth");
  }
};
