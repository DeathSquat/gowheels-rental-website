"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Car, Locate, SearchCheck } from "lucide-react";
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
    <section className="relative bg-background py-16 lg:py-24">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-foreground leading-tight">
                Go Wheels — Affordable Rides, Pure Comfort, Your Journey
              </h1>
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Experience premium car rentals with our wide fleet, transparent pricing, and 24/7 support. 
                  Your comfort is our priority.
                </p>
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-primary" />
                    <span>Wide Fleet Selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SearchCheck className="h-4 w-4 text-primary" />
                    <span>Transparent Pricing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Form */}
            <Card className="p-6 shadow-lg">
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
          </div>

          {/* Right Column - Vehicle Image */}
          <div className="relative">
            <Card className="overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] bg-gradient-to-br from-accent to-accent/60 p-8 flex items-center justify-center">
                <div className="relative w-full h-full max-w-md mx-auto">
                  {/* Car illustration placeholder - in real app this would be a high-quality photo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="h-24 w-24 text-primary/60" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-sm font-medium text-card-foreground">
                        Premium Fleet Available
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Economy • SUV • Luxury • Electric
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Floating feature badges */}
            <div className="absolute -top-4 -right-4 bg-success text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              24/7 Support
            </div>
            <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              Best Prices
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background to-accent/10 -z-10" />
    </section>
  );
}