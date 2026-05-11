import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { TextPlugin } from 'gsap/TextPlugin'
import { useGSAP } from '@gsap/react'

// Register once at module level — never inside a component
gsap.registerPlugin(ScrollTrigger, SplitText, TextPlugin, useGSAP)

export { gsap, ScrollTrigger, SplitText, TextPlugin, useGSAP }
