import { Router } from "express";
import { MulterCloud } from "../../middleware/multer";
import { downloadFile, uploadFiles } from "./document.service";
import { validationFileType } from "../../middleware/multer";
import { Authentication, tokenEnum } from "../../middleware/authentication";
import asyncHandler from "express-async-handler";
import { validation } from "../../middleware/validation";
import {
  downloadSchema,
  fileSchema,
  uploadFileSchema,
} from "./document.validation";

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
        ...validationFileType.file,
      ],
    }).array("attachments")(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },

  asyncHandler(uploadFiles)
);

documentRouter.get(
  "/download/:DocumentId/:fileId",
  Authentication(tokenEnum.access),
  validation({ params: downloadSchema }),
  downloadFile
);

export default documentRouter;
