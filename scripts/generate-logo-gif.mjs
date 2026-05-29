import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const width = 192;
const height = 192;
const frameCount = 20;
const outputPath = resolve("public/logos/edenverse-logo-lightning.gif");

const palette = Array.from({ length: 256 }, () => [0, 0, 0]);
const colors = [
  "#020409",
  "#060912",
  "#0b1420",
  "#132232",
  "#25364a",
  "#4f6678",
  "#8aa0aa",
  "#102d43",
  "#165a7b",
  "#22a9d7",
  "#58d9ff",
  "#c8f7ff",
  "#fff4bc",
  "#705525",
  "#b18a3b",
  "#f1cf78",
  "#2b160e",
  "#7d2e18",
  "#e66d2c",
  "#0e0610"
];

colors.forEach((hex, index) => {
  palette[index] = [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16)
  ];
});

function at(x, y) {
  return y * width + x;
}

function put(pixels, x, y, color) {
  if (x >= 0 && x < width && y >= 0 && y < height) {
    pixels[at(x | 0, y | 0)] = color;
  }
}

function fillRect(pixels, x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      put(pixels, xx, yy, color);
    }
  }
}

function line(pixels, x0, y0, x1, y1, color, thickness = 1) {
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;

  while (true) {
    for (let oy = -Math.floor(thickness / 2); oy <= Math.floor(thickness / 2); oy += 1) {
      for (let ox = -Math.floor(thickness / 2); ox <= Math.floor(thickness / 2); ox += 1) {
        put(pixels, x0 + ox, y0 + oy, color);
      }
    }

    if (x0 === x1 && y0 === y1) {
      break;
    }

    const e2 = err * 2;
    if (e2 >= dy) {
      err += dy;
      x0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y0 += sy;
    }
  }
}

function inDoor(x, y) {
  if (x < 44 || x > 148 || y < 26 || y > 164) {
    return false;
  }

  if (y > 70) {
    return true;
  }

  const dx = (x - 96) / 52;
  const dy = (y - 70) / 48;
  return dx * dx + dy * dy <= 1;
}

function glow(pixels, cx, cy, rx, ry, strength) {
  for (let y = Math.max(0, cy - ry); y <= Math.min(height - 1, cy + ry); y += 1) {
    for (let x = Math.max(0, cx - rx); x <= Math.min(width - 1, cx + rx); x += 1) {
      const d = Math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2);

      if (d > 1) {
        continue;
      }

      const value = (1 - d) * strength;
      if (value > 0.62) {
        put(pixels, x, y, 11);
      } else if (value > 0.44) {
        put(pixels, x, y, 10);
      } else if (value > 0.26 && pixels[at(x, y)] < 8) {
        put(pixels, x, y, 9);
      } else if (value > 0.14 && pixels[at(x, y)] < 4) {
        put(pixels, x, y, 7);
      }
    }
  }
}

function doorPanel(pixels, x0, x1, frame) {
  for (let y = 62; y <= 164; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      if (!inDoor(x, y)) {
        continue;
      }
      const grain = (x * 19 + y * 13 + frame * 5) % 37;
      put(pixels, x, y, grain < 5 ? 4 : grain < 15 ? 3 : 2);
    }
  }

  line(pixels, x0, 70, x0, 164, 14, 2);
  line(pixels, x1, 70, x1, 164, 14, 2);
  line(pixels, x0 + 6, 98, x1 - 6, 98, 13);
  line(pixels, x0 + 6, 127, x1 - 6, 127, 13);
}

function drawLetters(pixels) {
  fillRect(pixels, 66, 121, 5, 31, 15);
  fillRect(pixels, 66, 121, 24, 4, 15);
  fillRect(pixels, 66, 135, 19, 4, 15);
  fillRect(pixels, 66, 148, 25, 4, 15);
  line(pixels, 100, 121, 113, 152, 15, 4);
  line(pixels, 133, 121, 113, 152, 15, 4);
  line(pixels, 100, 121, 113, 152, 10);
  line(pixels, 133, 121, 113, 152, 10);
}

function drawLightning(pixels, frame, open) {
  if (!(frame % 5 === 2 || frame % 9 === 4 || open > 0.92)) {
    return;
  }

  const shift = frame % 2 ? 6 : -5;
  const points = [
    [96 + shift, 16],
    [87 + shift, 48],
    [103 + shift, 50],
    [91 + shift, 88],
    [111 + shift, 84],
    [96 + shift, 132]
  ];

  for (let index = 0; index < points.length - 1; index += 1) {
    const [x0, y0] = points[index];
    const [x1, y1] = points[index + 1];
    line(pixels, x0, y0, x1, y1, 11, 3);
    line(pixels, x0, y0, x1, y1, 12);
  }
}

