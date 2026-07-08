import { ref, computed, onUnmounted } from 'vue'
import { TIMER_PRESETS } from '@/types/exercise'

export function useTimer(initialSeconds = 60) {
  const totalSeconds = ref(initialSeconds)
  const remainingSeconds = ref(initialSeconds)
  const isRunning = ref(false)
  const isPaused = ref(false)
  const isComplete = ref(false)
  let timerId: ReturnType<typeof setInterval> | null = null

  const progress = computed(() => {
    if (totalSeconds.value === 0) return 0
    return ((totalSeconds.value - remainingSeconds.value) / totalSeconds.value) * 100
  })

  const displayTime = computed(() => {
    const mins = Math.floor(remainingSeconds.value / 60)
    const secs = remainingSeconds.value % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  const presets = TIMER_PRESETS

  function start(): void {
    if (isRunning.value && !isPaused.value) return
    isRunning.value = true
    isPaused.value = false
    isComplete.value = false

    timerId = setInterval(() => {
      if (remainingSeconds.value > 0) {
        remainingSeconds.value--
      } else {
        pause()
        isComplete.value = true
      }
    }, 1000)
  }

  function pause(): void {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
    isPaused.value = true
    isRunning.value = false
  }

  function resume(): void {
    if (isPaused.value) {
      start()
    }
  }

  function reset(seconds?: number): void {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
    if (seconds !== undefined) {
      totalSeconds.value = seconds
    }
    remainingSeconds.value = totalSeconds.value
    isRunning.value = false
    isPaused.value = false
    isComplete.value = false
  }

  function setDuration(seconds: number): void {
    reset(seconds)
  }

  onUnmounted(() => {
    if (timerId) clearInterval(timerId)
  })

  return {
    totalSeconds,
    remainingSeconds,
    isRunning,
    isPaused,
    isComplete,
    progress,
    displayTime,
    presets,
    start,
    pause,
    resume,
    reset,
    setDuration,
  }
}
