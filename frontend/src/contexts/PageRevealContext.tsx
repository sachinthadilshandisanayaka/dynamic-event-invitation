import { createContext, useContext } from 'react'

/** True once the entrance animation (envelope / loading screen) has completed
 *  and the invitation content is fully visible. Hero-mode text animations gate
 *  on this so they don't fire while the page is still hidden (opacity: 0). */
export const PageRevealContext = createContext(true)   // default true = no envelope
export const usePageRevealed = () => useContext(PageRevealContext)
