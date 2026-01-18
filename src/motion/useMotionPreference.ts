import { useReducedMotion } from 'motion/react'
import type { Variants } from 'motion/react'

export function useMotionPreference() {
  const shouldReduceMotion = useReducedMotion()

  const getVariants = (variants: Variants): Variants => {
    if (shouldReduceMotion) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.1 } }
      }
    }
    return variants
  }

  const getTransition = (transition: object) => {
    if (shouldReduceMotion) {
      return { duration: 0 }
    }
    return transition
  }

  return {
    shouldReduceMotion: shouldReduceMotion ?? false,
    getVariants,
    getTransition
  }
}
