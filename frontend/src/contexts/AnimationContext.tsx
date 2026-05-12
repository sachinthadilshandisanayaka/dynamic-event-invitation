import { createContext, useContext } from 'react'

/** When true, all GSAP text/scroll animations are skipped (admin builder preview). */
export const AnimationDisabledContext = createContext(false)
export const useAnimationDisabled = () => useContext(AnimationDisabledContext)
