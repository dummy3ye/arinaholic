import { describe, expect, it } from "vitest";
import { parseImageSize, readLocalImageSize } from "./image-size";

function png(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer);
  buffer.write("PNG", 1, "ascii");
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

function jpeg(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(14);
  Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x09, 0x08]).copy(buffer);
  buffer.writeUInt16BE(height, 7);
  buffer.writeUInt16BE(width, 9);
  return buffer;
}

function webp(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(30);
  buffer.write("RIFF", 0, "ascii");
  buffer.write("WEBP", 8, "ascii");
  buffer.write("VP8X", 12, "ascii");
  buffer.writeUIntLE(width - 1, 24, 3);
  buffer.writeUIntLE(height - 1, 27, 3);
  return buffer;
}

function gif(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(10);
  buffer.write("GIF89a", 0, "ascii");
  buffer.writeUInt16LE(width, 6);
  buffer.writeUInt16LE(height, 8);
  return buffer;
}

function avif(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(28);
  buffer.write("ftyp", 4, "ascii");
  buffer.write("ispe", 12, "ascii");
  buffer.writeUInt32BE(width, 20);
  buffer.writeUInt32BE(height, 24);
  return buffer;
}

describe("image size", () => {
  it("reads dimensions from common image headers", () => {
    expect(parseImageSize(png(120, 150))).toEqual({ width: 120, height: 150 });
    expect(parseImageSize(jpeg(32, 16))).toEqual({ width: 32, height: 16 });
    expect(parseImageSize(webp(640, 480))).toEqual({ width: 640, height: 480 });
    expect(parseImageSize(gif(20, 10))).toEqual({ width: 20, height: 10 });
    expect(parseImageSize(avif(384, 216))).toEqual({ width: 384, height: 216 });
  });

  it("returns null for unknown or invalid data", () => {
    expect(parseImageSize(Buffer.from("not an image"))).toBeNull();
    expect(parseImageSize(Buffer.alloc(0))).toBeNull();
  });

  it("reads local images from public", () => {
    expect(readLocalImageSize("/og-image.png")).toEqual({
      width: 1200,
      height: 630,
    });
  });

  it("ignores remote and escaping paths", () => {
    expect(readLocalImageSize("//example.com/cover.png")).toBeNull();
    expect(readLocalImageSize("https://example.com/cover.png")).toBeNull();
    expect(readLocalImageSize("/../../etc/passwd")).toBeNull();
  });
});
