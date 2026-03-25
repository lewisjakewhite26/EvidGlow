import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, Cloud, Wind, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

const colours = [
  { name: 'Teal', value: '#2DD4BF', rgb: [45, 212, 191] },
  { name: 'Blue', value: '#3B82F6', rgb: [59, 130, 246] },
  { name: 'Rose', value: '#FB7185', rgb: [251, 113, 133] },
  { name: 'Amber', value: '#FBBF24', rgb: [251, 191, 36] },
  { name: 'Purple', value: '#A78BFA', rgb: [167, 139, 250] },
];

// Fluid Simulation Constants
const ITERATIONS = 10;
const VISCOSITY = 0.000001;
const DIFFUSION = 0.000001;
const DISSIPATION = 0.999;
const VELOCITY_DISSIPATION = 0.995;

class Fluid {
  size: number;
  dt: number;
  diff: number;
  visc: number;
  
  s: Float32Array;
  density: Float32Array;
  
  // Color channels
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
  
  Vx: Float32Array;
  Vy: Float32Array;
  
  Vx0: Float32Array;
  Vy0: Float32Array;

  constructor(size: number, diffusion: number, viscosity: number, dt: number) {
    this.size = size;
    this.dt = dt;
    this.diff = diffusion;
    this.visc = viscosity;
    
    const numCells = size * size;
    this.s = new Float32Array(numCells);
    this.density = new Float32Array(numCells);
    
    this.r = new Float32Array(numCells);
    this.g = new Float32Array(numCells);
    this.b = new Float32Array(numCells);
    
    this.Vx = new Float32Array(numCells);
    this.Vy = new Float32Array(numCells);
    
    this.Vx0 = new Float32Array(numCells);
    this.Vy0 = new Float32Array(numCells);
  }

  addDensity(x: number, y: number, amount: number, r: number, g: number, b: number) {
    const index = x + y * this.size;
    this.density[index] += amount;
    this.r[index] += r * amount;
    this.g[index] += g * amount;
    this.b[index] += b * amount;
  }

  addVelocity(x: number, y: number, amountX: number, amountY: number) {
    const index = x + y * this.size;
    this.Vx[index] += amountX;
    this.Vy[index] += amountY;
  }

  step() {
    const { size, visc, diff, dt, Vx, Vy, Vx0, Vy0, s, density, r, g, b } = this;

    this.diffuse(1, Vx0, Vx, visc, dt);
    this.diffuse(2, Vy0, Vy, visc, dt);

    this.project(Vx0, Vy0, Vx, Vy);

    this.advect(1, Vx, Vx0, Vx0, Vy0, dt);
    this.advect(2, Vy, Vy0, Vx0, Vy0, dt);

    this.project(Vx, Vy, Vx0, Vy0);

    // Diffuse and advect density
    this.diffuse(0, s, density, diff, dt);
    this.advect(0, density, s, Vx, Vy, dt);

    // Diffuse and advect color channels
    this.diffuse(0, s, r, diff, dt);
    this.advect(0, r, s, Vx, Vy, dt);
    
    this.diffuse(0, s, g, diff, dt);
    this.advect(0, g, s, Vx, Vy, dt);
    
    this.diffuse(0, s, b, diff, dt);
    this.advect(0, b, s, Vx, Vy, dt);
    
    // Dissipation
    for (let i = 0; i < density.length; i++) {
      density[i] *= DISSIPATION;
      r[i] *= DISSIPATION;
      g[i] *= DISSIPATION;
      b[i] *= DISSIPATION;
      Vx[i] *= VELOCITY_DISSIPATION;
      Vy[i] *= VELOCITY_DISSIPATION;
    }
  }

  private diffuse(b: number, x: Float32Array, x0: Float32Array, diff: number, dt: number) {
    const a = dt * diff * (this.size - 2) * (this.size - 2);
    this.lin_solve(b, x, x0, a, 1 + 6 * a);
  }

