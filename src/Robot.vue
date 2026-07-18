<script setup lang="ts">
  import { useRobotStore } from './stores/robot';

  const robotStore = useRobotStore()
</script>

<template>
  <rect
    width="1"
    height="1"
    :x="robotStore.pos[1]"
    :y="robotStore.pos[0]"
    style="fill: var(--primary-grad-end);"
  />
  <template v-for="(row, posx) in robotStore.visited">
    <template v-for="(cell, posy) in row">
      <rect
        v-if="cell"
        width="1"
        height="1"
        :x="posy"
        :y="posx"
        style="fill: var(--primary-grad-end);"
      />
      </template>
  </template> 

  <text
    fill="#fff"
    font-size="0.5"
    :x="robotStore.pos[1]!+0.35"
    :y="robotStore.pos[0]!+0.65"
    :transform="`rotate(${robotStore.toAngle(robotStore.dir)}, ${robotStore.pos[1]!+.5}, ${robotStore.pos[0]!+.5})`"
  >
    >
  </text>
</template>