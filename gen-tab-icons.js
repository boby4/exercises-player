import zlib from 'zlib'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, 'src/assets/tab')

function crc32(buf) {
  let c, table = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function makePng(width, height, rgbaData) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  
  // IHDR
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8  // bit depth
  ihdrData[9] = 6  // color type RGBA
  ihdrData[10] = 0 // compression
  ihdrData[11] = 0 // filter
  ihdrData[12] = 0 // interlace
  const ihdr = makeChunk('IHDR', ihdrData)
  
  // IDAT - add filter byte 0 to each row
  const raw = Buffer.alloc(height * (1 + width * 4))
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0 // filter none
    rgbaData.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const compressed = zlib.deflateSync(raw)
  const idat = makeChunk('IDAT', compressed)
  
  // IEND
  const iend = makeChunk('IEND', Buffer.alloc(0))
  
  return Buffer.concat([sig, ihdr, idat, iend])
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuffer = Buffer.from(type)
  const crcData = Buffer.concat([typeBuffer, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcData), 0)
  return Buffer.concat([len, typeBuffer, data, crc])
}

const SIZE = 81

function createCanvas() {
  return Buffer.alloc(SIZE * SIZE * 4) // RGBA
}

function setPixel(buf, x, y, r, g, b, a = 255) {
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return
  const i = (y * SIZE + x) * 4
  // Alpha blending
  if (a < 255 && buf[i + 3] > 0) {
    const srcA = a / 255
    const dstA = buf[i + 3] / 255
    const outA = srcA + dstA * (1 - srcA)
    buf[i] = Math.round((r * srcA + buf[i] * dstA * (1 - srcA)) / outA)
    buf[i + 1] = Math.round((g * srcA + buf[i + 1] * dstA * (1 - srcA)) / outA)
    buf[i + 2] = Math.round((b * srcA + buf[i + 2] * dstA * (1 - srcA)) / outA)
    buf[i + 3] = Math.round(outA * 255)
  } else {
    buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a
  }
}

function fillCircle(buf, cx, cy, r, cr, cg, cb, ca = 255) {
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx, dy = y - cy
      if (dx * dx + dy * dy <= r * r) setPixel(buf, x, y, cr, cg, cb, ca)
    }
  }
}

function fillRect(buf, x1, y1, x2, y2, r, g, b, a = 255) {
  for (let y = y1; y <= y2; y++)
    for (let x = x1; x <= x2; x++) setPixel(buf, x, y, r, g, b, a)
}

function fillRoundedRect(buf, x1, y1, x2, y2, radius, r, g, b, a = 255) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      let inside = true
      // Check corners
      if (x < x1 + radius && y < y1 + radius) {
        const dx = x - (x1 + radius), dy = y - (y1 + radius)
        inside = dx * dx + dy * dy <= radius * radius
      } else if (x > x2 - radius && y < y1 + radius) {
        const dx = x - (x2 - radius), dy = y - (y1 + radius)
        inside = dx * dx + dy * dy <= radius * radius
      } else if (x < x1 + radius && y > y2 - radius) {
        const dx = x - (x1 + radius), dy = y - (y2 - radius)
        inside = dx * dx + dy * dy <= radius * radius
      } else if (x > x2 - radius && y > y2 - radius) {
        const dx = x - (x2 - radius), dy = y - (y2 - radius)
        inside = dx * dx + dy * dy <= radius * radius
      }
      if (inside) setPixel(buf, x, y, r, g, b, a)
    }
  }
}

function strokeLine(buf, x1, y1, x2, y2, thickness, r, g, b, a = 255) {
  const dx = x2 - x1, dy = y2 - y1
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 3
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps
    const x = Math.round(x1 + dx * t)
    const y = Math.round(y1 + dy * t)
    fillCircle(buf, x, y, Math.floor(thickness / 2), r, g, b, a)
  }
}

function strokeCircle(buf, cx, cy, radius, thickness, r, g, b, a = 255) {
  for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
    const x = Math.round(cx + Math.cos(angle) * radius)
    const y = Math.round(cy + Math.sin(angle) * radius)
    fillCircle(buf, x, y, Math.floor(thickness / 2), r, g, b, a)
  }
}

function strokeRoundRect(buf, x1, y1, x2, y2, radius, thickness, r, g, b, a = 255) {
  // Top
  strokeLine(buf, x1 + radius, y1, x2 - radius, y1, thickness, r, g, b, a)
  // Bottom
  strokeLine(buf, x1 + radius, y2, x2 - radius, y2, thickness, r, g, b, a)
  // Left
  strokeLine(buf, x1, y1 + radius, x1, y2 - radius, thickness, r, g, b, a)
  // Right
  strokeLine(buf, x2, y1 + radius, x2, y2 - radius, thickness, r, g, b, a)
  // Corners
  for (let angle = 0; angle <= Math.PI / 2; angle += 0.02) {
    let x, y
    // Top-left
    x = Math.round(x1 + radius - Math.cos(angle) * radius)
    y = Math.round(y1 + radius - Math.sin(angle) * radius)
    fillCircle(buf, x, y, Math.floor(thickness / 2), r, g, b, a)
    // Top-right
    x = Math.round(x2 - radius + Math.cos(angle) * radius)
    y = Math.round(y1 + radius - Math.sin(angle) * radius)
    fillCircle(buf, x, y, Math.floor(thickness / 2), r, g, b, a)
    // Bottom-left
    x = Math.round(x1 + radius - Math.cos(angle) * radius)
    y = Math.round(y2 - radius + Math.sin(angle) * radius)
    fillCircle(buf, x, y, Math.floor(thickness / 2), r, g, b, a)
    // Bottom-right
    x = Math.round(x2 - radius + Math.cos(angle) * radius)
    y = Math.round(y2 - radius + Math.sin(angle) * radius)
    fillCircle(buf, x, y, Math.floor(thickness / 2), r, g, b, a)
  }
}

