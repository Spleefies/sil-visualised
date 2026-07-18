import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useWallsStore = defineStore('walls', () => {
  const walls:Ref<Wall[][]> = ref([])

  type Wall = '.' | 'R' | 'L'
  return { walls }
})