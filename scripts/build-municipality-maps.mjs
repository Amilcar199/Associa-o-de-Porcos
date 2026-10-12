import { writeFileSync } from 'node:fs'
import { ANGOLA_MAP_PATHS } from '../src/components/sections/PigMap/angola-map-paths.ts'
import { ANGOLA_PROVINCE_META } from '../src/components/sections/PigMap/angola-map-meta.ts'
import { MUNICIPALITIES_BY_PROVINCE, municipalitySlug } from '../src/components/sections/PigMap/province-municipalities.ts'

const GRID = 260

function tokenize(d) {
  return d.match(/[MmLlCcZz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || []
}

function samplePath(d) {
  const tokens = tokenize(d)
  const points = []
  let index = 0
  let cx = 0
  let cy = 0
  let sx = 0
  let sy = 0
  let command = ''

  const num = () => Number(tokens[index++])
  const push = (x, y) => {
    const last = points[points.length - 1]
    if (!last || Math.hypot(last[0] - x, last[1] - y) > 0.4) points.push([x, y])
  }

  while (index < tokens.length) {
    if (/[MmLlCcZz]/.test(tokens[index])) command = tokens[index++]
    const relative = command === command.toLowerCase()
    const kind = command.toLowerCase()

    if (kind === 'm') {
      const x = relative ? cx + num() : num()
      const y = relative ? cy + num() : num()
      cx = x
      cy = y
      sx = x
      sy = y
      push(cx, cy)
      command = relative ? 'l' : 'L'
    } else if (kind === 'l') {
      const x = relative ? cx + num() : num()
      const y = relative ? cy + num() : num()
      cx = x
      cy = y
      push(cx, cy)
    } else if (kind === 'c') {
      const x1 = relative ? cx + num() : num()
      const y1 = relative ? cy + num() : num()
      const x2 = relative ? cx + num() : num()
      const y2 = relative ? cy + num() : num()
      const x = relative ? cx + num() : num()
      const y = relative ? cy + num() : num()
      for (let step = 1; step <= 8; step += 1) {
        const t = step / 8
        const u = 1 - t
        push(
          u * u * u * cx + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x,
          u * u * u * cy + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y,
        )
      }
      cx = x
      cy = y
    } else if (kind === 'z') {
      cx = sx
      cy = sy
      push(cx, cy)
    } else {
      throw new Error(`Comando SVG não suportado: ${command}`)
    }
  }
  return points
}

function rasterize(points) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of points) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  const span = Math.max(maxX - minX, maxY - minY) || 1
  const cell = span / GRID
  const cols = Math.max(2, Math.ceil((maxX - minX) / cell))
  const rows = Math.max(2, Math.ceil((maxY - minY) / cell))
  const grid = Array.from({ length: rows }, () => new Int16Array(cols).fill(-1))

  for (let row = 0; row < rows; row += 1) {
    const y = minY + (row + 0.5) * cell
    const hits = []
    for (let index = 0; index < points.length - 1; index += 1) {
      const [x1, y1] = points[index]
      const [x2, y2] = points[index + 1]
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        const t = (y - y1) / (y2 - y1)
        hits.push(x1 + t * (x2 - x1))
      }
    }
    hits.sort((a, b) => a - b)
    for (let pair = 0; pair + 1 < hits.length; pair += 2) {
      const start = Math.max(0, Math.floor((hits[pair] - minX) / cell))
      const end = Math.min(cols - 1, Math.ceil((hits[pair + 1] - minX) / cell) - 1)
      for (let col = start; col <= end; col += 1) grid[row][col] = -2
    }
  }

  return { grid, rows, cols, minX, minY, cell }
}

function interiorCells(grid) {
  const cells = []
  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      if (grid[row][col] === -2) cells.push([col, row])
    }
  }
  return cells
}

