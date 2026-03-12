import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Edit2, Trash2, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import confetti from 'canvas-confetti';

const CLASS_GROUPS = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Staff'] as const;
type ClassGroup = typeof CLASS_GROUPS[number];

const CLASS_NAMES: Record<ClassGroup, string[]> = {
  'Class 1': [
    'Alexander', 'Alfie', 'Arrianne', 'Bella', 'Cade', 'Edward', 'Elena', 'Eliza', 
    'Evalyn', 'Freddie', 'George', 'Jack', 'Jackson', 'Jasper', 'John', 'Jules', 
    'Kai', 'Layla', 'Lenny', 'Lucas', 'Milo', 'Myla', 'Nancy', 'Olly', 'Oscar', 
    'Polly', 'Reuben', 'Wren'
  ],
  'Class 2': [
    'Alben', 'Amelia', 'Archie', 'Arthur', 'Brandon', 'Charlotte', 'Evie', 'Fia', 
    'Florence', 'Freddie', 'G', 'Harper', 'Henry', 'Ishbel', 'Ivy', 'Leo', 'Lily', 
    'Lottie', 'Mila', 'Nancy', 'Oliver', 'Oscar', 'Sebastian', 'Sofia', 'Teddy', 'Troy'
  ],
  'Class 3': [
    'A', 'Alba', 'Bobby', 'Frankie', 'George L', 'George S', 'Grace', 'Hunter', 'Jack', 
    'Lacey', 'Maddie-Bee', 'Molly P', 'Molly W', 'Natalie', 'Otis', 'Ruby', 'Rupert', 
    'Sophie', 'Tilly', 'Violette'
  ],
  'Class 4': [
    'Candice', 'Eva', 'Felix', 'Frankie', 'Jack', 'Joshua', 'Jude', 'Katie', 
    'Maja', 'Matthew F', 'Matthew G', 'Rocky', 'Rosie', 'Ruby', 'Serenity', 'W'
  ],
  'Staff': []
};

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

interface VotingPageProps {
  title: string;
  description: string;
  questions: WouldYouRatherQuestion[];
}

const PASTEL_COLORS = ['#ffd8e8', '#d0e5ff', '#e8f5d0', '#ffe0d0', '#f0d8ff', '#d0e8f5', '#ffe8f0', '#fff0d0', '#d8f0ff', '#e8e8f0', '#d0f0f8', '#ffe0e8'];

