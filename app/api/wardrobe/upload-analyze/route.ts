import { NextRequest, NextResponse } from "next/server"
import { generateS3UploadUrl } from "@/lib/aws-s3"

export async function POST(request: NextRequest) {
  try {
    const { fileType, customerId, fileName } = await request.json()

    console.log('Upload-analyze request:', { fileType, customerId, fileName })

    if (!fileType || !customerId) {
      return NextResponse.json({ 
        error: "File type and customer ID are required" 
      }, { status: 400 })
    }

    // Generate S3 upload URL
    console.log('=== SERVER DEBUG: Generating S3 upload URL ===')
    let uploadUrl, publicUrl, key
    try {
      const s3Result = await generateS3UploadUrl(fileType, customerId, fileName)
      uploadUrl = s3Result.uploadUrl
      publicUrl = s3Result.publicUrl
      key = s3Result.key
      console.log('=== SERVER DEBUG: S3 URLs generated successfully ===')
    } catch (s3Error) {
      console.error('=== SERVER DEBUG: S3 URL generation failed ===')
      console.error('S3 Error type:', s3Error?.constructor?.name)
      console.error('S3 Error message:', s3Error instanceof Error ? s3Error.message : s3Error)
      console.error('S3 Error stack:', s3Error instanceof Error ? s3Error.stack : 'No stack trace')
      throw s3Error
    }

    return NextResponse.json({ 
      success: true,
      uploadUrl,
      publicUrl,
      fileName: key,
      message: "Upload URL generated successfully. After uploading, call /api/ai/analyze-image to analyze the clothing."
    })

  } catch (error) {
    console.error('=== SERVER DEBUG: Caught error in upload-analyze route ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Request body:', { fileType: 'from request', customerId: 'from request', fileName: 'from request' })
    console.error('Environment check:', {
      hasAwsAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasAwsSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      awsRegion: process.env.AWS_REGION,
      awsBucket: process.env.AWS_S3_BUCKET
    })
    
    return NextResponse.json({ 
      error: "Failed to generate upload URL",
      details: error instanceof Error ? error.message : "Unknown error",
      type: error instanceof Error ? error.constructor.name : typeof error,
      debug: {
        hasAwsAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
        hasAwsSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
        awsRegion: process.env.AWS_REGION,
        awsBucket: process.env.AWS_S3_BUCKET
      }
    }, { status: 500 })
  }
}