  private lin_solve(b: number, x: Float32Array, x0: Float32Array, a: number, c: number) {
    const cRecip = 1.0 / c;
    for (let k = 0; k < ITERATIONS; k++) {
      for (let j = 1; j < this.size - 1; j++) {
        for (let i = 1; i < this.size - 1; i++) {
          x[i + j * this.size] =
            (x0[i + j * this.size] +
              a *
                (x[i + 1 + j * this.size] +
                  x[i - 1 + j * this.size] +
                  x[i + (j + 1) * this.size] +
                  x[i + (j - 1) * this.size])) *
            cRecip;
        }
      }
      this.set_bnd(b, x);
    }
  }

  private project(velocX: Float32Array, velocY: Float32Array, p: Float32Array, div: Float32Array) {
    for (let j = 1; j < this.size - 1; j++) {
      for (let i = 1; i < this.size - 1; i++) {
        div[i + j * this.size] =
          -0.5 *
          (velocX[i + 1 + j * this.size] -
            velocX[i - 1 + j * this.size] +
            velocY[i + (j + 1) * this.size] -
            velocY[i + (j - 1) * this.size]);
        p[i + j * this.size] = 0;
      }
    }
    this.set_bnd(0, div);
    this.set_bnd(0, p);
    this.lin_solve(0, p, div, 1, 4);

    for (let j = 1; j < this.size - 1; j++) {
      for (let i = 1; i < this.size - 1; i++) {
        velocX[i + j * this.size] -=
          0.5 * (p[i + 1 + j * this.size] - p[i - 1 + j * this.size]);
        velocY[i + j * this.size] -=
          0.5 * (p[i + (j + 1) * this.size] - p[i + (j - 1) * this.size]);
      }
    }
    this.set_bnd(1, velocX);
    this.set_bnd(2, velocY);
  }

  private advect(b: number, d: Float32Array, d0: Float32Array, velocX: Float32Array, velocY: Float32Array, dt: number) {
    let i0, i1, j0, j1;

    const dtx = dt * (this.size - 2);
    const dty = dt * (this.size - 2);

    let s0, s1, t0, t1;
    let tmp1, tmp2, x, y;

    const N = this.size;
    const ifloat = N;
    const jfloat = N;

    for (let j = 1; j < N - 1; j++) {
      for (let i = 1; i < N - 1; i++) {
        tmp1 = dtx * velocX[i + j * N];
        tmp2 = dty * velocY[i + j * N];
        x = i - tmp1;
        y = j - tmp2;

        if (x < 0.5) x = 0.5;
        if (x > N - 1.5) x = N - 1.5;
        i0 = Math.floor(x);
        i1 = i0 + 1.0;
        if (y < 0.5) y = 0.5;
        if (y > N - 1.5) y = N - 1.5;
        j0 = Math.floor(y);
        j1 = j0 + 1.0;

        s1 = x - i0;
        s0 = 1.0 - s1;
        t1 = y - j0;
        t0 = 1.0 - t1;

        const i0i = Math.floor(i0);
        const i1i = Math.floor(i1);
        const j0i = Math.floor(j0);
        const j1i = Math.floor(j1);

        d[i + j * N] =
          s0 * (t0 * d0[i0i + j0i * N] + t1 * d0[i0i + j1i * N]) +
          s1 * (t0 * d0[i1i + j0i * N] + t1 * d0[i1i + j1i * N]);
      }
    }
    this.set_bnd(b, d);
  }

