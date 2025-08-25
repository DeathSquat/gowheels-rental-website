"use client";

import React from "react";
import { Toaster } from "sonner";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FleetExplorer from "@/components/FleetExplorer";
import BookingWidget from "@/components/BookingWidget";
import SupportChat from "@/components/SupportChat";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
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
      
      <SupportChat />
      
      <Toaster position="top-right" />
    </div>
  );
}