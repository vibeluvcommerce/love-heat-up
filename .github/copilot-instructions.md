# Love Heat Up - AI Agent Instructions

## Project Overview
18+ browser-based strip Monopoly game built with Vue 3 + Phaser 3 (frontend) and Flask-SocketIO (backend). Players compete on a heart-shaped board, acquiring properties that trigger opponent strip animations with moaning sound effects. Supports single-player AI opponents and 2-4 player real-time multiplayer.

## Architecture & Tech Stack

**Frontend (client/):**
- Vue 3 (Composition API + TypeScript) for UI, routing, lobby, settings
- Phaser 3 as game engine (mounted in single `<canvas>` component at `views/GameView.vue`)
- Howler for audio (moaning sfx, BGM)
- vite-plugin-pwa for progressive web app packaging

**Backend (server/):**
- Flask + Flask-SocketIO for real-time multiplayer synchronization (confirmed tech stack)
- Database: SQLite for development (`db.sqlite3`), PostgreSQL for production (zero-config local, one-command production switch)
- i18n: Flask-Babel for server-side translations, Vue I18n for client-side (Chinese Simplified + English required from Day 0)

## Critical Development Workflow

**Initial Setup (Day 0):**
```powershell
# Client setup
pnpm create vite@latest client -- --template vue-ts
cd client ; pnpm add phaser howler @types/howler vite-plugin-pwa vue-i18n

# Server setup
mkdir server ; cd server
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install flask flask-socketio eventlet flask-babel
```

**Running Development:**
- Client: `cd client ; pnpm dev` (Vite on port 5173)
- Server: `cd server ; .\venv\Scripts\Activate.ps1 ; flask run` (port 5000)
- Both terminals must run simultaneously for multiplayer testing

## Core Game Systems (Implementation Order)

### 1. Phaser Game Instance (Day 1)
- Entry point: `client/src/game/MainGame.ts` creates `Phaser.Game(config)` mounted to `#game-canvas` in `GameView.vue`
- Scene structure: `BootScene` (preload assets) → `MainGame` (gameplay)
- Character rendering: Large standing sprites at (540, 960) with keyboard movement for initial test

### 2. Heart-Shaped Board Path (Day 2)
- 40 grid positions stored as `pathPoints: Array<{x: number, y: number}>`
- Movement: Phaser Tweens chain through path array based on dice roll (1-6)
- Visual: Graphics or sprite grid forming heart outline

### 3. Property System (Day 3)
- Each tile: `{id: number, price: 800-2000, owner: string|null, level: 0-3}`
- Purchase flow: Land on empty → Vue modal "Buy XXX Hotel?" → deduct money → change tile color + add flag sprite
- Player state: Initial money 15000, displayed in Vue UI top-right

### 4. **Strip Mechanic (Day 4 - CORE APPEAL)**
- Each character has 6 clothing stages: `clothes: 5` (fully dressed) → `0` (nude)
- AI characters assigned 4-5 "owned tiles" hardcoded in map data
- **Trigger:** When player purchases AI's owned tile → `aiCharacter.clothes--` → switch character sprite immediately → `camera.shake(300)` + cloth-ripping SFX via Howler
- Critical: This instant visual+audio feedback is the game's primary dopamine loop

### 5. Rent/Moaning System (Day 5)
- Landing on owned property: Deduct `tile.price * (tile.level + 1)`
- **Simultaneous triggers:**
  - Owner's character sprite: Phaser tween for 800ms violent shake (random offset ±50px X/Y)
  - Howler plays random moaning clip from character's 5+ voice lines
  - Screen flash: Red vignette overlay (alpha fade)

### 6. Bankruptcy & Victory CG (Day 6)
- Money < 0 → force `clothes = 0` → switch to "collapsed" sprite pose → play 10s struggling animation
- Last player standing → fullscreen 30s victory CG video (placeholder initially)
- This completes minimum viable single-player loop

## Multiplayer Architecture (Days 10-15)

### Server-Side Authority
- **All randomness server-generated:** Dice rolls, card draws emit from Flask
- Room management: `/create_room` returns `room_id`, clients join via SocketIO `join_room` event
- Turn sync: Server broadcasts `{current_player_id, dice_value}` → all clients animate simultaneously
- State events: `buy_property`, `pay_rent`, `player_bankrupt`, `game_over` all server-validated then broadcast

### Client SocketIO Events Pattern
```typescript
// Example: client/src/services/SocketService.ts
socket.on('dice_roll', ({playerId, value}) => {
  // All clients execute same animation
  movePlayerToken(playerId, value);
});

socket.emit('request_buy', {tileId, playerId}, (response) => {
  if (response.success) updateLocalState();
});
```

### Reconnection Logic (Day 15)
- Server maintains game state for 30s after disconnect
- Rejoin sends full state snapshot to sync client

## Special Card System (Days 19-21, Extensible)

**Desire Points (♥) Economy:**
- Gain +10♥ per turn (displayed in Vue UI)
- Shop accessed via overlay modal

**Initial Three Cards (implementation order):**
1. "Forced Strip" (♥200): Target opponent `clothes--` immediately
2. "10s Tremor" (♥350): Target shakes + moaning loop for 10 seconds
3. "Mini Climax" (♥500): Target -2000 money + screaming SFX + screen flash

