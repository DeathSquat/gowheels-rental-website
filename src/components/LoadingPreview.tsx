"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onLoadingComplete(), 800);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(progressInterval);
  }, [onLoadingComplete]);

  const CarIcon = () => (
    <svg
      width="80"
      height="40"
      viewBox="0 0 80 40"
      fill="none"
      className="text-white"
    >
      <path
        d="M15 25C15 27.7614 12.7614 30 10 30C7.23858 30 5 27.7614 5 25C5 22.2386 7.23858 20 10 20C12.7614 20 15 22.2386 15 25Z"
        fill="currentColor"
      />
      <path
        d="M75 25C75 27.7614 72.7614 30 70 30C67.2386 30 65 27.7614 65 25C65 22.2386 67.2386 20 70 20C72.7614 20 75 22.2386 75 25Z"
        fill="currentColor"
      />
      <path
        d="M20 15L25 8H55L65 15V25H75V20L70 8H25L15 20V25H20V15Z"
        fill="currentColor"
      />
      <rect x="30" y="10" width="20" height="8" rx="2" fill="currentColor" opacity="0.7" />
    </svg>
  );

  const FloatingParticle = ({ delay }: { delay: number }) => (
    <motion.div
      className="absolute w-2 h-2 bg-white/30 rounded-full"
      initial={{ 
        x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
        y: typeof window !== 'undefined' ? window.innerHeight + 20 : 100,
        opacity: 0
      }}
      animate={{
        y: -20,
        opacity: [0, 1, 0],
        x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        left: Math.random() * 100 + '%',
      }}
    />
  );

  return (
    <>
      {/* Global styles for animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes grid-move {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }

          .grid-animation {
            background-image: 
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: grid-move 20s linear infinite;
          }

          .shimmer-effect {
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
            animation: shimmer 1.5s infinite;
          }

          .text-3d {
            text-shadow: 
              0 1px 0 #ccc,
              0 2px 0 #c9c9c9,
              0 3px 0 #bbb,
              0 4px 0 #b9b9b9,
              0 5px 0 #aaa,
              0 6px 1px rgba(0,0,0,.1),
              0 0 5px rgba(0,0,0,.1),
              0 1px 3px rgba(0,0,0,.3),
              0 3px 5px rgba(0,0,0,.2),
              0 5px 10px rgba(0,0,0,.25);
            background: linear-gradient(45deg, #ffffff, #e2e8f0, #ffffff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .glassmorphism {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .glow-aura {
            background: radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%);
            filter: blur(20px);
          }

          .progress-gradient {
            background: linear-gradient(90deg, #3b82f6, #06b6d4, #10b981);
            box-shadow: 
              0 0 20px rgba(59, 130, 246, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
        `
      }} />

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700"
            style={{
              perspective: '1000px',
              transformStyle: 'preserve-3d'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full grid-animation" />
            </div>

            {/* Floating Particles */}
            {[...Array(15)].map((_, i) => (
              <FloatingParticle key={i} delay={i * 0.3} />
            ))}

            {/* 3D Floating Cars */}
            <motion.div
              className="absolute top-1/4 left-1/4"
              animate={{
                y: [-20, 20, -20],
                rotateY: [0, 360],
                rotateX: [0, 15, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="opacity-40 transform scale-75">
                <CarIcon />
              </div>
            </motion.div>

            <motion.div
              className="absolute top-3/4 right-1/4"
              animate={{
                y: [20, -20, 20],
                rotateY: [360, 0],
                rotateZ: [0, 10, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="opacity-30 transform scale-50">
                <CarIcon />
              </div>
            </motion.div>

            <motion.div
              className="absolute top-1/2 right-1/6"
              animate={{
                x: [-30, 30, -30],
                rotateY: [0, -360],
                rotateX: [-10, 10, -10]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="opacity-25 transform scale-60">
                <CarIcon />
              </div>
            </motion.div>

            {/* Main Content Container */}
            <motion.div
              className="text-center z-10 relative"
              style={{ transformStyle: 'preserve-3d' }}
              initial={{ rotateX: 45, y: 100, opacity: 0 }}
              animate={{ rotateX: 0, y: 0, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {/* 3D Logo */}
              <motion.div
                className="mb-8 relative"
                animate={{
                  rotateY: [0, 5, -5, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <h1 className="text-7xl font-display font-extrabold text-white relative text-3d">
                  Go Wheels
                </h1>
                
                {/* Glassmorphism backdrop */}
                <div
                  className="absolute inset-0 rounded-2xl -z-10 glassmorphism"
                  style={{
                    transform: 'translateZ(-20px) scale(1.2)',
                    borderRadius: '20px'
                  }}
                />
              </motion.div>

              {/* Central Car Animation */}
              <motion.div
                className="mb-8 relative"
                animate={{
                  rotateY: [0, 360],
                  scale: [1, 1.1, 1],
                  z: [0, 50, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative">
                  <CarIcon />
                  
                  {/* Glowing aura */}
                  <div className="absolute inset-0 rounded-full opacity-50 glow-aura transform scale-200" />
                </div>
              </motion.div>

              {/* Tagline */}
              <motion.p
                className="text-xl font-medium text-white/90 mb-12 tracking-wide"
                style={{
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                Affordable Rides, Pure Comfort, Your Journey
              </motion.p>

              {/* 3D Progress Container */}
              <motion.div
                className="relative w-80 mx-auto"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateX: [0, 2, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {/* Glassmorphism background */}
                <div
                  className="absolute inset-0 rounded-full glassmorphism"
                  style={{
                    transform: 'translateZ(-10px) scale(1.1)'
                  }}
                />
                
                {/* Progress Track */}
                <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full relative progress-gradient"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Animated shimmer effect */}
                    <div className="absolute inset-0 opacity-60 shimmer-effect" />
                  </motion.div>
                </div>
                
                {/* Progress Text */}
                <motion.div
                  className="text-center mt-4 text-white/80 font-medium"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {progress}%
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};