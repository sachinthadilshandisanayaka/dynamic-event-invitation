import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { AnimationCollection } from '../../data/animationCollections'
import { ButterflySystem } from '../../animation-engine/systems/ButterflySystem'

interface Props {
  collection: AnimationCollection
}

// Camera is at z=6. At FOV=60, visible half-height at z=0: 6 * tan(30°) = 3.46
// For 16:9: visible half-width ≈ 6.16. We use ±5 / ±3 for safe coverage.
const CAM_Z = 6

const BUTTERFLY_CONFIG = {
  count:              10,
  species:            'morpho' as const,
  wingColorInner:     '#4A8FE8',
  wingColorMid:       '#2255CC',
  wingColorOuter:     '#1A3A99',
  borderColor:        '#0A0F1A',
  beatHz:             1.65,
  scaleMin:           0.55,
  scaleMax:           1.1,
  flightRangeX:       300,
  flightRangeY:       180,
  opacity:            0.92,
  showOnLanding:      true,
  showDuringEnvelope: false,
}

export function ParticleSystem({ collection }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  // GIF-based butterflies — delegate entirely to ButterflySystem
  if (collection.particleType === 'butterflies') {
    return (
      <ButterflySystem
        config={{ ...BUTTERFLY_CONFIG, count: collection.particleCount || 10 }}
        visible
      />
    )
  }

  if (collection.particleType === 'none') return null

  return <ThreeParticleSystem collection={collection} />
}

function ThreeParticleSystem({ collection }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let raf: number
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)

    Object.assign(renderer.domElement.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '10',
    })
    mount.appendChild(renderer.domElement)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = CAM_Z

    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
    const countScale = isMobile ? 0.45 : 1

    let update: ((elapsed: number) => void) = () => {}
    switch (collection.particleType) {
      case 'sparkles': update = buildSparkles(scene, collection, countScale); break
      case 'petals':   update = buildPetals(scene, collection, countScale);   break
      case 'blossoms': update = buildBlossoms(scene, collection, countScale); break
    }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    const animate = () => {
      raf = requestAnimationFrame(animate)
      update(clock.getElapsedTime())
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      scene.clear()
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [collection.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={mountRef}
      style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}
    />
  )
}

/* ─── 1. GOLD SPARKLES (THREE.Points + ShaderMaterial + additive blending) ─── */

function buildSparkles(scene: THREE.Scene, c: AnimationCollection, scale: number) {
  const count = Math.round(1400 * scale)
  const positions  = new Float32Array(count * 3)
  const sizes      = new Float32Array(count)
  const phases     = new Float32Array(count)
  const velocities = new Float32Array(count * 2) // x, y drift

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 14
    positions[i * 3 + 1] = (Math.random() - 0.5) * 9
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3
    sizes[i]  = Math.random() * 14 + 3
    phases[i] = Math.random() * Math.PI * 2
    velocities[i * 2]     = (Math.random() - 0.5) * 0.006
    velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.004
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aPhase',   new THREE.BufferAttribute(phases, 1))

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime:  { value: 0 },
      uColor: { value: new THREE.Color(c.loadingAccent) },
    },
    vertexShader: `
      attribute float aSize;
      attribute float aPhase;
      uniform float uTime;
      varying float vAlpha;

      void main() {
        vAlpha = 0.45 + 0.55 * sin(uTime * 1.8 + aPhase);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (260.0 / -mvPos.z) * (0.6 + vAlpha * 0.4);
        gl_Position  = projectionMatrix * mvPos;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;

      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float s = pow(1.0 - d * 2.0, 2.8);
        gl_FragColor = vec4(uColor, s * vAlpha * 0.85);
      }
    `,
  })

  scene.add(new THREE.Points(geo, mat))

  return (elapsed: number) => {
    mat.uniforms.uTime.value = elapsed
    const pos = geo.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i * 2]
      pos[i * 3 + 1] += velocities[i * 2 + 1]
      // Wrap around visible area
      if (pos[i * 3] >  7)  pos[i * 3]     = -7
      if (pos[i * 3] < -7)  pos[i * 3]     =  7
      if (pos[i * 3 + 1] >  5) pos[i * 3 + 1] = -5
      if (pos[i * 3 + 1] < -5) pos[i * 3 + 1] =  5
    }
    geo.attributes.position.needsUpdate = true
  }
}

/* ─── 2. ROSE PETALS (THREE.InstancedMesh + canvas texture + falling) ─── */

