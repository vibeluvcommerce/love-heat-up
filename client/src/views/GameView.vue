<template>
  <div class="game-container">
    <div id="game-canvas"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { MainGame } from '../game/MainGame'

let game: Phaser.Game | null = null

onMounted(() => {
  // 初始化Phaser游戏实例
  game = new MainGame()
})

onUnmounted(() => {
  // 清理游戏实例
  if (game) {
    game.destroy(true)
    game = null
  }
})
</script>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
  position: relative;
}

#game-canvas {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
