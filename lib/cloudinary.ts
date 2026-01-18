import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  format: string
  width: number
  height: number
  bytes: number
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'wardrobe'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: fileName.replace(/\.[^/.]+$/, ''), // Remove file extension
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          reject(error)
        } else if (result) {
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
            url: result.url,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          })
        }
      }
    )
    
    uploadStream.end(fileBuffer)
  })
}

export function getCloudinaryUrl(publicId: string, options?: any): string {
  return cloudinary.url(publicId, options)
}