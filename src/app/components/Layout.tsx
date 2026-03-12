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
    <div className="flex min-h-screen overflow-hidden bg-[#f1f2f6]">
      {/* Header */}
      <header className="fixed left-0 top-0 z-40 flex w-full items-center justify-center border-b border-[#e0e0f0] bg-[#f1f2f6] py-6">
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
            Would You Rather Vote
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
      <main className="w-full overflow-y-auto pt-24">{children}</main>
    </div>
  );
}