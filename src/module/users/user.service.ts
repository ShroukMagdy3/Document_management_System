import { Request, Response, NextFunction } from "express";
import User, { RoleEnum } from "../../DB/models/users.model";
import { AppError } from "../../utilities/classError";
import { Compare, generateOtp, Hash } from "../../utilities/hash";
import eventEmitter from "../../utilities/events";
import {
  confirmEmailSchemaType,
  signInSchemaType,
  signUpSchemaType,
} from "./user.validation";
import { generateToken } from "../../utilities/token";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "../../utilities/cloudinary";
import { RevokeTokenModel } from "../../DB/models/revokeToken.model";
import { workspaceModel } from "../../DB/models/workspace.model";

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userName, email, password, phone, nid }: signUpSchemaType = req.body;
  const user = await User.findOne({ where: { email: email } });
  if (user) {
    throw new AppError("this user already exists You can signIn");
  }
  const otp = await generateOtp();
  const hashOtp = await Hash(String(otp), Number(process.env.SALT_ROUNDS));
  const hashPass = await Hash(password, Number(process.env.SALT_ROUNDS));
  eventEmitter.emit("confirmEmail", { email, otp, userName });
  const addUser = await User.create({
    userName,
    email,
    password: hashPass,
    phone,
    nid,
    otp: hashOtp,
  });

  const workspace = await workspaceModel.create ({
    name:"My Workspace",
    userNID: nid
  })

  return res.status(201).json({ message: "Created", addUser , workspace });

};

export const confirmEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, otp }: confirmEmailSchemaType = req.body;
  const user = await User.findOne({
    where: { email: email, confirmed: false },
  });

  if (!user) {
    throw new AppError("email not exist or already confirmed !");
  }
  if (!(await Compare(otp, user?.otp))) {
    throw new AppError("Invalid otp");
  }
  await User.update({ confirmed: true }, { where: { email } });

  return res.status(200).json({ message: "Confirmed" });
};
export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password }: signInSchemaType = req.body;
  const user = await User.findOne({ where: { email: email, confirmed: true } });

  if (!user) {
    throw new AppError("email not exist you must signUp first");
  }
  if (!(await Compare(password, user?.password))) {
    throw new AppError("wrong password");
  }
  const jwtId = uuidv4();
  const accessToken = await generateToken({
    payload: { id: user.id, email },
    signature:
      user.role == RoleEnum.user
        ? process.env.SIGNATURE_access_USER!
        : process.env.SIGNATURE_access_ADMIN!,
    options: {
      expiresIn: "1d",
      jwtid: jwtId,
    },
  });
  const refresh_token = await generateToken({
    payload: { id: user.id, email },
    signature:
      user.role == RoleEnum.admin
        ? process.env.SIGNATURE_REFRESH_ADMIN!
        : process.env.SIGNATURE_REFRESH_USER!,
    options: { expiresIn: "1y", jwtid: jwtId },
  });

  return res
    .status(200)
    .json({ message: "success", tokens: { accessToken, refresh_token }  });
};

export const uploadProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findOne({ where: { nid: req.user.nid } });
  if (!user) throw new AppError("This user does not exist");
  if (!req.file) throw new AppError("No file uploaded", 400);

  if (user.image) {
    await cloudinary.uploader.destroy(user.image, {
      resource_type: "image",
    });
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: `keeply/profileImages/${user.id}`,
  });

  await User.update(
    {
      image: result.public_id,
    },
    { where: { nid: user.nid } }
  );

  const updatedUser = await User.findOne({ where: { nid: req.user.nid } });

  return res.status(200).json({
    message: "Profile updated successfully",
    user: updatedUser,
  });
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await User.findOne({ where: { nid: req.user.nid } });
  if (!user) {
    throw new AppError("This user does not exist", 404);
  }

  const parsedUser = {
    ...user.toJSON(),
    image: user.image
      ? `https://res.cloudinary.com/dcnhiaaxu/image/upload/v1762340954/${user.image} `
      : null,
  };

  return res.status(200).json({
    message: "success",
    user: parsedUser,
  });
};
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await RevokeTokenModel.create({
    token: req?.decode?.jti!,
    expiredAt: new Date(req?.decode?.exp! * 1000),
  });
  return res.status(200).json({ message: "Logged out!" });
};
