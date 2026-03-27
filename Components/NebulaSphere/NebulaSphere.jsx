import * as THREE from "three";
import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, extend, useFrame, useThree } from "@react-three/fiber";
import { CubeCamera, shaderMaterial, Stars } from "@react-three/drei";

// ─── Mood palette definitions ─────────────────────────────────────────────────
export const MOODS = {
  teal: {
    label: "Teal",
    swatch: "#14b8a6",
    c1: [0.04, 0.45, 0.52],   // deep teal
    c2: [0.0,  0.72, 0.80],   // bright cyan
    c3: [0.01, 0.04, 0.14],   // midnight navy
    star: "#5eead4",
  },
  blue: {
    label: "Blue",
    swatch: "#3b82f6",
    c1: [0.18, 0.22, 0.72],   // indigo
    c2: [0.40, 0.55, 0.95],   // periwinkle
    c3: [0.01, 0.02, 0.18],   // deep navy
    star: "#93c5fd",
  },
  rose: {
    label: "Rose",
    swatch: "#f43f5e",
    c1: [0.55, 0.10, 0.28],   // deep rose
    c2: [0.85, 0.35, 0.50],   // dusty coral
    c3: [0.12, 0.01, 0.06],   // deep burgundy
    star: "#fda4af",
  },
  amber: {
    label: "Amber",
    swatch: "#f59e0b",
    c1: [0.55, 0.28, 0.02],   // deep amber
    c2: [0.90, 0.60, 0.10],   // golden
    c3: [0.10, 0.05, 0.00],   // deep ochre
    star: "#fcd34d",
  },
  purple: {
    label: "Purple",
    swatch: "#a855f7",
    c1: [0.30, 0.08, 0.55],   // deep violet
    c2: [0.60, 0.35, 0.85],   // soft lavender
    c3: [0.06, 0.01, 0.12],   // deep plum
    star: "#d8b4fe",
  },
};

