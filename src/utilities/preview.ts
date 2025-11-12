import cloudinary from "./cloudinary";

function generatePreview(uploadResult: any) {
  const { public_id, resource_type, original_filename } = uploadResult;

  if (
    resource_type === "raw" &&
    (original_filename?.endsWith(".pdf") || uploadResult.format === "pdf")
  ) {
    return cloudinary.url(public_id, {
      resource_type: "image",
      format: "png",
      page: 1,
      width: 300,
      height: 300,
      crop: "fit",
    });
  }

  if (resource_type === "video") {
    return cloudinary.url(public_id, {
      resource_type: "video",
      format: "jpg",
      width: 300,
      height: 300,
      crop: "fill",
    });
  }

 
  if (resource_type === "image") {
    return cloudinary.url(public_id, {
      width: 300,
      height: 300,
      crop: "fill",
    });
  }

  return null;
}

export default generatePreview;
