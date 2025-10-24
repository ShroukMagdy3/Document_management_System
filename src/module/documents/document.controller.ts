import { Router } from "express";
import { MulterCloud } from "../../middleware/multer";
import { uploadFiles } from "./document.service";
import { validationFileType } from "../../middleware/multer";
import { Authentication, tokenEnum } from "../../middleware/authentication";
import asyncHandler from "express-async-handler";


const documentRouter = Router({ mergeParams: true });


documentRouter.post(
  "/upload",
  Authentication(tokenEnum.access),
  (req, res, next) => {
    MulterCloud({
      fileTypes: [
        ...validationFileType.image,
        ...validationFileType.video,
        ...validationFileType.audio,
        ...validationFileType.file
      ]
    }).array("attachments")(req, res, (err) => {
      if (err) return next(err); 
      next();
    });
  },
  
  asyncHandler(uploadFiles)
);

export default documentRouter;
