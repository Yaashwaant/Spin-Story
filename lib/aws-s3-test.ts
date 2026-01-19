import { S3Client, HeadBucketCommand, ListBucketsCommand } from "@aws-sdk/client-s3"

// Test S3 connectivity and credentials
export async function testS3Connectivity(): Promise<{
  success: boolean
  error?: string
  details: {
    canConnect: boolean
    canListBuckets: boolean
    canAccessBucket: boolean
    bucketExists: boolean
    credentialsConfigured: boolean
    region: string
    bucket: string
  }
}> {
  const region = process.env.AWS_REGION || "ap-south-1"
  const bucket = process.env.AWS_S3_BUCKET || "wardrobe-images"
  
  console.log('=== S3 CONNECTIVITY TEST ===')
  console.log('Testing S3 connectivity with:')
  console.log('Region:', region)
  console.log('Bucket:', bucket)
  console.log('Access Key configured:', !!process.env.AWS_ACCESS_KEY_ID)
  console.log('Secret Key configured:', !!process.env.AWS_SECRET_ACCESS_KEY)

  const results = {
    canConnect: false,
    canListBuckets: false,
    canAccessBucket: false,
    bucketExists: false,
    credentialsConfigured: false,
    region,
    bucket
  }

  try {
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    })

    results.credentialsConfigured = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)

    // Test 1: Basic connectivity
    console.log('Test 1: Testing basic connectivity...')
    try {
      await s3Client.send(new ListBucketsCommand({}))
      results.canConnect = true
      results.canListBuckets = true
      console.log('✓ Can connect to S3 and list buckets')
    } catch (error) {
      console.error('✗ Failed to connect to S3:', error)
      results.canConnect = false
    }

    // Test 2: Bucket access
    if (results.canConnect) {
      console.log('Test 2: Testing bucket access...')
      try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucket }))
        results.canAccessBucket = true
        results.bucketExists = true
        console.log('✓ Can access bucket:', bucket)
      } catch (error: any) {
        console.error('✗ Failed to access bucket:', error)
        results.canAccessBucket = false
        
        if (error.name === 'NoSuchBucket') {
          results.bucketExists = false
          console.error('Bucket does not exist:', bucket)
        } else if (error.name === 'AccessDenied') {
          console.error('Access denied to bucket:', bucket)
        } else if (error.name === 'InvalidAccessKeyId') {
          console.error('Invalid AWS Access Key ID')
        } else if (error.name === 'SignatureDoesNotMatch') {
          console.error('Invalid AWS Secret Access Key')
        } else {
          console.error('Unknown bucket access error:', error.name, error.message)
        }
      }
    }

    const success = results.canConnect && results.canAccessBucket && results.bucketExists
    
    console.log('=== S3 CONNECTIVITY TEST RESULTS ===')
    console.log('Overall success:', success)
    console.log('Details:', results)

    return {
      success,
      details: results,
      error: success ? undefined : 'S3 connectivity test failed'
    }

  } catch (error: any) {
    console.error('=== S3 CONNECTIVITY TEST FAILED ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)

    return {
      success: false,
      error: `S3 connectivity test error: ${error.message}`,
      details: results
    }
  }
}

// Test function that can be called from API routes
export async function diagnoseS3Issues(): Promise<string> {
  console.log('Starting S3 diagnostics...')
  const result = await testS3Connectivity()
  
  let diagnosis = '=== S3 DIAGNOSTICS REPORT ===\n'
  diagnosis += `Overall Status: ${result.success ? '✓ PASSED' : '✗ FAILED'}\n\n`
  
  diagnosis += 'Configuration:\n'
  diagnosis += `- Region: ${result.details.region}\n`
  diagnosis += `- Bucket: ${result.details.bucket}\n`
  diagnosis += `- Credentials Configured: ${result.details.credentialsConfigured ? '✓' : '✗'}\n\n`
  
  diagnosis += 'Connectivity Tests:\n'
  diagnosis += `- Can Connect to S3: ${result.details.canConnect ? '✓' : '✗'}\n`
  diagnosis += `- Can List Buckets: ${result.details.canListBuckets ? '✓' : '✗'}\n`
  diagnosis += `- Can Access Bucket: ${result.details.canAccessBucket ? '✓' : '✗'}\n`
  diagnosis += `- Bucket Exists: ${result.details.bucketExists ? '✓' : '✗'}\n\n`
  
  if (result.error) {
    diagnosis += `Error: ${result.error}\n`
  }
  
  if (!result.success) {
    diagnosis += '\nTroubleshooting suggestions:\n'
    if (!result.details.credentialsConfigured) {
      diagnosis += '- Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables\n'
    }
    if (!result.details.canConnect) {
      diagnosis += '- Check internet connectivity and AWS region settings\n'
    }
    if (!result.details.bucketExists) {
      diagnosis += '- Create the S3 bucket or check bucket name spelling\n'
    }
    if (!result.details.canAccessBucket) {
      diagnosis += '- Check IAM permissions for the AWS credentials\n'
      diagnosis += '- Ensure the bucket policy allows access from your credentials\n'
    }
  }
  
  console.log(diagnosis)
  return diagnosis
}