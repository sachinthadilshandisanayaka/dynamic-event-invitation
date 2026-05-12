/**
 * WeddingScene — Three.js WebGL layer (light/romantic theme)
 *
 * Visual language: clean cream paper envelope on transparent canvas.
 * The HTML background gradient shows through — no dark skydome needed.
 * Matches the reference design: white envelope, rose wax seal, warm lighting.
 */

import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { gsap } from '../../lib/gsap-init'

export type EnvelopeState = 'idle' | 'hinted' | 'opening' | 'open' | 'revealing' | 'revealed'

interface Props {
  state: EnvelopeState
  onEnvelopeClick: () => void
  onOpenComplete: () => void
}

// ── Envelope shader — cream paper with X-fold crease ──────────────────────────

const envelopeVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const envelopeFrag = /* glsl */ `
  uniform float uCrease;
  uniform float uDarken;
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    // Warm cream/ivory paper
    vec3 paper = vec3(0.980, 0.962, 0.938);

    // Soft edge shadow for paper depth
    float mx = smoothstep(0.0, 0.09, vUv.x) * smoothstep(1.0, 0.91, vUv.x);
    float my = smoothstep(0.0, 0.07, vUv.y) * smoothstep(1.0, 0.93, vUv.y);
    paper = mix(paper * 0.91, paper, mx * my);

    // X-fold crease lines
    float dA = abs(vUv.x - vUv.y);
    float dB = abs(vUv.x - (1.0 - vUv.y));
    float crease = clamp(smoothstep(0.014, 0.0, dA) + smoothstep(0.014, 0.0, dB), 0.0, 1.0) * uCrease;
    paper = mix(paper, vec3(0.84, 0.81, 0.77), crease * 0.28);

    // Warm directional light
    float ndl = dot(vNormal, normalize(vec3(0.3, 0.8, 1.0))) * 0.13 + 0.87;
    paper *= ndl;
    paper = mix(paper, paper * 0.7, uDarken);
    gl_FragColor = vec4(paper, 1.0);
  }
`

// ── WeddingScene ──────────────────────────────────────────────────────────────

