"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Car, Locate, SearchCheck, Zap, Shield, Clock } from "lucide-react";
import { toast } from "sonner";

interface SearchParams {
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  returnDate?: string;
  passengers: number;
}

interface HeroProps {
  onSearch?: (params: SearchParams) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    passengers: 1,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<string[]>([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);

  // Mock location suggestions - in real app this would use Google Places API
  const mockLocationSuggestions = [
    "Mumbai Central Station, Mumbai",
    "Andheri East, Mumbai", 
    "Bandra West, Mumbai",
    "Delhi Airport, New Delhi",
    "Connaught Place, New Delhi",
    "Cyber City, Gurgaon"
  ];

  const handleLocationSearch = useCallback((query: string, isPickup: boolean) => {
    if (query.length < 2) {
      if (isPickup) {
        setShowPickupSuggestions(false);
      } else {
        setShowDropoffSuggestions(false);
      }
      return;
    }

    // Mock filtering - in real app this would call Google Places API
    const filtered = mockLocationSuggestions.filter(location =>
      location.toLowerCase().includes(query.toLowerCase())
    );

    if (isPickup) {
      setPickupSuggestions(filtered);
      setShowPickupSuggestions(true);
    } else {
      setDropoffSuggestions(filtered);
      setShowDropoffSuggestions(true);
    }
  }, []);

  const selectLocation = useCallback((location: string, isPickup: boolean) => {
    setSearchParams(prev => ({
      ...prev,
      [isPickup ? 'pickupLocation' : 'dropoffLocation']: location
    }));
    
    if (isPickup) {
      setShowPickupSuggestions(false);
    } else {
      setShowDropoffSuggestions(false);
    }
  }, []);

  const validateDates = useCallback(() => {
    const { pickupDate, returnDate } = searchParams;
    
    if (!pickupDate) {
      toast.error("Please select a pickup date and time");
      return false;
    }

    const pickupDateTime = new Date(pickupDate);
    const now = new Date();
    const minPickupTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now

    if (pickupDateTime < minPickupTime) {
      toast.error("Pickup time must be at least 30 minutes from now");
      return false;
    }

    if (returnDate) {
      const returnDateTime = new Date(returnDate);
      if (returnDateTime <= pickupDateTime) {
        toast.error("Return time must be after pickup time");
        return false;
      }
    }

    return true;
  }, [searchParams]);

  const handleSearch = useCallback(async () => {
    if (!searchParams.pickupLocation) {
      toast.error("Please select a pickup location");
      return;
    }

    if (!validateDates()) {
      return;
    }

    setIsSearching(true);

    try {
      // Mock API call - in real app this would call Convex
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful response
      const carCount = Math.floor(Math.random() * 20) + 5;
      toast.success(`Found ${carCount} cars near ${searchParams.pickupLocation?.split(',')[0]}`);
      
      // Call onSearch callback if provided
      onSearch?.(searchParams);
      
      // Emit custom DOM event
      const event = new CustomEvent('carSearchCompleted', {
        detail: { searchParams, carCount }
      });
      document.dispatchEvent(event);
      
    } catch (error) {
      toast.error("Search failed. Please try again.", {
        action: {
          label: "Retry",
          onClick: () => handleSearch()
        }
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchParams, validateDates, onSearch]);

  const incrementPassengers = useCallback(() => {
    setSearchParams(prev => ({
      ...prev,
      passengers: Math.min(prev.passengers + 1, 9)
    }));
  }, []);

  const decrementPassengers = useCallback(() => {
    setSearchParams(prev => ({
      ...prev,
      passengers: Math.max(prev.passengers - 1, 1)
    }));
  }, []);

  return (
    <section className="relative bg-background py-16 lg:py-24 overflow-hidden">
      {/* 3D Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Animated gradient mesh */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.4) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(147, 197, 253, 0.4) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-20 left-20 w-16 h-16 bg-blue-500/10 rounded-lg backdrop-blur-sm border border-blue-500/20"
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 360],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformStyle: 'preserve-3d' }}
        />

        <motion.div
          className="absolute top-40 right-32 w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            rotateZ: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-32 left-1/4 w-8 h-8 bg-green-500/20 rounded-sm backdrop-blur-sm transform rotate-45"
          animate={{
            y: [0, -30, 0],
            rotateY: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="space-y-6">
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-foreground leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                style={{
                  textShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
                }}
              >
                Go Wheels — Affordable Rides, Pure Comfort, Your Journey
              </motion.h1>
              
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Experience premium car rentals with our wide fleet, transparent pricing, and 24/7 support. 
                  Your comfort is our priority.
                </p>
                
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <motion.div
                    className="flex items-center gap-2 group cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      <Car className="h-4 w-4 text-primary" />
                      <motion.div
                        className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <span className="group-hover:text-primary transition-colors">Wide Fleet Selection</span>
                  </motion.div>
                  
                  <motion.div
                    className="flex items-center gap-2 group cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      <SearchCheck className="h-4 w-4 text-primary" />
                      <motion.div
                        className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      />
                    </div>
                    <span className="group-hover:text-primary transition-colors">Transparent Pricing</span>
                  </motion.div>
                  
                  <motion.div
                    className="flex items-center gap-2 group cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative">
                      <Clock className="h-4 w-4 text-primary" />
                      <motion.div
                        className="absolute inset-0 bg-primary/20 rounded-full blur-md"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      />
                    </div>
                    <span className="group-hover:text-primary transition-colors">24/7 Support</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Enhanced Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Card className="p-6 shadow-2xl backdrop-blur-md bg-card/80 border-white/10">
                <CardContent className="p-0">
                  <div className="grid gap-6">
                    {/* Location Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="relative space-y-2">
                        <Label htmlFor="pickup-location" className="text-sm font-medium">
                          Pickup Location
                        </Label>
                        <div className="relative">
                          <Locate className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="pickup-location"
                            placeholder="Enter pickup location"
                            className="pl-10"
                            value={searchParams.pickupLocation || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSearchParams(prev => ({ ...prev, pickupLocation: value }));
                              handleLocationSearch(value, true);
                            }}
                            onFocus={() => {
                              if (searchParams.pickupLocation && pickupSuggestions.length > 0) {
                                setShowPickupSuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              // Delay to allow click on suggestions
                              setTimeout(() => setShowPickupSuggestions(false), 200);
                            }}
                          />
                        </div>
                        {showPickupSuggestions && pickupSuggestions.length > 0 && (
                          <Card className="absolute z-10 w-full mt-1 shadow-lg">
                            <CardContent className="p-0">
                              {pickupSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  className="w-full text-left px-3 py-2 hover:bg-accent text-sm transition-colors"
                                  onClick={() => selectLocation(suggestion, true)}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </CardContent>
                          </Card>
                        )}
                      </div>

                      <div className="relative space-y-2">
                        <Label htmlFor="dropoff-location" className="text-sm font-medium">
                          Drop-off Location (Optional)
                        </Label>
                        <div className="relative">
                          <Locate className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="dropoff-location"
                            placeholder="Enter drop-off location"
                            className="pl-10"
                            value={searchParams.dropoffLocation || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              setSearchParams(prev => ({ ...prev, dropoffLocation: value }));
                              handleLocationSearch(value, false);
                            }}
                            onFocus={() => {
                              if (searchParams.dropoffLocation && dropoffSuggestions.length > 0) {
                                setShowDropoffSuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setShowDropoffSuggestions(false), 200);
                            }}
                          />
                        </div>
                        {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                          <Card className="absolute z-10 w-full mt-1 shadow-lg">
                            <CardContent className="p-0">
                              {dropoffSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  className="w-full text-left px-3 py-2 hover:bg-accent text-sm transition-colors"
                                  onClick={() => selectLocation(suggestion, false)}
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>

                    {/* Date and Time Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pickup-datetime" className="text-sm font-medium">
                          Pickup Date & Time
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="pickup-datetime"
                            type="datetime-local"
                            className="pl-10"
                            value={searchParams.pickupDate || ''}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, pickupDate: e.target.value }))}
                            min={new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="return-datetime" className="text-sm font-medium">
                          Return Date & Time (Optional)
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="return-datetime"
                            type="datetime-local"
                            className="pl-10"
                            value={searchParams.returnDate || ''}
                            onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
                            min={searchParams.pickupDate || new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Passengers and Search Button */}
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="space-y-2 flex-1">
                        <Label className="text-sm font-medium">Passengers</Label>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={decrementPassengers}
                            disabled={searchParams.passengers <= 1}
                            className="h-10 w-10"
                          >
                            -
                          </Button>
                          <div className="flex-1 text-center py-2 px-4 border rounded-md bg-background">
                            {searchParams.passengers}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={incrementPassengers}
                            disabled={searchParams.passengers >= 9}
                            className="h-10 w-10"
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={handleSearch}
                        disabled={isSearching}
                        size="lg"
                        className="w-full md:w-auto h-12 px-8 font-semibold"
                      >
                        {isSearching ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Searching...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <SearchCheck className="h-4 w-4" />
                            Search Cars
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Right Column - Enhanced 3D Vehicle Showcase */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          >
            {/* Main car showcase with 3D effects */}
            <motion.div
              className="relative"
              animate={{
                rotateY: [0, 5, -5, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Card className="overflow-hidden shadow-2xl backdrop-blur-md bg-card/90 border-white/10">
                <motion.div
                  className="aspect-[4/3] bg-gradient-to-br from-accent/20 to-accent/60 p-8 flex items-center justify-center relative"
                  animate={{
                    background: [
                      'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.4) 100%)',
                      'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(147, 197, 253, 0.4) 100%)',
                      'linear-gradient(135deg, rgba(147, 197, 253, 0.2) 0%, rgba(59, 130, 246, 0.4) 100%)',
                    ],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {/* Floating car with enhanced 3D effects */}
                  <motion.div
                    className="relative w-full h-full max-w-md mx-auto"
                    animate={{
                      y: [0, -10, 0],
                      rotateX: [0, 5, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Glowing backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent rounded-lg blur-xl" />
                    
                    {/* Main car icon with enhanced styling */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{
                          rotateY: [0, 360],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          rotateY: {
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                          },
                          scale: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          },
                        }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <Car
                          className="h-24 w-24 text-primary drop-shadow-2xl"
                          style={{
                            filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.6))',
                          }}
                        />
                      </motion.div>
                    </div>
                    
                    {/* Info card with glassmorphism */}
                    <motion.div
                      className="absolute bottom-4 left-4 right-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1, duration: 0.8 }}
                    >
                      <div className="bg-card/90 backdrop-blur-md rounded-lg p-3 border border-white/20 shadow-xl">
                        <p className="text-sm font-medium text-card-foreground">
                          Premium Fleet Available
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-muted-foreground">
                            Economy • SUV • Luxury • Electric
                          </p>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Zap className="h-3 w-3 text-yellow-400" />
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </Card>
            </motion.div>

            {/* Enhanced floating badges with 3D effects */}
            <motion.div
              className="absolute -top-4 -right-4 bg-success text-white px-4 py-2 rounded-full text-sm font-medium shadow-2xl backdrop-blur-sm"
              animate={{
                y: [0, -5, 0],
                rotateZ: [0, 2, -2, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                boxShadow: '0 0 20px rgba(16, 163, 74, 0.4)',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
              }}
            >
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                24/7 Support
              </div>
            </motion.div>
            
            <motion.div
              className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-2xl backdrop-blur-sm"
              animate={{
                y: [0, 5, 0],
                rotateZ: [0, -2, 2, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              style={{
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              }}
            >
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Best Prices
              </div>
            </motion.div>

            {/* Additional 3D decorative elements */}
            <motion.div
              className="absolute top-1/2 -right-8 w-4 h-4 bg-purple-500/30 rounded-full backdrop-blur-sm"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
                rotateZ: [0, 360],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            <motion.div
              className="absolute top-1/4 -left-6 w-6 h-6 bg-cyan-500/20 rounded-lg backdrop-blur-sm border border-cyan-500/30"
              animate={{
                rotateX: [0, 360],
                rotateY: [0, 360],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ transformStyle: 'preserve-3d' }}
            />
          </motion.div>
        </div>
      </div>

      {/* Enhanced background decoration with 3D depth */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: [
            'linear-gradient(135deg, rgba(15, 20, 32, 1) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(51, 65, 85, 0.6) 100%)',
            'linear-gradient(135deg, rgba(30, 41, 59, 1) 0%, rgba(51, 65, 85, 0.8) 50%, rgba(15, 20, 32, 0.6) 100%)',
            'linear-gradient(135deg, rgba(15, 20, 32, 1) 0%, rgba(30, 41, 59, 0.8) 50%, rgba(51, 65, 85, 0.6) 100%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </section>
  );
}