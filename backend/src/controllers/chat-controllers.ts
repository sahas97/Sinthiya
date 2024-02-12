import { Request, Response, NextFunction } from "express";
import User from "../models/user.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateChatCompletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_SECRET);
  const { message } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const user = await User.findById(res.locals.jwtData.id);
    if (!user)
      return res
        .status(401)
        .json({ message: "User not registered OR Token malfunctioned" });

    //garb chat of user
    const chats = user.chats.map(({ role, parts }) => ({
      role,
      parts,
    }));

    //send all chats with new one to geminai
    const chat = model.startChat({
      history: chats,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    // const text = response.candidates[0].content.parts[0].text;
    console.log(text);

    // push new massage to the chat array
    chats.push({ parts: message, role: "user" });
    // //save new arry to user doc
    user.chats.push({ role: "user", parts: message });

    const chatObj = {
      role: "model",
      parts: text,
    };
    user.chats.push(chatObj);
    await user.save();
    return res.status(200).json({
      chats: user.chats,
    });
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      message: "Something went wrong.",
    });
  }
};

export const sendChatsToUser = async (
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
      .json({ message: "OK", chats: user.chats });
  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};

export const deleteChats = async (
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
    
    // remove all chats objects from the user chats array
    //@ts-ignore
    user.chats = [];
    const results = await user.save();
    if(results){
      return res
      .status(200)
      .json({ message: "OK",});
    }

  } catch (error) {
    console.log(error);
    return res.status(200).json({ message: "ERROR", cause: error.message });
  }
};
