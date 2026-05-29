import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const OUT = 256;
const SCALE = 3;
const SIZE = OUT * SCALE;
const FRAME_COUNT = 42;
const OUTPUT_PATH = resolve("public/logos/edenverse-logo-lightning.gif");

const customPalette = [
  "#01030a",
  "#030712",
  "#07101d",
  "#0d1a2a",
  "#14263a",
  "#21364d",
  "#304a63",
  "#4c6678",
  "#7893a0",
  "#0a263c",
  "#0d3f5d",
  "#106287",
  "#1591c0",
  "#28c8f4",
  "#70e5ff",
  "#c9f8ff",
  "#f4feff",
  "#24130c",
  "#4e2a14",
  "#76501f",
  "#9f7934",
  "#c9a857",
  "#f0d68a",
  "#fff0b5",
  "#fff8df",
  "#3a140f",
  "#7a2717",
  "#c34d22",
  "#ff9b43",
  "#120816",
  "#201025",
  "#331936",
  "#0b0b0f",
  "#17171f",
  "#292934",
  "#4b4b5a",
  "#ffffff"
];

function hexToRgb(hex) {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16)
  ];
}

function buildPalette() {
  const seen = new Set();
  const colors = [];

  for (const color of customPalette.map(hexToRgb)) {
    const key = color.join(",");
    if (!seen.has(key)) {
      seen.add(key);
      colors.push(color);
    }
  }

  const levels = [0, 51, 102, 153, 204, 255];
  for (const r of levels) {
    for (const g of levels) {
      for (const b of levels) {
        const key = `${r},${g},${b}`;
        if (!seen.has(key)) {
          seen.add(key);
          colors.push([r, g, b]);
        }
      }
    }
  }

  while (colors.length < 256) {
    colors.push([0, 0, 0]);
  }

  return colors.slice(0, 256);
}

const palette = buildPalette();
const paletteBytes = Buffer.from(palette.flat());

function buildLookup() {
  const lookup = new Uint8Array(32 * 32 * 32);

  for (let r5 = 0; r5 < 32; r5 += 1) {
    for (let g5 = 0; g5 < 32; g5 += 1) {
      for (let b5 = 0; b5 < 32; b5 += 1) {
        const r = (r5 << 3) + 4;
        const g = (g5 << 3) + 4;
        const b = (b5 << 3) + 4;
        let bestIndex = 0;
        let bestDistance = Infinity;

        for (let index = 0; index < palette.length; index += 1) {
          const color = palette[index];
          const dr = r - color[0];
          const dg = g - color[1];
          const db = b - color[2];
          const distance = dr * dr + dg * dg + db * db;

          if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = index;
          }
        }

        lookup[(r5 << 10) | (g5 << 5) | b5] = bestIndex;
      }
    }
  }

  return lookup;
}

const colorLookup = buildLookup();

function clamp(value, min = 0, max = 255) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function easeInOutSine(value) {
  return -(Math.cos(Math.PI * value) - 1) / 2;
}

function openAmount(frame) {
  const t = frame / (FRAME_COUNT - 1);

  if (t < 0.58) {
    return easeInOutSine(t / 0.58);
  }

  if (t < 0.82) {
    return 1;
  }

  return easeInOutSine(1 - (t - 0.82) / 0.18);
}

function rng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0xffffffff;
  };
}

function createBuffer() {
  return new Float32Array(SIZE * SIZE * 3);
}

function pixelOffset(x, y) {
  return (y * SIZE + x) * 3;
}

function blend(buffer, x, y, color, alpha) {
  const ix = Math.round(x * SCALE);
  const iy = Math.round(y * SCALE);

  if (ix < 0 || ix >= SIZE || iy < 0 || iy >= SIZE || alpha <= 0) {
    return;
  }

  const offset = pixelOffset(ix, iy);
  const inv = 1 - alpha;
  buffer[offset] = buffer[offset] * inv + color[0] * alpha;
  buffer[offset + 1] = buffer[offset + 1] * inv + color[1] * alpha;
  buffer[offset + 2] = buffer[offset + 2] * inv + color[2] * alpha;
}

function blendScaled(buffer, x, y, color, alpha) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE || alpha <= 0) {
    return;
  }

  const offset = pixelOffset(x, y);
  const inv = 1 - alpha;
  buffer[offset] = buffer[offset] * inv + color[0] * alpha;
  buffer[offset + 1] = buffer[offset + 1] * inv + color[1] * alpha;
  buffer[offset + 2] = buffer[offset + 2] * inv + color[2] * alpha;
}

