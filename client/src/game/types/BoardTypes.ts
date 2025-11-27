// 棋盘路径点接口
export interface PathPoint {
  x: number
  y: number
}

// 棋盘配置接口
export interface BoardConfig {
  name: string
  pathPoints: PathPoint[]
  tileSize: number
  backgroundColor: number
  tileColor: number
  tileAlpha: number
}

// 棋盘形状枚举
export enum BoardShape {
  HEART = 'heart',
  CIRCLE = 'circle',
  SQUARE = 'square',
  STAR = 'star'
}
