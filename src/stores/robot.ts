import { defineStore } from "pinia"
import { ref, type Ref } from "vue"
import { useWallsStore } from "./walls"

export const useRobotStore = defineStore('robot', () => {
  enum Direction {
    UP, RIGHT, DOWN, LEFT
  }
  type Vector = [number, number]
  const directionData:{vector:Vector,angle:number}[] = [
    { vector: [-1, 0], angle: 270 },
    { vector: [ 0, 1], angle: 0   },
    { vector: [ 1, 0], angle: 90  },
    { vector: [ 0,-1], angle: 180 }
  ];

  function toVector(dir: Direction): Vector{
    return directionData[dir]!.vector;
  }

  function toAngle(dir: Direction): number{
    return directionData[dir]!.angle;
  }

  function turnLeft(dir: Direction): Direction {
    return (dir + 3) % 4;
  }

  function turnRight(dir: Direction): Direction {
    return (dir + 1) % 4;
  }
  const pos:Ref<Vector> = ref([0,1])
  const dir = ref(Direction.RIGHT)

  const wallsStore = useWallsStore()

  function advance() {
    visited.value[pos.value[0]]![pos.value[1]] = true
    const vector = toVector(dir.value)
    const nextPos:Vector = [pos.value[0]!+vector[0],pos.value[1]!+vector[1]]
    if ( nextPos[1] < 0 || nextPos[1] >= wallsStore.walls.length ||
         nextPos[0] < 0 || nextPos[0] >= wallsStore.walls[0]!.length
    ) {
      moving.value = false
      return
    }
    const nextWall = wallsStore.walls[nextPos[0]]?.[nextPos[1]]
    if ( nextWall == 'R') {
      dir.value = turnRight(dir.value)
    } else if (nextWall == 'L') {
      dir.value = turnLeft(dir.value)
    } else {
      pos.value = nextPos
    }
  }

  const moving = ref(false)
  const speed = ref(1)
  function startRobot() {
    moving.value = true
    requestAnimationFrame(moveRobot)
  }

  let lastTime = 0
  let accumulator = 0

  function moveRobot(time: number) {
  if (!moving.value) {
    lastTime = 0
    accumulator = 0
    return
  }

  if (lastTime == 0) lastTime = time

  const rows = wallsStore.walls.length
  const cols = wallsStore.walls[0]?.length
  const cells = Math.sqrt(rows * cols!)

  const delta = (time - lastTime) / 1000 // seconds
  lastTime = time

  accumulator += delta * speed.value * cells

  while (accumulator >= 1 && moving.value) {
    advance()
    accumulator--
  }
  requestAnimationFrame(moveRobot)
}

  function stopRobot() {
    moving.value = false
  }

  const visited:Ref<boolean[][]> = ref([])

  return { pos, dir, moving, speed, visited, Direction, toAngle, advance, startRobot, stopRobot, moveRobot }
})
