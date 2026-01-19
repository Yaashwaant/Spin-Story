import { NextRequest, NextResponse } from "next/server"
import { diagnoseS3Issues } from "@/lib/aws-s3-test"

export async function GET(request: NextRequest) {
  try {
    console.log('=== S3 DIAGNOSTIC ENDPOINT: Starting diagnostics ===')
    
    const diagnosis = await diagnoseS3Issues()
    
    return NextResponse.json({
      success: true,
      diagnosis,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('=== S3 DIAGNOSTIC ENDPOINT: Error ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json({
      success: false,
      error: 'Failed to run S3 diagnostics',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : typeof error
    }, { status: 500 })
  }
}