function placeSeeds(cells, count) {
  if (cells.length === 0) return []
  const seeds = [cells[Math.floor(cells.length / 2)]]
  while (seeds.length < count && seeds.length < cells.length) {
    let best = cells[0]
    let bestDistance = -1
    const step = Math.max(1, Math.floor(cells.length / 2500))
    for (let index = 0; index < cells.length; index += step) {
      const cell = cells[index]
      let nearest = Infinity
      for (const seed of seeds) {
        const distance = (cell[0] - seed[0]) ** 2 + (cell[1] - seed[1]) ** 2
        if (distance < nearest) nearest = distance
      }
      if (nearest > bestDistance) {
        bestDistance = nearest
        best = cell
      }
    }
    seeds.push(best)
  }
  return seeds.slice(0, count)
}

function assign(grid, cells, seeds) {
  const owned = seeds.map(() => [])
  for (const cell of cells) {
    let best = 0
    let bestDistance = Infinity
    for (let index = 0; index < seeds.length; index += 1) {
      const distance = (cell[0] - seeds[index][0]) ** 2 + (cell[1] - seeds[index][1]) ** 2
      if (distance < bestDistance) {
        bestDistance = distance
        best = index
      }
    }
    grid[cell[1]][cell[0]] = best
    owned[best].push(cell)
  }
  return owned
}

function relax(owned, previous) {
  return owned.map((cells, index) => {
    if (cells.length === 0) return previous[index]
    let x = 0
    let y = 0
    for (const cell of cells) {
      x += cell[0]
      y += cell[1]
    }
    return [x / cells.length, y / cells.length]
  })
}

function traceRegion(grid, label) {
  const rows = grid.length
  const cols = grid[0].length
  const outgoing = new Map()
  const add = (x1, y1, x2, y2) => {
    const key = `${x1},${y1}`
    const list = outgoing.get(key)
    if (list) list.push([x2, y2])
    else outgoing.set(key, [[x2, y2]])
  }
  const same = (col, row) => row >= 0 && col >= 0 && row < rows && col < cols && grid[row][col] === label

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (!same(col, row)) continue
      if (!same(col, row - 1)) add(col + 1, row, col, row)
      if (!same(col + 1, row)) add(col + 1, row + 1, col + 1, row)
      if (!same(col, row + 1)) add(col, row + 1, col + 1, row + 1)
      if (!same(col - 1, row)) add(col, row, col, row + 1)
    }
  }

  const loops = []
  for (const [startKey, ends] of outgoing) {
    while (ends.length) {
      const loop = []
      let key = startKey
      let guard = 0
      while (guard < rows * cols * 2) {
        const list = outgoing.get(key)
        if (!list?.length) break
        const [x, y] = key.split(',').map(Number)
        loop.push([x, y])
        const next = list.pop()
        key = `${next[0]},${next[1]}`
        if (key === startKey) break
        guard += 1
      }
      if (loop.length >= 3) loops.push(loop)
    }
  }
  return loops
}

function simplify(points, epsilon) {
  if (points.length < 4) return points
  const sq = epsilon * epsilon
  const keep = new Uint8Array(points.length)
  keep[0] = 1
  keep[points.length - 1] = 1
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [start, end] = stack.pop()
    let max = 0
    let index = -1
    const [x1, y1] = points[start]
    const [x2, y2] = points[end]
    const dx = x2 - x1
    const dy = y2 - y1
    const length = dx * dx + dy * dy || 1
    for (let cursor = start + 1; cursor < end; cursor += 1) {
      const [x, y] = points[cursor]
      const area = Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1)
      const distance = (area * area) / length
      if (distance > max) {
        max = distance
        index = cursor
      }
    }
    if (max > sq && index !== -1) {
      keep[index] = 1
      stack.push([start, index], [index, end])
    }
  }
  return points.filter((_, index) => keep[index])
}

function toPath(loops, origin) {
  const { minX, minY, cell } = origin
  return loops.map((loop) => {
    const simplified = simplify(loop, 1.2)
    const commands = simplified.map(([col, row], index) => {
      const x = (minX + col * cell).toFixed(1)
      const y = (minY + row * cell).toFixed(1)
      return `${index === 0 ? 'M' : 'L'}${x} ${y}`
    })
    return `${commands.join('')}Z`
  }).join('')
}

