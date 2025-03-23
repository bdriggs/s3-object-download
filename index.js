import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import "dotenv/config";
import fs from "node:fs";

import {
  S3Client,
  ListObjectsV2Command,
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

  const input = {
    Bucket: process.env.S3_BUCKET_NAME,
  };
  const command = new ListObjectsV2Command(input);
  const response = await s3Client.send(command);
  const path = process.env.OUTPUT_PATH;

  for (const item of response.Contents) {
    if (!fs.existsSync(`${path}/${item.Key}`)) {
      const obj = await s3Client.send(
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: item.Key,
        })
      );
    }

    if (item.Size === 0) {
      if (!fs.existsSync(`${path}/${item.Key}`)) {
        fs.mkdirSync(`${path}/${item.Key}`);
      }
    } else {
      writeFileSync(
        `${path}/${item.Key}`,
        await obj.Body.transformToByteArray()
      );
    }
  }
  console.log("Files downloaded successfully.\n");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