export function WeddingScene({ state, onEnvelopeClick, onOpenComplete }: Props) {
  const mountRef        = useRef<HTMLDivElement>(null)
  const rendererRef     = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef       = useRef<THREE.PerspectiveCamera | null>(null)
  const sceneRef        = useRef<THREE.Scene | null>(null)
  const frameRef        = useRef<number>(0)

  const flapHingeRef    = useRef<THREE.Object3D | null>(null)
  const envelopeBodyRef = useRef<THREE.Mesh | null>(null)
  const sealRef         = useRef<THREE.Mesh | null>(null)
  const sealRingRef     = useRef<THREE.Mesh | null>(null)
  const envelopeGroupRef = useRef<THREE.Group | null>(null)
  const hasOpenedRef    = useRef(false)

  // ── Build scene ────────────────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Transparent renderer — HTML gradient shows through
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)   // fully transparent
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const camera = new THREE.PerspectiveCamera(52, mount.clientWidth / mount.clientHeight, 0.1, 200)
    camera.position.set(0, 0.3, 6)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    const scene = new THREE.Scene()
    sceneRef.current = scene

    // ── Lighting — warm, soft, romantic ─────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xfff8f0, 0.75)
    scene.add(ambient)

    const key = new THREE.DirectionalLight(0xfff4e8, 1.4)
    key.position.set(2, 4, 5)
    key.castShadow = true
    scene.add(key)

    const fill = new THREE.DirectionalLight(0xfce8d0, 0.45)
    fill.position.set(-3, 1, 3)
    scene.add(fill)

    const rim = new THREE.DirectionalLight(0xffe0d0, 0.3)
    rim.position.set(0, -3, -2)
    scene.add(rim)

    // ── Envelope group (for entry animation) ────────────────────────────────
    const group = new THREE.Group()
    scene.add(group)
    envelopeGroupRef.current = group

    // Paper material factory
    const paperMat = (creaseVal: number) => new THREE.ShaderMaterial({
      vertexShader: envelopeVert,
      fragmentShader: envelopeFrag,
      uniforms: {
        uCrease: { value: creaseVal },
        uDarken: { value: 0 },
      },
      side: THREE.DoubleSide,
    })

    // ── Envelope body ───────────────────────────────────────────────────────
    const body = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 3.1, 10, 10),
      paperMat(1.0)
    )
    body.receiveShadow = true
    group.add(body)
    envelopeBodyRef.current = body

    // Bottom triangle fold
    const bottomShape = new THREE.Shape()
    bottomShape.moveTo(-2.1, -1.55)
    bottomShape.lineTo(0, 0.1)
    bottomShape.lineTo(2.1, -1.55)
    bottomShape.closePath()
    const bottomFold = new THREE.Mesh(
      new THREE.ShapeGeometry(bottomShape, 10),
      paperMat(0.5)
    )
    bottomFold.position.z = 0.001
    group.add(bottomFold)

    // Left side fold
    const leftShape = new THREE.Shape()
    leftShape.moveTo(-2.1, -1.55)
    leftShape.lineTo(-2.1, 1.55)
    leftShape.lineTo(0, 0.1)
    leftShape.closePath()
    const leftFold = new THREE.Mesh(
      new THREE.ShapeGeometry(leftShape, 10),
      paperMat(0.4)
    )
    leftFold.position.z = 0.002
    group.add(leftFold)

    // Right side fold
    const rightShape = new THREE.Shape()
    rightShape.moveTo(2.1, -1.55)
    rightShape.lineTo(2.1, 1.55)
    rightShape.lineTo(0, 0.1)
    rightShape.closePath()
    const rightFold = new THREE.Mesh(
      new THREE.ShapeGeometry(rightShape, 10),
      paperMat(0.4)
    )
    rightFold.position.z = 0.002
    group.add(rightFold)

    // ── Flap hinge (top chevron, pivots open) ───────────────────────────────
    const hinge = new THREE.Object3D()
    hinge.position.set(0, 1.55, 0.003)
    group.add(hinge)
    flapHingeRef.current = hinge

    const flapShape = new THREE.Shape()
    flapShape.moveTo(-2.1, 0)
    flapShape.lineTo(0, -1.6)
    flapShape.lineTo(2.1, 0)
    flapShape.closePath()
    const flapMesh = new THREE.Mesh(
      new THREE.ShapeGeometry(flapShape, 12),
      paperMat(0.6)
    )
    hinge.add(flapMesh)

    // ── Wax seal — rose pink ─────────────────────────────────────────────────
    const sealGroup = new THREE.Group()
    sealGroup.position.set(0, 0.12, 0.015)
    group.add(sealGroup)

    // Outer ring
    const ring = new THREE.Mesh(
      new THREE.CircleGeometry(0.32, 64),
      new THREE.MeshStandardMaterial({
        color: 0xC8858A,   // dusty rose
        roughness: 0.55,
        metalness: 0.08,
      })
    )
    sealGroup.add(ring)
    sealRingRef.current = ring

    // Inner seal disc
    const seal = new THREE.Mesh(
      new THREE.CircleGeometry(0.24, 64),
      new THREE.MeshStandardMaterial({
        color: 0xD49098,   // lighter rose center
        roughness: 0.45,
        metalness: 0.12,
      })
    )
    seal.position.z = 0.002
    sealGroup.add(seal)
    sealRef.current = sealGroup as unknown as THREE.Mesh

    // Subtle glow plane behind seal
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(0.45, 32),
      new THREE.MeshBasicMaterial({
        color: 0xF0C0C8,
        transparent: true,
        opacity: 0.18,
      })
    )
    glow.position.z = -0.001
    sealGroup.add(glow)

    // ── Drop shadow plane ────────────────────────────────────────────────────
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 3.7),
      new THREE.MeshBasicMaterial({
        color: 0x8B7060,
        transparent: true,
        opacity: 0.12,
      })
    )
    shadow.position.set(0.12, -0.18, -0.1)
    group.add(shadow)

    // ── Entry animation: envelope scales & rises into position ───────────────
    group.scale.setScalar(0.01)
    group.position.y = -0.8
    gsap.to(group.scale, {
      x: 1, y: 1, z: 1,
      duration: 1.0,
      ease: 'back.out(1.4)',
    })
    gsap.to(group.position, {
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
    })

    // ── Idle float ───────────────────────────────────────────────────────────
    gsap.to(body.position, {
      y: 0.08,
      duration: 2.2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })
    gsap.to(group.rotation, {
      z: 0.012,
      duration: 2.8,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })

    // ── Render loop ───────────────────────────────────────────────────────────
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(frameRef.current)
      gsap.killTweensOf([body.position, group.scale, group.position, group.rotation])
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  // ── Opening animation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (state !== 'opening' || hasOpenedRef.current) return
    hasOpenedRef.current = true

    const seal  = sealRef.current
    const hinge = flapHingeRef.current
    const group = envelopeGroupRef.current
    if (!seal || !hinge || !group) return

    // Stop idle float
    const bodyForKill = envelopeBodyRef.current
    if (bodyForKill) gsap.killTweensOf(bodyForKill.position)
    gsap.killTweensOf(group.rotation)

    const tl = gsap.timeline({ onComplete: onOpenComplete })

    // 1. Seal pulses then shatters
    tl.to(seal.scale, { x: 1.15, y: 1.15, duration: 0.18, ease: 'power2.in' })
    tl.to(seal.scale, { x: 0.01, y: 0.01, duration: 0.25, ease: 'back.in(3)' }, '+=0.05')
    tl.call(() => { seal.visible = false })

    // 2. Sparkle burst from seal position (DOM particles)
    tl.call(() => burstSparkles(mountRef.current))

    // 3. Flap swings open — smooth, satisfying
    tl.to(hinge.rotation, {
      x: -Math.PI * 0.98,
      duration: 1.3,
      ease: 'power3.inOut',
    }, '-=0.1')

    // 4. Camera gently zooms in
    if (cameraRef.current) {
      tl.to(cameraRef.current.position, {
        z: 5.0,
        y: 0.15,
        duration: 1.2,
        ease: 'power2.out',
      }, '-=0.9')
    }

    // 5. Envelope gently retreats & fades
    tl.to(group.position, { z: -0.3, duration: 0.9, ease: 'power2.inOut' }, '-=0.6')
    tl.to(group, { duration: 0.5 })   // brief pause so user sees the open envelope

  }, [state, onOpenComplete])

  // ── Raycaster click ───────────────────────────────────────────────────────
  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (state !== 'idle' && state !== 'hinted') return
    const renderer = rendererRef.current
    const camera   = cameraRef.current
    const mount    = mountRef.current
    if (!renderer || !camera || !mount) return

    const rect = mount.getBoundingClientRect()
    const ndc  = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    )
    const ray = new THREE.Raycaster()
    ray.setFromCamera(ndc, camera)

    const targets = [
      envelopeBodyRef.current,
      sealRef.current,
    ].filter(Boolean) as THREE.Object3D[]

    const hits = ray.intersectObjects(targets, true)
    if (hits.length > 0) onEnvelopeClick()
  }, [state, onEnvelopeClick])

  return (
    <div
      ref={mountRef}
      onClick={handleClick}
      style={{
        position: 'absolute',
        inset: 0,
        cursor: state === 'idle' || state === 'hinted' ? 'pointer' : 'default',
        zIndex: 50,
      }}
    />
  )
}

