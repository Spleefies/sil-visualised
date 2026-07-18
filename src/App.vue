<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import Base  from './Base.vue'
  import Robot from './Robot.vue'
  import Walls from './Walls.vue'
  import { useWallsStore } from './stores/walls.ts'
  import { useRobotStore } from './stores/robot.ts'

  const problemInput = ref("10 10\n5 5")
  const gridInput     = computed(() => problemInput.value.split('\n')[0]?.split(' '))
  const gridRows      = computed(() => Number(gridInput.value?.[0]))
  const gridColumns   = computed(() => Number(gridInput.value?.[1]))
  const robotStartPos = computed(() => problemInput.value.split('\n')[1]?.split(' '))
  const robotStartX   = computed(() => Number(robotStartPos.value?.[0])-1)
  const robotStartY   = computed(() => Number(robotStartPos.value?.[1])-1)

  const wallsStore = useWallsStore()
  const robotStore = useRobotStore()

  const gridString = computed({
    get() {
      return wallsStore.walls.map(row => row.join('')).join('\n')
    },
    set(gridStr) {
      wallsStore.walls = gridStr.split('\n').map(row => row.split('')) as Wall[][]
    }
  })
  type Wall = '.' | 'R' | 'L'
  const score = computed(() => robotStore.visited.flat().filter(Boolean).length)

  function resetGrid() {
    gridString.value = Array.from({ length: gridColumns.value }, () => '.'.repeat(gridRows.value)).join('\n')
  }

  function copyGrid() {
    navigator.clipboard.writeText(gridString.value)
  }

  function resetRobot() {
    robotStore.pos[0] = robotStartX.value
    robotStore.pos[1] = robotStartY.value
    robotStore.dir = robotStore.Direction.RIGHT
    robotStore.visited = wallsStore.walls.map(row => Array(row.length).fill(false))
  }

  resetGrid()
  resetRobot()

  watch(problemInput, resetRobot)
  watch([gridRows, gridColumns], resetGrid) 

</script>

