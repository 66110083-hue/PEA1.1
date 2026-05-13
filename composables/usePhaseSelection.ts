import { ref } from 'vue'

export const usePhaseSelection = () => {
  const PHASES = [
    { id: 'A', name: 'Phase A', color: '#378ADD' },
    { id: 'B', name: 'Phase B', color: '#1D9E75' },
    { id: 'C', name: 'Phase C', color: '#BA7517' }
  ] as const

  const activePhases = ref<string[]>(['A', 'B', 'C'])

  const togglePhase = (id: string) => {
    const idx = activePhases.value.indexOf(id)
    if (idx > -1) {
      if (activePhases.value.length > 1) activePhases.value.splice(idx, 1)
    } else {
      activePhases.value.push(id)
      activePhases.value.sort()
    }
  }

  return { PHASES, activePhases, togglePhase }
}