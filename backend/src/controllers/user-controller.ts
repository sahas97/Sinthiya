import { Request, Response, NextFunction } from "express";
import { compare, hash } from "bcrypt";
import User from "../models/user.js";
import { createToken } from "../utils/token-manager.js";
import { COOKIE_NAME } from "../utils/constants.js";

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      message: "All Users",
      users: users,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "ERROR",
      cause: error.message,
    });
  }
};

export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password } = req.body;
    // check weather the user alredy exist
    const existUser = await User.findOne({ email });
    if (existUser) return res.status(401).send("User alredy registered.");
    const hsPassword = await hash(password, 16);
    const user = new User({
      name,
      email,
      password: hsPassword,
    });
    await user.save();

    //clear cookie
    res.clearCookie(COOKIE_NAME, {
      path: "/",
      domain: "localhost",
      httpOnly: true,
      signed: true,
    });

    //create a new token
    const token = createToken(user._id.toString(), user.email, "7d");
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    // add token inside the cookie
    //when deploying this the domain should be your domain
    res.cookie(COOKIE_NAME, token, {
      path: "/",
      domain: "localhost",
      expires,
      httpOnly: true,
      signed: true,
    });

    return res.status(201).json({
      message: "user signup successfully.",
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "ERROR",
      cause: error.message,
    });
  }
};

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    //check wetahr the user is alredy authenticated
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send("User not registered.");
    }

    //check the password
    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) return res.status(403).send("Incorrect password.");

    //clear cookie
    res.clearCookie(COOKIE_NAME, {
      path: "/",
      domain: "localhost",
      httpOnly: true,
      signed: true,
    });

    //create a new token
    const token = createToken(user._id.toString(), user.email, "7d");
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    // add token inside the cookie
    //when deploying this the domain should be your domain
    res.cookie(COOKIE_NAME, token, {
      path: "/",
      domain: "localhost",
      expires,
      httpOnly: true,
      signed: true,
    });

    res.status(200).json({
      message: "Login  Successfully.",
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      message: "ERROR",
      cause: error.message,
    });
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
    return res
      .status(200)
      .json({ message: "OK", name: user.name, email: user.email });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const userLogout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //user token check
    const user = await User.findById(res.locals.jwtData.id);
    if (!user) {
      return res.status(401).send("User not registered OR Token malfunctioned");
    }
    if (user._id.toString() !== res.locals.jwtData.id) {
      return res.status(401).send("Permissions didn't match");
    }
      //clear cookie
      res.clearCookie(COOKIE_NAME, {
        path: "/",
        domain: "localhost",
        httpOnly: true,
        signed: true,
      });
  
    return res
      .status(200)
      .json({ message: "OK", });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