**Card System Architecture (for future expansion):**
```typescript
// client/src/types/Card.ts
interface Card {
  id: string;
  nameKey: string; // i18n key like 'cards.forced_strip.name'
  descKey: string; // i18n key
  cost: number;    // ♥ cost
  category: 'strip' | 'damage' | 'buff' | 'debuff';
  target: 'single' | 'all' | 'self';
  execute: (game: GameState, targetId: string) => void;
  animationKey?: string; // Phaser animation identifier
}
```
Store cards in `client/src/data/cards.ts` as array - new cards simply push to array without touching core logic

## Asset Organization (Days 22-30)

Each character requires:
- 6 standing sprites (fully dressed → nude, naming: `char1_stage0.png` through `char1_stage5.png`)
- 1 collapsed sprite (`char1_collapsed.png`)
- 8+ moaning audio clips (`char1_moan_01.ogg` through `char1_moan_08.ogg`)
- 1 victory CG video (30s, `char1_victory.mp4`)

**Asset Loading Pattern:**
```typescript
// BootScene.ts
preload() {
  for (let i = 0; i < 6; i++) {
    this.load.image(`char1_stage${i}`, `assets/char1/stage${i}.png`);
  }
  this.load.audio('char1_moans', [
    'assets/char1/moan_01.ogg',
    'assets/char1/moan_02.ogg',
    // ... etc
  ]);
}
```

## Project-Specific Conventions

- **i18n from Day 0:** All user-facing text uses i18n keys - NEVER hardcode strings
  - Client: `$t('ui.buy_property')` in Vue, `i18n.t('cards.forced_strip.name')` in services
  - Server: Flask-Babel for error messages, notifications
  - Default locale: Chinese Simplified (`zh-CN`), fallback: English (`en`)
  - Translation files: `client/src/locales/zh-CN.json`, `client/src/locales/en.json`
- **Chinese comments allowed:** Development plan is in Chinese; bilingual code comments acceptable
- **Placeholder assets required:** Days 1-21 use ANY images/sounds to validate mechanics; final assets swap in Days 22-30
- **Daily progress visibility:** Each day's work must produce visible browser changes (no "backend prep days")
- **Phaser-Vue boundary:** Game logic lives in Phaser; UI (lobby, settings, modals) in Vue components
- **No TypeScript strictness initially:** Focus on rapid prototyping; refactor type safety after Day 30

## Testing Approach

- **Single-player (Days 1-9):** Test against 3 AI opponents with simple strategy: 90% probability buy empty property, 10% skip; always auto-upgrade owned properties when landing
- **Multiplayer (Days 10-15):** Open 4 browser tabs on localhost, simulate 4 players
- **i18n testing:** Toggle between `zh-CN` and `en` locales in settings - all UI must update without reload
- **Audio testing:** Critical for moaning triggers - verify no audio overlap/clipping with rapid property purchases
- **DLC testing:** Mock ownership states to verify locked/unlocked character access
- **Performance target:** 60 FPS on mobile devices (optimize sprite atlases, compress audio)

## Monetization & DLC System

### Character DLC Packs
- Each DLC character = standalone folder: `client/public/dlc/char_<id>/` containing:
  - 6-stage sprites, collapsed sprite, 8+ moans, 30s victory video
  - `metadata.json`: `{id, nameKey, price, unlockMethod: 'purchase'|'ad'}`
- Client checks ownership via server endpoint `/api/user/owned_dlc`
- Character selection screen filters available characters based on ownership

**Implementation pattern:**
```typescript
// client/src/services/DLCService.ts
interface DLCCharacter {
  id: string;
  nameKey: string; // i18n key
  owned: boolean;
  price?: number; // USD cents for IAP
  unlockAdCount?: number; // e.g., watch 5 ads to unlock
}
```

### Ad Integration (AdMob / Unity Ads)
- **Rewarded video placement:**
  1. Pre-game: "Watch ad → +500♥ starting bonus"
  2. Mid-game: "Watch ad → instant revival with 5000 money" (bankruptcy recovery)
  3. Post-game: "Watch ad → unlock random DLC character progress (+1/5)"
- **Implementation:** Wrap ad SDK in `client/src/services/AdService.ts` with callbacks:
  ```typescript
  AdService.showRewarded('pre_game_boost', (success) => {
    if (success) grantDesirePoints(500);
  });
  ```
- **Banner ads:** Bottom of lobby screen only (never during gameplay to preserve immersion)

## Deployment (Days 36-45)

- **PWA Build:** `vite-plugin-pwa` configured for "Add to Home Screen"
- **Production hosts:**
  - Frontend: Vercel (automatic Vue/Vite deployment)
  - Backend: Railway or Render (Flask + PostgreSQL addon)
- **Database migration:** Change Flask config from SQLite to `DATABASE_URL` env var for PostgreSQL
- **Asset CDN:** Serve large CG videos + DLC packs from CDN (Cloudflare R2 / AWS S3)
- **Payment integration:** Stripe for web DLC purchases, Google Play IAP for Android PWA

## Important Notes for AI Agents

1. **This is an adult game** - all strip/moaning mechanics are core features, not bugs
2. **Visual feedback timing is critical** - sprite changes, shakes, and audio must feel instant (<100ms latency)
3. **Server authority prevents cheating** - never trust client-side dice rolls or money calculations in multiplayer
4. **i18n is non-negotiable** - reject any PR with hardcoded Chinese/English strings; all text must use translation keys
5. **The 45-day timeline is aggressive** - prioritize working features over polish until Day 31
6. **Flask-SocketIO is the confirmed backend** - do not suggest Node.js/Socket.io alternatives
7. **Audio licensing matters** - use royalty-free moaning SFX or commission custom recordings
8. **DLC architecture must be modular** - adding new character should only require dropping assets into `dlc/` folder + one metadata JSON
