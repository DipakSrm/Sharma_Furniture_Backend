import cloudinary from "./cloudinary.js";

export const uploadToCloudinary = async (filepath) => {
  if (!filepath) return "";
  console.log("File to upload is", filepath);
  const options = {
    use_filename: true,
    unique_filename: false,
   

    resource_type: "auto", // Automatically detect the resource type (image, video, etc.)
    folder: "Home/Sharma_Furnitures/Products", // Specify the folder in Cloudinary where the file will be uploaded
    overwrite: true,
  };
  try {
 
    const result = await cloudinary.uploader.upload(filepath, options);
    console.log(result);
    return result.secure_url;
  } catch (error) {
    console.error("error in cloudsinarty", error);
    throw error;
  }
};

