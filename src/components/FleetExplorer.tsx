"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Map, 
  Grid3x2, 
  ListFilter, 
  ChevronUp, 
  ChevronsUpDown,
  Car,
  MapPin,
  CarFront
} from 'lucide-react';

interface Car {
  id: string;
  name: string;
  type: string;
  image: string;
  gallery?: string[];
  specs: {
    seats: number;
    transmission: 'automatic' | 'manual';
    fuelType: string;
    doors: number;
  };
  pricing: {
    perHour: number;
    perDay: number;
  };
  amenities: string[];
  rating: number;
  reviewCount: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  availability: boolean;
  cancellationPolicy: string;
  insuranceOptions: Array<{
    type: string;
    price: number;
    description: string;
  }>;
}

interface FilterState {
  vehicleTypes: string[];
  seating: number[];
  transmission: string[];
  fuelType: string[];
  priceRange: [number, number];
  amenities: string[];
}

const MOCK_CARS: Car[] = [
  {
    id: '1',
    name: 'Toyota Camry 2024',
    type: 'sedan',
    image: '/api/placeholder/400/300',
    gallery: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
    specs: {
      seats: 5,
      transmission: 'automatic',
      fuelType: 'gasoline',
      doors: 4
    },
    pricing: {
      perHour: 15,
      perDay: 89
    },
    amenities: ['AC', 'GPS', 'Bluetooth'],
    rating: 4.8,
    reviewCount: 124,
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: 'Downtown San Francisco'
    },
    availability: true,
    cancellationPolicy: 'Free cancellation up to 24 hours before pickup',
    insuranceOptions: [
      { type: 'Basic', price: 0, description: 'Included coverage' },
      { type: 'Premium', price: 25, description: 'Enhanced protection' }
    ]
  },
  {
    id: '2',
    name: 'Honda CR-V 2024',
    type: 'suv',
    image: '/api/placeholder/400/300',
    gallery: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
    specs: {
      seats: 7,
      transmission: 'automatic',
      fuelType: 'hybrid',
      doors: 4
    },
    pricing: {
      perHour: 18,
      perDay: 109
    },
    amenities: ['AC', 'GPS', 'Child Seat', 'Bluetooth'],
    rating: 4.6,
    reviewCount: 89,
    location: {
      lat: 37.7849,
      lng: -122.4094,
      address: 'Mission District'
    },
    availability: true,
    cancellationPolicy: 'Free cancellation up to 24 hours before pickup',
    insuranceOptions: [
      { type: 'Basic', price: 0, description: 'Included coverage' },
      { type: 'Premium', price: 30, description: 'Enhanced protection' }
    ]
  }
];

const VEHICLE_TYPES = ['sedan', 'suv', 'hatchback', 'convertible', 'truck'];
const SEATING_OPTIONS = [2, 4, 5, 7, 8];
const TRANSMISSION_OPTIONS = ['automatic', 'manual'];
const FUEL_TYPES = ['gasoline', 'hybrid', 'electric', 'diesel'];
const AMENITY_OPTIONS = ['AC', 'GPS', 'Bluetooth', 'Child Seat', 'Heated Seats', 'Sunroof'];

