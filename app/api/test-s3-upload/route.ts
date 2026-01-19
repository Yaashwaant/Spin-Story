import { NextRequest, NextResponse } from "next/server"
import { generateS3UploadUrl } from "@/lib/aws-s3"

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST S3 UPLOAD: Starting test ===')
    
    const { fileType = 'image/jpeg', testFileName = 'test-image.jpg' } = await request.json()
    const customerId = 'test-customer'
    
    console.log('Test parameters:', { fileType, testFileName, customerId })
    
    // Step 1: Generate upload URL
    console.log('Step 1: Generating S3 upload URL...')
    let uploadUrl, publicUrl, key
    
    try {
      const s3Result = await generateS3UploadUrl(fileType, customerId, testFileName)
      uploadUrl = s3Result.uploadUrl
      publicUrl = s3Result.publicUrl
      key = s3Result.key
      console.log('✓ S3 upload URL generated successfully')
    } catch (error) {
      console.error('✗ Failed to generate S3 upload URL')
      throw error
    }
    
    // Step 2: Test the upload URL with a small test file
    console.log('Step 2: Testing upload with sample data...')
    
    // Create a small test image (1x1 pixel JPEG)
    const testImageData = new Uint8Array([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19,
      0x12, 0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27,
      0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F,
      0x27, 0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00,
      0x01, 0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xFF, 0xC4, 0x00,
      0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C, 0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00,
      0xA0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0xFF, 0xD9
    ])
    
    const testBlob = new Blob([testImageData], { type: fileType })
    
    console.log('Step 3: Attempting S3 upload...')
    console.log('Upload URL:', uploadUrl)
    console.log('File size:', testBlob.size, 'bytes')
    console.log('Content-Type:', fileType)
    
    let uploadResponse
    try {
      uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': fileType,
        },
        body: testBlob,
      })
      
      console.log('=== UPLOAD RESPONSE ===')
      console.log('Status:', uploadResponse.status)
      console.log('Status Text:', uploadResponse.statusText)
      console.log('Headers:', Object.fromEntries(uploadResponse.headers.entries()))
      console.log('URL:', uploadResponse.url)
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('=== UPLOAD ERROR ===')
        console.error('Error body:', errorText)
        console.error('Error status:', uploadResponse.status)
        
        return NextResponse.json({
          success: false,
          error: 'S3 upload failed',
          details: {
            status: uploadResponse.status,
            statusText: uploadResponse.statusText,
            errorBody: errorText,
            url: uploadResponse.url
          }
        }, { status: 400 })
      }
      
      console.log('✓ S3 upload successful!')
      
      return NextResponse.json({
        success: true,
        message: 'S3 upload test completed successfully',
        details: {
          uploadUrl,
          publicUrl,
          key,
          uploadStatus: uploadResponse.status,
          uploadStatusText: uploadResponse.statusText,
          fileSize: testBlob.size,
          fileType
        }
      })
      
    } catch (error: any) {
      console.error('=== UPLOAD EXCEPTION ===')
      console.error('Error type:', error?.constructor?.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      if (error.name === 'TypeError') {
        console.error('This appears to be a network/CORS error')
      }
      
      return NextResponse.json({
        success: false,
        error: 'S3 upload exception',
        details: {
          errorType: error?.constructor?.name,
          errorMessage: error.message,
          uploadUrl,
          isTypeError: error.name === 'TypeError'
        }
      }, { status: 500 })
    }
    
  } catch (error: any) {
    console.error('=== TEST FAILED ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: {
        errorType: error?.constructor?.name,
        errorMessage: error.message
      }
    }, { status: 500 })
  }
}