function fillBackground(buffer, frame) {
  for (let y = 0; y < SIZE; y += 1) {
    const oy = (y + 0.5) / SCALE;
    for (let x = 0; x < SIZE; x += 1) {
      const ox = (x + 0.5) / SCALE;
      const dx = (ox - 128) / 144;
      const dy = (oy - 132) / 144;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const noise = ((x * 13 + y * 17 + frame * 19) % 97) / 97;
      const warmth = Math.max(0, 1 - Math.abs(ox - 40) / 42) * Math.max(0, 1 - Math.abs(oy - 174) / 48);
      const blue = Math.max(0, 1 - Math.sqrt(((ox - 128) / 110) ** 2 + ((oy - 92) / 120) ** 2));
      const vignette = smoothstep(0.42, 1.08, distance);
      const offset = pixelOffset(x, y);

      buffer[offset] = clamp(4 + blue * 13 + warmth * 22 + noise * 5 - vignette * 12);
      buffer[offset + 1] = clamp(6 + blue * 23 + warmth * 12 + noise * 4 - vignette * 14);
      buffer[offset + 2] = clamp(14 + blue * 42 + warmth * 4 + noise * 5 - vignette * 17);
    }
  }
}

function drawEllipseGlow(buffer, cx, cy, rx, ry, color, alpha, power = 2) {
  const minX = Math.max(0, Math.floor((cx - rx) * SCALE));
  const maxX = Math.min(SIZE - 1, Math.ceil((cx + rx) * SCALE));
  const minY = Math.max(0, Math.floor((cy - ry) * SCALE));
  const maxY = Math.min(SIZE - 1, Math.ceil((cy + ry) * SCALE));

  for (let y = minY; y <= maxY; y += 1) {
    const oy = (y + 0.5) / SCALE;
    for (let x = minX; x <= maxX; x += 1) {
      const ox = (x + 0.5) / SCALE;
      const d = Math.sqrt(((ox - cx) / rx) ** 2 + ((oy - cy) / ry) ** 2);

      if (d <= 1) {
        blendScaled(buffer, x, y, color, (1 - d) ** power * alpha);
      }
    }
  }
}

function inArch(x, y) {
  if (y < 28 || y > 218 || x < 48 || x > 208) {
    return false;
  }

  if (y >= 93) {
    return true;
  }

  const halfWidth = (y - 28) * 1.22;
  return Math.abs(x - 128) <= halfWidth;
}

function drawArchClip(buffer, painter) {
  const minX = Math.floor(44 * SCALE);
  const maxX = Math.ceil(212 * SCALE);
  const minY = Math.floor(24 * SCALE);
  const maxY = Math.ceil(222 * SCALE);

  for (let y = minY; y <= maxY; y += 1) {
    const oy = (y + 0.5) / SCALE;
    for (let x = minX; x <= maxX; x += 1) {
      const ox = (x + 0.5) / SCALE;
      if (inArch(ox, oy)) {
        painter(x, y, ox, oy);
      }
    }
  }
}

function distanceToSegment(px, py, x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const lengthSq = dx * dx + dy * dy || 1;
  const t = clamp(((px - x0) * dx + (py - y0) * dy) / lengthSq, 0, 1);
  const x = x0 + t * dx;
  const y = y0 + t * dy;
  return Math.hypot(px - x, py - y);
}

function drawLine(buffer, x0, y0, x1, y1, color, width, alpha) {
  const minX = Math.max(0, Math.floor((Math.min(x0, x1) - width - 2) * SCALE));
  const maxX = Math.min(SIZE - 1, Math.ceil((Math.max(x0, x1) + width + 2) * SCALE));
  const minY = Math.max(0, Math.floor((Math.min(y0, y1) - width - 2) * SCALE));
  const maxY = Math.min(SIZE - 1, Math.ceil((Math.max(y0, y1) + width + 2) * SCALE));

  for (let y = minY; y <= maxY; y += 1) {
    const oy = (y + 0.5) / SCALE;
    for (let x = minX; x <= maxX; x += 1) {
      const ox = (x + 0.5) / SCALE;
      const distance = distanceToSegment(ox, oy, x0, y0, x1, y1);
      const coverage = 1 - smoothstep(width * 0.5, width * 0.5 + 1.25, distance);
      if (coverage > 0) {
        blendScaled(buffer, x, y, color, coverage * alpha);
      }
    }
  }
}

function drawPath(buffer, points, color, width, alpha) {
  for (let index = 0; index < points.length - 1; index += 1) {
    drawLine(buffer, points[index][0], points[index][1], points[index + 1][0], points[index + 1][1], color, width, alpha);
  }
}

