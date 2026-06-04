import { v2 as cloudinary } from "cloudinary"
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from "../config/env.js"
import { saveBrandIconLocal, saveServiceImagesLocal, saveCardImageLocal } from "./localImageStorage.js"

const cloudinaryConfigured = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET
)

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  timeout: 60000
})

if (!cloudinaryConfigured) {
  console.warn("[storage] Cloudinary not configured — using local backend/uploads/ for image storage")
}

export const uploadBrandIcon = async (imageData) => {
  if (!imageData || !imageData.buffer) {
    throw new Error("No image data provided")
  }

  const maxSize = 250 * 1024
  if (imageData.buffer.length > maxSize) {
    throw new Error("Image size must be less than 250KB")
  }

  const allowedFormats = ["image/jpeg", "image/jpg", "image/png"]
  if (!allowedFormats.includes(imageData.mimetype)) {
    throw new Error("Image must be in JPEG, JPG, or PNG format")
  }

  if (!cloudinaryConfigured) {
    return saveBrandIconLocal(imageData)
  }

  try {
    const base64Image = `data:${imageData.mimetype};base64,${imageData.buffer.toString("base64")}`
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "vivaahhub/brand_icons",
      resource_type: "image",
    })
    return result.secure_url
  } catch (error) {
    console.warn("[storage] Cloudinary upload failed, saving brand icon locally:", error.message)
    return saveBrandIconLocal(imageData)
  }
}

export const uploadServiceImages = async (images) => {
  const maxSize = 500 * 1024
  const allowedFormats = ["image/jpeg", "image/jpg", "image/png"]

  for (const image of images) {
    if (image.size > maxSize) throw new Error(`Image ${image.name} exceeds the maximum size of 500KB`)
    if (!allowedFormats.includes(image.mimetype)) {
      throw new Error(`Image ${image.name} must be in JPEG, JPG, or PNG format`)
    }
  }

  if (!cloudinaryConfigured) {
    return saveServiceImagesLocal(images)
  }

  try {
    const results = await Promise.all(
      images.map((image) => {
        const base64Image = `data:${image.mimetype};base64,${image.data.toString("base64")}`
        return cloudinary.uploader.upload(base64Image, {
          folder: "vivaahhub/services",
          resource_type: "image",
        })
      })
    )
    return results.map((result) => result.secure_url)
  } catch (error) {
    console.warn("[storage] Cloudinary upload failed, saving service images locally:", error.message)
    return saveServiceImagesLocal(images)
  }
}

export const uploadCardImage = async (image) => {
  if (!cloudinaryConfigured) {
    return saveCardImageLocal(image)
  }

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    attempts++;
    try {
      const maxSize = 5 * 1024 * 1024 // 5MB
      const allowedFormats = ["image/jpeg", "image/jpg", "image/png"]

      // Check if image is a valid object
      if (!image || typeof image !== "object") {
        throw new Error("Invalid image object")
      }

      // Get image size safely
      let imageSize = 0;
      if (image.size !== undefined) {
        imageSize = image.size;
      } else if (image.buffer) {
        imageSize = image.buffer.length;
      } else if (image.data) {
        imageSize = image.data.length;
      }

      // Check file size
      if (imageSize > maxSize) {
        throw new Error("Image exceeds the maximum size of 5MB")
      }

      // Get mimetype safely
      let mimetype = null;
      if (image.mimetype) {
        mimetype = image.mimetype;
      } else if (image.originalname) {
        // Try to determine from filename if available
        const ext = image.originalname.split('.').pop().toLowerCase();
        if (ext === 'jpg' || ext === 'jpeg') mimetype = 'image/jpeg';
        else if (ext === 'png') mimetype = 'image/png';
      }

      // Check file format if mimetype is available
      if (mimetype && !allowedFormats.includes(mimetype)) {
        throw new Error("Image must be in JPEG, JPG, or PNG format")
      }

      let base64Image;

      // If image is a file from express-fileupload
      if (image.data && Buffer.isBuffer(image.data)) {
        base64Image = `data:${mimetype || 'image/png'};base64,${image.data.toString("base64")}`
      }
      // If image is a file from multer
      else if (image.buffer && Buffer.isBuffer(image.buffer)) {
        base64Image = `data:${mimetype || 'image/png'};base64,${image.buffer.toString("base64")}`
      }
      // If image is a temp file path
      else if (image.tempFilePath) {
        const fs = await import("fs")
        const data = fs.readFileSync(image.tempFilePath)
        base64Image = `data:${mimetype || 'image/png'};base64,${data.toString("base64")}`
      } 
      // Try to handle if it's a blob or file object from frontend
      else if (image instanceof Blob || image instanceof File) {
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64Image = `data:${image.type || 'image/png'};base64,${buffer.toString("base64")}`;
      } 
      else {
        throw new Error("Unsupported image format or structure")
      }

      // Upload to cloudinary with timeout and chunked upload for large files
      console.log(`Cloudinary upload attempt ${attempts}`);
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "vivaahhub/cards",
        resource_type: "image",
        timeout: 120000, // 2 minute timeout 
        chunk_size: 6000000, // Use chunked upload for large files
      })

      return result.secure_url
    } catch (error) {
      console.error(`Cloudinary upload attempt ${attempts} failed:`, error)
      
      // If we've exhausted retries, fall back to local storage
      if (attempts >= MAX_RETRIES) {
        console.warn("[storage] Cloudinary upload failed after retries, saving card image locally:", error.message)
        try {
          return await saveCardImageLocal(image)
        } catch (localErr) {
          throw new Error(localErr.message || "Failed to upload card image")
        }
      }

      // If it's a timeout error, wait and retry
      if (error.http_code === 499 || error.error?.http_code === 499 ||
          error.message?.includes('timeout') || error.error?.message?.includes('timeout')) {
        console.log(`Upload timed out. Retrying in ${RETRY_DELAY/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.warn("[storage] Cloudinary upload failed, saving card image locally:", error.message)
        try {
          return await saveCardImageLocal(image)
        } catch (localErr) {
          throw new Error(localErr.message || "Failed to upload card image")
        }
      }
    }
  }
}

