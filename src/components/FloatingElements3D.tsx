"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Car, Cube, Triangle, Circle } from 'lucide-react';

interface FloatingElement {
  id: string;
  type: 'cube' | 'sphere' | 'pyramid' | 'particle' | 'car';
  x: number;
  y: number;
  z: number;
  size: number;
  opacity: number;
  speed: number;
  rotationSpeed: number;
  parallaxFactor: number;
}

interface MousePosition {
  x: number;
  y: number;
}

export const FloatingElements3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Initialize floating elements
  useEffect(() => {
    const createElements = () => {
      const newElements: FloatingElement[] = [];
      const elementCount = Math.min(20, Math.floor(window.innerWidth / 100));

      for (let i = 0; i < elementCount; i++) {
        const types: FloatingElement['type'][] = ['cube', 'sphere', 'pyramid', 'particle', 'car'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        newElements.push({
          id: `element-${i}`,
          type,
          x: Math.random() * 100,
          y: Math.random() * 100,
          z: Math.random() * 1000 - 500,
          size: type === 'particle' ? Math.random() * 4 + 2 : Math.random() * 40 + 20,
          opacity: type === 'particle' ? Math.random() * 0.3 + 0.1 : Math.random() * 0.4 + 0.1,
          speed: Math.random() * 2 + 0.5,
          rotationSpeed: Math.random() * 2 + 0.5,
          parallaxFactor: Math.random() * 0.5 + 0.2,
        });
      }

      setElements(newElements);
    };

    createElements();
  }, [windowSize]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      setMousePosition({
        x: (e.clientX - centerX) / centerX,
        y: (e.clientY - centerY) / centerY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animate elements continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setElements(prev => prev.map(element => ({
        ...element,
        x: (element.x + element.speed * 0.1) % 110,
        y: element.y + Math.sin(Date.now() * 0.001 * element.speed) * 0.1,
      })));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const renderGeometricShape = (element: FloatingElement) => {
    const baseTransform = `
      translate3d(
        calc(${element.x}vw + ${mousePosition.x * element.parallaxFactor * 20}px),
        calc(${element.y}vh + ${mousePosition.y * element.parallaxFactor * 20}px),
        ${element.z}px
      )
    `;

    switch (element.type) {
      case 'cube':
        return (
          <motion.div
            key={element.id}
            className="absolute pointer-events-none"
            style={{
              transform: baseTransform,
              width: element.size,
              height: element.size,
            }}
            animate={{
              rotateX: [0, 360],
              rotateY: [0, 360],
              rotateZ: [0, 360],
            }}
            transition={{
              duration: 20 / element.rotationSpeed,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <div
              className="w-full h-full bg-gradient-to-br from-blue-500/20 to-gray-700/20 backdrop-blur-sm border border-white/10 rounded-lg shadow-2xl"
              style={{
                opacity: element.opacity,
                transform: 'rotateX(45deg) rotateY(45deg)',
                background: `linear-gradient(135deg, 
                  rgba(59, 130, 246, ${element.opacity * 0.3}) 0%, 
                  rgba(55, 65, 81, ${element.opacity * 0.2}) 50%, 
                  rgba(255, 255, 255, ${element.opacity * 0.1}) 100%)`,
              }}
            />
          </motion.div>
        );

      case 'sphere':
        return (
          <motion.div
            key={element.id}
            className="absolute pointer-events-none rounded-full"
            style={{
              transform: baseTransform,
              width: element.size,
              height: element.size,
              background: `radial-gradient(circle at 30% 30%, 
                rgba(147, 197, 253, ${element.opacity * 0.4}) 0%, 
                rgba(59, 130, 246, ${element.opacity * 0.2}) 50%, 
                rgba(17, 24, 39, ${element.opacity * 0.1}) 100%)`,
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: `0 0 ${element.size}px rgba(59, 130, 246, ${element.opacity * 0.3})`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [element.opacity, element.opacity * 1.2, element.opacity],
            }}
            transition={{
              duration: 4 / element.speed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );

      case 'pyramid':
        return (
          <motion.div
            key={element.id}
            className="absolute pointer-events-none"
            style={{
              transform: baseTransform,
              width: 0,
              height: 0,
              borderLeft: `${element.size / 2}px solid transparent`,
              borderRight: `${element.size / 2}px solid transparent`,
              borderBottom: `${element.size}px solid rgba(99, 102, 241, ${element.opacity})`,
              filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.3))',
            }}
            animate={{
              rotateY: [0, 360],
              rotateZ: [-10, 10, -10],
            }}
            transition={{
              rotateY: {
                duration: 15 / element.rotationSpeed,
                repeat: Infinity,
                ease: "linear",
              },
              rotateZ: {
                duration: 3 / element.speed,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          />
        );

      case 'particle':
        return (
          <motion.div
            key={element.id}
            className="absolute pointer-events-none rounded-full"
            style={{
              transform: baseTransform,
              width: element.size,
              height: element.size,
              background: `rgba(255, 255, 255, ${element.opacity})`,
              boxShadow: `0 0 ${element.size * 2}px rgba(255, 255, 255, ${element.opacity * 0.5})`,
            }}
            animate={{
              opacity: [element.opacity, element.opacity * 2, element.opacity],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2 / element.speed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );

      case 'car':
        return (
          <motion.div
            key={element.id}
            className="absolute pointer-events-none"
            style={{
              transform: baseTransform,
            }}
            animate={{
              rotateY: [0, 360],
              y: [0, -20, 0],
            }}
            transition={{
              rotateY: {
                duration: 25 / element.rotationSpeed,
                repeat: Infinity,
                ease: "linear",
              },
              y: {
                duration: 6 / element.speed,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
          >
            <div
              className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-gray-700/20 rounded-lg p-2 border border-white/10"
              style={{ opacity: element.opacity }}
            >
              <Car 
                size={element.size} 
                className="text-blue-400/60" 
                style={{
                  filter: `drop-shadow(0 0 ${element.size / 4}px rgba(59, 130, 246, 0.4))`,
                }}
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/5 pointer-events-none" />
      
      {/* Floating elements */}
      {elements.map(element => renderGeometricShape(element))}

      {/* Additional ambient particles */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 80%, rgba(147, 197, 253, 0.02) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 60%, rgba(99, 102, 241, 0.03) 0%, transparent 50%)',
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Glassmorphism overlay elements */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          transform: `translate3d(${mousePosition.x * 30}px, ${mousePosition.y * 30}px, 0)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-1/3 right-1/4 w-24 h-24 rounded-lg pointer-events-none"
        style={{
          background: 'rgba(59, 130, 246, 0.05)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          transform: `translate3d(${mousePosition.x * -20}px, ${mousePosition.y * -20}px, 0)`,
        }}
        animate={{
          rotateZ: [0, 180, 360],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};