function drawLightning(buffer, frame, amount) {
  const chance = frame % 4 === 1 || frame % 7 === 3 || amount > 0.9;

  if (!chance) {
    return;
  }

  const random = rng(1400 + frame * 57);
  const main = [];
  const xShift = random() * 20 - 10;

  for (let step = 0; step <= 9; step += 1) {
    const y = 9 + step * 16;
    const taper = step / 9;
    const x = 128 + xShift * (1 - taper) + (random() - 0.5) * (18 + step * 2);
    main.push([x, y]);
  }

  drawPath(buffer, main, [31, 196, 255], 9, 0.16);
  drawPath(buffer, main, [115, 235, 255], 4.2, 0.42);
  drawPath(buffer, main, [255, 255, 255], 1.25, 0.95);

  for (let branch = 0; branch < 5; branch += 1) {
    const start = 2 + Math.floor(random() * 5);
    const direction = random() > 0.5 ? 1 : -1;
    const base = main[start];
    const branchPoints = [
      base,
      [base[0] + direction * (12 + random() * 16), base[1] + 10 + random() * 12],
      [base[0] + direction * (22 + random() * 28), base[1] + 26 + random() * 20]
    ];
    drawPath(buffer, branchPoints, [80, 220, 255], 4, 0.2);
    drawPath(buffer, branchPoints, [235, 253, 255], 0.9, 0.72);
  }

  for (const side of [-1, 1]) {
    const edgeArc = [
      [128 + side * (23 + amount * 16), 82],
      [128 + side * (41 + random() * 10), 109],
      [128 + side * (35 + random() * 16), 145],
      [128 + side * (55 + random() * 8), 177]
    ];
    drawPath(buffer, edgeArc, [71, 216, 255], 5, 0.19);
    drawPath(buffer, edgeArc, [250, 255, 255], 1, 0.75);
  }
}

function drawDoor(buffer, frame, amount) {
  drawEllipseGlow(buffer, 128, 106, 95 + amount * 34, 138, [28, 170, 232], 0.45 + amount * 0.38, 2.4);
  drawEllipseGlow(buffer, 128, 110, 42 + amount * 34, 104, [225, 255, 255], 0.24 + amount * 0.5, 1.8);

  const gapTop = 9 + amount * 78;
  const gapBottom = 12 + amount * 103;

  drawArchClip(buffer, (x, y, ox, oy) => {
    const vertical = clamp((oy - 28) / 190, 0, 1);
    const gap = gapTop + (gapBottom - gapTop) * vertical;
    const distanceFromCenter = Math.abs(ox - 128);

    if (distanceFromCenter < gap / 2) {
      const core = 1 - distanceFromCenter / (gap / 2);
      blendScaled(buffer, x, y, [45, 205, 255], 0.35 + core * 0.38);
      blendScaled(buffer, x, y, [255, 255, 255], Math.max(0, core - 0.55) * 0.55);
      return;
    }

    const side = ox < 128 ? -1 : 1;
    const inner = 128 + side * gap / 2;
    const outer = side < 0 ? 53 : 203;
    const withinLeaf = side < 0 ? ox >= outer && ox <= inner : ox <= outer && ox >= inner;

    if (!withinLeaf) {
      return;
    }

    const leafPosition = Math.abs((ox - outer) / (inner - outer || 1));
    const grain = ((Math.floor(ox * 19) + Math.floor(oy * 13) + frame * 11) % 71) / 71;
    const lightEdge = 1 - Math.min(1, Math.abs(ox - inner) / 10);
    const shadowEdge = Math.min(1, Math.abs(ox - outer) / 22);
    const r = 20 + leafPosition * 28 + lightEdge * 42 + grain * 12;
    const g = 24 + leafPosition * 28 + lightEdge * 33 + grain * 9;
    const b = 34 + leafPosition * 35 + lightEdge * 24 + shadowEdge * 7;

    blendScaled(buffer, x, y, [r, g, b], 0.96);

    if ((Math.floor((ox - outer) / 14) + Math.floor(oy / 38)) % 2 === 0) {
      blendScaled(buffer, x, y, [8, 10, 17], 0.11);
    }
  });

  for (const side of [-1, 1]) {
    const outer = side < 0 ? 53 : 203;
    const innerTop = 128 + side * gapTop / 2;
    const innerBottom = 128 + side * gapBottom / 2;
    drawLine(buffer, outer, 88, outer, 218, [219, 182, 91], 3.4, 0.7);
    drawLine(buffer, innerTop, 88, innerBottom, 218, [119, 234, 255], 5.2, 0.35 + amount * 0.24);
    drawLine(buffer, innerTop, 88, innerBottom, 218, [248, 222, 139], 1.3, 0.6);
    drawLine(buffer, outer + side * 16, 112, innerTop - side * 8, 112, [167, 127, 54], 1.2, 0.56);
    drawLine(buffer, outer + side * 12, 157, innerBottom - side * 9, 157, [167, 127, 54], 1.1, 0.5);
  }

  drawLine(buffer, 52, 92, 52, 219, [245, 214, 131], 3.2, 0.72);
  drawLine(buffer, 204, 92, 204, 219, [245, 214, 131], 3.2, 0.72);
  drawLine(buffer, 56, 79, 128, 25, [245, 214, 131], 3.2, 0.72);
  drawLine(buffer, 200, 79, 128, 25, [245, 214, 131], 3.2, 0.72);
  drawLine(buffer, 58, 82, 128, 31, [36, 210, 255], 6, 0.12 + amount * 0.1);
  drawLine(buffer, 198, 82, 128, 31, [36, 210, 255], 6, 0.12 + amount * 0.1);

  drawLine(buffer, 40, 220, 216, 220, [244, 213, 127], 5, 0.76);
  drawLine(buffer, 29, 231, 227, 231, [134, 93, 38], 8, 0.76);

  for (let ray = -3; ray <= 3; ray += 1) {
    const spread = ray * (12 + amount * 12);
    drawLine(buffer, 128, 82, 128 + spread, 14, [71, 216, 255], 1.2, Math.max(0, amount - 0.28) * 0.22);
    drawLine(buffer, 128, 116, 128 + spread * 1.3, 238, [71, 216, 255], 1.4, Math.max(0, amount - 0.22) * 0.2);
  }
}

