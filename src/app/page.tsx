"use client";

import React, { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { LoadingScreen } from "@/components/LoadingPreview";
import { FloatingElements3D } from "@/components/FloatingElements3D";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FleetExplorer from "@/components/FleetExplorer";
import BookingWidget from "@/components/BookingWidget";
import SupportChat from "@/components/SupportChat";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    
    // Prevent flash of light content
    document.documentElement.style.backgroundColor = '#0f1420';
    document.body.style.backgroundColor = '#0f1420';
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setTimeout(() => {
      setShowContent(true);
    }, 200);
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className={`min-h-screen bg-background dark transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'} relative`}>
      {/* 3D Floating Elements Background */}
      <FloatingElements3D />
      
      {/* Main Content */}
      <div className="relative z-10">
        <Header />
        
        <main>
          <Hero />
          
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <FleetExplorer />
              </div>
              
              <div className="lg:col-span-4">
                <BookingWidget />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
      
      {/* AI Support Chat - Always on top */}
      <SupportChat />
      
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}