import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { ArrowLeft, Users, TrendingUp, Award } from 'lucide-react';
import { useNavigate } from 'react-router';

interface WouldYouRatherQuestion {
  id: string;
  optionA: string;
  optionB: string;
}

interface Vote {
  id: string;
  name: string;
  class: string;
  answers: Record<string, 'A' | 'B'>;
  timestamp: number;
}

const WOULD_YOU_RATHER_QUESTIONS: WouldYouRatherQuestion[] = [
  { id: 'q1', optionA: 'Have a pet dragon', optionB: 'Have a pet unicorn' },
  { id: 'q2', optionA: 'Read minds', optionB: 'See the future' },
  { id: 'q3', optionA: 'Read instantly', optionB: 'Write automatically' },
  { id: 'q4', optionA: 'Best player on a losing team', optionB: 'Worst player on a winning team' },
  { id: 'q5', optionA: 'Rich person 100 years in the past', optionB: 'Poor person 100 years in the future' },
  { id: 'q6', optionA: 'Same song stuck in your head', optionB: 'Same dream every night' }
];

const PASTEL_COLORS = ['#a8d0ff', '#ffb8a0', '#d0e8a8', '#ffe0a8', '#d8b8ff', '#a0d0e8', '#ffd0e0', '#ffd8e8', '#b8d8ff', '#d0d0e0', '#a0d8e8', '#ffb8c8'];

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

  const getQuestionResults = (questionId: string) => {
    const aVotes = votes.filter(v => v.answers[questionId] === 'A').length;
    const bVotes = votes.filter(v => v.answers[questionId] === 'B').length;
    return { aVotes, bVotes, total: aVotes + bVotes };
  };

  const getClassBreakdown = () => {
    const breakdown: Record<string, number> = {};
    votes.forEach(vote => {
      breakdown[vote.class] = (breakdown[vote.class] || 0) + 1;
    });
    return Object.entries(breakdown).map(([name, value]) => ({ name, value }));
  };

  const getMostPopularOptions = () => {
    const optionCounts: Record<string, { count: number; question: string }> = {};
    
    WOULD_YOU_RATHER_QUESTIONS.forEach(question => {
      const { aVotes, bVotes } = getQuestionResults(question.id);
      
      if (!optionCounts[question.optionA]) {
        optionCounts[question.optionA] = { count: 0, question: `${question.optionA} vs ${question.optionB}` };
      }
      optionCounts[question.optionA].count = aVotes;
      
      if (!optionCounts[question.optionB]) {
        optionCounts[question.optionB] = { count: 0, question: `${question.optionA} vs ${question.optionB}` };
      }
      optionCounts[question.optionB].count = bVotes;
    });

    return Object.entries(optionCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
  };

  if (votes.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f1f2f6] p-4">
        <div className="text-center">
          <p className="mb-4 text-xl text-[#6a6a7e]">No votes yet!</p>
          <motion.button
            onClick={() => navigate('/')}
            className="rounded-2xl px-6 py-3 shadow-[3px_3px_8px_rgba(163,177,198,0.25),-3px_-3px_8px_rgba(255,255,255,0.7)] transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-[#5a5a6e]">Go Back</span>
          </motion.button>
        </div>
      </div>
    );
  }

  const classBreakdown = getClassBreakdown();
  const topOptions = getMostPopularOptions();

  return (
    <div className="min-h-screen bg-[#f1f2f6] px-4 py-12">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl text-[#4a4a5e]">📊 Analytics Dashboard</h1>
            <p className="text-[#6a6a7e]">Detailed voting insights and statistics</p>
          </div>
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
        </div>

        {/* Summary Cards */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div
            className="rounded-3xl p-6 shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.7)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-[#d0e5ff] p-3">
                <Users className="h-6 w-6 text-[#6a6a7e]" />
              </div>
              <h3 className="text-lg text-[#5a5a6e]">Total Votes</h3>
            </div>
            <p className="text-3xl font-medium text-[#4a4a5e]">{votes.length}</p>
          </motion.div>

          <motion.div
            className="rounded-3xl p-6 shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.7)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-[#ffe0d0] p-3">
                <TrendingUp className="h-6 w-6 text-[#6a6a7e]" />
              </div>
              <h3 className="text-lg text-[#5a5a6e]">Questions</h3>
            </div>
            <p className="text-3xl font-medium text-[#4a4a5e]">{WOULD_YOU_RATHER_QUESTIONS.length}</p>
          </motion.div>

          <motion.div
            className="rounded-3xl p-6 shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.7)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-2xl bg-[#e8f5d0] p-3">
                <Award className="h-6 w-6 text-[#6a6a7e]" />
              </div>
              <h3 className="text-lg text-[#5a5a6e]">Top Choice</h3>
            </div>
            <p className="text-xl font-medium text-[#4a4a5e] line-clamp-2">{topOptions[0]?.[0] || 'N/A'}</p>
          </motion.div>
        </div>

        {/* Class Breakdown */}
        <motion.div
          className="mb-12 rounded-3xl p-8 shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.7)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="mb-6 text-2xl text-[#4a4a5e]">Votes by Class</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
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
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Question-by-Question Results */}
        <motion.div
          className="mb-12 rounded-3xl p-8 shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.7)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="mb-6 text-2xl text-[#4a4a5e]">Question Results</h2>
          <div className="space-y-8">
            {WOULD_YOU_RATHER_QUESTIONS.map((question, index) => {
              const { aVotes, bVotes, total } = getQuestionResults(question.id);
              const aPercent = total > 0 ? (aVotes / total) * 100 : 50;
              const bPercent = total > 0 ? (bVotes / total) * 100 : 50;

              const chartData = [
                { name: question.optionA, votes: aVotes, percent: aPercent },
                { name: question.optionB, votes: bVotes, percent: bPercent }
              ];

              return (
                <motion.div
                  key={question.id}
                  className="rounded-2xl p-6 shadow-[3px_3px_6px_rgba(163,177,198,0.15),-3px_-3px_6px_rgba(255,255,255,0.5)]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  <h3 className="mb-4 text-lg text-[#5a5a6e]">
                    Question {index + 1}: Would you rather...
                  </h3>
                  
                  {/* Horizontal Bar Comparison */}
                  <div className="mb-4 space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[#4a4a5e] font-medium">{question.optionA}</span>
                        <span className="text-sm text-[#6a6a7e]">{aVotes} votes ({Math.round(aPercent)}%)</span>
                      </div>
                      <div className="h-8 rounded-full bg-[#e8e8f0] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: PASTEL_COLORS[index * 2 % PASTEL_COLORS.length] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${aPercent}%` }}
                          transition={{ duration: 1, delay: 0.7 + index * 0.05 }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[#4a4a5e] font-medium">{question.optionB}</span>
                        <span className="text-sm text-[#6a6a7e]">{bVotes} votes ({Math.round(bPercent)}%)</span>
                      </div>
                      <div className="h-8 rounded-full bg-[#e8e8f0] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: PASTEL_COLORS[(index * 2 + 1) % PASTEL_COLORS.length] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${bPercent}%` }}
                          transition={{ duration: 1, delay: 0.7 + index * 0.05 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mini Bar Chart */}
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0f0" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#8a8a9e"
                          tick={{ fill: '#8a8a9e', fontSize: 12 }}
                          interval={0}
                          angle={-15}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis stroke="#8a8a9e" tick={{ fill: '#8a8a9e' }} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#f1f2f6',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '3px 3px 6px rgba(163,177,198,0.2), -3px -3px 6px rgba(255,255,255,0.7)'
                          }}
                        />
                        <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={PASTEL_COLORS[(index * 2 + idx) % PASTEL_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Top 5 Most Popular Options */}
        <motion.div
          className="rounded-3xl p-8 shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.7)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="mb-6 text-2xl text-[#4a4a5e]">Top 5 Most Popular Choices</h2>
          <div className="space-y-4">
            {topOptions.map(([option, data], index) => (
              <motion.div
                key={option}
                className="flex items-center gap-4 rounded-2xl p-4 shadow-[3px_3px_6px_rgba(163,177,198,0.15),-3px_-3px_6px_rgba(255,255,255,0.5)]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <div 
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold text-[#4a4a5e]"
                  style={{ backgroundColor: PASTEL_COLORS[index % PASTEL_COLORS.length] }}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-[#4a4a5e] font-medium">{option}</div>
                  <div className="text-sm text-[#8a8a9e]">{data.count} votes</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}