import { S3 } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const S3_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_KEY;
export const AWS_S3_ENDPOINT = process.env.AWS_S3_ENDPOINT;

export const S3_BUCKET = process.env.AWS_S3_BUCKET;
export const s3Client = new S3({
  region: S3_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});
