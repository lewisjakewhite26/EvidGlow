import { ReactNode, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Maximize, Minimize, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [votesCount, setVotesCount] = useState(0);

  // Check votes count
  const checkVotes = () => {
    const storedVotes = localStorage.getItem('worldBookDayVotes');
    const count = storedVotes ? JSON.parse(storedVotes).length : 0;
    console.log('Votes count:', count, 'Path:', location.pathname);
    setVotesCount(count);
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Error attempting to exit fullscreen:', err);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Check votes on mount and when location changes
  useEffect(() => {
    checkVotes();
  }, [location]);

  // Listen for storage changes (when votes are added/removed)
  useEffect(() => {
    const handleStorageChange = () => {
      checkVotes();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically since storage event doesn't fire in same tab
    const interval = setInterval(checkVotes, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#f1f2f6] relative">
      {/* Animated Glassmorphism Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full opacity-70 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(168, 208, 255, 0.9) 0%, rgba(168, 208, 255, 0.3) 50%, rgba(168, 208, 255, 0) 70%)',
            top: '5%',
            left: '5%',
          }}
          animate={{
            x: [0, 70, 0],
            y: [0, 50, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full opacity-65 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 184, 160, 0.85) 0%, rgba(255, 184, 160, 0.4) 50%, rgba(255, 184, 160, 0) 70%)',
            top: '50%',
            right: '10%',
          }}
          animate={{
            x: [0, -60, 0],
            y: [0, 60, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[650px] h-[650px] rounded-full opacity-60 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(208, 232, 168, 0.9) 0%, rgba(208, 232, 168, 0.4) 50%, rgba(208, 232, 168, 0) 70%)',
            bottom: '0%',
            left: '45%',
          }}
          animate={{
            x: [0, 80, 0],
            y: [0, -70, 0],
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full opacity-65 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(216, 184, 255, 0.85) 0%, rgba(216, 184, 255, 0.4) 50%, rgba(216, 184, 255, 0) 70%)',
            top: '35%',
            left: '65%',
          }}
          animate={{
            x: [0, -50, 0],
            y: [0, -60, 0],
            scale: [1, 1.18, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[750px] h-[750px] rounded-full opacity-70 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 224, 168, 0.9) 0%, rgba(255, 224, 168, 0.4) 50%, rgba(255, 224, 168, 0) 70%)',
            top: '15%',
            right: '0%',
          }}
          animate={{
            x: [0, 65, 0],
            y: [0, 75, 0],
            scale: [1, 1.22, 1],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[550px] h-[550px] rounded-full opacity-60 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 200, 220, 0.85) 0%, rgba(255, 200, 220, 0.4) 50%, rgba(255, 200, 220, 0) 70%)',
            bottom: '20%',
            left: '15%',
          }}
          animate={{
            x: [0, 55, 0],
            y: [0, -45, 0],
            scale: [1, 1.16, 1],
          }}
          transition={{
            duration: 21,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[700px] h-[700px] rounded-full opacity-65 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(160, 208, 232, 0.85) 0%, rgba(160, 208, 232, 0.4) 50%, rgba(160, 208, 232, 0) 70%)',
            top: '60%',
            right: '40%',
          }}
          animate={{
            x: [0, -70, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 23,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Floating Emojis */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Emoji 1 - 🤪 */}
        <motion.div
          className="absolute text-6xl opacity-30"
          style={{ left: '10%', bottom: '-100px' }}
          animate={{
            y: [0, -1200],
            x: [0, 30, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          🤪
        </motion.div>

        {/* Emoji 2 - 😂 */}
        <motion.div
          className="absolute text-5xl opacity-25"
          style={{ left: '25%', bottom: '-100px' }}
          animate={{
            y: [0, -1300],
            x: [0, -25, 15, 0],
            rotate: [0, -15, 15, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
            delay: 2,
          }}
        >
          😂
        </motion.div>

        {/* Emoji 3 - 🥰 */}
        <motion.div
          className="absolute text-7xl opacity-28"
          style={{ left: '45%', bottom: '-100px' }}
          animate={{
            y: [0, -1100],
            x: [0, 20, -30, 0],
            rotate: [0, 20, -20, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'linear',
            delay: 5,
          }}
        >
          🥰
        </motion.div>

        {/* Emoji 4 - 🥳 */}
        <motion.div
          className="absolute text-5xl opacity-26"
          style={{ left: '60%', bottom: '-100px' }}
          animate={{
            y: [0, -1250],
            x: [0, -15, 25, 0],
            rotate: [0, -12, 12, 0],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: 'linear',
            delay: 7,
          }}
        >
          🥳
        </motion.div>

        {/* Emoji 5 - 🫣 */}
        <motion.div
          className="absolute text-6xl opacity-24"
          style={{ left: '75%', bottom: '-100px' }}
          animate={{
            y: [0, -1150],
            x: [0, 18, -22, 0],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: 'linear',
            delay: 3,
          }}
        >
          🫣
        </motion.div>

        {/* Emoji 6 - 🤨 */}
        <motion.div
          className="absolute text-4xl opacity-27"
          style={{ left: '85%', bottom: '-100px' }}
          animate={{
            y: [0, -1350],
            x: [0, -28, 18, 0],
            rotate: [0, -18, 18, 0],
          }}
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: 'linear',
            delay: 1,
          }}
        >
          🤨
        </motion.div>

        {/* Emoji 7 - 🤯 */}
        <motion.div
          className="absolute text-5xl opacity-25"
          style={{ left: '5%', bottom: '-100px' }}
          animate={{
            y: [0, -1280],
            x: [0, 22, -18, 0],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            duration: 29,
            repeat: Infinity,
            ease: 'linear',
            delay: 8,
          }}
        >
          🤯
        </motion.div>

        {/* Emoji 8 - 🥴 */}
        <motion.div
          className="absolute text-6xl opacity-29"
          style={{ left: '35%', bottom: '-100px' }}
          animate={{
            y: [0, -1180],
            x: [0, -20, 25, 0],
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: 'linear',
            delay: 4,
          }}
        >
          🥴
        </motion.div>

        {/* Emoji 9 - 👀 */}
        <motion.div
          className="absolute text-5xl opacity-26"
          style={{ left: '55%', bottom: '-100px' }}
          animate={{
            y: [0, -1220],
            x: [0, 15, -20, 0],
            rotate: [0, 12, -12, 0],
          }}
          transition={{
            duration: 27,
            repeat: Infinity,
            ease: 'linear',
            delay: 6,
          }}
        >
          👀
        </motion.div>

        {/* Emoji 10 - 👌 */}
        <motion.div
          className="absolute text-6xl opacity-28"
          style={{ left: '70%', bottom: '-100px' }}
          animate={{
            y: [0, -1120],
            x: [0, -16, 20, 0],
            rotate: [0, 14, -14, 0],
          }}
          transition={{
            duration: 23,
            repeat: Infinity,
            ease: 'linear',
            delay: 9,
          }}
        >
          👌
        </motion.div>

        {/* Emoji 11 - 🫶 */}
        <motion.div
          className="absolute text-5xl opacity-27"
          style={{ left: '15%', bottom: '-100px' }}
          animate={{
            y: [0, -1260],
            x: [0, 24, -16, 0],
            rotate: [0, -16, 16, 0],
          }}
          transition={{
            duration: 31,
            repeat: Infinity,
            ease: 'linear',
            delay: 2.5,
          }}
        >
          🫶
        </motion.div>

        {/* Emoji 12 - 🌭 */}
        <motion.div
          className="absolute text-6xl opacity-25"
          style={{ left: '40%', bottom: '-100px' }}
          animate={{
            y: [0, -1140],
            x: [0, -18, 22, 0],
            rotate: [0, 18, -18, 0],
          }}
          transition={{
            duration: 25.5,
            repeat: Infinity,
            ease: 'linear',
            delay: 7.5,
          }}
        >
          🌭
        </motion.div>

        {/* Emoji 13 - ☕ */}
        <motion.div
          className="absolute text-5xl opacity-24"
          style={{ left: '65%', bottom: '-100px' }}
          animate={{
            y: [0, -1290],
            x: [0, 26, -14, 0],
            rotate: [0, -11, 11, 0],
          }}
          transition={{
            duration: 28.5,
            repeat: Infinity,
            ease: 'linear',
            delay: 4.5,
          }}
        >
          ☕
        </motion.div>

        {/* Emoji 14 - 🙌 */}
        <motion.div
          className="absolute text-6xl opacity-26"
          style={{ left: '80%', bottom: '-100px' }}
          animate={{
            y: [0, -1160],
            x: [0, -22, 18, 0],
            rotate: [0, 13, -13, 0],
          }}
          transition={{
            duration: 26.5,
            repeat: Infinity,
            ease: 'linear',
            delay: 5.5,
          }}
        >
          🙌
        </motion.div>

        {/* Emoji 15 - 💪 */}
        <motion.div
          className="absolute text-5xl opacity-28"
          style={{ left: '20%', bottom: '-100px' }}
          animate={{
            y: [0, -1200],
            x: [0, 17, -23, 0],
            rotate: [0, -14, 14, 0],
          }}
          transition={{
            duration: 24.5,
            repeat: Infinity,
            ease: 'linear',
            delay: 3.5,
          }}
        >
          💪
        </motion.div>

        {/* Emoji 16 - 🥶 */}
        <motion.div
          className="absolute text-6xl opacity-27"
          style={{ left: '50%', bottom: '-100px' }}
          animate={{
            y: [0, -1230],
            x: [0, -19, 21, 0],
            rotate: [0, 16, -16, 0],
          }}
          transition={{
            duration: 27.5,
            repeat: Infinity,
            ease: 'linear',
            delay: 6.5,
          }}
        >
          🥶
        </motion.div>

        {/* Emoji 17 - 🫡 */}
        <motion.div
          className="absolute text-5xl opacity-25"
          style={{ left: '30%', bottom: '-100px' }}
          animate={{
            y: [0, -1170],
            x: [0, 21, -17, 0],
            rotate: [0, -17, 17, 0],
          }}
          transition={{
            duration: 29.5,
            repeat: Infinity,
            ease: 'linear',
            delay: 8.5,
          }}
        >
          🫡
        </motion.div>

        {/* Emoji 18 - 🤝 */}
        <motion.div
          className="absolute text-6xl opacity-29"
          style={{ left: '90%', bottom: '-100px' }}
          animate={{
            y: [0, -1190],
            x: [0, -24, 19, 0],
            rotate: [0, 9, -9, 0],
          }}
          transition={{
            duration: 23.5,
            repeat: Infinity,
            ease: 'linear',
            delay: 1.5,
          }}
        >
          🤝
        </motion.div>

        {/* Emoji 19 - 💅 */}
        <motion.div
          className="absolute text-5xl opacity-26"
          style={{ left: '12%', bottom: '-100px' }}
          animate={{
            y: [0, -1240],
            x: [0, 20, -15, 0],
            rotate: [0, -13, 13, 0],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            ease: 'linear',
            delay: 5,
          }}
        >
          💅
        </motion.div>

        {/* Emoji 20 - 🫠 */}
        <motion.div
          className="absolute text-6xl opacity-28"
          style={{ left: '58%', bottom: '-100px' }}
          animate={{
            y: [0, -1210],
            x: [0, -17, 22, 0],
            rotate: [0, 11, -11, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
            delay: 7,
          }}
        >
          🫠
        </motion.div>
      </div>

      {/* Header */}
      <header className="fixed left-0 top-0 z-40 flex w-full items-center justify-center border-b border-[#e0e0f0] bg-[#f1f2f6]/80 backdrop-blur-md py-6">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              rotate: [0, -5, 5, -5, 0],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut"
            }}
          >
            <BookOpen className="h-8 w-8 text-[#6a6a7e]" />
          </motion.div>
          <motion.h1 
            className="text-2xl text-[#5a5a6e]"
            animate={{ 
              y: [0, -2, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Emoji Vote
          </motion.h1>
        </div>

        {/* Header Buttons */}
        <div className="absolute right-6 flex items-center gap-3">
          {/* Analytics Button - Show when votes exist and on home page */}
          {votesCount > 0 && location.pathname === '/' && (
            <motion.button
              onClick={() => navigate('/analytics')}
              className="rounded-2xl p-3 shadow-[3px_3px_8px_rgba(163,177,198,0.25),-3px_-3px_8px_rgba(255,255,255,0.7)] transition-all"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '4px 4px 12px rgba(163,177,198,0.3),-4px -4px 12px rgba(255,255,255,0.8)'
              }}
              whileTap={{ scale: 0.95 }}
              title="View Analytics"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <BarChart3 className="h-5 w-5 text-[#6a6a7e]" />
            </motion.button>
          )}

          {/* Fullscreen Toggle */}
          <motion.button
            onClick={toggleFullscreen}
            className="rounded-2xl p-3 shadow-[3px_3px_8px_rgba(163,177,198,0.25),-3px_-3px_8px_rgba(255,255,255,0.7)] transition-all"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '4px 4px 12px rgba(163,177,198,0.3),-4px -4px 12px rgba(255,255,255,0.8)'
            }}
            whileTap={{ scale: 0.95 }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5 text-[#6a6a7e]" />
            ) : (
              <Maximize className="h-5 w-5 text-[#6a6a7e]" />
            )}
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full overflow-y-auto pt-24 relative z-10">{children}</main>
    </div>
  );
}