export default function FleetExplorer() {
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [cars, setCars] = useState<Car[]>(MOCK_CARS);
  const [filteredCars, setFilteredCars] = useState<Car[]>(MOCK_CARS);
  const [loading, setLoading] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuickBook, setShowQuickBook] = useState(false);
  const [hoveredCarId, setHoveredCarId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [filters, setFilters] = useState<FilterState>({
    vehicleTypes: [],
    seating: [],
    transmission: [],
    fuelType: [],
    priceRange: [0, 200],
    amenities: []
  });

  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Simulate data fetching
  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCars(MOCK_CARS);
        setFilteredCars(MOCK_CARS);
      } catch (error) {
        toast.error('Failed to load cars. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Filter and sort cars
  const processedCars = useMemo(() => {
    let result = [...cars];

    // Apply filters
    if (filters.vehicleTypes.length > 0) {
      result = result.filter(car => filters.vehicleTypes.includes(car.type));
    }
    if (filters.seating.length > 0) {
      result = result.filter(car => filters.seating.includes(car.specs.seats));
    }
    if (filters.transmission.length > 0) {
      result = result.filter(car => filters.transmission.includes(car.specs.transmission));
    }
    if (filters.fuelType.length > 0) {
      result = result.filter(car => filters.fuelType.includes(car.specs.fuelType));
    }
    if (filters.amenities.length > 0) {
      result = result.filter(car => 
        filters.amenities.every(amenity => car.amenities.includes(amenity))
      );
    }
    result = result.filter(car => 
      car.pricing.perDay >= filters.priceRange[0] && 
      car.pricing.perDay <= filters.priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'price':
        result.sort((a, b) => a.pricing.perDay - b.pricing.perDay);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Mock newest sorting
        break;
      default: // popularity
        result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [cars, filters, sortBy]);

  // Update active filters for display
  useEffect(() => {
    const active: string[] = [];
    if (filters.vehicleTypes.length > 0) active.push(`${filters.vehicleTypes.length} vehicle type${filters.vehicleTypes.length > 1 ? 's' : ''}`);
    if (filters.seating.length > 0) active.push(`${filters.seating.length} seating option${filters.seating.length > 1 ? 's' : ''}`);
    if (filters.transmission.length > 0) active.push(`${filters.transmission.length} transmission${filters.transmission.length > 1 ? 's' : ''}`);
    if (filters.fuelType.length > 0) active.push(`${filters.fuelType.length} fuel type${filters.fuelType.length > 1 ? 's' : ''}`);
    if (filters.amenities.length > 0) active.push(`${filters.amenities.length} amenity${filters.amenities.length > 1 ? 'ies' : 'y'}`);
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 200) {
      active.push(`$${filters.priceRange[0]}-$${filters.priceRange[1]}/day`);
    }
    setActiveFilters(active);
  }, [filters]);

  const clearFilter = useCallback((filterType: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: filterType === 'priceRange' ? [0, 200] : []
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      vehicleTypes: [],
      seating: [],
      transmission: [],
      fuelType: [],
      priceRange: [0, 200],
      amenities: []
    });
  }, []);

  const handleCarClick = useCallback((car: Car) => {
    setSelectedCar(car);
    setShowDetailModal(true);
  }, []);

  const handleQuickBook = useCallback((car: Car) => {
    setSelectedCar(car);
    setShowQuickBook(true);
  }, []);

  const handleBookingSubmit = useCallback(async () => {
    if (!selectedCar) return;
    
    try {
      // Simulate booking API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Booking hold created successfully!');
      setShowQuickBook(false);
    } catch (error) {
      toast.error('Failed to create booking hold. Please try again.');
    }
  }, [selectedCar]);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Vehicle Type</h3>
        <div className="space-y-2">
          {VEHICLE_TYPES.map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={filters.vehicleTypes.includes(type)}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({
                    ...prev,
                    vehicleTypes: checked 
                      ? [...prev.vehicleTypes, type]
                      : prev.vehicleTypes.filter(t => t !== type)
                  }));
                }}
              />
              <label htmlFor={`type-${type}`} className="text-sm capitalize cursor-pointer">
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Seating</h3>
        <div className="space-y-2">
          {SEATING_OPTIONS.map(seats => (
            <div key={seats} className="flex items-center space-x-2">
              <Checkbox
                id={`seats-${seats}`}
                checked={filters.seating.includes(seats)}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({
                    ...prev,
                    seating: checked 
                      ? [...prev.seating, seats]
                      : prev.seating.filter(s => s !== seats)
                  }));
                }}
              />
              <label htmlFor={`seats-${seats}`} className="text-sm cursor-pointer">
                {seats} seats
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Transmission</h3>
        <div className="space-y-2">
          {TRANSMISSION_OPTIONS.map(trans => (
            <div key={trans} className="flex items-center space-x-2">
              <Checkbox
                id={`trans-${trans}`}
                checked={filters.transmission.includes(trans)}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({
                    ...prev,
                    transmission: checked 
                      ? [...prev.transmission, trans]
                      : prev.transmission.filter(t => t !== trans)
                  }));
                }}
              />
              <label htmlFor={`trans-${trans}`} className="text-sm capitalize cursor-pointer">
                {trans}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Fuel Type</h3>
        <div className="space-y-2">
          {FUEL_TYPES.map(fuel => (
            <div key={fuel} className="flex items-center space-x-2">
              <Checkbox
                id={`fuel-${fuel}`}
                checked={filters.fuelType.includes(fuel)}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({
                    ...prev,
                    fuelType: checked 
                      ? [...prev.fuelType, fuel]
                      : prev.fuelType.filter(f => f !== fuel)
                  }));
                }}
              />
              <label htmlFor={`fuel-${fuel}`} className="text-sm capitalize cursor-pointer">
                {fuel}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Price Range (per day)</h3>
        <div className="px-2">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
            max={200}
            step={10}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${filters.priceRange[0]}</span>
            <span>${filters.priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Amenities</h3>
        <div className="space-y-2">
          {AMENITY_OPTIONS.map(amenity => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${amenity}`}
                checked={filters.amenities.includes(amenity)}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({
                    ...prev,
                    amenities: checked 
                      ? [...prev.amenities, amenity]
                      : prev.amenities.filter(a => a !== amenity)
                  }));
                }}
              />
              <label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                {amenity}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const CarCard = ({ car }: { car: Car }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        hoveredCarId === car.id ? 'ring-2 ring-primary' : ''
      }`}
      onMouseEnter={() => setHoveredCarId(car.id)}
      onMouseLeave={() => setHoveredCarId(null)}
    >
      <CardHeader className="p-0">
        <div className="relative">
          <img 
            src={car.image} 
            alt={car.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <Badge className="absolute top-2 right-2 bg-card text-card-foreground">
            ${car.pricing.perDay}/day
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">{car.name}</h3>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-yellow-500">★</span>
            <span>{car.rating}</span>
            <span className="text-muted-foreground">({car.reviewCount})</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span>{car.specs.seats} seats</span>
          <span className="capitalize">{car.specs.transmission}</span>
          <span className="capitalize">{car.specs.fuelType}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {car.amenities.slice(0, 3).map(amenity => (
            <Badge key={amenity} variant="secondary" className="text-xs">
              {amenity}
            </Badge>
          ))}
          {car.amenities.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{car.amenities.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCarClick(car)}
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            size="sm"
            onClick={() => handleQuickBook(car)}
            className="flex-1"
          >
            Quick Book
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top Toolbar */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Active Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {activeFilters.length > 0 && (
                <>
                  {activeFilters.map((filter, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => {
                        if (filter.includes('vehicle type')) clearFilter('vehicleTypes');
                        else if (filter.includes('seating')) clearFilter('seating');
                        else if (filter.includes('transmission')) clearFilter('transmission');
                        else if (filter.includes('fuel type')) clearFilter('fuelType');
                        else if (filter.includes('amenity')) clearFilter('amenities');
                        else if (filter.includes('$')) clearFilter('priceRange');
                      }}
                    >
                      {filter} ×
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground"
                  >
                    Clear all
                  </Button>
                </>
              )}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ListFilter className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSidebar />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {processedCars.length} car{processedCars.length !== 1 ? 's' : ''} found
              </span>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x2 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`container mx-auto px-4 py-6 ${
        viewMode === 'map' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''
      }`}>
        {/* Car Grid */}
        <div className={viewMode === 'map' ? 'lg:order-1' : ''}>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-muted rounded flex-1"></div>
                      <div className="h-8 bg-muted rounded flex-1"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedCars.map(car => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        {viewMode === 'map' && (
          <div className="lg:order-2">
            <Card className="h-[600px] flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Map integration would go here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Google Maps with car markers and clustering
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Car Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedCar && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCar.name}</DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={selectedCar.image} 
                    alt={selectedCar.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Specifications</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <span>Seats: {selectedCar.specs.seats}</span>
                        <span>Doors: {selectedCar.specs.doors}</span>
                        <span className="capitalize">Transmission: {selectedCar.specs.transmission}</span>
                        <span className="capitalize">Fuel: {selectedCar.specs.fuelType}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedCar.amenities.map(amenity => (
                          <Badge key={amenity} variant="secondary">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Location</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedCar.location.address}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Pricing</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span>Per Hour</span>
                        <span className="font-semibold">${selectedCar.pricing.perHour}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Per Day</span>
                        <span className="font-semibold">${selectedCar.pricing.perDay}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Insurance Options</h4>
                    <div className="space-y-2">
                      {selectedCar.insuranceOptions.map(option => (
                        <div key={option.type} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{option.type}</span>
                            <span>${option.price}/day</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Cancellation Policy</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedCar.cancellationPolicy}
                    </p>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleQuickBook(selectedCar);
                    }}
                  >
                    Book This Car
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Book Sheet */}
      <Sheet open={showQuickBook} onOpenChange={setShowQuickBook}>
        <SheetContent side="right" className="w-96">
          {selectedCar && (
            <>
              <SheetHeader>
                <SheetTitle>Quick Book</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <img 
                    src={selectedCar.image} 
                    alt={selectedCar.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-semibold">{selectedCar.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${selectedCar.pricing.perDay}/day
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Pickup Date
                    </label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      disabled={(date) => date < new Date()}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Pickup Time
                      </label>
                      <Select defaultValue="10:00">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="09:00">9:00 AM</SelectItem>
                          <SelectItem value="10:00">10:00 AM</SelectItem>
                          <SelectItem value="11:00">11:00 AM</SelectItem>
                          <SelectItem value="12:00">12:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Duration
                      </label>
                      <Select defaultValue="1">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Day</SelectItem>
                          <SelectItem value="2">2 Days</SelectItem>
                          <SelectItem value="3">3 Days</SelectItem>
                          <SelectItem value="7">1 Week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Car rental (1 day)</span>
                      <span>${selectedCar.pricing.perDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & fees</span>
                      <span>$12</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${selectedCar.pricing.perDay + 12}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={handleBookingSubmit}
                  >
                    Create Booking Hold
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}