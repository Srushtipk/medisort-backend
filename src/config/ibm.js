// src/config/ibm.js

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import 'dotenv/config';

export const ibmCOS = new S3Client({
  region: process.env.IBM_REGION,
  endpoint: `https://${process.env.IBM_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.IBM_API_KEY_ID,
    secretAccessKey: process.env.IBM_SECRET_KEY,
  },
});

export const uploadToIBM = async (buffer, mimeType) => {
  const Bucket = process.env.IBM_BUCKET;
  const Key = `uploads/${Date.now()}-${randomUUID()}`;

  const command = new PutObjectCommand({
    Bucket,
    Key,
    Body: buffer,
    ContentType: mimeType,
  });

  await ibmCOS.send(command);

  // This is the corrected line to build the public URL
  return `https://${Bucket}.s3.${process.env.IBM_REGION}.cloud-object-storage.appdomain.cloud/${Key}`;
};