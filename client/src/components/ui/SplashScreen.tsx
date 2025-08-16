'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  isLoading: boolean;
  onLoadingComplete: () => void;
}

export default function SplashScreen({ isLoading, onLoadingComplete }: SplashScreenProps) {
  const [isMounted, setIsMounted] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // If not loading anymore, start fade out animation
    if (!isLoading) {
      setIsVisible(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setIsMounted(false);
        onLoadingComplete();
      }, 500); // Match this with the exit animation duration
      return () => clearTimeout(timer);
    }
  }, [isLoading, onLoadingComplete]);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-white z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0, 0.71, 0.2, 1.01],
              scale: {
                type: "spring",
                damping: 5,
                stiffness: 100,
                restDelta: 0.001
              }
            }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <Image
                src="/assets/csa-logo.jpg"
                alt="CSA Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <motion.div 
              className="mt-6 h-1 w-32 bg-gray-200 rounded-full overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: '8rem' }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
            >
              <div className="h-full bg-blue-600 w-full"></div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
