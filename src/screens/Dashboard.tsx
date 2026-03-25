import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, Heart, Brain, Palette } from 'lucide-react';
import { cn } from '../lib/utils';

export const Dashboard = ({ onCheckIn }: { onCheckIn: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 p-8 grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      {/* Hero Bento */}
      <div className="md:col-span-2 glass-panel rounded-[32px] p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -mr-20 -mt-20" />
        
        <div className="relative z-10">
          <h2 className="text-5xl font-extrabold text-white tracking-tight mb-6">
            Welcome back, <span className="text-primary">Lewis</span>
          </h2>
          <p className="text-white/60 text-xl max-w-md leading-relaxed">
            Your progress is looking great. You've maintained a 5-day mindfulness streak!
          </p>
        </div>

        <button 
          onClick={onCheckIn}
          className="relative z-10 w-fit px-8 py-4 bg-primary text-midnight font-bold rounded-2xl hover:bg-primary/80 transition-all flex items-center gap-3 group"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          Daily Check-in
        </button>
      </div>

      {/* Stats Bento */}
      <div className="glass-panel rounded-[32px] p-8 flex flex-col gap-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          Weekly Stats
        </h3>
        
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 max-h-[400px] hide-scrollbar">
          {[
            { label: 'Mindfulness', value: '85%', icon: Brain, text: 'text-blue-400', bg: 'bg-blue-400' },
            { label: 'Wellbeing', value: '92%', icon: Heart, text: 'text-rose-400', bg: 'bg-rose-400' },
            { label: 'Focus', value: '78%', icon: Sparkles, text: 'text-amber-400', bg: 'bg-amber-400' },
            { label: 'Creativity', value: '88%', icon: Palette, text: 'text-emerald-400', bg: 'bg-emerald-400' },
            { label: 'Energy', value: '65%', icon: TrendingUp, text: 'text-violet-400', bg: 'bg-violet-400' },
            { label: 'Social', value: '72%', icon: Heart, text: 'text-pink-400', bg: 'bg-pink-400' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 bg-white/5 rounded-2xl border border-white/10 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={cn("w-4 h-4", stat.text)} />
                <span className="text-xl font-bold text-white">{stat.value}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", stat.bg)} style={{ width: stat.value }} />
              </div>
              <span className="text-[10px] font-bold text-white/40 mt-2 block uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bento Row */}
      <div className="glass-panel rounded-[32px] p-8 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-white">Daily Inspiration</h4>
          <p className="text-white/40 text-sm">"The universe is not outside of you. Look inside yourself; everything that you want, you already are."</p>
        </div>
      </div>

    </motion.div>
  );
};
