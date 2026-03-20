import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Edit2, Trash2, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import confetti from 'canvas-confetti';
import OnScreenKeyboard from './OnScreenKeyboard';

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

const SUNDAY_DINNER_ITEMS = [
  '🤪',
  '😂',
  '🥰',
  '🥳',
  '🫣',
  '🤨',
  '🤯',
  '🥴',
  '👀',
  '👌',
  '🫶',
  '🌭',
  '☕',
  '🙌',
  '💪',
  '🥶',
  '🫡',
  '🤝',
  '💅',
  '🫠'
];

interface Vote {
  name: string;
  class: string;
  choices: string[]; // Array of 3 favourite emojis
  timestamp: number;
}

interface VotingPageProps {
  title: string;
  description: string;
}

const PASTEL_COLORS = ['#ffd8e8', '#d0e5ff', '#e8f5d0', '#ffe0d0', '#f0d8ff', '#d0e8f5', '#ffe8f0', '#fff0d0', '#d8f0ff', '#e8e8f0', '#d0f0f8', '#ffe0e8'];

export function VotingPage({
  title,
  description
}: VotingPageProps) {
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
  const [name, setName] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [editingVoteId, setEditingVoteId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll when keyboard opens
  useEffect(() => {
    if (showKeyboard && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [showKeyboard]);

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
    if (!selectedClass || !name || selectedItems.length !== 3) return;

    const newVote: Vote = {
      name,
      class: selectedClass,
      choices: selectedItems,
      timestamp: Date.now()
    };

    if (editingVoteId) {
      setVotes(votes.map(v => v.id === editingVoteId ? newVote : v));
      setEditingVoteId(null);
    } else {
      setVotes([...votes, newVote]);
    }

    // Show celebration
    setShowCelebration(true);
    
    // Fire confetti
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

    setTimeout(() => {
      setShowCelebration(false);
      // Reset form
      setSelectedClass(null);
      setName('');
      setSelectedItems([]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  const handleDeleteVote = (id: string) => {
    setVotes(votes.filter(v => v.id !== id));
  };

  const handleEditVote = (vote: Vote) => {
    setEditingVoteId(vote.id);
    setSelectedClass(vote.class as ClassGroup);
    setName(vote.name);
    setSelectedItems(vote.choices);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSelectedClass(null);
    setName('');
    setSelectedItems([]);
    setEditingVoteId(null);
  };

  const hasVoted = (voterName: string, voterClass: string) => {
    return votes.some(v => v.name.toLowerCase() === voterName.toLowerCase() && v.class === voterClass);
  };

  const toggleItem = (item: string) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(t => t !== item));
    } else if (selectedItems.length < 3) {
      setSelectedItems([...selectedItems, item]);
      
      // Auto-submit when 3rd item is selected
      if (selectedItems.length === 2) {
        setTimeout(() => {
          const newChoices = [...selectedItems, item];
          if (!selectedClass || !name) return;

          const newVote: Vote = {
            name,
            class: selectedClass,
            choices: newChoices,
            timestamp: Date.now()
          };

          if (editingVoteId) {
            setVotes(votes.map(v => v.id === editingVoteId ? newVote : v));
            setEditingVoteId(null);
          } else {
            setVotes([...votes, newVote]);
          }

          // Show celebration
          setShowCelebration(true);
          
          // Fire confetti
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

          setTimeout(() => {
            setShowCelebration(false);
            // Reset form
            setSelectedClass(null);
            setName('');
            setSelectedItems([]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 1500);
        }, 300);
      }
    }
  };

  const getItemVotes = () => {
    const itemCounts: Record<string, number> = {};
    SUNDAY_DINNER_ITEMS.forEach(item => {
      itemCounts[item] = 0;
    });
    
    votes.forEach(vote => {
      vote.choices.forEach(item => {
        if (itemCounts[item] !== undefined) {
          itemCounts[item]++;
        }
      });
    });

    return Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([item, count]) => ({ item, count }));
  };

  const canSubmit = selectedClass && name && selectedItems.length === 3;
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
                  😀
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
            <h3 className="mb-6 text-xl text-[#5a5a6e]">Most Popular Emojis</h3>
            <div className="space-y-4">
              {getItemVotes().slice(0, 10).map(({ item, count }, index) => {
                const maxCount = getItemVotes()[0].count;
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                  <div key={item} className="flex items-center gap-4">
                    <div className="w-8 text-center text-sm text-[#8a8a9e]">#{index + 1}</div>
                    <div className="flex-1">
                      <div className="mb-1 flex justify-between">
                        <span className="text-[#4a4a5e]">{item}</span>
                        <span className="text-sm text-[#6a6a7e] font-medium">{count} votes</span>
                      </div>
                      <div className="h-3 rounded-full bg-[#e8e8f0] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ 
                            background: `linear-gradient(90deg, ${PASTEL_COLORS[index % PASTEL_COLORS.length]}, ${PASTEL_COLORS[(index + 1) % PASTEL_COLORS.length]})` 
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                      </div>
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
                    <div className="mt-1 text-xs text-[#8a8a9e]">{vote.choices.join(', ')}</div>
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
                    onFocus={() => setShowKeyboard(true)}
                    placeholder="Type your name..."
                    className="w-full rounded-2xl bg-transparent px-6 py-4 text-center text-[#4a4a5e] placeholder-[#a8a8b8] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.2),inset_-3px_-3px_6px_rgba(255,255,255,0.4)] outline-none transition-all focus:shadow-[inset_4px_4px_8px_rgba(163,177,198,0.25),inset_-4px_-4px_8px_rgba(255,255,255,0.45)]"
                    ref={inputRef}
                  />
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

          {/* Step 3: Sunday Dinner Item Selection */}
          {selectedClass && name && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 className="mb-4 text-center text-lg text-[#5a5a6e]">
                Choose Your Top 3 Favourite Emojis
              </h3>
              <p className="mb-6 text-center text-sm text-[#8a8a9e]">
                Selected: {selectedItems.length}/3
              </p>

              <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
                {SUNDAY_DINNER_ITEMS.map((item, index) => {
                  const isSelected = selectedItems.includes(item);
                  const selectionIndex = selectedItems.indexOf(item);
                  const isDisabled = !isSelected && selectedItems.length >= 3;

                  return (
                    <motion.button
                      key={item}
                      onClick={() => !isDisabled && toggleItem(item)}
                      disabled={isDisabled}
                      className={`relative overflow-hidden rounded-2xl p-6 transition-all ${
                        isDisabled
                          ? 'cursor-not-allowed opacity-40 shadow-[2px_2px_4px_rgba(163,177,198,0.15),-2px_-2px_4px_rgba(255,255,255,0.5)]'
                          : 'shadow-[4px_4px_8px_rgba(163,177,198,0.2),-4px_-4px_8px_rgba(255,255,255,0.6)]'
                      }`}
                      style={{ 
                        backgroundColor: isSelected ? PASTEL_COLORS[index % PASTEL_COLORS.length] : 'transparent' 
                      }}
                      whileHover={isDisabled ? {} : { 
                        scale: 1.05,
                        boxShadow: '6px 6px 12px rgba(163,177,198,0.25),-6px -6px 12px rgba(255,255,255,0.7)'
                      }}
                      whileTap={isDisabled ? {} : { scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1,
                        y: 0,
                        boxShadow: isSelected
                          ? [
                              'inset 4px 4px 8px rgba(163,177,198,0.25), inset -4px -4px 8px rgba(255,255,255,0.4), 0 0 12px rgba(168,208,255,0.6)',
                              'inset 4px 4px 8px rgba(163,177,198,0.25), inset -4px -4px 8px rgba(255,255,255,0.4), 0 0 20px rgba(168,208,255,0.8)',
                              'inset 4px 4px 8px rgba(163,177,198,0.25), inset -4px -4px 8px rgba(255,255,255,0.4), 0 0 12px rgba(168,208,255,0.6)'
                            ]
                          : isDisabled
                            ? '2px 2px 4px rgba(163,177,198,0.15), -2px -2px 4px rgba(255,255,255,0.5)'
                            : '4px 4px 8px rgba(163,177,198,0.2), -4px -4px 8px rgba(255,255,255,0.6)'
                      }}
                      transition={{ 
                        duration: 0.3,
                        delay: index * 0.03,
                        boxShadow: isSelected ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : {}
                      }}
                    >
                      {isSelected && (
                        <>
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                          />
                          <motion.div
                            className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/70"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          >
                            <span className="text-xs font-bold text-[#4a4a5e]">{selectionIndex + 1}</span>
                          </motion.div>
                        </>
                      )}
                      
                      <div className={`relative z-10 text-center text-4xl transition-all duration-300 ${
                        isSelected ? 'font-medium' : ''
                      }`}>
                        {item}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {selectedItems.length === 3 && (
                <motion.div
                  className="mt-8 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-sm text-[#6a6a7e]">
                    😀 Your choices: <span className="font-medium text-[#4a4a5e]">{selectedItems.join(', ')}</span>
                  </p>
                  <p className="mt-2 text-xs text-[#8a8a9e]">Your vote will be submitted automatically!</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {showKeyboard && (
        <OnScreenKeyboard 
          onKeyPress={(key) => setName(prev => prev + key)}
          onBackspace={() => setName(prev => prev.slice(0, -1))}
          onSpace={() => setName(prev => prev + ' ')}
          onClose={() => setShowKeyboard(false)}
        />
      )}
    </div>
  );
}