export function VotingPage({
  title,
  description,
  questions
}: VotingPageProps) {
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
  const [name, setName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B'>>({});
  const [votes, setVotes] = useState<Vote[]>([]);
  const [editingVoteId, setEditingVoteId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Load votes from localStorage on mount
  useEffect(() => {
    const storedVotes = localStorage.getItem('worldBookDayVotes');
    if (storedVotes) {
      try {
        const parsedVotes = JSON.parse(storedVotes);
        setVotes(parsedVotes);
      } catch (error) {
        console.error('Error loading votes from localStorage:', error);
      }
    }
  }, []);

  // Save votes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('worldBookDayVotes', JSON.stringify(votes));
  }, [votes]);

  const handleSubmit = () => {
    if (!selectedClass || !name || Object.keys(answers).length !== questions.length) return;

    const newVote: Vote = {
      id: editingVoteId || Date.now().toString(),
      name,
      class: selectedClass,
      answers,
      timestamp: Date.now()
    };

    if (editingVoteId) {
      setVotes(votes.map(v => v.id === editingVoteId ? newVote : v));
      setEditingVoteId(null);
    } else {
      setVotes([...votes, newVote]);
    }

    // Reset form
    setSelectedClass(null);
    setName('');
    setCurrentQuestionIndex(0);
    setAnswers({});
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleDeleteVote = (id: string) => {
    setVotes(votes.filter(v => v.id !== id));
  };

  const handleEditVote = (vote: Vote) => {
    setEditingVoteId(vote.id);
    setSelectedClass(vote.class as ClassGroup);
    setName(vote.name);
    setAnswers(vote.answers);
    setCurrentQuestionIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSelectedClass(null);
    setName('');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setEditingVoteId(null);
  };

  const hasVoted = (voterName: string, voterClass: string) => {
    return votes.some(v => v.name.toLowerCase() === voterName.toLowerCase() && v.class === voterClass);
  };

  const handleAnswer = (questionId: string, answer: 'A' | 'B') => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);
    
    // Check if this was the last question
    const allAnswered = questions.every(q => newAnswers[q.id]);
    
    if (allAnswered) {
      // Show celebration immediately
      setShowCelebration(true);
      
      // Fire confetti multiple times
      const duration = 1500;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount,
          spread: randomInRange(50, 100),
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#ffd8e8', '#d0e5ff', '#e8f5d0', '#ffe0d0', '#f0d8ff', '#ffe8f0']
        });
        confetti({
          particleCount,
          spread: randomInRange(50, 100),
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#ffd8e8', '#d0e5ff', '#e8f5d0', '#ffe0d0', '#f0d8ff', '#ffe8f0']
        });
      }, 250);

      // Hide celebration after 1.5 seconds
      setTimeout(() => {
        setShowCelebration(false);
      }, 1500);
      
      // Auto-submit after a short delay
      setTimeout(() => {
        if (!selectedClass || !name) return;

        const newVote: Vote = {
          id: editingVoteId || Date.now().toString(),
          name,
          class: selectedClass,
          answers: newAnswers,
          timestamp: Date.now()
        };

        if (editingVoteId) {
          setVotes(votes.map(v => v.id === editingVoteId ? newVote : v));
          setEditingVoteId(null);
        } else {
          setVotes([...votes, newVote]);
        }

        // Reset form
        setSelectedClass(null);
        setName('');
        setCurrentQuestionIndex(0);
        setAnswers({});
        
        // Scroll to top to see results
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1500);
    } else if (currentQuestionIndex < questions.length - 1) {
      // Auto-advance to next question
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allQuestionsAnswered = questions.every(q => answers[q.id]);
  const canSubmit = selectedClass && name && allQuestionsAnswered;
  const isDuplicateVote = selectedClass && name && hasVoted(name, selectedClass) && !editingVoteId;

  return (
    <div className="min-h-screen bg-[#f1f2f6] px-4 py-12">
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="rounded-[3rem] p-16 shadow-[12px_12px_24px_rgba(163,177,198,0.3),-12px_-12px_24px_rgba(255,255,255,0.8)] bg-gradient-to-br from-[#ffd8e8] via-[#d0e5ff] to-[#e8f5d0]"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                duration: 0.6 
              }}
            >
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="mb-6 text-8xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  🎉
                </motion.div>
                <motion.h2
                  className="text-5xl font-bold text-[#4a4a5e] mb-4"
                  animate={{ 
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  Thank You!
                </motion.h2>
                <p className="text-2xl text-[#6a6a7e]">Your vote has been recorded! ✨</p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-4xl text-[#4a4a5e]">{title}</h2>
          <p className="text-lg text-[#6a6a7e]">{description}</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex justify-center gap-3">
          {votes.length > 0 && (
            <>
              <motion.button
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 rounded-2xl px-6 py-3 shadow-[3px_3px_8px_rgba(163,177,198,0.25),-3px_-3px_8px_rgba(255,255,255,0.7)] transition-all"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '4px 4px 12px rgba(163,177,198,0.3),-4px -4px 12px rgba(255,255,255,0.8)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="h-5 w-5 text-[#6a6a7e]" />
                <span className="text-[#5a5a6e]">{showStats ? 'Hide Stats' : 'Quick Stats'}</span>
              </motion.button>

              <motion.button
                onClick={() => navigate('/analytics')}
                className="flex items-center gap-2 rounded-2xl px-6 py-3 shadow-[3px_3px_8px_rgba(163,177,198,0.25),-3px_-3px_8px_rgba(255,255,255,0.7)] transition-all"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: '4px 4px 12px rgba(163,177,198,0.3),-4px -4px 12px rgba(255,255,255,0.8)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <BarChart3 className="h-5 w-5 text-[#6a6a7e]" />
                <span className="text-[#5a5a6e]">Full Analytics</span>
              </motion.button>
            </>
          )}
        </div>

        {/* Quick Stats Display */}
        {showStats && votes.length > 0 && (
          <motion.div
            className="mb-12 rounded-3xl p-8 shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.7)]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="mb-6 text-xl text-[#5a5a6e]">Question Results</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {questions.map((question, index) => {
                const aVotes = votes.filter(v => v.answers[question.id] === 'A').length;
                const bVotes = votes.filter(v => v.answers[question.id] === 'B').length;
                const total = aVotes + bVotes;
                const aPercent = total > 0 ? (aVotes / total) * 100 : 50;
                const bPercent = total > 0 ? (bVotes / total) * 100 : 50;

                return (
                  <div
                    key={question.id}
                    className="rounded-2xl p-6 shadow-[3px_3px_6px_rgba(163,177,198,0.15),-3px_-3px_6px_rgba(255,255,255,0.5)]"
                  >
                    <div className="mb-4 text-sm text-[#8a8a9e]">Question {index + 1}</div>
                    <div className="mb-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[#4a4a5e]">{question.optionA}</div>
                        <div className="text-sm text-[#6a6a7e] font-medium">{aVotes} ({Math.round(aPercent)}%)</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-[#4a4a5e]">{question.optionB}</div>
                        <div className="text-sm text-[#6a6a7e] font-medium">{bVotes} ({Math.round(bPercent)}%)</div>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-[#e8e8f0] overflow-hidden flex">
                      <div 
                        className="bg-[#a8d0ff] transition-all duration-500"
                        style={{ width: `${aPercent}%` }}
                      />
                      <div 
                        className="bg-[#ffb8a0] transition-all duration-500"
                        style={{ width: `${bPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Recent Votes List */}
        {votes.length > 0 && !showStats && (
          <div className="mb-12 rounded-3xl p-8 shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.7)]">
            <h3 className="mb-6 text-xl text-[#5a5a6e]">Recent Votes ({votes.length})</h3>
            <div className="space-y-3">
              {votes.slice().reverse().slice(0, 10).map((vote) => (
                <div
                  key={vote.id}
                  className="flex items-center justify-between rounded-2xl p-4 shadow-[3px_3px_6px_rgba(163,177,198,0.15),-3px_-3px_6px_rgba(255,255,255,0.5)]"
                >
                  <div>
                    <span className="text-[#4a4a5e] font-medium">{vote.name}</span>
                    <span className="ml-3 text-sm text-[#8a8a9e]">({vote.class})</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditVote(vote)}
                      className="rounded-xl p-2 shadow-[2px_2px_4px_rgba(163,177,198,0.2),-2px_-2px_4px_rgba(255,255,255,0.6)] transition-all hover:shadow-[3px_3px_6px_rgba(163,177,198,0.25),-3px_-3px_6px_rgba(255,255,255,0.7)]"
                    >
                      <Edit2 className="h-4 w-4 text-[#6a6a7e]" />
                    </button>
                    <button
                      onClick={() => handleDeleteVote(vote.id)}
                      className="rounded-xl p-2 shadow-[2px_2px_4px_rgba(163,177,198,0.2),-2px_-2px_4px_rgba(255,255,255,0.6)] transition-all hover:shadow-[3px_3px_6px_rgba(163,177,198,0.25),-3px_-3px_6px_rgba(255,255,255,0.7)]"
                    >
                      <Trash2 className="h-4 w-4 text-[#ff6b6b]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voting Section */}
        <div className="rounded-3xl p-8 shadow-[8px_8px_16px_rgba(163,177,198,0.2),-8px_-8px_16px_rgba(255,255,255,0.7)]">
          <h3 className="mb-8 text-center text-2xl text-[#4a4a5e]">
            {editingVoteId ? '✏️ Edit Your Vote' : '🗳️ Cast Your Vote'}
          </h3>

          {/* Step 1: Class Selection */}
          <div className="mb-10">
            <h3 className="mb-6 text-center text-lg text-[#5a5a6e]">Select Your Class</h3>
            <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
              {CLASS_GROUPS.map((classGroup, index) => (
                <motion.button
                  key={classGroup}
                  onClick={() => {
                    setSelectedClass(classGroup);
                    setName('');
                  }}
                  className="relative overflow-hidden rounded-2xl bg-transparent p-6 shadow-[3px_3px_6px_rgba(163,177,198,0.25),-3px_-3px_6px_rgba(255,255,255,0.7)] transition-all"
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: '4px 4px 8px rgba(163,177,198,0.3),-4px -4px 8px rgba(255,255,255,0.8)'
                  }}
                  whileTap={{
                    scale: 0.95,
                    transition: { duration: 0.1 }
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: selectedClass && selectedClass !== classGroup ? 0.4 : 1, 
                    y: 0,
                    boxShadow: selectedClass === classGroup 
                      ? [
                          'inset 3px 3px 6px rgba(163,177,198,0.3), inset -3px -3px 6px rgba(255,255,255,0.5), 0 0 10px rgba(255,180,200,0.8), 0 0 20px rgba(255,220,180,0.4)',
                          'inset 3px 3px 6px rgba(163,177,198,0.3), inset -3px -3px 6px rgba(255,255,255,0.5), 0 0 20px rgba(255,180,200,0.9), 0 0 30px rgba(255,220,180,0.6)',
                          'inset 3px 3px 6px rgba(163,177,198,0.3), inset -3px -3px 6px rgba(255,255,255,0.5), 0 0 10px rgba(255,180,200,0.8), 0 0 20px rgba(255,220,180,0.4)'
                        ]
                      : '3px 3px 6px rgba(163,177,198,0.25), -3px -3px 6px rgba(255,255,255,0.7)'
                  }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.05,
                    opacity: { duration: 0.3 },
                    boxShadow: selectedClass === classGroup ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}
                  }}
                >
                  {selectedClass === classGroup && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                  )}
                  
                  <div className={`relative z-10 text-base transition-all duration-300 ${
                    selectedClass === classGroup ? 'text-[#4a4a5e] font-medium' : 'text-[#6a6a7e]'
                  }`}>
                    {classGroup}
                  </div>
                  
                  {selectedClass === classGroup && (
                    <motion.div
                      className="absolute right-2 top-2 z-10"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15, duration: 0.5 }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Check className="h-4 w-4 text-[#6a6a7e] drop-shadow-sm" />
                      </motion.div>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Step 2: Name Selection */}
          {selectedClass && (
            <motion.div 
              className="mb-10"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 className="mb-6 text-center text-lg text-[#5a5a6e]">
                {selectedClass === 'Staff' ? 'Enter Your Name' : 'Select Your Name'}
              </h3>
              {selectedClass === 'Staff' ? (
                <div className="mx-auto max-w-md">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Type your name..."
                    className="w-full rounded-2xl bg-transparent px-6 py-4 text-center text-[#4a4a5e] placeholder-[#a8a8b8] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.2),inset_-3px_-3px_6px_rgba(255,255,255,0.4)] outline-none transition-all focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.25),inset_-4px_-4px_8px_rgba(255,255,255,0.45)]"
                  />
                  {name && hasVoted(name, 'Staff') && !editingVoteId && (
                    <motion.p 
                      className="mt-3 text-center text-sm text-[#ff6b6b]"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      ⚠️ This name has already voted
                    </motion.p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {CLASS_NAMES[selectedClass].map((studentName, index) => {
                    const voted = hasVoted(studentName, selectedClass);
                    return (
                      <motion.button
                        key={studentName}
                        onClick={() => !voted && setName(studentName)}
                        disabled={voted && !editingVoteId}
                        className={`relative overflow-hidden rounded-2xl p-4 transition-all ${
                          voted && !editingVoteId
                            ? 'cursor-not-allowed opacity-40 shadow-[inset_2px_2px_4px_rgba(163,177,198,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.3)]'
                            : 'shadow-[3px_3px_6px_rgba(163,177,198,0.2),-3px_-3px_6px_rgba(255,255,255,0.6)]'
                        }`}
                        whileHover={voted && !editingVoteId ? {} : { 
                          scale: 1.03,
                          boxShadow: '4px 4px 8px rgba(163,177,198,0.25),-4px -4px 8px rgba(255,255,255,0.7)'
                        }}
                        whileTap={voted && !editingVoteId ? {} : { scale: 0.95 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: name && name !== studentName ? 0.4 : 1,
                          y: 0,
                          boxShadow: name === studentName
                            ? [
                                'inset 3px 3px 6px rgba(163,177,198,0.3), inset -3px -3px 6px rgba(255,255,255,0.5), 0 0 8px rgba(168,208,255,0.6)',
                                'inset 3px 3px 6px rgba(163,177,198,0.3), inset -3px -3px 6px rgba(255,255,255,0.5), 0 0 12px rgba(168,208,255,0.8)',
                                'inset 3px 3px 6px rgba(163,177,198,0.3), inset -3px -3px 6px rgba(255,255,255,0.5), 0 0 8px rgba(168,208,255,0.6)'
                              ]
                            : voted && !editingVoteId
                              ? 'inset 2px 2px 4px rgba(163,177,198,0.2), inset -2px -2px 4px rgba(255,255,255,0.3)'
                              : '3px 3px 6px rgba(163,177,198,0.2), -3px -3px 6px rgba(255,255,255,0.6)'
                        }}
                        transition={{ 
                          duration: 0.3,
                          delay: index * 0.02,
                          boxShadow: name === studentName ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}
                        }}
                      >
                        {name === studentName && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                          />
                        )}
                        
                        <span className={`relative z-10 text-sm transition-all duration-300 ${
                          name === studentName ? 'text-[#4a4a5e] font-medium' : 'text-[#6a6a7e]'
                        }`}>
                          {studentName}
                        </span>

                        {voted && !editingVoteId && (
                          <motion.div
                            className="absolute right-1 top-1 z-10 rounded-full bg-[#a8d0ff] p-1"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          >
                            <Check className="h-3 w-3 text-[#4a4a5e]" />
                          </motion.div>
                        )}

                        {name === studentName && (
                          <motion.div
                            className="absolute right-1 top-1 z-10"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          >
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <Check className="h-3 w-3 text-[#6a6a7e] drop-shadow-sm" />
                            </motion.div>
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Questions */}
          {selectedClass && name && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="mb-2 flex justify-between text-sm text-[#8a8a9e]">
                  <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-3 rounded-full bg-[#e8e8f0] overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#a8d0ff] to-[#d8b8ff]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Current Question */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="mb-8 text-center text-2xl text-[#4a4a5e]">
                    Would you rather...
                  </h4>

                  <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Option A */}
                    <motion.button
                      onClick={() => handleAnswer(currentQuestion.id, 'A')}
                      className={`relative overflow-hidden rounded-3xl p-10 transition-all ${
                        answers[currentQuestion.id] === 'A'
                          ? 'shadow-[inset_4px_4px_8px_rgba(163,177,198,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]'
                          : 'shadow-[6px_6px_12px_rgba(163,177,198,0.2),-6px_-6px_12px_rgba(255,255,255,0.7)]'
                      }`}
                      style={{ backgroundColor: PASTEL_COLORS[currentQuestionIndex % PASTEL_COLORS.length] }}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: '8px 8px 16px rgba(163,177,198,0.25),-8px -8px 16px rgba(255,255,255,0.8)'
                      }}
                      whileTap={{ scale: 0.98 }}
                      animate={{
                        boxShadow: answers[currentQuestion.id] === 'A'
                          ? [
                              'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5), 0 0 15px rgba(168,208,255,0.6)',
                              'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5), 0 0 25px rgba(168,208,255,0.8)',
                              'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5), 0 0 15px rgba(168,208,255,0.6)'
                            ]
                          : '6px 6px 12px rgba(163,177,198,0.2), -6px -6px 12px rgba(255,255,255,0.7)'
                      }}
                      transition={{
                        boxShadow: answers[currentQuestion.id] === 'A' ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}
                      }}
                    >
                      {answers[currentQuestion.id] === 'A' && (
                        <motion.div
                          className="absolute right-4 top-4"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <div className="rounded-full bg-white/50 p-2">
                            <Check className="h-6 w-6 text-[#4a4a5e]" />
                          </div>
                        </motion.div>
                      )}
                      <div className="text-xl text-[#4a4a5e] font-medium">
                        {currentQuestion.optionA}
                      </div>
                    </motion.button>

                    {/* Option B */}
                    <motion.button
                      onClick={() => handleAnswer(currentQuestion.id, 'B')}
                      className={`relative overflow-hidden rounded-3xl p-10 transition-all ${
                        answers[currentQuestion.id] === 'B'
                          ? 'shadow-[inset_4px_4px_8px_rgba(163,177,198,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]'
                          : 'shadow-[6px_6px_12px_rgba(163,177,198,0.2),-6px_-6px_12px_rgba(255,255,255,0.7)]'
                      }`}
                      style={{ backgroundColor: PASTEL_COLORS[(currentQuestionIndex + 1) % PASTEL_COLORS.length] }}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: '8px 8px 16px rgba(163,177,198,0.25),-8px -8px 16px rgba(255,255,255,0.8)'
                      }}
                      whileTap={{ scale: 0.98 }}
                      animate={{
                        boxShadow: answers[currentQuestion.id] === 'B'
                          ? [
                              'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5), 0 0 15px rgba(255,184,160,0.6)',
                              'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5), 0 0 25px rgba(255,184,160,0.8)',
                              'inset 4px 4px 8px rgba(163,177,198,0.3), inset -4px -4px 8px rgba(255,255,255,0.5), 0 0 15px rgba(255,184,160,0.6)'
                            ]
                          : '6px 6px 12px rgba(163,177,198,0.2), -6px -6px 12px rgba(255,255,255,0.7)'
                      }}
                      transition={{
                        boxShadow: answers[currentQuestion.id] === 'B' ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : {}
                      }}
                    >
                      {answers[currentQuestion.id] === 'B' && (
                        <motion.div
                          className="absolute right-4 top-4"
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        >
                          <div className="rounded-full bg-white/50 p-2">
                            <Check className="h-6 w-6 text-[#4a4a5e]" />
                          </div>
                        </motion.div>
                      )}
                      <div className="text-xl text-[#4a4a5e] font-medium">
                        {currentQuestion.optionB}
                      </div>
                    </motion.button>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      className={`flex items-center gap-2 rounded-2xl px-6 py-3 shadow-[3px_3px_6px_rgba(163,177,198,0.2),-3px_-3px_6px_rgba(255,255,255,0.6)] transition-all ${
                        currentQuestionIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-[4px_4px_8px_rgba(163,177,198,0.25),-4px_-4px_8px_rgba(255,255,255,0.7)]'
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4 text-[#6a6a7e]" />
                      <span className="text-[#6a6a7e]">Previous</span>
                    </button>

                    {!isLastQuestion ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        disabled={!answers[currentQuestion.id]}
                        className={`flex items-center gap-2 rounded-2xl px-6 py-3 shadow-[3px_3px_6px_rgba(163,177,198,0.2),-3px_-3px_6px_rgba(255,255,255,0.6)] transition-all ${
                          !answers[currentQuestion.id] ? 'opacity-40 cursor-not-allowed' : 'hover:shadow-[4px_4px_8px_rgba(163,177,198,0.25),-4px_-4px_8px_rgba(255,255,255,0.7)]'
                        }`}
                      >
                        <span className="text-[#6a6a7e]">Next</span>
                        <ChevronRight className="h-4 w-4 text-[#6a6a7e]" />
                      </button>
                    ) : (
                      <motion.button
                        onClick={handleReset}
                        className="rounded-2xl px-6 py-3 shadow-[3px_3px_6px_rgba(163,177,198,0.2),-3px_-3px_6px_rgba(255,255,255,0.6)] transition-all hover:shadow-[4px_4px_8px_rgba(163,177,198,0.25),-4px_-4px_8px_rgba(255,255,255,0.7)]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-[#6a6a7e]">Start Over</span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}