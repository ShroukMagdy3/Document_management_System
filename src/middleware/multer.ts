import { NextFunction, Response, Request } from "express";
import multer, { FileFilterCallback, StorageEngine } from "multer";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { AppError } from "../utilities/classError";
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
    }
  });
  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    if (!fileTypes || fileTypes.includes(file.mimetype)) {
      // console.log("file type valid:", file.mimetype);
      cb(null, true);
    } else {
      // console.log("invalid file type:", file.mimetype);
      cb(new AppError("Invalid file type", 400));
    }
  };

  return multer({ storage, fileFilter });
};
