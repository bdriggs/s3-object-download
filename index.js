export const downloadFilesFromBucket = async ({ bucketName }) => {
    const { Contents } = await s3Client.send(
      new ListObjectsCommand({ Bucket: bucketName }),
    );
    const path = await prompter.input({
      message: "Enter destination path for files:",
    });
  
    for (const content of Contents) {
      const obj = await s3Client.send(
        new GetObjectCommand({ Bucket: bucketName, Key: content.Key }),
      );
      writeFileSync(
        `${path}/${content.Key}`,
        await obj.Body.transformToByteArray(),
      );
    }
    console.log("Files downloaded successfully.\n");
  };
  