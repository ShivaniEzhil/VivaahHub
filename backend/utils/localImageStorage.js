import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { BACKEND_URL } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const ensureDir = () => {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
};

const extFromMime = (mimetype) => {
  if (!mimetype) return ".jpg";
  if (mimetype.includes("png")) return ".png";
  if (mimetype.includes("jpeg") || mimetype.includes("jpg")) return ".jpg";
  if (mimetype.includes("webp")) return ".webp";
  return ".bin";
};

const writeBuffer = (buffer, mimetype, subfolder = "") => {
  ensureDir();
  const folder = subfolder ? path.join(UPLOADS_DIR, subfolder) : UPLOADS_DIR;
  if (subfolder && !fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

  const filename = `${uuidv4()}${extFromMime(mimetype)}`;
  fs.writeFileSync(path.join(folder, filename), buffer);

  const urlPath = subfolder ? `/uploads/${subfolder}/${filename}` : `/uploads/${filename}`;
  return `${BACKEND_URL}${urlPath}`;
};

const bufferFromImage = (image) => {
  if (!image) return null;
  if (Buffer.isBuffer(image.buffer)) return { buf: image.buffer, mimetype: image.mimetype };
  if (Buffer.isBuffer(image.data)) return { buf: image.data, mimetype: image.mimetype };
  if (image.tempFilePath) {
    return { buf: fs.readFileSync(image.tempFilePath), mimetype: image.mimetype };
  }
  return null;
};

export const saveBrandIconLocal = async (imageData) => {
  const parsed = bufferFromImage(imageData);
  if (!parsed?.buf) throw new Error("Invalid brand icon data");
  return writeBuffer(parsed.buf, parsed.mimetype || "image/jpeg", "brand_icons");
};

export const saveServiceImagesLocal = async (images = []) => {
  const urls = [];
  for (const image of images) {
    const parsed = bufferFromImage(image);
    if (!parsed?.buf) throw new Error(`Invalid service image: ${image?.name || "unknown"}`);
    urls.push(writeBuffer(parsed.buf, parsed.mimetype || "image/jpeg", "services"));
  }
  return urls;
};

export const saveCardImageLocal = async (image) => {
  const parsed = bufferFromImage(image);
  if (!parsed?.buf) throw new Error("Invalid card image");
  return writeBuffer(parsed.buf, parsed.mimetype || "image/jpeg", "cards");
};
