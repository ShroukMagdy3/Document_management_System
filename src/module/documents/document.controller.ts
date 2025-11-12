import { Router } from "express";
import {
  cycleBin,
  deleteDoc,
  downloadPdf,
  freezeDoc,
  getAllDoc,
  openPdf,
  search,
  sortDesc,
  unfreezeDoc,
  updateDoc,
  uploadAudio,
  uploadImage,
  uploadPdf,
  uploadVideo,
} from "./document.service";
import { Authentication, tokenEnum } from "../../middleware/authentication";
import asyncHandler from "express-async-handler";
import {
  MulterCloud,
  MulterCloud2,
  MulterCloudMemory,
  validationFileType,
} from "../../middleware/multer";
import { freezeSchema } from "./document.validation";
import { validation } from "../../middleware/validation";
const documentRouter = Router();

documentRouter.post(
  "/uploadPdf",
  Authentication(tokenEnum.access),
  MulterCloud2().single("attachment"),
  uploadPdf
);

documentRouter.get(
  "/openPdf/:id",
  openPdf
);

documentRouter.get(
  "/downloadPdf/:id",
  downloadPdf
);




documentRouter.post(
  "/uploadImage",
  Authentication(tokenEnum.access),
  MulterCloud2().single("attachment"),
  uploadImage
);

documentRouter.post(
  "/uploadVideo",
  Authentication(tokenEnum.access),
  MulterCloud2().single("attachment"),
  uploadVideo
);

documentRouter.post(
  "/uploadAudio",
  Authentication(tokenEnum.access),
  MulterCloud2().single("attachment"),
  uploadAudio
);

documentRouter.get("/getAll", Authentication(tokenEnum.access), getAllDoc);

documentRouter.patch(
  "/update/:docId",
  Authentication(tokenEnum.access),
  validation({ params: freezeSchema }),
  updateDoc
);
documentRouter.delete(
  "/delete/:docId",
  Authentication(tokenEnum.access),
  validation({ params: freezeSchema }),
  deleteDoc
);

documentRouter.patch(
  "/freeze/:docId",
  Authentication(tokenEnum.access),
  validation({ params: freezeSchema }),
  freezeDoc
);
documentRouter.patch(
  "/unfreeze/:docId",
  Authentication(tokenEnum.access),
  validation({ params: freezeSchema }),
  unfreezeDoc
);
documentRouter.get("/cycleBin", Authentication(tokenEnum.access), cycleBin);

documentRouter.get("/sort", Authentication(tokenEnum.access), sortDesc);
documentRouter.get("/search", Authentication(tokenEnum.access), search);



export default documentRouter;