function makeFrame(frame) {
  const pixels = new Uint8Array(width * height);
  const open = Math.sin((Math.PI * frame) / (frameCount - 1));

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const vignette = Math.sqrt(((x - 96) / 116) ** 2 + ((y - 96) / 116) ** 2);
      const noise = (x * 17 + y * 31 + frame * 7) % 61;
      put(pixels, x, y, vignette > 0.98 ? 0 : noise < 4 ? 3 : noise < 11 ? 2 : 1);
    }
  }

  glow(pixels, 96, 82, Math.round(58 + open * 34), 98, 0.45 + open * 0.72);

  for (let y = 26; y <= 164; y += 1) {
    for (let x = 44; x <= 148; x += 1) {
      if (inDoor(x, y)) {
        put(pixels, x, y, x < 49 || x > 143 || y > 158 ? 14 : 4);
      }
    }
  }

  const gap = Math.round(8 + open * 60);
  const leftEnd = 96 - Math.floor(gap / 2);
  const rightStart = 96 + Math.floor(gap / 2);

  for (let y = 34; y <= 164; y += 1) {
    for (let x = leftEnd; x <= rightStart; x += 1) {
      if (!inDoor(x, y)) {
        continue;
      }
      const center = Math.abs(x - 96) / Math.max(1, gap / 2);
      put(pixels, x, y, center < 0.25 ? 11 : center < 0.55 ? 10 : 9);
    }
  }

  for (let ray = -2; ray <= 2; ray += 1) {
    line(pixels, 96, 70, 96 + ray * Math.round(12 + open * 16), 10, open > 0.45 ? 10 : 8);
    line(pixels, 96, 88, 96 + ray * Math.round(18 + open * 16), 176, open > 0.45 ? 9 : 7);
  }

  doorPanel(pixels, 48, leftEnd, frame);
  doorPanel(pixels, rightStart, 144, frame);

  line(pixels, 44, 72, 44, 166, 15, 2);
  line(pixels, 148, 72, 148, 166, 15, 2);
  line(pixels, 52, 50, 96, 20, 15, 2);
  line(pixels, 140, 50, 96, 20, 15, 2);
  fillRect(pixels, 38, 165, 116, 5, 15);
  fillRect(pixels, 30, 173, 132, 7, 13);

  drawLetters(pixels);
  drawLightning(pixels, frame, open);

  return pixels;
}

function writeSubBlocks(data) {
  const blocks = [];
  for (let offset = 0; offset < data.length; offset += 255) {
    const chunk = data.slice(offset, offset + 255);
    blocks.push(Buffer.from([chunk.length]), Buffer.from(chunk));
  }
  blocks.push(Buffer.from([0]));
  return Buffer.concat(blocks);
}

function lzwLiteralEncode(indices) {
  const minCodeSize = 8;
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  const codeSize = minCodeSize + 1;
  let bitBuffer = 0;
  let bitCount = 0;
  let sinceClear = 0;
  const bytes = [];

  function output(code) {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      bytes.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  }

  output(clearCode);

  for (const colorIndex of indices) {
    if (sinceClear >= 240) {
      output(clearCode);
      sinceClear = 0;
    }
    output(colorIndex);
    sinceClear += 1;
  }

  output(endCode);

  if (bitCount > 0) {
    bytes.push(bitBuffer & 0xff);
  }

  return Buffer.from(bytes);
}

function u16(value) {
  return Buffer.from([value & 0xff, (value >> 8) & 0xff]);
}

const chunks = [
  Buffer.from("GIF89a", "ascii"),
  u16(width),
  u16(height),
  Buffer.from([0xf7, 0x00, 0x00]),
  Buffer.from(palette.flat()),
  Buffer.from([0x21, 0xff, 0x0b]),
  Buffer.from("NETSCAPE2.0", "ascii"),
  Buffer.from([0x03, 0x01, 0x00, 0x00, 0x00])
];

for (let frame = 0; frame < frameCount; frame += 1) {
  chunks.push(
    Buffer.from([0x21, 0xf9, 0x04, 0x04]),
    u16(6),
    Buffer.from([0x00, 0x00]),
    Buffer.from([0x2c]),
    u16(0),
    u16(0),
    u16(width),
    u16(height),
    Buffer.from([0x00, 0x08]),
    writeSubBlocks(lzwLiteralEncode(makeFrame(frame)))
  );
}

chunks.push(Buffer.from([0x3b]));

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, Buffer.concat(chunks));
console.log(`Generated ${outputPath}`);