// ============ Icon Definitions ============
const GRAY = [153, 153, 153]    // #999999
const GREEN = [76, 175, 80]     // #4CAF50
const T = 4 // line thickness

// HOME icon - simple house
function drawHome(color) {
  const buf = createCanvas()
  const [r, g, b] = color
  const cx = 40, cy = 40
  // Roof - triangle
  strokeLine(buf, 14, 36, 40, 14, T + 1, r, g, b)
  strokeLine(buf, 40, 14, 66, 36, T + 1, r, g, b)
  strokeLine(buf, 14, 36, 66, 36, T, r, g, b)
  // Body
  strokeLine(buf, 20, 36, 20, 62, T, r, g, b)
  strokeLine(buf, 60, 36, 60, 62, T, r, g, b)
  strokeLine(buf, 20, 62, 60, 62, T, r, g, b)
  // Door
  strokeLine(buf, 33, 62, 33, 46, T, r, g, b)
  strokeLine(buf, 47, 62, 47, 46, T, r, g, b)
  strokeLine(buf, 33, 46, 47, 46, T, r, g, b)
  return buf
}

// SEARCH icon - magnifying glass
function drawSearch(color) {
  const buf = createCanvas()
  const [r, g, b] = color
  // Circle
  strokeCircle(buf, 34, 34, 16, T, r, g, b)
  // Handle
  strokeLine(buf, 46, 46, 64, 64, T + 1, r, g, b)
  return buf
}

// HEART icon
function drawHeart(color) {
  const buf = createCanvas()
  const [r, g, b] = color
  // Draw heart shape using two circles and a triangle
  // Left lobe
  for (let y = 10; y < 70; y++) {
    for (let x = 10; x < 70; x++) {
      const nx = (x - 40) / 28
      const ny = -(y - 38) / 28
      // Heart equation: (x^2 + y^2 - 1)^3 - x^2*y^3 < 0
      const val = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny
      if (val < 0) {
        // Check if on edge (for outline)
        const nx2 = (x + 1 - 40) / 28
        const ny2 = -(y + 1 - 38) / 28
        const val2 = Math.pow(nx2 * nx2 + ny2 * ny2 - 1, 3) - nx2 * nx2 * ny2 * ny2 * ny2
        const nx3 = (x - 1 - 40) / 28
        const ny3 = -(y - 1 - 38) / 28
        const val3 = Math.pow(nx3 * nx3 + ny3 * ny3 - 1, 3) - nx3 * nx3 * ny3 * ny3 * ny3
        const edge = val2 < 0 === val >= 0 || val3 < 0 === val >= 0
      }
    }
  }
  // Simpler approach: filled heart
  for (let y = 10; y < 68; y++) {
    for (let x = 10; x < 70; x++) {
      const nx = (x - 40) / 26
      const ny = -(y - 36) / 26
      const val = Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * ny * ny * ny
      if (val < 0.05) {
        // Edge detection
        let isEdge = false
        for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          const nnx = (x + dx - 40) / 26
          const nny = -(y + dy - 36) / 26
          const v2 = Math.pow(nnx * nnx + nny * nny - 1, 3) - nnx * nnx * nny * nny * nny
          if (v2 >= 0.05) { isEdge = true; break }
        }
        if (isEdge) {
          setPixel(buf, x, y, r, g, b)
        }
      }
    }
  }
  return buf
}

// PLAN icon - calendar/list
function drawPlan(color) {
  const buf = createCanvas()
  const [r, g, b] = color
  // Outer rounded rect
  strokeRoundRect(buf, 16, 12, 64, 68, 5, T, r, g, b)
  // Top bar
  strokeLine(buf, 16, 28, 64, 28, T, r, g, b)
  // Two tabs on top
  strokeLine(buf, 28, 8, 28, 18, T, r, g, b)
  strokeLine(buf, 52, 8, 52, 18, T, r, g, b)
  // List lines
  strokeLine(buf, 24, 38, 56, 38, T - 1, r, g, b)
  strokeLine(buf, 24, 48, 56, 48, T - 1, r, g, b)
  strokeLine(buf, 24, 58, 44, 58, T - 1, r, g, b)
  return buf
}

// ============ Generate All Icons ============
const icons = [
  { name: 'home', draw: drawHome },
  { name: 'search', draw: drawSearch },
  { name: 'heart', draw: drawHeart },
  { name: 'plan', draw: drawPlan },
]

for (const icon of icons) {
  const normal = icon.draw(GRAY)
  const active = icon.draw(GREEN)
  
  const normalPng = makePng(SIZE, SIZE, normal)
  const activePng = makePng(SIZE, SIZE, active)
  
  fs.writeFileSync(path.join(outDir, `${icon.name}.png`), normalPng)
  fs.writeFileSync(path.join(outDir, `${icon.name}-active.png`), activePng)
  console.log(`✓ ${icon.name}.png + ${icon.name}-active.png`)
}

console.log('\nAll tab icons generated!')
