import { motion } from 'motion/react';
import { Delete, X } from 'lucide-react';

interface OnScreenKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onClose: () => void;
}

const KEYBOARD_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export default function OnScreenKeyboard({ onKeyPress, onBackspace, onSpace, onClose }: OnScreenKeyboardProps) {
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#f1f2f6] p-4 pb-6 shadow-[0_-8px_24px_rgba(163,177,198,0.3)]"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <div className="mx-auto max-w-4xl">
        {/* Close Button */}
        <div className="mb-3 flex justify-end">
          <motion.button
            onMouseDown={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f2f6] shadow-[3px_3px_8px_rgba(163,177,198,0.3),-3px_-3px_8px_rgba(255,255,255,0.8)] transition-all"
            whileHover={{
              scale: 1.05,
              boxShadow: '4px 4px 10px rgba(163,177,198,0.35),-4px -4px 10px rgba(255,255,255,0.85)'
            }}
            whileTap={{
              scale: 0.95,
              boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.3), inset -3px -3px 6px rgba(255,255,255,0.8)'
            }}
          >
            <X className="h-5 w-5 text-[#6a6a7e]" />
          </motion.button>
        </div>

        <div className="space-y-3">
          {KEYBOARD_LAYOUT.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="flex justify-center gap-2"
              style={{ paddingLeft: rowIndex === 1 ? '2rem' : rowIndex === 2 ? '4rem' : '0' }}
            >
              {row.map((key) => (
                <motion.button
                  key={key}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onKeyPress(key);
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f2f6] text-lg font-medium text-[#4a4a5e] shadow-[4px_4px_10px_rgba(163,177,198,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] transition-all"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '5px 5px 12px rgba(163,177,198,0.35),-5px -5px 12px rgba(255,255,255,0.85)'
                  }}
                  whileTap={{
                    scale: 0.95,
                    boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.3), inset -3px -3px 6px rgba(255,255,255,0.8)'
                  }}
                >
                  {key}
                </motion.button>
              ))}
            </div>
          ))}

          {/* Bottom Row with Space and Backspace */}
          <div className="flex justify-center gap-2 pt-2">
            <motion.button
              onMouseDown={(e) => {
                e.preventDefault();
                onBackspace();
              }}
              className="flex h-14 w-20 items-center justify-center rounded-2xl bg-[#f1f2f6] shadow-[4px_4px_10px_rgba(163,177,198,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] transition-all"
              whileHover={{
                scale: 1.05,
                boxShadow: '5px 5px 12px rgba(163,177,198,0.35),-5px -5px 12px rgba(255,255,255,0.85)'
              }}
              whileTap={{
                scale: 0.95,
                boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.3), inset -3px -3px 6px rgba(255,255,255,0.8)'
              }}
            >
              <Delete className="h-6 w-6 text-[#6a6a7e]" />
            </motion.button>

            <motion.button
              onMouseDown={(e) => {
                e.preventDefault();
                onSpace();
              }}
              className="flex h-14 flex-1 max-w-md items-center justify-center rounded-2xl bg-[#f1f2f6] text-lg font-medium text-[#4a4a5e] shadow-[4px_4px_10px_rgba(163,177,198,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] transition-all"
              whileHover={{
                scale: 1.02,
                boxShadow: '5px 5px 12px rgba(163,177,198,0.35),-5px -5px 12px rgba(255,255,255,0.85)'
              }}
              whileTap={{
                scale: 0.98,
                boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.3), inset -3px -3px 6px rgba(255,255,255,0.8)'
              }}
            >
              SPACE
            </motion.button>

            <motion.button
              onMouseDown={(e) => {
                e.preventDefault();
                onBackspace();
              }}
              className="flex h-14 w-20 items-center justify-center rounded-2xl bg-[#f1f2f6] shadow-[4px_4px_10px_rgba(163,177,198,0.3),-4px_-4px_10px_rgba(255,255,255,0.8)] transition-all"
              whileHover={{
                scale: 1.05,
                boxShadow: '5px 5px 12px rgba(163,177,198,0.35),-5px -5px 12px rgba(255,255,255,0.85)'
              }}
              whileTap={{
                scale: 0.95,
                boxShadow: 'inset 3px 3px 6px rgba(163,177,198,0.3), inset -3px -3px 6px rgba(255,255,255,0.8)'
              }}
            >
              <Delete className="h-6 w-6 text-[#6a6a7e]" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}