function buildPetals(scene: THREE.Scene, c: AnimationCollection, scale: number) {
  const count = Math.round(80 * scale)
  const texture = makePetalTexture(c.loadingAccent, 'rose')

  const geo = new THREE.PlaneGeometry(0.35, 0.25)
  const mat = new THREE.MeshBasicMaterial({
    map: texture, transparent: true,
    side: THREE.DoubleSide, depthWrite: false,
  })

  const mesh   = new THREE.InstancedMesh(geo, mat, count)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  scene.add(mesh)

  const dummy = new THREE.Object3D()
  type PetalState = { x: number; y: number; z: number; rx: number; ry: number; rz: number; vy: number; vx: number; vrz: number; phase: number; scale: number }
  const states: PetalState[] = []

  for (let i = 0; i < count; i++) {
    const s: PetalState = {
      x: (Math.random() - 0.5) * 14,
      y: 4 + Math.random() * 8,
      z: (Math.random() - 0.5) * 2,
      rx: Math.random() * Math.PI,
      ry: Math.random() * Math.PI,
      rz: Math.random() * Math.PI,
      vy: -(0.015 + Math.random() * 0.022),
      vx: (Math.random() - 0.5) * 0.008,
      vrz: (Math.random() - 0.5) * 0.03,
      phase: Math.random() * Math.PI * 2,
      scale: 0.7 + Math.random() * 0.9,
    }
    states.push(s)
    dummy.position.set(s.x, s.y, s.z)
    dummy.rotation.set(s.rx, s.ry, s.rz)
    dummy.scale.setScalar(s.scale)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true

  return (elapsed: number) => {
    for (let i = 0; i < count; i++) {
      const s = states[i]
      s.y  += s.vy
      s.x  += s.vx + Math.sin(elapsed * 0.7 + s.phase) * 0.004
      s.rz += s.vrz
      s.rx += s.vrz * 0.4

      if (s.y < -5) {
        s.y = 5 + Math.random() * 4
        s.x = (Math.random() - 0.5) * 14
      }

      dummy.position.set(s.x, s.y, s.z)
      dummy.rotation.set(s.rx, s.ry, s.rz)
      dummy.scale.setScalar(s.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }
}

/* ─── 3. CHERRY BLOSSOMS (InstancedMesh + blossom canvas texture) ─── */

function buildBlossoms(scene: THREE.Scene, c: AnimationCollection, scale: number) {
  const count = Math.round(60 * scale)
  const texture = makePetalTexture(c.loadingAccent, 'blossom')

  const geo = new THREE.PlaneGeometry(0.28, 0.28)
  const mat = new THREE.MeshBasicMaterial({
    map: texture, transparent: true,
    side: THREE.DoubleSide, depthWrite: false,
  })

  const mesh = new THREE.InstancedMesh(geo, mat, count)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  scene.add(mesh)

  const dummy  = new THREE.Object3D()
  const states = Array.from({ length: count }, () => ({
    x: (Math.random() - 0.5) * 13,
    y: 4 + Math.random() * 8,
    z: (Math.random() - 0.5) * 2,
    rx: Math.random() * Math.PI,
    ry: Math.random() * Math.PI,
    rz: Math.random() * Math.PI,
    vy: -(0.01 + Math.random() * 0.016),
    vx: (Math.random() - 0.5) * 0.006,
    vrz: (Math.random() - 0.5) * 0.025,
    phase: Math.random() * Math.PI * 2,
    scale: 0.6 + Math.random() * 0.8,
  }))

  states.forEach((s, i) => {
    dummy.position.set(s.x, s.y, s.z)
    dummy.rotation.set(s.rx, s.ry, s.rz)
    dummy.scale.setScalar(s.scale)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  })
  mesh.instanceMatrix.needsUpdate = true

  return (elapsed: number) => {
    states.forEach((s, i) => {
      s.y  += s.vy
      s.x  += s.vx + Math.sin(elapsed * 0.6 + s.phase) * 0.003
      s.rz += s.vrz
      s.rx += s.vrz * 0.3
      if (s.y < -5) { s.y = 5 + Math.random() * 4; s.x = (Math.random() - 0.5) * 13 }
      dummy.position.set(s.x, s.y, s.z)
      dummy.rotation.set(s.rx, s.ry, s.rz)
      dummy.scale.setScalar(s.scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }
}

/* ─── CANVAS TEXTURE HELPERS ─── */

function makePetalTexture(color: string, type: 'rose' | 'blossom'): THREE.CanvasTexture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const c = size / 2

  if (type === 'rose') {
    // Elliptical rose petal with gradient
    const grad = ctx.createRadialGradient(c, c * 0.7, 2, c, c, c * 0.95)
    grad.addColorStop(0, hexToRgba(color, 1))
    grad.addColorStop(0.65, hexToRgba(color, 0.85))
    grad.addColorStop(1, hexToRgba(color, 0))
    ctx.beginPath()
    ctx.ellipse(c, c, c * 0.7, c * 0.95, -0.25, 0, Math.PI * 2)
    ctx.fillStyle = grad
    ctx.fill()
  } else {
    // Five-petal blossom
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2
      const px = c + Math.cos(a) * c * 0.38
      const py = c + Math.sin(a) * c * 0.38
      const grad = ctx.createRadialGradient(px, py, 1, px, py, c * 0.4)
      grad.addColorStop(0, hexToRgba(color, 0.95))
      grad.addColorStop(1, hexToRgba(color, 0))
      ctx.beginPath()
      ctx.ellipse(px, py, c * 0.36, c * 0.24, a + Math.PI / 2, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
    }
    // Yellow centre
    const cGrad = ctx.createRadialGradient(c, c, 0, c, c, c * 0.18)
    cGrad.addColorStop(0, 'rgba(255,224,80,0.95)')
    cGrad.addColorStop(1, 'rgba(255,200,60,0)')
    ctx.beginPath()
    ctx.arc(c, c, c * 0.2, 0, Math.PI * 2)
    ctx.fillStyle = cGrad
    ctx.fill()
  }

  return new THREE.CanvasTexture(canvas)
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
