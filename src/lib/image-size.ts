import fs from "node:fs";
import path from "node:path";

export type ImageSize = { width: number; height: number };

const PUBLIC_DIR = path.join(process.cwd(), "public");

function checked(size: ImageSize | null): ImageSize | null {
  if (!size) return null;
  if (!Number.isInteger(size.width) || !Number.isInteger(size.height)) {
    return null;
  }
  if (size.width <= 0 || size.height <= 0) return null;
  return size;
}

function parsePng(buffer: Buffer): ImageSize | null {
  if (
    buffer.length < 24 ||
    buffer[0] !== 0x89 ||
    buffer.toString("ascii", 1, 4) !== "PNG" ||
    buffer[4] !== 0x0d ||
    buffer[5] !== 0x0a ||
    buffer[6] !== 0x1a ||
    buffer[7] !== 0x0a
  ) {
    return null;
  }
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function parseJpeg(buffer: Buffer): ImageSize | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    while (buffer[offset] === 0xff) offset += 1;
    const marker = buffer[offset];
    offset += 1;

    if (
      marker === 0xd8 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) break;
    if (offset + 2 > buffer.length) return null;

    const length = buffer.readUInt16BE(offset);
    if (length < 2 || offset + length > buffer.length) return null;

    const isStartOfFrame =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);

    if (isStartOfFrame && offset + 7 <= buffer.length) {
      return {
        width: buffer.readUInt16BE(offset + 5),
        height: buffer.readUInt16BE(offset + 3),
      };
    }
    offset += length;
  }
  return null;
}

function parseWebp(buffer: Buffer): ImageSize | null {
  if (
    buffer.length < 16 ||
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP"
  ) {
    return null;
  }

  const chunk = buffer.toString("ascii", 12, 16);
  if (chunk === "VP8X" && buffer.length >= 30) {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }
  if (chunk === "VP8 " && buffer.length >= 30) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L" && buffer.length >= 25 && buffer[20] === 0x2f) {
    const b0 = buffer[21];
    const b1 = buffer[22];
    const b2 = buffer[23];
    const b3 = buffer[24];
    return {
      width: 1 + (b0 | ((b1 & 0x3f) << 8)),
      height: 1 + (((b1 & 0xc0) >> 6) | (b2 << 2) | ((b3 & 0x0f) << 10)),
    };
  }
  return null;
}

function parseGif(buffer: Buffer): ImageSize | null {
  const signature = buffer.toString("ascii", 0, 6);
  if (
    (signature !== "GIF87a" && signature !== "GIF89a") ||
    buffer.length < 10
  ) {
    return null;
  }
  return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
}

function parseAvif(buffer: Buffer): ImageSize | null {
  if (buffer.length < 12 || buffer.toString("ascii", 4, 8) !== "ftyp") {
    return null;
  }
  const ispe = buffer.indexOf("ispe");
  if (ispe === -1 || ispe + 16 > buffer.length) return null;
  return {
    width: buffer.readUInt32BE(ispe + 8),
    height: buffer.readUInt32BE(ispe + 12),
  };
}

export function parseImageSize(buffer: Buffer): ImageSize | null {
  return checked(
    parsePng(buffer) ??
      parseJpeg(buffer) ??
      parseWebp(buffer) ??
      parseGif(buffer) ??
      parseAvif(buffer),
  );
}

export function readLocalImageSize(src: string): ImageSize | null {
  if (!src.startsWith("/") || src.startsWith("//")) return null;

  const filePath = path.resolve(PUBLIC_DIR, `.${src}`);
  if (
    filePath !== PUBLIC_DIR &&
    !filePath.startsWith(`${PUBLIC_DIR}${path.sep}`)
  ) {
    return null;
  }

  try {
    return parseImageSize(fs.readFileSync(filePath));
  } catch {
    return null;
  }
}