<template>
  <div class="container">
    <div class="header-row">
      <h1>Wandering Robot Visualiser</h1>
      <div class="subtitle" id="subtitle">Score: {{ score }}</div>
    </div>
    <div>
      <div style="flex: 2">
        <svg :viewBox="`0 0 ${gridColumns} ${gridRows}`" style="height: 90vh;">
          <Base :width="gridColumns" :height="gridRows"/>
          <Robot/>
          <Walls/>
        </svg>
      </div>
      <div style="flex: 1">
        <div class="input-panel">
          <label for="problem-input">Problem input</label>
          <div class="panel-subtitle">First line n m, Second line x y.</div>
          <!-- <div class="input-row" style="margin-top:0; margin-bottom:10px;">
            <select id="template-select" title="Load a template">
              <option value="">Load a template...</option>
              <option value="Sample">Sample</option><option value="Subtask 1">Subtask 1</option><option value="Subtask 2">Subtask 2</option><option value="Subtask 3">Subtask 3</option>
            </select>
            <span style="font-size:12px; color:rgba(255,255,255,0.4);">Loads into the box below and applies immediately.</span>
          </div> -->
          <textarea id="problem-input" spellcheck="false" v-model="problemInput"></textarea>
          <!-- <div class="input-row">
            <button id="apply-problem" class="primary">Apply problem</button>
            <span class="input-status ok" id="problem-status">Restored your previous session.</span>
          </div> -->
        </div>
        <div class="input-panel">
          <label for="moves-input">Grid</label>
          <div class="panel-subtitle">A grid with n rows and m columns. Empty cells represented with . and
            walls represented with either L or R. The cell (x, y) must be empty.</div>
          <textarea id="moves-input" spellcheck="false" v-model="gridString"></textarea>
          <div class="input-row">
            <!-- <button id="load-grid-file-btn" title="Load grid from an output file">Load file</button> -->
            <button id="copy-grid" title="Copy grid to clipboard" @click="copyGrid">Copy</button>
            <button id="reset-moves" @click="resetGrid()">Reset Grid</button>
            <input type="file" id="moves-file-input" accept=".txt,text/plain" style="display:none">
            <span class="input-status" id="moves-status"></span>
          </div>
        </div>
        <div class="input-panel">
          <label for="robot-controls">Robot Controls</label>
          <div class="input-row">
            Speed: <input type="range" min="1" max="8" v-model="robotStore.speed"/>{{ robotStore.speed }}x
          </div>
          <div class="input-row">
            <button v-if="robotStore.moving" class="primary" @click="robotStore.stopRobot()" >Stop robot</button>
            <button v-else class="primary" @click="robotStore.startRobot()">Start robot</button>
            <button @click="resetRobot()">Reset robot</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <link href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;500;700&family=Orbitron:wght@400..900&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..600,0..1,0" rel="stylesheet"/>
  
  <style>
  :root {
    --primary: #E4FD75;
    --primary-grad-end: #6E8022;
    --secondary: #B9CD60;
    --complementary: #8e75fd;   /* water */
    --destructive: #FF4C4C;     /* robot / errors */
    --background: #090909;
    --border: rgba(255, 255, 255, 0.2);
    --border-soft: rgba(255, 255, 255, 0.1);
    --panel: rgba(255, 255, 255, 0.03);
    --muted: rgba(255, 255, 255, 0.6);
    --radius-btn: 8px;
    --radius-panel: 12px;
    --radius-card: 14px;
  }
  * { box-sizing: border-box; }
  body {
    font-family: 'Fira Mono', ui-monospace, monospace;
    /* Self-supply the dark background so the visualiser is fully standalone
    instead of relying on the modal painting #090909 behind a transparent
    iframe body. --background is #090909 (declared in :root above). */
    background: var(--background);
    margin: 0;
    padding: 12px 6px 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
  }
  
  /* Scrollbars — themed to match the platform: transparent track, rounded
  translucent thumb, no arrow buttons. */
  * { scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.2) transparent; }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }
  ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.35); background-clip: padding-box; }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
  .container { max-width: 1400px; margin: 0 auto; }
  
  /* Header — title and problem params share one baseline row */
  .header-row {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
  .header-row #subtitle { margin-left: auto; margin-right: 12px; }
  h1 {
    margin: 0;
    font-family: 'Orbitron', sans-serif;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #fff;
  }
  .subtitle { font-size: 13px; color: var(--muted); }
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 20px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    user-select: none;
  }
  
  /* Stats */
  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 16px;
    padding: 16px 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
  }
  .stat-label {
    font-size: 11px;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 500;
  }
  .stat-value {
    font-size: 20px;
    font-weight: 500;
    color: #fff;
    margin-top: 4px;
    font-variant-numeric: tabular-nums;
  }
  .stat-value.score { color: var(--primary); }
  
  /* Canvas */
  .canvas-wrap {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 8px;
    overflow: hidden;
    position: relative;
  }
  .canvas-wrap svg { cursor: grab; }
  .canvas-wrap svg.dragging { cursor: grabbing; }
  .canvas-wrap svg.edit-cursor { cursor: crosshair; }
  .canvas-hint {
    position: absolute;
    bottom: 10px;
    right: 14px;
    font-size: 10px;
    color: rgba(255, 255, 255, 0.35);
    pointer-events: none;
  }
  .edit-badge {
    position: absolute;
    top: 12px;
    left: 14px;
    font-size: 11px;
    font-weight: 700;
    color: var(--primary);
    background: rgba(228, 253, 117, 0.08);
    border: 1px solid rgba(228, 253, 117, 0.4);
    border-radius: 6px;
    padding: 3px 8px;
    pointer-events: none;
  }
  .edit-badge.flash { animation: badge-flash 0.3s; }
  @keyframes badge-flash {
    0%, 100% { background: rgba(228, 253, 117, 0.08); }
    50% { background: rgba(255, 76, 76, 0.35); }
  }
  svg { display: block; width: 100%; height: auto; }
  
  /* Buttons — platform Button.tsx conventions: rounded-md, font-medium,
  uniform 36px height, hover lift. Fixed widths on content-swapping
  buttons so the layout never reflows. */
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    min-width: 40px;
    padding: 0 16px;
    gap: 6px;
    border-radius: var(--radius-btn);
    border: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.04);
    font-family: 'Fira Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all 0.3s;
  }
  button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.35);
    transform: translateY(-1px);
  }
  button:active { transform: translateY(0); }
  button:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(228, 253, 117, 0.4); }
  button:disabled { opacity: 0.35; cursor: default; pointer-events: none; }
  button.icon { width: 36px; min-width: 36px; height: 36px; padding: 0; flex: none; }
  /* Matches the platform's .animated-bg-gradient exactly (app.css):
  rest shows the lime-to-olive gradient, hover eases it upward. */
  button.primary {
    background: linear-gradient(var(--primary) 0%, var(--primary) 50%, var(--primary-grad-end) 100%);
    background-size: 100% 200%;
    background-position: 0% 100%;
    color: #090909;
    /* No border — a transparent border makes the gradient wrap and paint a
    bright 1px lime line along the bottom edge (repeat past padding-box). */
    border: none;
    box-shadow: 0 1px 2px rgba(110, 128, 34, 0.4);
  }
  button.primary:hover {
    background-position: 0% 75%;
    box-shadow: 0 10px 24px rgba(110, 128, 34, 0.35);
    transform: translateY(-2px);
  }
  button.danger {
    background: var(--destructive);
    border-color: var(--destructive);
    color: #fff;
  }
  button.danger:hover { background: rgba(255, 76, 76, 0.9); border-color: transparent; transform: none; }
  button.active {
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(228, 253, 117, 0.1);
  }
  #copy-grid { min-width: 5em; }
  
  /* Playback card groups controls, sparkline and event line into one box */
  .playback-card {
    margin-top: 16px;
    padding: 12px 16px;
    background: var(--panel);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius-panel);
  }
  .playback-divider {
    height: 1px;
    background: var(--border-soft);
    margin: 12px -16px;
  }
  .controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .controls button { height: 36px; }
  .turn-display {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    min-width: 70px;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
  
  /* Range slider — custom, platform-toned */
  input[type="range"] {
    flex: 1;
    height: 36px;
    margin: 0;
    background: transparent;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
  }
  input[type="range"]::-webkit-slider-runnable-track {
    height: 2px;
    background: var(--border);
    border-radius: 1px;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--primary);
    border: 2px solid #090909;
    margin-top: -6px;
    transition: transform 0.15s;
  }
  input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.15); }
  input[type="range"]::-moz-range-track {
    height: 2px;
    background: var(--border);
    border-radius: 1px;
  }
  input[type="range"]::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--primary);
    border: 2px solid #090909;
  }
  
  select {
    height: 40px;
    padding: 0 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-btn);
    background: #131313;
    font-family: 'Fira Mono', monospace;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    font-variant-numeric: tabular-nums;
    transition: border-color 0.3s;
  }
  select:focus { outline: none; border-color: var(--primary); }
  .controls select { height: 36px; }
  .input-panel select { min-width: 220px; }
  
  /* Sparkline — score-over-time strip inside the playback card. The label
  lives in HTML so it is never distorted by the stretched SVG. */
  .sparkline-wrap {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .spark-box { flex: 1 1 0%; min-width: 0; }
  .spark-box svg { display: block; width: 100%; height: 32px; cursor: crosshair; }
  #spark-final {
    font-size: 12px;
    color: var(--primary);
    opacity: 0.8;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  
  /* Event line — last row of the playback card */
  .event-log {
    min-height: 20px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }
  
  /* Input panels */
  .input-panel {
    margin-top: 16px;
    padding: 20px 24px;
    background: var(--panel);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius-panel);
  }
  .input-panel label {
    display: block;
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 2px;
  }
  .panel-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 10px;
  }
  .input-panel textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius-btn);
    font-family: 'Fira Mono', monospace;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    resize: vertical;
    background: rgba(255, 255, 255, 0.02);
    line-height: 1.5;
    transition: border-color 0.3s;
  }
