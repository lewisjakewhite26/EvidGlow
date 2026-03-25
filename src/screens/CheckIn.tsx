import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Wind, Moon, ArrowLeft, Smile, Palette, Zap, CloudRain, BrainCircuit, User, Sparkles, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { getAnalysis, MoodScores, AnalysisResult } from '../lib/moodAnalysis';

const moods = [
  { id: 'happy', label: 'Happy', icon: Smile, hex: '#FACC15' },
  { id: 'excited', label: 'Excited', icon: Zap, hex: '#FB923C' },
  { id: 'calm', label: 'Calm', icon: Wind, hex: '#4ADE80' },
  { id: 'focused', label: 'Focused', icon: Target, hex: '#60A5FA' },
  { id: 'creative', label: 'Creative', icon: Palette, hex: '#C084FC' },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: CloudRain, hex: '#F87171' },
  { id: 'worried', label: 'Worried', icon: BrainCircuit, hex: '#FB7185' },
  { id: 'tired', label: 'Tired', icon: Moon, hex: '#94A3B8' },
  { id: 'lonely', label: 'Lonely', icon: User, hex: '#818CF8' },
];

export const CheckIn = ({ onBack }: { onBack: () => void }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [intensities, setIntensities] = useState<Record<string, number>>({});
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    if (!intensities[id]) {
      setIntensities(prev => ({ ...prev, [id]: 50 }));
    }
  };

  const handleIntensityChange = (id: string, value: number) => {
    setIntensities(prev => ({ ...prev, [id]: value }));
  };

  const handleLog = () => {
    const result = getAnalysis(intensities);
    setAnalysis(result);
    setSelected(null);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-midnight flex items-center justify-center p-6 cursor-default"
      onClick={() => setSelected(null)}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onBack();
        }}
        className="absolute top-12 left-12 flex items-center gap-4 text-white/40 hover:text-white transition-colors group z-[110]"
      >
        <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center group-hover:bg-white/10">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="font-medium">Dashboard</span>
      </button>

      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ layout: { duration: 0.6, type: "spring", damping: 25, stiffness: 120 } }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[640px] glass-panel rounded-[32px] p-6 md:p-8 flex flex-col items-center relative overflow-hidden min-h-[500px] justify-center"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <AnimatePresence mode="wait">
          {!analysis ? (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">
                  Mood Check-in
                </h2>
                <p className="text-white/40 text-sm font-medium">
                  How are you feeling?
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-3 w-full max-w-[480px]">
                {moods.map((mood) => {
                  const intensity = intensities[mood.id] || 0;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => handleSelect(mood.id)}
                      className={cn(
                        "group relative flex flex-col items-center justify-center py-4 rounded-xl border transition-all duration-500 overflow-hidden",
                        selected === mood.id 
                          ? "border-white/40 scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)] bg-white/10" 
                          : cn(
                              "bg-white/5 border-white/10",
                              intensity > 0 
                                ? "bg-white/10 border-white/20" 
                                : "hover:bg-white/10 hover:border-white/20 hover:-translate-y-1"
                            )
                      )}
                    >
                      {/* Dreamy Atmospheric Fill */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <motion.div 
                          initial={false}
                          animate={{ 
                            height: `${intensity + 10}%`,
                            opacity: intensity > 0 ? 1 : 0
                          }}
                          transition={{ duration: 1.2, ease: "circOut" }}
                          className="absolute bottom-0 left-0 right-0 origin-bottom"
                          style={{ 
                            background: `linear-gradient(to top, ${mood.hex}50 0%, ${mood.hex}20 70%, transparent 100%)`,
                            maskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.6) 30%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.6) 30%, transparent 100%)',
                          }}
                        >
                          <div 
                            className="absolute top-0 left-0 right-0 h-16 -translate-y-1/2 blur-xl opacity-60"
                            style={{ background: `radial-gradient(circle at center, ${mood.hex} 0%, transparent 70%)` }}
                          />
                        </motion.div>
                      </div>

                      <div className={cn(
                        "relative z-10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-1.5 transition-transform duration-500 group-hover:scale-110",
                        (selected === mood.id || intensity > 0) ? "bg-white/10" : "bg-white/5"
                      )}>
                        <mood.icon className={cn("w-4 h-4 md:w-5 md:h-5", (selected === mood.id || intensity > 0) ? "text-white" : "text-white/40 group-hover:text-white")} />
                      </div>
                      <span className={cn(
                        "relative z-10 font-bold text-xs md:text-sm tracking-wide",
                        (selected === mood.id || intensity > 0) ? "text-white" : "text-white/40 group-hover:text-white"
                      )}>
                        {mood.label}
                      </span>

                      {selected === mood.id && intensity > 0 && (
                        <div className="absolute top-1.5 right-1.5 z-10">
                          <span className="text-[8px] font-black text-white/60 uppercase tracking-tighter">{intensity}%</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selected ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-[320px] mt-6 flex flex-col items-center gap-3"
                >
                  <div className="flex justify-center w-full">
                    <span className="text-white text-3xl font-black tabular-nums leading-none">
                      {intensities[selected]}<span className="text-base text-white/40 ml-0.5">%</span>
                    </span>
                  </div>
                  
                  <div className="w-full relative px-2 py-2">
                    <div className="absolute top-1/2 -translate-y-1/2 left-2 right-2 h-[2px] bg-white/10 rounded-full" />
                    <motion.div 
                      className="absolute top-1/2 -translate-y-1/2 h-[2px] rounded-full blur-[4px] opacity-50"
                      initial={false}
                      animate={{ 
                        width: `calc(${intensities[selected]}% - 16px)`,
                        background: moods.find(m => m.id === selected)?.hex,
                      }}
                      style={{ left: '8px' }}
                    />
                    <motion.div 
                      className="absolute top-1/2 -translate-y-1/2 h-[2px] rounded-full z-10"
                      initial={false}
                      animate={{ 
                        width: `calc(${intensities[selected]}% - 16px)`,
                        background: moods.find(m => m.id === selected)?.hex,
                      }}
                      style={{ left: '8px' }}
                    />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={intensities[selected]}
                      onChange={(e) => handleIntensityChange(selected, parseInt(e.target.value))}
                      className="w-full h-6 bg-transparent appearance-none cursor-pointer relative z-20
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(255,255,255,0.5)]
                        [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-midnight
                        [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200
                        [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:active:scale-90"
                    />
                  </div>

                  <button
                    onClick={handleLog}
                    className="w-full py-3 text-midnight font-black text-sm rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                    style={{ 
                      background: moods.find(m => m.id === selected)?.hex,
                      boxShadow: `0 8px 20px ${moods.find(m => m.id === selected)?.hex}20`
                    }}
                  >
                    Save
                  </button>
                </motion.div>
              ) : (
                <button
                  onClick={onBack}
                  className="mt-6 text-white/20 hover:text-white/60 font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                >
                  Close
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full flex flex-col items-center text-center py-4"
            >
              {/* Atmospheric Background Glows for the card */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[32px]">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                    x: [0, 20, 0],
                    y: [0, -10, 0]
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-1/4 -left-1/4 w-full h-full blur-[80px] rounded-full"
                  style={{ background: moods.find(m => m.id === analysis.primary)?.hex + '30' }}
                />
                <motion.div 
                  animate={{ 
                    scale: [1.2, 1, 1.2],
                    opacity: [0.1, 0.3, 0.1],
                    x: [0, -20, 0],
                    y: [0, 20, 0]
                  }}
                  transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-1/4 -right-1/4 w-full h-full blur-[80px] rounded-full"
                  style={{ background: moods.find(m => m.id === analysis.secondary)?.hex + '20' }}
                />
              </div>

              <motion.div 
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8 relative"
              >
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 0.9, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </motion.div>
                <div className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse" 
                     style={{ background: moods.find(m => m.id === analysis.primary)?.hex }} />
              </motion.div>

              <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
                {analysis.title}
              </h3>

              <div className="space-y-8 mb-12 w-full max-w-[520px]">
                <p className="text-white/80 text-xl md:text-2xl leading-relaxed font-medium italic px-4">
                  "{analysis.analysis}"
                </p>
                
                <div className="relative group/tip">
                  <div className="absolute inset-0 blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" 
                       style={{ background: moods.find(m => m.id === analysis.primary)?.hex }} />
                  <div className="relative glass-panel rounded-[32px] p-8 border border-white/10 shadow-2xl">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] block mb-4">A little tip for you</span>
                    <p className="text-white text-lg md:text-xl font-bold leading-snug">
                      {analysis.tip}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setAnalysis(null)}
                className="group relative flex items-center gap-4 px-10 py-5 rounded-full glass-panel border border-white/10 hover:bg-white/10 transition-all active:scale-95 hover:border-white/20"
              >
                <span className="text-white font-black uppercase tracking-[0.3em] text-xs">Close</span>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