  private set_bnd(b: number, x: Float32Array) {
    const N = this.size;
    for (let i = 1; i < N - 1; i++) {
      x[i + 0 * N] = b === 2 ? -x[i + 1 * N] : x[i + 1 * N];
      x[i + (N - 1) * N] = b === 2 ? -x[i + (N - 2) * N] : x[i + (N - 2) * N];
    }
    for (let j = 1; j < N - 1; j++) {
      x[0 + j * N] = b === 1 ? -x[1 + j * N] : x[1 + j * N];
      x[(N - 1) + j * N] = b === 1 ? -x[(N - 2) + j * N] : x[(N - 2) + j * N];
    }

    x[0 + 0 * N] = 0.5 * (x[1 + 0 * N] + x[0 + 1 * N]);
    x[0 + (N - 1) * N] = 0.5 * (x[1 + (N - 1) * N] + x[0 + (N - 2) * N]);
    x[(N - 1) + 0 * N] = 0.5 * (x[(N - 2) + 0 * N] + x[(N - 1) + 1 * N]);
    x[(N - 1) + (N - 1) * N] = 0.5 * (x[(N - 2) + (N - 1) * N] + x[(N - 1) + (N - 2) * N]);
  }
}

type SensoryFlowViewProps = {
  onBack: () => void;
};

