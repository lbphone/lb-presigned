import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import path from 'path'
import mime from 'mime'

const awsPath = path.join(GetResourcePath(GetCurrentResourceName()), '.aws')

process.env.AWS_SDK_LOAD_CONFIG = '0'
process.env.AWS_CONFIG_FILE = awsPath
process.env.AWS_SHARED_CREDENTIALS_FILE = awsPath
process.env.AWS_SDK_JS_TYPESCRIPT_DETECTION_DISABLED = 'true'

function normalizeUrl(raw: string): string {
    let url = raw.startsWith('http') ? raw : `https://${raw}`

    if (url.endsWith('/')) url = url.slice(0, -1)

    return url
}

// R2 configuration
const r2Bucket = GetConvar('LB_R2_BUCKET', '')
const r2AccountId = GetConvar('LB_R2_ACCOUNT_ID', '')
const r2AccessKeyId = GetConvar('LB_R2_ACCESS_KEY_ID', '')
const r2SecretAccessKey = GetConvar('LB_R2_SECRET_ACCESS_KEY', '')
const r2RawDomain = GetConvar('LB_R2_DOMAIN', '')

const useR2 = !!(r2Bucket && r2AccountId && r2AccessKeyId && r2SecretAccessKey && r2RawDomain)

// S3 configuration
const s3Bucket = GetConvar('LB_S3_BUCKET', '')
const s3Region = GetConvar('LB_S3_REGION', '')
const s3AccessKeyId = GetConvar('LB_S3_ACCESS_KEY_ID', '')
const s3SecretAccessKey = GetConvar('LB_S3_SECRET_ACCESS_KEY', '')
const s3RawDomain = GetConvar('LB_S3_DOMAIN', '')

const useS3 = !!(s3Bucket && s3Region && s3AccessKeyId && s3SecretAccessKey)

if (!useR2 && !useS3) {
    throw new Error(
        'LB Presigned: No storage provider configured.\n' +
            '  For R2: set LB_R2_BUCKET, LB_R2_ACCOUNT_ID, LB_R2_ACCESS_KEY_ID, LB_R2_SECRET_ACCESS_KEY, LB_R2_DOMAIN\n' +
            '  For S3: set LB_S3_BUCKET, LB_S3_REGION, LB_S3_ACCESS_KEY_ID, LB_S3_SECRET_ACCESS_KEY'
    )
}

const bucket = useR2 ? r2Bucket : s3Bucket
const domain = useR2
    ? normalizeUrl(r2RawDomain)
    : s3RawDomain
      ? normalizeUrl(s3RawDomain)
      : `https://${s3Bucket}.s3.${s3Region}.amazonaws.com`

const client = new S3Client({
    region: useR2 ? 'auto' : s3Region,
    endpoint: useR2 ? `https://${r2AccountId}.r2.cloudflarestorage.com` : undefined,
    credentials: {
        accessKeyId: useR2 ? r2AccessKeyId : s3AccessKeyId,
        secretAccessKey: useR2 ? r2SecretAccessKey : s3SecretAccessKey
    }
})

exports('GeneratePresignedUrl', async (mimeType: string) => {
    if (!mimeType || typeof mimeType !== 'string') {
        throw new Error('LB Presigned: Invalid mime type')
    }

    const extension = mime.getExtension(mimeType)

    if (!extension) {
        throw new Error(`LB Presigned: Invalid mime type: ${mimeType}`)
    }

    const fileName = `${crypto.randomUUID()}.${extension}`

    const url = await getSignedUrl(
        client,
        new PutObjectCommand({
            Bucket: bucket,
            Key: fileName,
            ContentType: mimeType
        }),
        { expiresIn: 60 }
    )

    return {
        presignedUrl: url,
        fileUrl: `${domain}/${fileName}`
    }
})
