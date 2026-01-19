import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuid } from "uuid"

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

// S3 bucket name - ensure we use the environment variable
const BUCKET_NAME = process.env.AWS_S3_BUCKET || "wardrobe-images"

console.log('=== S3 DEBUG: Bucket configuration ===')
console.log('AWS_S3_BUCKET env var:', process.env.AWS_S3_BUCKET)
console.log('Final BUCKET_NAME:', BUCKET_NAME)

export interface S3UploadResult {
  uploadUrl: string
  publicUrl: string
  key: string
}

export async function generateS3UploadUrl(
  fileType: string,
  customerId: string,
  fileName: string
): Promise<S3UploadResult> {
  try {
    console.log('=== S3 DEBUG: Starting upload URL generation ===')
    console.log('S3 Config:', {
      bucket: BUCKET_NAME,
      region: process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    })
    console.log('Request params:', { fileType, customerId, fileName })
    
    // Generate unique key for S3
    const extension = fileType.split('/')[1] || 'jpg'
    const key = `wardrobe/${customerId}/${uuid()}.${extension}`
    
    console.log('Generated S3 key:', key)
    
    // Create presigned URL for upload
    console.log('Creating PutObjectCommand...')
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    })
    
    console.log('Generating presigned URL...')
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 hour
    
    // Generate public URL for accessing the image
    const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${key}`
    
    console.log('=== S3 DEBUG: Successfully generated URLs ===')
    console.log('Upload URL:', uploadUrl)
    console.log('Public URL:', publicUrl)
    
    return {
      uploadUrl,
      publicUrl,
      key,
    }
  } catch (error) {
    console.error('=== S3 DEBUG: Error generating upload URL ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('AWS Config:', {
      bucket: BUCKET_NAME,
      region: process.env.AWS_REGION,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    })
    throw new Error(`Failed to generate S3 upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function getS3ObjectUrl(key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
  } catch (error) {
    console.error('S3 object URL generation error:', error)
    throw new Error(`Failed to generate S3 object URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}