// ─── Outer nebula shell material ──────────────────────────────────────────────
const NebulaMaterial = shaderMaterial(
  {
    uTime: 0,
    uSpeed: 0.026,
    uColor1: new THREE.Color(0.04, 0.45, 0.52),
    uColor2: new THREE.Color(0.0, 0.72, 0.80),
    uColor3: new THREE.Color(0.01, 0.04, 0.14),
    uMouse: new THREE.Vector2(0, 0),
    uBreath: 0,
    uBlobStrength: 0.24,
  },
  // vertex
  `
    uniform float uTime;
    uniform float uSpeed;
    uniform vec2  uMouse;
    uniform float uBlobStrength;

    varying vec2  vUv;
    varying vec3  vPosition;
    varying vec3  vNormal;
    varying float vNoise;

    // Simplex-style hash
    vec3 mod289(vec3 x){ return x - floor(x*(1./289.))*289.; }
    vec4 mod289(vec4 x){ return x - floor(x*(1./289.))*289.; }
    vec4 permute(vec4 x){ return mod289(((x*34.)+1.)*x); }
    vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }

    float snoise(vec3 v){
      const vec2 C = vec2(1./6., 1./3.);
      const vec4 D = vec4(0., 0.5, 1., 2.);
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g  = step(x0.yzx, x0.xyz);
      vec3 l  = 1. - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0., i1.z, i2.z, 1.))
        + i.y + vec4(0., i1.y, i2.y, 1.))
        + i.x + vec4(0., i1.x, i2.x, 1.));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j  = p - 49.*floor(p*ns.z*ns.z);
      vec4 x_ = floor(j*ns.z);
      vec4 y_ = floor(j - 7.*x_);
      vec4 x  = x_*ns.x + ns.yyyy;
      vec4 y  = y_*ns.x + ns.yyyy;
      vec4 h  = 1. - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.+1.;
      vec4 s1 = floor(b1)*2.+1.;
      vec4 sh = -step(h, vec4(0.));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.);
      m = m*m;
      return 42.*dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }

    void main() {
      vUv       = uv;
      vPosition = position;
      vNormal   = normal;

      // Layer two octaves of noise for organic cloud depth
      vec3 noiseCoord = vNormal + uTime * uSpeed;
      // Mouse pushes noise field — stronger + slight Z so it reads from all angles
      vec2 m = uMouse;
      noiseCoord.xy += m * 0.52;
      noiseCoord.z  += (m.x + m.y) * 0.22;
      // Extra slow drift tied to pointer for parallax-like swirl
      noiseCoord += vec3(m.y, -m.x, 0.0) * sin(uTime * 0.7) * 0.12;

      float n1 = snoise(noiseCoord);
      float n2 = snoise(noiseCoord * 2.1 + vec3(4.3, 1.7, 2.9)) * 0.5;
      vNoise = n1 + n2;

      // ── Liquid / blob displacement (object space, viscous slow motion) ──
      vec3 p = position;
      float t = uTime * uSpeed;
      float body = snoise(p * 1.35 + vec3(t * 1.6, t * 1.1, t * 0.9));
      float detail = snoise(p * 3.4 + vec3(1.7, -t * 2.0, t * 1.4)) * 0.45;
      float micro = snoise(p * 6.2 + vec3(t * 2.8, 0.0, -t * 2.2)) * 0.22;
      float swell = vNoise * 0.32 + body * 0.26 + detail * 0.17 + micro * 0.11;
      // Mouse gently “pushes” the membrane
      swell += (m.x * p.x + m.y * p.y) * 0.065;
      // Semi-solid blob — stronger swell but still reads as one volume
      swell *= 0.78 + 0.22 * sin(t * 2.4 + body * 5.0);
      float disp = swell * uBlobStrength;
      vec3 displaced = p + normal * disp;
      // Cheap perturbed normal so rim / equator shading follows the bulge
      vec3 nudge = vec3(
        snoise(p * 2.8 + vec3(0.02, t, 0.0)),
        snoise(p * 2.8 + vec3(3.1, 0.0, t)),
        snoise(p * 2.8 + vec3(0.0, 2.2, t))
      ) * 0.22;
      vNormal = normalize(normal + nudge);

      gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
    }
  `,
  // fragment
  `
    uniform float uTime;
    uniform float uBreath;
    uniform vec3  uColor1;
    uniform vec3  uColor2;
    uniform vec3  uColor3;

    varying vec2  vUv;
    varying vec3  vPosition;
    varying vec3  vNormal;
    varying float vNoise;

    void main() {
      // Soft organic blending — no hard lines
      float t1 = smoothstep(-0.6,  0.6, vNoise);
      float t2 = smoothstep( 0.1,  0.9, vNoise + 0.3);

      vec3 base  = mix(uColor3, uColor1, t1);
      vec3 final = mix(base,    uColor2, t2 * 0.75);

      // Subtle breathing luminance pulse
      float breathLum = 1.0 + uBreath * 0.12;
      final *= breathLum;

      // Soft vignette towards poles for depth
      float rim = pow(1.0 - abs(vNormal.y) * 0.6, 2.0);
      final *= (0.6 + 0.4 * rim);

      // Slight inner glow at equator
      float equator = exp(-abs(vNormal.y) * 3.0) * 0.25;
      final += uColor2 * equator * (0.8 + uBreath * 0.2);

      // Slightly softer opacity where the field peaks — reads more like a soft body
      float bodySoft = smoothstep(-0.15, 0.55, vNoise);
      float alpha = mix(0.86, 0.94, bodySoft);

      gl_FragColor = vec4(final, alpha);
    }
  `
);

extend({ NebulaMaterial });

