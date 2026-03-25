import React from 'react';
import { motion } from 'motion/react';
import { Check, Play, Lock, Flag } from 'lucide-react';
import { cn } from '../lib/utils';

const steps = [
  { id: 1, title: 'Day 1', subtitle: 'Breathing', status: 'completed' },
  { id: 2, title: 'Day 2', subtitle: 'Journaling', status: 'completed' },
  { id: 3, title: 'Day 3', subtitle: 'Mindful Walk', status: 'active' },
  { id: 4, title: 'Day 4', subtitle: 'Locked', status: 'locked' },
  { id: 5, title: 'Day 5', subtitle: 'Locked', status: 'locked' },
  { id: 6, title: 'Day 6', subtitle: 'Locked', status: 'locked' },
  { id: 7, title: 'Day 7', subtitle: 'Milestone', status: 'milestone' },
];

export const Journey = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 p-8 md:p-12 glass-panel rounded-[32px] mx-8 my-8 overflow-hidden relative"
    >
      <div className="relative z-10 mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Your Wellbeing Journey
        </h2>
        <p className="text-white/60 text-lg font-medium">
          Keep up your mindful moments!
        </p>
      </div>

      <div className="relative w-full flex items-center min-h-[400px]">
        <div className="w-full overflow-x-auto hide-scrollbar pb-16 pt-24 px-4">
          <div className="min-w-max flex items-center relative px-20">
            {/* Background Line */}
            <div className="absolute top-1/2 left-20 right-20 h-1 bg-white/10 -translate-y-1/2 rounded-full" />
            
            {/* Active Progress Line */}
            <div 
              className="absolute top-1/2 left-20 h-1 bg-primary -translate-y-1/2 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.4)]"
              style={{ width: 'calc(2 * (64px + 16rem))' }} // Approximate width for 2 completed steps
            />

            <div className="flex items-center gap-64 relative z-10">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center group cursor-pointer relative">
                  {step.status === 'active' && (
                    <motion.div 
                      layoutId="active-glow"
                      className="absolute -top-16 w-12 h-12 rounded-full bg-primary/40 blur-md shadow-[0_0_40px_rgba(45,212,191,0.8)] z-20 flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-4 h-4 rounded-full bg-white blur-[1px]" />
                    </motion.div>
                  )}

                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300 shadow-lg border-2",
                    step.status === 'completed' && "bg-white/10 border-white/30 group-hover:bg-white/20",
                    step.status === 'active' && "bg-primary/20 border-primary shadow-[0_0_20px_rgba(45,212,191,0.3)]",
                    (step.status === 'locked' || step.status === 'milestone') && "bg-white/5 border-white/10 opacity-50"
                  )}>
                    {step.status === 'completed' && <Check className="w-8 h-8 text-white" />}
                    {step.status === 'active' && <Play className="w-8 h-8 text-primary fill-primary" />}
                    {step.status === 'locked' && <Lock className="w-8 h-8 text-white/40" />}
                    {step.status === 'milestone' && <Flag className="w-8 h-8 text-white/40" />}
                  </div>

                  <p className={cn(
                    "font-bold text-lg",
                    step.status === 'active' ? "text-primary" : "text-white"
                  )}>
                    {step.title}
                  </p>
                  <p className="text-white/50 text-sm mt-1">{step.subtitle}</p>

                  {step.status === 'active' && (
                    <div className="absolute -bottom-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs py-2 px-4 rounded-lg whitespace-nowrap">
                      Click to start session
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fade Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-midnight to-transparent pointer-events-none rounded-l-[32px]" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-midnight to-transparent pointer-events-none rounded-r-[32px]" />
      </div>
    </motion.div>
  );
};
