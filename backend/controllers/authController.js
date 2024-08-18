import { User } from "../models/userModel.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../mailtrap/emails.js";

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

    res.status(201).json({
      success: true,
      message: "user created successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};
export const login = async (req, res) => {
  res.send("login route");
};
export const logout = async (req, res) => {
  res.send("logout route");
};
