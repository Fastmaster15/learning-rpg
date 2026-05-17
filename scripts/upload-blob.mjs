import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { put } from "@vercel/blob";

const CONTENT_TYPES = {
  ".webp": "image/webp",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav"
};

function printUsage() {
  console.error("Usage: npm run upload:blob -- <local-file-path> <blob-path>");
}

function inferContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const [localFilePath, blobPath] = process.argv.slice(2);

  if (!token) {
    console.error("Error: BLOB_READ_WRITE_TOKEN is not set.");
    printUsage();
    process.exit(1);
  }

  if (!localFilePath || !blobPath) {
    console.error("Error: missing required arguments.");
    printUsage();
    process.exit(1);
  }

  if (!existsSync(localFilePath)) {
    console.error(`Error: local file not found: ${localFilePath}`);
    process.exit(1);
  }

  const fileBuffer = await readFile(localFilePath);
  const contentType = inferContentType(localFilePath);

  try {
    const result = await put(blobPath, fileBuffer, {
      access: "public",
      token,
      contentType
    });

    console.log("Uploaded to Vercel Blob");
    console.log(`- local file: ${localFilePath}`);
    console.log(`- pathname: ${result.pathname}`);
    console.log(`- url: ${result.url}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: upload failed: ${message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exit(1);
});
