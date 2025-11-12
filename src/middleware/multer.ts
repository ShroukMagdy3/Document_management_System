import { NextFunction, Response, Request } from "express";
import multer, { FileFilterCallback, StorageEngine } from "multer";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../utilities/classError";
import cloudinary from "../utilities/cloudinary";
import streamifier from "streamifier";

export const validationFileType = {
  image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/mpeg", "video/ogg", "video/webm"],
  audio: [
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/mp4",
    "audio/webm",
    "audio/aac",
  ],
  file: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};

export const MulterCloud = ({ fileTypes }: { fileTypes?: string[] }) => {
  const storage = multer.diskStorage({
    destination: os.tmpdir(),
    filename(req: Request, file: Express.Multer.File, cb) {
      cb(null, `${uuidv4()}-${file.originalname}`);
    },
  });
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (!fileTypes || fileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("Invalid file type", 400));
    }
  };

  return multer({ storage, fileFilter });
};

export const MulterCloud2 = () => {
  const storage = multer.diskStorage({
    destination: os.tmpdir(),
    filename(req, file, cb) {
      cb(null, `${uuidv4()}-${file.originalname}`);
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    cb(null, true);
  };

  return multer({ storage, fileFilter });
};

export const MulterCloudMemory = () => {
  return multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
  });
};
