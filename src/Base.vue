<script setup lang="ts">
  import { computed } from "vue";

  const props = defineProps(['width', 'height'])
  const posys = computed(() => Array.from({ length: props.height }, (_, i) => i))
  const posxs = computed(() => Array.from({ length: props.width  }, (_, i) => i))
  
</script>
<template>
  <g opacity="0.2">
  <template v-for="posx in posxs">
    <rect
      v-for="posy in posys"
      width="1"
      height="1"
      stroke="#fff"
      stroke-width="0.03"
      :x="posx"
      :y="posy"
      />
  </template>
  </g>
</template>