function labelPoint(cells, origin) {
  let sumX = 0
  let sumY = 0
  for (const [col, row] of cells) {
    sumX += col
    sumY += row
  }
  const centerX = sumX / cells.length
  const centerY = sumY / cells.length
  let best = cells[0]
  let bestDistance = Infinity
  for (const cell of cells) {
    const distance = (cell[0] - centerX) ** 2 + (cell[1] - centerY) ** 2
    if (distance < bestDistance) {
      bestDistance = distance
      best = cell
    }
  }
  return [
    origin.minX + (best[0] + 0.5) * origin.cell,
    origin.minY + (best[1] + 0.5) * origin.cell,
    Math.max(origin.cell * 2.8, Math.sqrt(cells.length) * origin.cell * 0.22),
  ]
}

function buildProvince(points, labels) {
  const raster = rasterize(points)
  let cells = interiorCells(raster.grid)
  if (cells.length < labels.length) {
    throw new Error(`Poucos pixéis interiores (${cells.length}) para ${labels.length} municípios`)
  }
  let seeds = placeSeeds(cells, labels.length)
  let owned = []
  for (let pass = 0; pass < 4; pass += 1) {
    for (const row of raster.grid) row.fill(-1)
    for (const cell of cells) raster.grid[cell[1]][cell[0]] = -2
    owned = assign(raster.grid, cells, seeds)
    seeds = relax(owned, seeds)
  }
  for (const row of raster.grid) row.fill(-1)
  for (const cell of cells) raster.grid[cell[1]][cell[0]] = -2
  owned = assign(raster.grid, cells, seeds)

  const order = seeds
    .map((seed, index) => ({ index, y: seed[1], x: seed[0] }))
    .sort((a, b) => a.y - b.y || a.x - b.x)

  return labels.map((label, labelIndex) => {
    const region = order[labelIndex]?.index ?? labelIndex
    const regionCells = owned[region] || []
    const loops = regionCells.length ? traceRegion(raster.grid, region) : []
    const [labelX, labelY, labelSize] = regionCells.length
      ? labelPoint(regionCells, raster)
      : [raster.minX, raster.minY, raster.cell * 4]
    return {
      id: municipalitySlug(label),
      label,
      d: loops.length ? toPath(loops, raster) : '',
      labelX: Number(labelX.toFixed(1)),
      labelY: Number(labelY.toFixed(1)),
      labelSize: Number(labelSize.toFixed(1)),
    }
  })
}

const maps = {}
for (const shape of ANGOLA_MAP_PATHS) {
  const meta = ANGOLA_PROVINCE_META.find((province) => province.id === shape.id)
  if (!meta) throw new Error(`Província sem meta: ${shape.id}`)
  const labels = MUNICIPALITIES_BY_PROVINCE[meta.dataName]
  if (!labels?.length) throw new Error(`Sem municípios: ${meta.dataName}`)
  const started = Date.now()
  const points = samplePath(shape.d)
  const items = buildProvince(points, labels)
  const missing = items.filter((item) => !item.d).length
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [x, y] of points) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  const padX = (maxX - minX) * 0.04
  const padY = (maxY - minY) * 0.04
  maps[meta.dataName] = {
    viewBox: `${(minX - padX).toFixed(1)} ${(minY - padY).toFixed(1)} ${(maxX - minX + padX * 2).toFixed(1)} ${(maxY - minY + padY * 2).toFixed(1)}`,
    outline: shape.d,
    items,
  }
  console.log(`${meta.dataName}: ${items.length} municípios, ${missing} vazios, ${Date.now() - started}ms`)
}

const source = `// Contornos dos municípios, recortados na forma real de cada província.
// A fronteira exterior é a da província no mapa de Angola. As divisões internas
// repartem essa área pelos municípios da Lei n.º 14/24.

export interface MunicipalityMapShape {
  id: string
  label: string
  d: string
  labelX: number
  labelY: number
  labelSize: number
}

export interface ProvinceMunicipalityMap {
  viewBox: string
  outline: string
  items: MunicipalityMapShape[]
}

export const MUNICIPALITY_MAPS: Record<string, ProvinceMunicipalityMap> = ${JSON.stringify(maps)}
`

writeFileSync(new URL('../src/components/sections/PigMap/municipality-map-paths.ts', import.meta.url), source)
console.log('escrito')