function drawLetters(buffer, amount) {
  const glowAlpha = 0.14 + amount * 0.14;
  drawEllipseGlow(buffer, 128, 171, 72, 38, [24, 198, 255], glowAlpha, 2.4);

  const gold = [249, 220, 141];
  const pale = [255, 248, 221];

  drawLine(buffer, 79, 153, 79, 195, gold, 5.4, 0.88);
  drawLine(buffer, 79, 153, 109, 153, gold, 4.8, 0.88);
  drawLine(buffer, 79, 174, 102, 174, gold, 4.4, 0.84);
  drawLine(buffer, 79, 195, 111, 195, gold, 5, 0.88);

  drawLine(buffer, 119, 151, 136, 197, gold, 5.2, 0.88);
  drawLine(buffer, 174, 151, 136, 197, gold, 5.2, 0.88);
  drawLine(buffer, 119, 151, 136, 197, pale, 1, 0.52);
  drawLine(buffer, 174, 151, 136, 197, pale, 1, 0.52);
}

function renderFrame(frame) {
  const buffer = createBuffer();
  const amount = openAmount(frame);
  const pulse = Math.sin((frame / FRAME_COUNT) * Math.PI * 2);

  fillBackground(buffer, frame);
  drawEllipseGlow(buffer, 42, 174, 34, 46, [255, 118, 45], 0.14 + pulse * 0.02, 2.2);
  drawDoor(buffer, frame, amount);
  drawLightning(buffer, frame, amount);
  drawLetters(buffer, amount);
  drawEllipseGlow(buffer, 128, 128, 150, 150, [0, 0, 0], 0.14, 0.9);

  return downsample(buffer);
}

function downsample(buffer) {
  const pixels = new Uint8Array(OUT * OUT);

  for (let y = 0; y < OUT; y += 1) {
    for (let x = 0; x < OUT; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let oy = 0; oy < SCALE; oy += 1) {
        for (let ox = 0; ox < SCALE; ox += 1) {
          const offset = pixelOffset(x * SCALE + ox, y * SCALE + oy);
          r += buffer[offset];
          g += buffer[offset + 1];
          b += buffer[offset + 2];
        }
      }

      r = clamp(Math.round(r / (SCALE * SCALE)));
      g = clamp(Math.round(g / (SCALE * SCALE)));
      b = clamp(Math.round(b / (SCALE * SCALE)));
      pixels[y * OUT + x] = colorLookup[((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)];
    }
  }

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
  u16(OUT),
  u16(OUT),
  Buffer.from([0xf7, 0x00, 0x00]),
  paletteBytes,
  Buffer.from([0x21, 0xff, 0x0b]),
  Buffer.from("NETSCAPE2.0", "ascii"),
  Buffer.from([0x03, 0x01, 0x00, 0x00, 0x00])
];

for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
  const pixels = renderFrame(frame);
  chunks.push(
    Buffer.from([0x21, 0xf9, 0x04, 0x04]),
    u16(frame < FRAME_COUNT - 1 ? 4 : 10),
    Buffer.from([0x00, 0x00]),
    Buffer.from([0x2c]),
    u16(0),
    u16(0),
    u16(OUT),
    u16(OUT),
    Buffer.from([0x00, 0x08]),
    writeSubBlocks(lzwLiteralEncode(pixels))
  );
}

chunks.push(Buffer.from([0x3b]));

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, Buffer.concat(chunks));
console.log(`Generated ${OUTPUT_PATH}`);
