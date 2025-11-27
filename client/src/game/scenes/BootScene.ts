import Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  private character!: Phaser.GameObjects.Rectangle
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private debugText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // Day 1: 使用占位图形代替立绘
    // 后续会加载真实的角色立绘图片
    console.log('BootScene: Preloading assets...')
  }

  create() {
    console.log('BootScene: Creating game objects...')
    console.log('Game dimensions:', this.game.config.width, this.game.config.height)

    // 创建一个占位角色 (粉色矩形代表辣妹)
    this.character = this.add.rectangle(540, 960, 200, 400, 0xff69b4)
    
    // 添加文字标签
    this.add.text(540, 960, '辣妹占位图', {
      fontSize: '24px',
      color: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5)

    // 添加操作提示
    this.add.text(540, 1700, '← → 键移动角色', {
      fontSize: '32px',
      color: '#fff',
      fontFamily: 'Arial'
    }).setOrigin(0.5)

    // 调试信息
    this.debugText = this.add.text(20, 20, 'Debug: 等待键盘输入...', {
      fontSize: '20px',
      color: '#ffff00',
      fontFamily: 'Arial'
    })

    // 启用键盘控制
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys()
      console.log('键盘控制已启用:', this.cursors)
    } else {
      console.error('键盘输入未启用！')
    }

    console.log('Day 1 完成：Phaser游戏实例已启动，可以用方向键移动角色!')
    console.log('Character created at:', this.character.x, this.character.y)
  }

  update() {
    if (!this.character || !this.cursors) return

    let moved = false
    const speed = 10

    // 左右键移动角色
    if (this.cursors.left.isDown) {
      this.character.x -= speed
      moved = true
      this.debugText.setText('Debug: 按下 ← 键')
    } else if (this.cursors.right.isDown) {
      this.character.x += speed
      moved = true
      this.debugText.setText('Debug: 按下 → 键')
    }

    if (!moved) {
      this.debugText.setText(`Debug: 位置 X=${Math.floor(this.character.x)}`)
    }

    // 限制移动范围
    this.character.x = Phaser.Math.Clamp(this.character.x, 100, 980)
  }
}
