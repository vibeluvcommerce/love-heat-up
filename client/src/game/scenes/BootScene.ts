import Phaser from 'phaser'
import type { BoardConfig } from '../types/BoardTypes'
import { BoardShape } from '../types/BoardTypes'
import { getBoardConfig, getAvailableBoardShapes } from '../data/BoardConfigs'

export class BootScene extends Phaser.Scene {
  private playerToken!: Phaser.GameObjects.Arc
  private currentPosition: number = 0
  private tiles: Phaser.GameObjects.Rectangle[] = []
  private boardConfig!: BoardConfig
  private currentBoardShape: BoardShape = BoardShape.HEART

  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    console.log('BootScene: Preloading assets...')
  }

  create() {
    console.log('BootScene: Creating game board...')

    // 加载当前棋盘配置
    this.boardConfig = getBoardConfig(this.currentBoardShape)

    // 设置背景色
    this.cameras.main.setBackgroundColor(this.boardConfig.backgroundColor)

    // 绘制棋盘
    this.createBoard()

    // 创建玩家棋子
    this.createPlayerToken()

    // 添加UI
    this.createUI()

    // 点击屏幕掷骰子
    this.input.on('pointerdown', () => {
      this.rollDice()
    })

    console.log(`Day 2 完成：${this.boardConfig.name}已创建，点击屏幕掷骰子！`)
  }

  createBoard() {
    const { pathPoints, tileSize, tileColor, tileAlpha } = this.boardConfig

    // 在每个路径点上绘制格子
    pathPoints.forEach((point, index) => {
      // 格子背景
      const tile = this.add.rectangle(
        point.x,
        point.y,
        tileSize,
        tileSize,
        tileColor,
        tileAlpha
      )
      tile.setStrokeStyle(3, 0xffffff)
      this.tiles.push(tile)

      // 格子编号
      this.add.text(point.x, point.y, `${index}`, {
        fontSize: '16px',
        color: '#fff',
        fontFamily: 'Arial'
      }).setOrigin(0.5)
    })
  }

  createPlayerToken() {
    const startPos = this.boardConfig.pathPoints[0]
    if (!startPos) return

    // 创建圆形棋子（青色）
    this.playerToken = this.add.circle(
      startPos.x,
      startPos.y,
      25,
      0x00ffff
    )
    this.playerToken.setStrokeStyle(4, 0xffffff)
    this.playerToken.setDepth(10) // 确保棋子在最上层
  }

  createUI() {
    // 标题
    this.add.text(540, 100, `${this.boardConfig.name} - 点击屏幕掷骰子！`, {
      fontSize: '36px',
      color: '#fff',
      fontFamily: 'Arial',
      backgroundColor: '#000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)

    // 切换棋盘按钮提示
    const shapes = getAvailableBoardShapes()
    const shapeNames = shapes.map(s => getBoardConfig(s).name).join(' / ')
    
    this.add.text(540, 1850, `可扩展棋盘：${shapeNames}`, {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5)

    // 添加键盘切换功能（按空格键切换棋盘）
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.switchBoard()
    })
  }

  switchBoard() {
    const shapes = getAvailableBoardShapes()
    const currentIndex = shapes.indexOf(this.currentBoardShape)
    const nextIndex = (currentIndex + 1) % shapes.length
    const nextShape = shapes[nextIndex]
    
    if (!nextShape) return
    
    this.currentBoardShape = nextShape

    console.log(`切换到：${getBoardConfig(this.currentBoardShape).name}`)
    
    // 重启场景
    this.scene.restart()
  }

  rollDice() {
    // 随机1-6
    const diceValue = Phaser.Math.Between(1, 6)
    console.log(`掷骰子：${diceValue}`)

    // 计算目标位置
    const totalTiles = this.boardConfig.pathPoints.length
    const targetPosition = (this.currentPosition + diceValue) % totalTiles

    // 创建移动路径
    this.moveTokenAlongPath(this.currentPosition, diceValue)

    this.currentPosition = targetPosition
  }

  moveTokenAlongPath(from: number, steps: number) {
    // 创建Tween链，逐格移动
    let currentStep = from
    const totalTiles = this.boardConfig.pathPoints.length

    for (let i = 0; i < steps; i++) {
      currentStep = (currentStep + 1) % totalTiles
      const nextPos = this.boardConfig.pathPoints[currentStep]
      if (!nextPos) continue

      this.tweens.add({
        targets: this.playerToken,
        x: nextPos.x,
        y: nextPos.y,
        duration: 200,
        delay: i * 200, // 延迟，形成逐格移动效果
        ease: 'Power2'
      })
    }
  }
}