/* .input-panel textarea#problem-input { min-height: 110px; } */
  .input-panel textarea#moves-input { min-height: 64px; }
  .input-panel textarea:focus { outline: none; border-color: var(--primary); }
  .input-row {
    display: flex;
    gap: 10px;
    margin-top: 10px;
    align-items: center;
  }
  .input-status {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    flex: 1;
  }
  .input-status.error { color: var(--destructive); }
  .input-status.ok { color: var(--primary); }
  
  /* Legend (inside the help modal) */
  .legend {
    margin-top: 8px;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border-soft);
    border-radius: var(--radius-btn);
    font-size: 11px;
    color: rgba(255, 255, 255, 0.7);
    display: flex;
    gap: 18px;
    flex-wrap: wrap;
    align-items: center;
  }
  .legend-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
    vertical-align: middle;
  }
  /* Modals — platform Dialog.tsx convention: header bar + body */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: none;
    place-items: center;
    z-index: 50;
  }
  .modal-overlay.visible { display: grid; }
  .modal {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: clip;
    width: min(92vw, 720px);
    max-height: 84vh;
    display: flex;
    flex-direction: column;
  }
  #confirm-reset-overlay .modal, #confirm-load-overlay .modal { width: min(92vw, 480px); }
  .modal-header {
    height: 48px;
    flex: none;
    padding: 0 20px;
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    font-weight: 700;
  }
  .modal-body { padding: 16px 20px; overflow-y: auto; }
  .modal h3 {
    font-family: 'Orbitron', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: #fff;
    margin: 20px 0 8px 0;
  }
  .modal p, .modal li {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.65;
    margin: 4px 0;
  }
  .modal ol, .modal ul { padding-left: 20px; margin: 6px 0; }
  .modal .callout {
    border: 1px solid rgba(228, 253, 117, 0.4);
    background: rgba(228, 253, 117, 0.06);
    border-radius: var(--radius-btn);
    padding: 10px 14px;
    margin: 10px 0;
  }
  .modal .callout h3 { margin-top: 0; }
  .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 18px;
  }
  .modal-actions button { text-transform: uppercase; }
  
  .container > div {
    display: flex;
  }
</style>
