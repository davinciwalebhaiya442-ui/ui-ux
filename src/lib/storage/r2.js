import { S3Client, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const configured = Boolean(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
);

const client = configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    })
  : null;

export async function createSignedDownloadUrl(key, expiresIn = 600, fileName = null) {
  if (!client) throw new Error('R2 is not configured');
  const commandInput = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  };
  if (fileName) {
    const cleanFileName = String(fileName).replace(/["\r\n]/g, '_');
    commandInput.ResponseContentDisposition = `attachment; filename="${cleanFileName}"`;
  } else {
    commandInput.ResponseContentDisposition = 'attachment';
  }
  return getSignedUrl(client, new GetObjectCommand(commandInput), { expiresIn });
}
 
export async function createSignedUploadUrl(key, contentType, expiresIn = 900) {
  if (!client) throw new Error('R2 is not configured');
  const commandInput = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
  };
  if (contentType) {
    commandInput.ContentType = contentType;
  }
  return getSignedUrl(client, new PutObjectCommand(commandInput), { expiresIn });
}

export async function getAssetObject(key) {
  if (!client) throw new Error('R2 is not configured');
  return client.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
}

export async function uploadAsset({ key, body, contentType }) {
  if (!client) throw new Error('R2 is not configured');
  return client.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, Body: body, ContentType: contentType }));
}

export async function deleteAsset(key) {
  if (!client) throw new Error('R2 is not configured');
  return client.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }));
}