// ── DOM sparkle burst ─────────────────────────────────────────────────────────
// Gold particles that burst from the seal when it cracks.
// Simpler than Three.js particles and integrates with HTML layer perfectly.

function burstSparkles(mount: HTMLDivElement | null) {
  if (!mount) return
  const rect   = mount.getBoundingClientRect()
  const cx     = rect.left + rect.width / 2
  const cy     = rect.top  + rect.height * 0.47   // seal is slightly above center

  const COLORS = ['#D4A070', '#E8C090', '#F0D4A8', '#C89060', '#FFE0B0']
  const count  = 18

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    const angle  = (i / count) * Math.PI * 2 + Math.random() * 0.4
    const radius = 80 + Math.random() * 120
    const size   = 4 + Math.random() * 6
    const color  = COLORS[Math.floor(Math.random() * COLORS.length)]

    el.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${color};
      left: ${cx}px;
      top: ${cy}px;
      pointer-events: none;
      z-index: 9800;
      transform: translate(-50%, -50%);
    `
    document.body.appendChild(el)

    gsap.fromTo(el,
      { x: 0, y: 0, opacity: 1, scale: 1 },
      {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        opacity: 0,
        scale: 0.2,
        duration: 0.9 + Math.random() * 0.6,
        ease: 'power2.out',
        delay: Math.random() * 0.1,
        onComplete: () => el.remove(),
      }
    )
  }
}