export const SensoryFlowView = ({ onBack }: SensoryFlowViewProps) => {
  const sensoryRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef<HTMLCanvasElement | null>(null);
  const fluidRef = useRef<Fluid | null>(null);
  const [activeColour, setActiveColour] = useState(colours[0]);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isCloudsActive, setIsCloudsActive] = useState(false);
  const [isWindActive, setIsWindActive] = useState(false);
  const lastMousePos = useRef<Record<string, {x: number, y: number}>>({});
  const grid_size = 128;

  const activeColourRef = useRef(activeColour);
  const cloudsRef = useRef(isCloudsActive);
  const windRef = useRef(isWindActive);
  
  // Track active growing clouds
  const activeClouds = useRef<{x: number, y: number, radius: number, life: number, r: number, g: number, b: number, intensity: number}[]>([]);

  useEffect(() => {
    activeColourRef.current = activeColour;
  }, [activeColour]);

  useEffect(() => {
    cloudsRef.current = isCloudsActive;
    if (!isCloudsActive) activeClouds.current = [];
  }, [isCloudsActive]);

  useEffect(() => {
    windRef.current = isWindActive;
  }, [isWindActive]);

  useEffect(() => {
    const canvas = sensoryRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const buffer = document.createElement('canvas');
    buffer.width = grid_size;
    buffer.height = grid_size;
    const bCtx = buffer.getContext('2d');
    if (!bCtx) return;
    bufferRef.current = buffer;

    const fluid = new Fluid(grid_size, DIFFUSION, VISCOSITY, 0.1);
    fluidRef.current = fluid;

    const resizeSensory = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resizeSensory();
    window.addEventListener('resize', resizeSensory);

    let animationFrameId: number;
    const imageData = bCtx.createImageData(grid_size, grid_size);
    let time = 0;

    const render = () => {
      if (!fluidRef.current || !ctx || !canvas || !bCtx) return;
      
      const f = fluidRef.current;
      time += 0.01;

      // Spawn new cloud seeds occasionally
      if (cloudsRef.current && Math.random() > 0.96) { // Slightly more frequent
        const radius = 25 + Math.floor(Math.random() * 40); // Larger clouds
        const currentColour = activeColourRef.current;
        const [r, g, b] = currentColour.rgb;
        
        activeClouds.current.push({
          x: Math.floor(Math.random() * (grid_size - radius * 2)) + radius,
          y: Math.floor(Math.random() * (grid_size - radius * 2)) + radius,
          radius,
          life: 300 + Math.random() * 400, // Even longer growth
          r, g, b,
          intensity: 0.5 + Math.random() * 0.6 // More visible
        });
      }

      // Process growing clouds
      if (cloudsRef.current) {
        activeClouds.current = activeClouds.current.filter(cloud => {
          const { x, y, radius, r, g, b, intensity } = cloud;
          
          // Add a tiny bit of density each frame for "growth"
          for (let i = -radius; i <= radius; i++) {
            for (let j = -radius; j <= radius; j++) {
              const dist = Math.sqrt(i*i + j*j);
              if (dist < radius) {
                // Smoother falloff (power of 3) for dreamier edges
                const weight = Math.pow(1 - dist / radius, 3) * (intensity / 150);
                f.addDensity(x + i, y + j, weight, r, g, b);
                // Tiny expansion force
                if (dist > 0) {
                  f.addVelocity(x + i, y + j, (i / dist) * 0.00015, (j / dist) * 0.00015);
                }
              }
            }
          }
          
          cloud.life--;
          return cloud.life > 0;
        });
      }

      // Apply Wind Effect
      if (windRef.current) {
        // Extremely subtle, organic drifting wind
        const windX = Math.sin(time * 0.1) * Math.cos(time * 0.03) * 0.0003;
        const windY = Math.cos(time * 0.08) * Math.sin(time * 0.04) * 0.0003;
        
        for (let i = 0; i < f.Vx.length; i++) {
          f.Vx[i] += windX;
          f.Vy[i] += windY;
        }
      }

      f.step();

      const data = imageData.data;

      for (let i = 0; i < f.density.length; i++) {
        const d = f.density[i];
        const idx = i * 4;
        const val = Math.min(d * 255, 255);
        
        const r = d > 0.001 ? Math.min(f.r[i] / d, 255) : f.r[i];
        const g = d > 0.001 ? Math.min(f.g[i] / d, 255) : f.g[i];
        const b = d > 0.001 ? Math.min(f.b[i] / d, 255) : f.b[i];

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = val;
      }

      bCtx.clearRect(0, 0, grid_size, grid_size);
      bCtx.putImageData(imageData, 0, 0);

      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'screen';
      ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeSensory);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = sensoryRef.current;
    const fluid = fluidRef.current;
    if (!canvas || !fluid) return;

    const rect = canvas.getBoundingClientRect();
    
    // Handle multiple touches for "perfect" touch input
    const points = 'touches' in e 
      ? Array.from((e as React.TouchEvent).touches).map((t: any) => ({ x: t.clientX, y: t.clientY, id: t.identifier.toString() }))
      : [{ x: (e as React.MouseEvent).clientX, y: (e as React.MouseEvent).clientY, id: 'mouse' }];

    points.forEach(point => {
      const x = Math.floor(((point.x - rect.left) / canvas.width) * grid_size);
      const y = Math.floor(((point.y - rect.top) / canvas.height) * grid_size);

      if (x >= 1 && x < grid_size - 1 && y >= 1 && y < grid_size - 1) {
        // For multi-touch, we track velocity per point if possible, 
        // but for simplicity and "flow", we'll use the aggregate movement or just position
        const dx = point.x - (lastMousePos.current[point.id]?.x || point.x);
        const dy = point.y - (lastMousePos.current[point.id]?.y || point.y);
        
        const currentColour = activeColourRef.current;
        const [r, g, b] = currentColour.rgb;

        // Add to a 3x3 area for smoother interaction
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            const weight = (i === 0 && j === 0) ? 1 : 0.5;
            fluid.addDensity(x + i, y + j, 50 * weight, r, g, b);
            if (dx !== 0 || dy !== 0) {
              fluid.addVelocity(x + i, y + j, dx * 0.1 * weight, dy * 0.1 * weight);
            }
          }
        }
        
        // Update last position for this specific touch/mouse point
        if (!lastMousePos.current) lastMousePos.current = {};
        lastMousePos.current[point.id] = { x: point.x, y: point.y };
      }
    });
  };

  const clearSensory = () => {
    if (fluidRef.current) {
      fluidRef.current.density.fill(0);
      fluidRef.current.r.fill(0);
      fluidRef.current.g.fill(0);
      fluidRef.current.b.fill(0);
      fluidRef.current.Vx.fill(0);
      fluidRef.current.Vy.fill(0);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex w-full flex-col gap-3 p-4 pb-8 sm:p-8"
    >
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Sensory home
        </button>
      </div>

      <div className="flex min-h-0 w-full flex-col gap-4 md:flex-row md:gap-6">
      {/* Sidebar */}
      <aside className="flex shrink-0 justify-center md:w-24 md:flex-col md:justify-start">
        <div className="glass-panel flex w-full flex-col rounded-[32px] px-3 py-4 md:w-24 md:flex-1 md:items-center md:gap-8 md:px-0 md:py-8">
          <div className="flex flex-row flex-wrap items-center justify-center gap-3 md:flex-col md:gap-4">
            {colours.map((c) => (
              <button
                key={c.name}
                onClick={() => setActiveColour(c)}
                className={cn(
                  "w-12 h-12 rounded-full border-2 transition-all hover:scale-110 shadow-lg",
                  activeColour.name === c.name ? "border-white scale-110 ring-4 ring-white/20" : "border-white/10"
                )}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>

          <div className="h-px w-full bg-white/10 md:mx-auto md:w-12" />

          <div className="flex flex-row justify-center gap-4 md:flex-col">
            <button
              onClick={() => setIsCloudsActive(!isCloudsActive)}
              className={cn(
                "w-12 h-12 rounded-full border transition-all flex items-center justify-center",
                isCloudsActive 
                  ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(45,212,191,0.3)]" 
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
              )}
            >
              <Cloud className={cn("w-5 h-5", isCloudsActive && "animate-pulse")} />
            </button>
            <button
              onClick={() => setIsWindActive(!isWindActive)}
              className={cn(
                "w-12 h-12 rounded-full border transition-all flex items-center justify-center",
                isWindActive 
                  ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(45,212,191,0.3)]" 
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
              )}
            >
              <Wind className={cn("w-5 h-5", isWindActive && "animate-bounce")} />
            </button>
          </div>

          <div className="mt-2 w-full px-2 md:mt-auto md:px-4">
            <button 
              onClick={clearSensory}
              className="flex w-full flex-col items-center gap-1 rounded-full bg-primary py-3 text-white transition-all hover:bg-primary/80 group md:py-4"
            >
              <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-bold uppercase">Reset</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Sensory Area */}
      <section className="relative min-h-[min(52svh,320px)] h-[min(58svh,480px)] w-full min-w-0 overflow-hidden rounded-[32px] glass-panel p-2 md:h-[min(calc(100svh-220px),720px)] md:min-h-[min(420px,calc(100svh-220px))] md:flex-1">
        <div className="pointer-events-none absolute left-6 top-4 z-20 sm:left-8 sm:top-6">
          <h2 className="text-xl font-bold tracking-tight text-white/80 sm:text-2xl">Sensory Flow</h2>
        </div>

        <div className="relative h-full w-full cursor-pointer overflow-hidden rounded-[24px] bg-slate-900">
          <canvas
            ref={sensoryRef}
            onMouseDown={(e) => { 
              setIsInteracting(true); 
              lastMousePos.current['mouse'] = { x: e.clientX, y: e.clientY };
              handleInteraction(e); // Immediate feedback
            }}
            onMouseMove={(e) => isInteracting && handleInteraction(e)}
            onMouseUp={() => { setIsInteracting(false); }}
            onMouseLeave={() => { setIsInteracting(false); }}
            onTouchStart={(e) => { 
              e.preventDefault(); 
              setIsInteracting(true); 
              Array.from(e.touches).forEach((t: React.Touch) => {
                lastMousePos.current[t.identifier.toString()] = { x: t.clientX, y: t.clientY };
              });
              handleInteraction(e); // Immediate feedback
            }}
            onTouchMove={(e) => { e.preventDefault(); isInteracting && handleInteraction(e); }}
            onTouchEnd={(e) => { 
              e.preventDefault(); 
              if (e.touches.length === 0) {
                setIsInteracting(false);
              } else {
                // Remove ended touches from tracking
                const activeIds = Array.from(e.touches).map((t: React.Touch) => t.identifier.toString());
                Object.keys(lastMousePos.current).forEach(id => {
                  if (id !== 'mouse' && !activeIds.includes(id)) {
                    delete lastMousePos.current[id];
                  }
                });
              }
            }}
            className="w-full h-full blur-[2px] touch-none"
          />
        </div>
      </section>
      </div>
    </motion.div>
  );
};
