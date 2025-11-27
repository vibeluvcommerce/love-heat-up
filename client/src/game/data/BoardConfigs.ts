import type { PathPoint, BoardConfig } from '../types/BoardTypes'
import { BoardShape } from '../types/BoardTypes'

// 心形棋盘路径（40格）
const HEART_PATH: PathPoint[] = [
  // 右侧上升 (0-9)
  { x: 540, y: 1600 },   // 0: 底部中心（起点）
  { x: 640, y: 1500 },   // 1
  { x: 720, y: 1380 },   // 2
  { x: 780, y: 1240 },   // 3
  { x: 820, y: 1100 },   // 4
  { x: 840, y: 960 },    // 5
  { x: 840, y: 820 },    // 6
  { x: 820, y: 680 },    // 7
  { x: 780, y: 560 },    // 8
  { x: 720, y: 460 },    // 9
  
  // 右侧顶部弧线 (10-14)
  { x: 640, y: 400 },    // 10
  { x: 540, y: 360 },    // 11
  { x: 440, y: 360 },    // 12
  { x: 360, y: 400 },    // 13
  { x: 300, y: 460 },    // 14
  
  // 左侧下降到中心 (15-19)
  { x: 260, y: 560 },    // 15
  { x: 240, y: 680 },    // 16
  { x: 240, y: 820 },    // 17
  { x: 260, y: 960 },    // 18
  { x: 300, y: 1100 },   // 19
  
  // 左侧继续下降 (20-24)
  { x: 360, y: 1240 },   // 20
  { x: 440, y: 1380 },   // 21
  { x: 540, y: 1480 },   // 22（接近底部）
  { x: 440, y: 1380 },   // 23（重复利用对称）
  { x: 360, y: 1240 },   // 24
  
  // 内圈返回 (25-34)
  { x: 320, y: 1100 },   // 25
  { x: 300, y: 960 },    // 26
  { x: 300, y: 820 },    // 27
  { x: 320, y: 680 },    // 28
  { x: 360, y: 560 },    // 29
  { x: 420, y: 480 },    // 30
  { x: 500, y: 440 },    // 31
  { x: 580, y: 440 },    // 32
  { x: 660, y: 480 },    // 33
  { x: 720, y: 560 },    // 34
  
  // 收尾 (35-39)
  { x: 760, y: 680 },    // 35
  { x: 780, y: 820 },    // 36
  { x: 780, y: 960 },    // 37
  { x: 760, y: 1100 },   // 38
  { x: 720, y: 1240 }    // 39
]

// 圆形棋盘路径（40格）
const CIRCLE_PATH: PathPoint[] = generateCirclePath(540, 960, 500, 40)

// 方形棋盘路径（40格）
const SQUARE_PATH: PathPoint[] = generateSquarePath(540, 960, 600, 40)

// 星形棋盘路径（40格）
const STAR_PATH: PathPoint[] = generateStarPath(540, 960, 500, 40)

// 生成圆形路径
function generateCirclePath(centerX: number, centerY: number, radius: number, count: number): PathPoint[] {
  const points: PathPoint[] = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2 // 从顶部开始
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    })
  }
  return points
}

// 生成方形路径
function generateSquarePath(centerX: number, centerY: number, size: number, count: number): PathPoint[] {
  const points: PathPoint[] = []
  const perSide = count / 4
  const halfSize = size / 2
  
  // 上边
  for (let i = 0; i < perSide; i++) {
    points.push({
      x: centerX - halfSize + (i / perSide) * size,
      y: centerY - halfSize
    })
  }
  
  // 右边
  for (let i = 0; i < perSide; i++) {
    points.push({
      x: centerX + halfSize,
      y: centerY - halfSize + (i / perSide) * size
    })
  }
  
  // 下边
  for (let i = 0; i < perSide; i++) {
    points.push({
      x: centerX + halfSize - (i / perSide) * size,
      y: centerY + halfSize
    })
  }
  
  // 左边
  for (let i = 0; i < perSide; i++) {
    points.push({
      x: centerX - halfSize,
      y: centerY + halfSize - (i / perSide) * size
    })
  }
  
  return points
}

// 生成星形路径
function generateStarPath(centerX: number, centerY: number, radius: number, count: number): PathPoint[] {
  const points: PathPoint[] = []
  const outerRadius = radius
  const innerRadius = radius * 0.5
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 === 0 ? outerRadius : innerRadius
    points.push({
      x: centerX + Math.cos(angle) * r,
      y: centerY + Math.sin(angle) * r
    })
  }
  return points
}

// 棋盘配置映射
const BOARD_CONFIGS: Record<BoardShape, BoardConfig> = {
  [BoardShape.HEART]: {
    name: '心形棋盘',
    pathPoints: HEART_PATH,
    tileSize: 60,
    backgroundColor: 0xff1493,
    tileColor: 0xff69b4,
    tileAlpha: 0.6
  },
  [BoardShape.CIRCLE]: {
    name: '圆形棋盘',
    pathPoints: CIRCLE_PATH,
    tileSize: 55,
    backgroundColor: 0x4169e1,
    tileColor: 0x87ceeb,
    tileAlpha: 0.6
  },
  [BoardShape.SQUARE]: {
    name: '方形棋盘',
    pathPoints: SQUARE_PATH,
    tileSize: 50,
    backgroundColor: 0x228b22,
    tileColor: 0x90ee90,
    tileAlpha: 0.6
  },
  [BoardShape.STAR]: {
    name: '星形棋盘',
    pathPoints: STAR_PATH,
    tileSize: 50,
    backgroundColor: 0xff8c00,
    tileColor: 0xffd700,
    tileAlpha: 0.6
  }
}

// 获取棋盘配置
export function getBoardConfig(shape: BoardShape): BoardConfig {
  return BOARD_CONFIGS[shape]
}

// 获取所有可用棋盘形状
export function getAvailableBoardShapes(): BoardShape[] {
  return Object.values(BoardShape)
}

// 导出默认棋盘（心形）
export const DEFAULT_BOARD_SHAPE = BoardShape.HEART
export const DEFAULT_BOARD_CONFIG = BOARD_CONFIGS[BoardShape.HEART]