// ─── Fresnel glass inner sphere material ─────────────────────────────────────
const FresnelMaterial = shaderMaterial(
  {
    uTime: 0,
    tCube: null,
    uRefractionRatio: 1.02,
    uFresnelBias: 0.1,
    uFresnelScale: 2.5,
    uFresnelPower: 2.0,
    uTint: new THREE.Color(0.04, 0.45, 0.52),
    uBreath: 0,
  },
  `
    uniform float uRefractionRatio;
    uniform float uFresnelBias;
    uniform float uFresnelScale;
    uniform float uFresnelPower;
    uniform float uBreath;
    uniform float uTime;

    varying vec3  vReflect;
    varying vec3  vRefract[3];
    varying float vReflectionFactor;

    void main() {
      // Breathing scale on inner sphere
      float scale = 1.0 + uBreath * 0.055;
      vec3 scaledPos = position * scale;

      // Inner “gel” membrane — subtle liquid ripples (stays semi-solid)
      float lx = scaledPos.x * 5.2 + uTime * 1.05;
      float ly = scaledPos.y * 5.2 + uTime * 0.82;
      float lz = scaledPos.z * 4.0 + uTime * 0.93;
      float gel = sin(lx) * cos(ly) * 0.55 + sin(ly * 1.2 + lz * 0.9) * cos(lx * 0.75 + lz) * 0.45;
      gel *= 0.036;
      float ripple = sin(dot(scaledPos, vec3(6.8, 5.3, 6.1)) + uTime * 2.0) * 0.019;
      vec3 nLocal = normalize(normal + vec3(
        sin(lx + scaledPos.y * 2.0) * 0.16,
        cos(ly + scaledPos.z * 2.0) * 0.16,
        sin(lz + scaledPos.x * 2.0) * 0.16
      ));
      scaledPos += nLocal * (gel + ripple);

      vec4 mvPosition    = modelViewMatrix * vec4(scaledPos, 1.0);
      vec4 worldPosition = modelMatrix    * vec4(scaledPos, 1.0);
      vec3 worldNormal   = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * nLocal);
      vec3 I = worldPosition.xyz - cameraPosition;

      vReflect    = reflect(I, worldNormal);
      vRefract[0] = refract(normalize(I), worldNormal, uRefractionRatio);
      vRefract[1] = refract(normalize(I), worldNormal, uRefractionRatio * 0.99);
      vRefract[2] = refract(normalize(I), worldNormal, uRefractionRatio * 0.98);
      vReflectionFactor = uFresnelBias + uFresnelScale * pow(1.0 + dot(normalize(I), worldNormal), uFresnelPower);

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  `
    uniform samplerCube tCube;
    uniform vec3  uTint;
    uniform float uBreath;

    varying vec3  vReflect;
    varying vec3  vRefract[3];
    varying float vReflectionFactor;

    void main() {
      vec4 reflected = textureCube(tCube, vec3(-vReflect.x, vReflect.yz));
      vec4 refracted = vec4(1.0);
      refracted.r = textureCube(tCube, vec3(vRefract[0].x, vRefract[0].yz)).r;
      refracted.g = textureCube(tCube, vec3(vRefract[1].x, vRefract[1].yz)).g;
      refracted.b = textureCube(tCube, vec3(vRefract[2].x, vRefract[2].yz)).b;

      float fresnel = clamp(vReflectionFactor, 0.0, 1.0);
      vec4 glass = mix(refracted, reflected, fresnel);

      // Failed refract (TIR) can return black — blend toward reflection (branchless)
      float refrLum = dot(refracted.rgb, vec3(0.299, 0.587, 0.114));
      float healDark = (1.0 - smoothstep(0.0, 0.06, refrLum)) * 0.7;
      glass.rgb = mix(glass.rgb, reflected.rgb, healDark);

      // Tint the glass subtly toward the mood color
      glass.rgb = mix(glass.rgb, uTint, 0.08 + uBreath * 0.04);

      // Inner core glow that breathes
      float coreGlow = pow(clamp(1.0 - vReflectionFactor, 0.0, 1.0), 3.0);
      glass.rgb += uTint * coreGlow * (0.3 + uBreath * 0.2);

      gl_FragColor = glass;
    }
  `
);

extend({ FresnelMaterial });

// ─── Full-frame skydome (fills rectangular view — no black “corner triangles”) ─
const SkyDomeMaterial = shaderMaterial(
  {
    uC1: new THREE.Color(0.1, 0.1, 0.2),
    uC2: new THREE.Color(0.2, 0.1, 0.15),
    uC3: new THREE.Color(0.05, 0.02, 0.08),
    uCamPos: new THREE.Vector3(0, 0, 3),
  },
  `
    varying vec3 vWp;
    void main() {
      vWp = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform vec3 uC1;
    uniform vec3 uC2;
    uniform vec3 uC3;
    uniform vec3 uCamPos;
    varying vec3 vWp;

    void main() {
      vec3 d = normalize(vWp);
      vec3 toCam = normalize(uCamPos - vWp);
      float facing = max(dot(d, toCam), 0.001);
      float edgeLift = pow(1.0 - facing, 1.2);

      vec3 deep = uC3 * 1.2;
      vec3 mid = mix(uC1, uC2, 0.45) * vec3(0.5, 0.48, 0.56);
      float latitude = smoothstep(0.0, 1.0, abs(d.y));
      vec3 col = mix(deep, mid, latitude * 0.5 + 0.3);

      vec3 haze = mix(uC2, uC1, 0.55) * (0.2 + edgeLift * 0.55);
      col += haze;
      col = mix(col, uC2 * 0.65, edgeLift * 0.28);

      col = max(col, deep * 0.45);

      gl_FragColor = vec4(col, 1.0);
    }
  `
);

extend({ SkyDomeMaterial });

function SkyDome({ mood }) {
  const matRef = useRef();
  const { camera } = useThree();
  const cur = useRef({
    c1: [...MOODS[mood].c1],
    c2: [...MOODS[mood].c2],
    c3: [...MOODS[mood].c3],
  });

  useFrame((_, delta) => {
    if (!matRef.current) return;
    const target = MOODS[mood];
    const s = 1.5 * delta;
    cur.current.c1 = lerpColor(cur.current.c1, target.c1, s);
    cur.current.c2 = lerpColor(cur.current.c2, target.c2, s);
    cur.current.c3 = lerpColor(cur.current.c3, target.c3, s);
    matRef.current.uC1.setRGB(...cur.current.c1);
    matRef.current.uC2.setRGB(...cur.current.c2);
    matRef.current.uC3.setRGB(...cur.current.c3);
    matRef.current.uCamPos.copy(camera.position);
  });

  return (
    <mesh renderOrder={-100} frustumCulled={false} raycast={() => null}>
      <sphereGeometry args={[120, 44, 44]} />
      <skyDomeMaterial
        ref={matRef}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/** Match WebGL clear to mood so any gap is never harsh black */
function ClearColorSync({ mood }) {
  const { gl } = useThree();
  const col = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    const m = MOODS[mood];
    col.setRGB(m.c3[0], m.c3[1], m.c3[2]);
    gl.setClearColor(col, 1);
  });
  return null;
}

// ─── Lerp helper ─────────────────────────────────────────────────────────────
function lerpColor(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// ─── Outer nebula shell ───────────────────────────────────────────────────────
function NebulaShell({ targetMood, mouseRef, lowPowerMode }) {
  const matRef = useRef();

  // Live-interpolated color state
  const currentColors = useRef({
    c1: [...MOODS[targetMood].c1],
    c2: [...MOODS[targetMood].c2],
    c3: [...MOODS[targetMood].c3],
  });

  useFrame((state, delta) => {
    if (!matRef.current) return;
    const mat = matRef.current;
    const target = MOODS[targetMood];
    const speed = 1.5 * delta; // transition speed

    // Smooth color interpolation every frame
    currentColors.current.c1 = lerpColor(currentColors.current.c1, target.c1, speed);
    currentColors.current.c2 = lerpColor(currentColors.current.c2, target.c2, speed);
    currentColors.current.c3 = lerpColor(currentColors.current.c3, target.c3, speed);

    mat.uColor1.setRGB(...currentColors.current.c1);
    mat.uColor2.setRGB(...currentColors.current.c2);
    mat.uColor3.setRGB(...currentColors.current.c3);

    mat.uTime += delta;

    // Mouse follows pointer quickly enough to feel alive
    mat.uMouse.lerp(mouseRef.current, Math.min(1, delta * 10));

    // Breathing: ~6s cycle
    mat.uBreath = Math.sin(state.clock.elapsedTime * 0.52) * 0.5 + 0.5;

    // Blob amplitude slowly shifts so the liquid body feels alive, not a fixed noise mask
    const pulse = 0.22 + 0.09 * Math.sin(state.clock.elapsedTime * 0.38);
    mat.uBlobStrength = THREE.MathUtils.lerp(mat.uBlobStrength, pulse, Math.min(1, delta * 2.4));
  });

  return (
    <mesh>
      <sphereGeometry args={[2, lowPowerMode ? 96 : 192, lowPowerMode ? 96 : 192]} />
      <nebulaMaterial
        ref={matRef}
        side={THREE.BackSide}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

// ─── Inner glass sphere ───────────────────────────────────────────────────────
function GlassSphere({ targetMood, lowPowerMode }) {
  const matRef = useRef();
  const currentTint = useRef([...MOODS[targetMood].c1]);

  useFrame((state, delta) => {
    if (!matRef.current) return;
    const target = MOODS[targetMood];
    currentTint.current = lerpColor(currentTint.current, target.c1, 1.5 * delta);
    matRef.current.uTint.setRGB(...currentTint.current);
    matRef.current.uTime += delta;
    matRef.current.uBreath = Math.sin(state.clock.elapsedTime * 0.52) * 0.5 + 0.5;
  });

  return (
    <CubeCamera resolution={lowPowerMode ? 128 : 256} frames={Infinity} near={0.1} far={20}>
      {(texture) => (
        <mesh>
          <sphereGeometry args={[0.88, lowPowerMode ? 72 : 144, lowPowerMode ? 72 : 144]} />
          <fresnelMaterial
            ref={matRef}
            tCube={texture}
            uRefractionRatio={1.02}
            uFresnelBias={0.1}
            uFresnelScale={2.5}
            uFresnelPower={2.0}
          />
        </mesh>
      )}
    </CubeCamera>
  );
}

// ─── Pointer tracker (works for mouse + touch) ────────────────────────────────
function PointerTracker({ mouseRef }) {
  const { size } = useThree();

  useEffect(() => {
    const normalize = (x, y) => {
      mouseRef.current.set(
        (x / size.width  - 0.5) * 2,
        -(y / size.height - 0.5) * 2
      );
    };

    const onMove  = (e) => normalize(e.clientX, e.clientY);
    const onTouch = (e) => {
      if (e.touches[0]) normalize(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onLeave = () => mouseRef.current.set(0, 0);

    window.addEventListener("pointermove", onMove);
    window.addEventListener("touchmove",   onTouch, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("touchmove",   onTouch);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [size, mouseRef]);

  return null;
}

// ─── Subtle tilt so the whole volume follows the pointer ─────────────────────
function MouseParallax({ mouseRef, children }) {
  const groupRef = useRef();
  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const t = Math.min(1, delta * 6);
    const targetY = mouseRef.current.x * 0.38;
    const targetX = -mouseRef.current.y * 0.3;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetY, t);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetX, t);
  });
  return <group ref={groupRef}>{children}</group>;
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene({ mood, mouseRef, lowPowerMode }) {
  return (
    <>
      <ClearColorSync mood={mood} />
      <SkyDome mood={mood} />
      <PointerTracker mouseRef={mouseRef} />
      <MouseParallax mouseRef={mouseRef}>
        <NebulaShell targetMood={mood} mouseRef={mouseRef} lowPowerMode={lowPowerMode} />
        <GlassSphere targetMood={mood} lowPowerMode={lowPowerMode} />
      </MouseParallax>
      <Stars
        radius={6}
        depth={3}
        count={lowPowerMode ? 450 : 1200}
        factor={0.4}
        saturation={0.8}
        fade
        speed={0.3}
      />
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * NebulaSphere — drop-in React component
 *
 * Props:
 *   mood  — "teal" | "blue" | "rose" | "amber" | "purple"  (default: "teal")
 *   showMoodPicker — boolean, show the built-in mood selector (default: true)
 *   className — extra CSS class for the outer container
 *   style     — extra inline styles for the outer container
 */
export default function NebulaSphere({
  mood: moodProp,
  showMoodPicker = true,
  className = "",
  style = {},
}) {
  const [mood, setMood] = useState(moodProp ?? "teal");
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const lowPowerMode =
    typeof window !== "undefined" &&
    (window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // If parent controls mood externally
  useEffect(() => {
    if (moodProp) setMood(moodProp);
  }, [moodProp]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 320,
        background: "#020818",
        borderRadius: 16,
        overflow: "hidden",
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 55 }}
        dpr={lowPowerMode ? [1, 1.25] : [1, 2]}
        gl={{ antialias: !lowPowerMode, alpha: false, powerPreference: lowPowerMode ? "low-power" : "high-performance" }}
        style={{ display: "block", width: "100%", height: "100%" }}
      >
        <Scene mood={mood} mouseRef={mouseRef} lowPowerMode={lowPowerMode} />
      </Canvas>

      {showMoodPicker && (
        <div style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 10,
          background: "rgba(2,8,24,0.55)",
          backdropFilter: "blur(12px)",
          borderRadius: 40,
          padding: "8px 14px",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          {Object.entries(MOODS).map(([key, m]) => (
            <button
              key={key}
              title={m.label}
              onClick={() => setMood(key)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: m.swatch,
                border: mood === key
                  ? `2px solid white`
                  : "2px solid transparent",
                cursor: "pointer",
                padding: 0,
                transition: "transform 0.2s, border 0.2s",
                transform: mood === key ? "scale(1.2)" : "scale(1)",
                boxShadow: mood === key
                  ? `0 0 10px ${m.swatch}99`
                  : "none",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
