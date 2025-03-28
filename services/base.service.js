import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3_BUCKET, s3Client } from "../config/s3_connection.js";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

class BaseService {
  getPreSignedUrl = async (urlData) => {
    const { filename, Expires = 3600, ContentType } = urlData;
    const uniqueKey = `${Date.now()}-${filename}`;
    try {
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: uniqueKey,
        ContentType,
        ACL: "public-read",
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: Expires,
      });

      return signedUrl;
    } catch (error) {
      console.error("Error generating pre-signed URL:", error);
      throw error;
    }
  };

  static deleteObjectByUrl = async (url) => {
    try {
      if (!url?.startsWith("https://" + S3_BUCKET)) {
        console.log("Object Not from s3 : ", url);
        return;
      }
      const urlParts = new URL(url);
      const key = urlParts.pathname.substring(1);

      const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      });

      await s3Client.send(command);
      console.log("Object deleted successfully:", key);
      return { message: "Object deleted successfully", key };
    } catch (error) {
      console.error("Error deleting object:", error);
      throw error;
    }
  };
}

export default BaseService;
