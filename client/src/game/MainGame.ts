import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'

export class MainGame extends Phaser.Game {
  constructor() {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1080,
      height: 1920,
      parent: 'game-canvas',
      backgroundColor: '#ff1493',
      scene: [BootScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      input: {
        keyboard: true
      }
    }

    super(config)
    console.log('Phaser.Game 实例已创建:', this)
  }
}
