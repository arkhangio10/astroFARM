'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { getAchievementIcon, getAchievementColor } from '@/lib/achievements';
import { motion, AnimatePresence } from 'framer-motion';

export default function AchievementToast() {
  const { achievements } = useGameStore();
  const [showToast, setShowToast] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<any>(null);
  const [previousAchievements, setPreviousAchievements] = useState<any[]>([]);

  useEffect(() => {
    // Check for new achievements
    if (achievements.length > previousAchievements.length) {
      const newAchievement = achievements[achievements.length - 1];
      setCurrentAchievement(newAchievement);
      setShowToast(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    }
    
    setPreviousAchievements(achievements);
  }, [achievements, previousAchievements]);

  if (!currentAchievement) return null;

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="achievement-toast rounded-xl p-6 shadow-2xl border-2 max-w-md mx-4">
            <div className="flex items-center gap-4">
              {/* Achievement Icon */}
              <div className="text-4xl">
                {getAchievementIcon(currentAchievement.type, currentAchievement.tier)}
              </div>
              
              {/* Achievement Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  {currentAchievement.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {currentAchievement.description}
                </p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getAchievementColor(currentAchievement.tier) }}
                  />
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {currentAchievement.tier}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-2 rounded-full"
                  style={{ backgroundColor: getAchievementColor(currentAchievement.tier) }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

