import { Router } from "express";
import {
  cycleBin,
  deleteDoc,
  downloadDoc,
  freezeDoc,
  getAllDoc,
  openDoc,
  search,
  sortDesc,
  unfreezeDoc,
  updateDoc,
  createFolder,
  uploadFile,
  uploadFolder,
  listContents,
  moveDoc,
} from "./document.service";
import { Authentication, tokenEnum } from "../../middleware/authentication";
import { MulterCloud2, MulterFolderUpload } from "../../middleware/multer";
import { freezeSchema, createFolderSchema, moveSchema } from "./document.validation";
import { validation } from "../../middleware/validation";
import { catchAsync } from "../../utilities/catchAsync";

const documentRouter = Router();

documentRouter.post("/createFolder", Authentication(tokenEnum.access), validation({ body: createFolderSchema }), catchAsync(createFolder));

documentRouter.post(
  "/uploadFile",
  Authentication(tokenEnum.access),
  MulterCloud2().single("file"),
  catchAsync(uploadFile)
);

documentRouter.post(
  "/uploadFolder",
  Authentication(tokenEnum.access),
  MulterFolderUpload().array("files", 2000),
  catchAsync(uploadFolder)
);


documentRouter.get(
  "/list",
  Authentication(tokenEnum.access),
  catchAsync(listContents)
);

// Move a file or folder (and its whole subtree) under a different parent folder
documentRouter.patch(
  "/move/:docId",
  Authentication(tokenEnum.access),
  validation({ params: freezeSchema, body: moveSchema }),
  catchAsync(moveDoc)
);

documentRouter.get(
  "/open/:docId",
  Authentication(tokenEnum.access),
  validation({ params: freezeSchema }),
  catchAsync(openDoc)
);

// Force-download a document with its original filename (any file type).
documentRouter.get(
  "/download/:docId",
  Authentication(tokenEnum.access),
  validation({ params: freezeSchema }),
  catchAsync(downloadDoc)
);

documentRouter.get("/getAll", Authentication(tokenEnum.access), catchAsync(getAllDoc));

documentRouter.patch(
  "/update/:docId",
  Authentication(tokenEnum.access),
  validation({ params: freezeSchema }),
  catchAsync(updateDoc)
);
documentRouter.delete(
  "/delete/:docId",
  Authentication(tokenEnum.access),
  validation({ params: freezeSchema }),
  catchAsync(deleteDoc)
);

documentRouter.patch(
  "/freeze/:docId",
  Authentication(tokenEnum.access),
  validation({ params: freezeSchema }),
  catchAsync(freezeDoc)
);
documentRouter.patch(
  "/unfreeze/:docId",
  Authentication(tokenEnum.access),
  validation({ params: freezeSchema }),
  catchAsync(unfreezeDoc) 
);
documentRouter.get("/cycleBin", Authentication(tokenEnum.access), catchAsync(cycleBin));
documentRouter.get("/sort", Authentication(tokenEnum.access), catchAsync(sortDesc));
documentRouter.get("/search", Authentication(tokenEnum.access), catchAsync(search));



export default documentRouter;