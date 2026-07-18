<script setup lang="ts">
  import { useWallsStore } from './stores/walls'

  const wallStore = useWallsStore()

  const toggle:Record<Wall, Wall> = {
    'R': '.',
    'L': 'R',
    '.': 'L',
  }
  type Wall = '.' | 'R' | 'L'
  function toggleCell(posy: number, posx: number) {
    wallStore.walls[posy]![posx] = toggle[wallStore.walls[posy]![posx]!]
  }
</script>

<template>
  <template v-for="(row, posy) in wallStore.walls">
    <text
      v-for="(wall, posx) in row"
      fill="#fff"
      font-size="0.5"
      :x="posx+0.35"
      :y="posy+0.65"
      >
      {{ wall.replace('.',' ') }}
      </text>
    <rect
      v-for="(_, posx) in row"
      :x="posx"
      :y="posy"
      width="1" height="1"
      fill="#0000"
      v-on:click="toggleCell(posy, posx)"
    />
  </template>
</template>