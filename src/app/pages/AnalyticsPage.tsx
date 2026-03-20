import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { ArrowLeft, Users, TrendingUp, Award } from 'lucide-react';
import { useNavigate } from 'react-router';

const SUNDAY_DINNER_ITEMS = [
  'Roast Beef',
  'Roast Chicken',
  'Roast Lamb',
  'Roast Pork',
  'Yorkshire Pudding',
  'Roast Potatoes',
  'Mashed Potatoes',
  'Stuffing',
  'Gravy',
  'Peas',
  'Carrots',
  'Broccoli',
  'Cauliflower',
  'Brussels Sprouts',
  'Parsnips'
];

interface Vote {
  name: string;
  class: string;
  choices: string[]; // Array of 3 favourite emojis
  timestamp: number;
}

const PASTEL_COLORS = ['#a8d0ff', '#ffb8a0', '#d0e8a8', '#ffe0a8', '#d8b8ff', '#a0d0e8', '#ffd0e0', '#ffd8e8', '#b8d8ff', '#d0d0e0', '#a0d8e8', '#ffb8c8', '#c8e0ff', '#ffe8d0', '#e0d0ff'];

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [votes, setVotes] = useState<Vote[]>([]);

  useEffect(() => {
    const storedVotes = localStorage.getItem('worldBookDayVotes');
    if (storedVotes) {
      try {
        setVotes(JSON.parse(storedVotes));
      } catch (error) {
        console.error('Error loading votes:', error);
      }
    }
  }, []);

  const getToppingResults = () => {
    const toppingCounts: Record<string, number> = {};
    SUNDAY_DINNER_ITEMS.forEach(topping => {
      toppingCounts[topping] = 0;
    });
    
    votes.forEach(vote => {
      vote.choices.forEach(topping => {
        if (toppingCounts[topping] !== undefined) {
          toppingCounts[topping]++;
        }
      });
    });

    return Object.entries(toppingCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const getClassBreakdown = () => {
    const breakdown: Record<string, number> = {};
    votes.forEach(vote => {
      breakdown[vote.class] = (breakdown[vote.class] || 0) + 1;
    });
    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  };

  const getTopTopping = () => {
    const results = getToppingResults();
    return results.length > 0 ? results[0] : null;
  };

  const toppingResults = getToppingResults();
  const classBreakdown = getClassBreakdown();
  const topTopping = getTopTopping();
  const totalVotes = votes.length;

  if (totalVotes === 0) {
    return (
      <div className="min-h-screen bg-[#f1f2f6] px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <motion.button
            onClick={() => navigate('/')}
            className="mb-8 flex items-center gap-2 rounded-2xl px-6 py-3 shadow-[3px_3px_8px_rgba(163,177,198,0.25),-3px_-3px_8px_rgba(255,255,255,0.7)] transition-all"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '4px 4px 12px rgba(163,177,198,0.3),-4px -4px 12px rgba(255,255,255,0.8)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5 text-[#6a6a7e]" />
            <span className="text-[#5a5a6e]">Back to Voting</span>
          </motion.button>

          <div className="rounded-3xl p-12 shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.7)] text-center">
            <p className="text-2xl text-[#6a6a7e]">No votes yet! 😀</p>
            <p className="mt-4 text-[#8a8a9e]">Start voting to see analytics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f2f6] px-4 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-2xl px-6 py-3 shadow-[3px_3px_8px_rgba(163,177,198,0.25),-3px_-3px_8px_rgba(255,255,255,0.7)] transition-all"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '4px 4px 12px rgba(163,177,198,0.3),-4px -4px 12px rgba(255,255,255,0.8)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="h-5 w-5 text-[#6a6a7e]" />
            <span className="text-[#5a5a6e]">Back to Voting</span>
          </motion.button>

          <h1 className="text-3xl text-[#4a4a5e]">😀 Emoji Analytics 📊</h1>
        </div>

        {/* Key Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <motion.div
            className="rounded-3xl p-6 shadow-[6px_6px_12px_rgba(163,177,198,0.2),-6px_-6px_12px_rgba(255,255,255,0.7)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-[#a8d0ff] p-3 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.4)]">
                <Users className="h-6 w-6 text-[#4a4a5e]" />
              </div>
              <div>
                <p className="text-sm text-[#8a8a9e]">Total Voters</p>
                <p className="text-3xl font-bold text-[#4a4a5e]">{totalVotes}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="rounded-3xl p-6 shadow-[6px_6px_12px_rgba(163,177,198,0.2),-6px_-6px_12px_rgba(255,255,255,0.7)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-[#ffb8a0] p-3 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.4)]">
                <TrendingUp className="h-6 w-6 text-[#4a4a5e]" />
              </div>
              <div>
                <p className="text-sm text-[#8a8a9e]">Total Votes Cast</p>
                <p className="text-3xl font-bold text-[#4a4a5e]">{totalVotes * 3}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="rounded-3xl p-6 shadow-[6px_6px_12px_rgba(163,177,198,0.2),-6px_-6px_12px_rgba(255,255,255,0.7)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-[#d0e8a8] p-3 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.4)]">
                <Award className="h-6 w-6 text-[#4a4a5e]" />
              </div>
              <div>
                <p className="text-sm text-[#8a8a9e]">Most Popular</p>
                <p className="text-xl font-bold text-[#4a4a5e]">{topTopping ? topTopping.name : 'N/A'}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Top Pizza Toppings Bar Chart */}
        <motion.div
          className="mb-8 rounded-3xl p-8 shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.7)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="mb-6 text-2xl text-[#4a4a5e]">Emoji Results</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={toppingResults}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d0d0d8" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="#8a8a9e" 
                angle={-45}
                textAnchor="end"
                height={120}
                style={{ fontSize: '12px' }}
              />
              <YAxis stroke="#8a8a9e" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#f1f2f6',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '4px 4px 8px rgba(163,177,198,0.2), -4px -4px 8px rgba(255,255,255,0.7)'
                }}
              />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {toppingResults.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Class Breakdown Pie Chart */}
          <motion.div
            className="rounded-3xl p-8 shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.7)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="mb-6 text-2xl text-[#4a4a5e]">Votes by Class</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={classBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {classBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PASTEL_COLORS[index % PASTEL_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f1f2f6',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '4px 4px 8px rgba(163,177,198,0.2), -4px -4px 8px rgba(255,255,255,0.7)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Top 10 Toppings List */}
          <motion.div
            className="rounded-3xl p-8 shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.7)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="mb-6 text-2xl text-[#4a4a5e]">Top 10 Emojis</h2>
            <div className="space-y-4">
              {toppingResults.slice(0, 10).map((topping, index) => {
                const maxVotes = toppingResults[0]?.value || 1;
                const percentage = (topping.value / maxVotes) * 100;
                
                return (
                  <motion.div
                    key={topping.name}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-[3px_3px_6px_rgba(163,177,198,0.2),-3px_-3px_6px_rgba(255,255,255,0.6)]">
                      <span className="font-bold text-[#4a4a5e]">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex justify-between">
                        <span className="font-medium text-[#4a4a5e]">{topping.name}</span>
                        <span className="text-sm text-[#6a6a7e]">{topping.value} votes</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#e8e8f0] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: PASTEL_COLORS[index % PASTEL_COLORS.length] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.8 + index * 0.05 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}