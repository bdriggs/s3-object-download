import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import "dotenv/config";
import fs from "node:fs";

import {
  S3Client,
  ListObjectsCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

export async function main() {
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const { Contents } = await s3Client.send(
    new ListObjectsCommand({ Bucket: process.env.S3_BUCKET_NAME })
  );
  const path = process.env.OUTPUT_PATH;

  for (const content of Contents) {
    const obj = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: content.Key,
      })
    );

    if (content.Size === 0) {
      if (!fs.existsSync(`${path}/${content.Key}`)) {
        fs.mkdirSync(`${path}/${content.Key}`);
      }
    } else {
      writeFileSync(
        `${path}/${content.Key}`,
        await obj.Body.transformToByteArray()
      );
    }
  }
  console.log("Files downloaded successfully.\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
