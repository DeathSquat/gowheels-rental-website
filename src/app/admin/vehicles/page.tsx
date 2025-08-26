"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  Car, Plus, Search, Filter, Download, MoreVertical, 
  Edit, Trash2, Eye, MapPin, Star, Users, Settings, 
  Calendar, CreditCard, CheckCircle2, XCircle, 
  Loader2, Camera, X, ChevronLeft, ChevronRight,
  Activity, TrendingUp, AlertTriangle, Fuel,
  Palette, Gauge, Navigation, ShieldCheck
} from 'lucide-react';

interface Vehicle {
  id: number;
  name: string;
  type: string;
  imageUrl: string;
  galleryImages?: string[];
  seats: number;
  transmission: string;
  fuelType: string;
  doors?: number;
  pricePerHour?: string;
  pricePerDay: string;
  amenities?: string[];
  rating: string;
  reviewCount: number;
  locationAddress: string;
  locationLat?: string;
  locationLng?: string;
  availabilityStatus: boolean;
  cancellationPolicy?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface VehicleFilters {
  search: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  availability: string;
  location: string;
}

interface VehicleFormData {
  name: string;
  type: string;
  imageUrl: string;
  galleryImages: string[];
  seats: number;
  transmission: string;
  fuelType: string;
  doors: number;
  pricePerHour: string;
  pricePerDay: string;
  amenities: string[];
  locationAddress: string;
  locationLat: string;
  locationLng: string;
  availabilityStatus: boolean;
  cancellationPolicy: string;
}

interface VehicleStats {
  total: number;
  active: number;
  inactive: number;
  byType: { [key: string]: number };
  avgRating: number;
  totalReviews: number;
}

const VEHICLE_TYPES = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'truck', label: 'Truck' }
];

const TRANSMISSION_TYPES = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' }
];

const FUEL_TYPES = [
  { value: 'gasoline', label: 'Gasoline' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'electric', label: 'Electric' }
];

const AVAILABLE_AMENITIES = [
  'AC', 'GPS', 'Bluetooth', 'USB Charging', 'Premium Audio',
  'Leather Seats', 'Sunroof', 'Reverse Camera', 'Music System',
  '4WD', 'Alloy Wheels', 'Captain Chairs'
];

const initialFormData: VehicleFormData = {
  name: '',
  type: 'sedan',
  imageUrl: '',
  galleryImages: [],
  seats: 5,
  transmission: 'automatic',
  fuelType: 'gasoline',
  doors: 4,
  pricePerHour: '',
  pricePerDay: '',
  amenities: [],
  locationAddress: '',
  locationLat: '',
  locationLng: '',
  availabilityStatus: true,
  cancellationPolicy: ''
};

export default function VehicleManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stats, setStats] = useState<VehicleStats>({
    total: 0,
    active: 0,
    inactive: 0,
    byType: {},
    avgRating: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters and pagination
  const [filters, setFilters] = useState<VehicleFilters>({
    search: '',
    type: '',
    minPrice: '',
    maxPrice: '',
    availability: '',
    location: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Selection and bulk operations
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Modals and dialogs
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Form and selected items
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [bulkAction, setBulkAction] = useState('');

  // Gallery management
  const [galleryInput, setGalleryInput] = useState('');
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // Fetch vehicles data
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      params.append('limit', itemsPerPage.toString());
      params.append('offset', ((currentPage - 1) * itemsPerPage).toString());
      
      if (filters.search) params.append('search', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.availability) params.append('availabilityStatus', filters.availability);

      const response = await fetch(`/api/vehicles?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      
      const data = await response.json();
      setVehicles(data);
      setTotalItems(data.length);
      
      // Calculate stats
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters]);

  // Calculate vehicle statistics
  const calculateStats = (vehicleData: Vehicle[]) => {
    const total = vehicleData.length;
    const active = vehicleData.filter(v => v.isActive && v.availabilityStatus).length;
    const inactive = total - active;
    
    const byType = vehicleData.reduce((acc, vehicle) => {
      acc[vehicle.type] = (acc[vehicle.type] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const totalRating = vehicleData.reduce((sum, v) => sum + parseFloat(v.rating || '0'), 0);
    const avgRating = total > 0 ? totalRating / total : 0;
    
    const totalReviews = vehicleData.reduce((sum, v) => sum + v.reviewCount, 0);

    setStats({
      total,
      active,
      inactive,
      byType,
      avgRating,
      totalReviews
    });
  };

  // Form validation
  const validateForm = (data: VehicleFormData): { [key: string]: string } => {
    const errors: { [key: string]: string } = {};

    if (!data.name.trim()) errors.name = 'Name is required';
    if (!data.imageUrl.trim()) errors.imageUrl = 'Main image URL is required';
    if (!data.pricePerDay.trim()) errors.pricePerDay = 'Price per day is required';
    if (!data.locationAddress.trim()) errors.locationAddress = 'Location address is required';
    
    if (data.seats < 1 || data.seats > 20) {
      errors.seats = 'Seats must be between 1 and 20';
    }
    
    if (data.doors < 2 || data.doors > 6) {
      errors.doors = 'Doors must be between 2 and 6';
    }

    const pricePerDay = parseFloat(data.pricePerDay);
    if (isNaN(pricePerDay) || pricePerDay <= 0) {
      errors.pricePerDay = 'Price per day must be a positive number';
    }

    if (data.pricePerHour) {
      const pricePerHour = parseFloat(data.pricePerHour);
      if (isNaN(pricePerHour) || pricePerHour <= 0) {
        errors.pricePerHour = 'Price per hour must be a positive number';
      }
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm(formData);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      setActionLoading(true);
      const url = showEditModal ? `/api/vehicles/${selectedVehicle?.id}` : '/api/vehicles';
      const method = showEditModal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save vehicle');
      }

      toast.success(showEditModal ? 'Vehicle updated successfully' : 'Vehicle created successfully');
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      fetchVehicles();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save vehicle');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle vehicle deletion
  const handleDelete = async () => {
    if (!selectedVehicle) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/vehicles/${selectedVehicle.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete vehicle');
      }

      toast.success('Vehicle deleted successfully');
      setShowDeleteDialog(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete vehicle');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle bulk operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedVehicles.length === 0) return;

    try {
      setActionLoading(true);
      const promises = selectedVehicles.map(async (vehicleId) => {
        let updateData = {};
        
        switch (bulkAction) {
          case 'activate':
            updateData = { availabilityStatus: true, isActive: true };
            break;
          case 'deactivate':
            updateData = { availabilityStatus: false };
            break;
          case 'delete':
            return fetch(`/api/vehicles/${vehicleId}`, { method: 'DELETE' });
        }

        return fetch(`/api/vehicles/${vehicleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        });
      });

      await Promise.all(promises);
      
      toast.success(`${selectedVehicles.length} vehicles ${bulkAction}d successfully`);
      setShowBulkDialog(false);
      setSelectedVehicles([]);
      setSelectAll(false);
      setBulkAction('');
      fetchVehicles();
    } catch (error) {
      console.error('Error in bulk action:', error);
      toast.error('Failed to perform bulk action');
    } finally {
      setActionLoading(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Type', 'Seats', 'Transmission', 'Fuel Type', 'Price/Day', 'Rating', 'Location', 'Status'];
    const csvData = vehicles.map(vehicle => [
      vehicle.id,
      vehicle.name,
      vehicle.type,
      vehicle.seats,
      vehicle.transmission,
      vehicle.fuelType,
      vehicle.pricePerDay,
      vehicle.rating,
      vehicle.locationAddress,
      vehicle.availabilityStatus ? 'Available' : 'Unavailable'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vehicles_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setSelectedVehicle(null);
    setGalleryInput('');
    setCurrentGalleryIndex(0);
  };

  // Handle selection
  const handleSelectVehicle = (vehicleId: number, checked: boolean) => {
    if (checked) {
      setSelectedVehicles([...selectedVehicles, vehicleId]);
    } else {
      setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedVehicles(vehicles.map(v => v.id));
    } else {
      setSelectedVehicles([]);
    }
  };

  // Gallery management functions
  const addGalleryImage = () => {
    if (galleryInput.trim()) {
      setFormData(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, galleryInput.trim()]
      }));
      setGalleryInput('');
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  // Load data on mount and filter changes
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Update select all state
  useEffect(() => {
    setSelectAll(selectedVehicles.length === vehicles.length && vehicles.length > 0);
  }, [selectedVehicles, vehicles]);

  const getStatusBadge = (vehicle: Vehicle) => {
    if (!vehicle.isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (vehicle.availabilityStatus) {
      return <Badge variant="default" className="bg-green-500">Available</Badge>;
    }
    return <Badge variant="secondary">Unavailable</Badge>;
  };

  const formatPrice = (price: string) => {
    return `₹${parseFloat(price).toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vehicle Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your vehicle fleet, pricing, and availability
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active, {stats.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Now</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              Ready for booking
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              From {stats.totalReviews} reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Vehicles available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search vehicles..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              {selectedVehicles.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setShowBulkDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Bulk Actions ({selectedVehicles.length})
                </Button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          {showFiltersPanel && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 pt-4 border-t">
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {VEHICLE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Min Price"
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
              />

              <Input
                placeholder="Max Price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
              />

              <Select
                value={filters.availability}
                onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Available</SelectItem>
                  <SelectItem value="false">Unavailable</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles ({vehicles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading vehicles...</span>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No vehicles found
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedVehicles.includes(vehicle.id)}
                          onCheckedChange={(checked) => 
                            handleSelectVehicle(vehicle.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={vehicle.imageUrl}
                            alt={vehicle.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium">{vehicle.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {vehicle.transmission} • {vehicle.fuelType}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {VEHICLE_TYPES.find(t => t.value === vehicle.type)?.label || vehicle.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="w-4 h-4" />
                          {vehicle.seats} seats
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{formatPrice(vehicle.pricePerDay)}/day</div>
                          {vehicle.pricePerHour && (
                            <div className="text-muted-foreground">
                              {formatPrice(vehicle.pricePerHour)}/hour
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">
                            {vehicle.rating} ({vehicle.reviewCount})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="truncate max-w-[120px]">
                            {vehicle.locationAddress}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(vehicle)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowViewModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setFormData({
                                name: vehicle.name,
                                type: vehicle.type,
                                imageUrl: vehicle.imageUrl,
                                galleryImages: vehicle.galleryImages || [],
                                seats: vehicle.seats,
                                transmission: vehicle.transmission,
                                fuelType: vehicle.fuelType,
                                doors: vehicle.doors || 4,
                                pricePerHour: vehicle.pricePerHour || '',
                                pricePerDay: vehicle.pricePerDay,
                                amenities: vehicle.amenities || [],
                                locationAddress: vehicle.locationAddress,
                                locationLat: vehicle.locationLat || '',
                                locationLng: vehicle.locationLng || '',
                                availabilityStatus: vehicle.availabilityStatus,
                                cancellationPolicy: vehicle.cancellationPolicy || ''
                              });
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Rows per page:</span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => setItemsPerPage(parseInt(value))}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {Math.ceil(totalItems / itemsPerPage) || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Vehicle Modal */}
      <Dialog open={showAddModal || showEditModal} onOpenChange={(open) => {
        if (!open) {
          setShowAddModal(false);
          setShowEditModal(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showEditModal ? 'Edit Vehicle' : 'Add New Vehicle'}
            </DialogTitle>
            <DialogDescription>
              {showEditModal ? 'Update vehicle information' : 'Add a new vehicle to your fleet'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Vehicle Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Honda City"
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="type">Vehicle Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="seats">Seats *</Label>
                  <Input
                    id="seats"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.seats}
                    onChange={(e) => setFormData(prev => ({ ...prev, seats: parseInt(e.target.value) || 0 }))}
                  />
                  {formErrors.seats && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.seats}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="doors">Doors</Label>
                  <Input
                    id="doors"
                    type="number"
                    min="2"
                    max="6"
                    value={formData.doors}
                    onChange={(e) => setFormData(prev => ({ ...prev, doors: parseInt(e.target.value) || 0 }))}
                  />
                  {formErrors.doors && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.doors}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="transmission">Transmission *</Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSMISSION_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fuelType">Fuel Type *</Label>
                  <Select
                    value={formData.fuelType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, fuelType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricePerDay">Price per Day (₹) *</Label>
                  <Input
                    id="pricePerDay"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerDay: e.target.value }))}
                    placeholder="2500"
                  />
                  {formErrors.pricePerDay && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.pricePerDay}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pricePerHour">Price per Hour (₹)</Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerHour}
                    onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
                    placeholder="350"
                  />
                  {formErrors.pricePerHour && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.pricePerHour}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Images</h3>
              
              <div>
                <Label htmlFor="imageUrl">Main Image URL *</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/car-image.jpg"
                />
                {formErrors.imageUrl && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.imageUrl}</p>
                )}
              </div>

              <div>
                <Label>Gallery Images</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={galleryInput}
                      onChange={(e) => setGalleryInput(e.target.value)}
                      placeholder="Image URL"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={addGalleryImage}
                      disabled={!galleryInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {formData.galleryImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {formData.galleryImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Gallery ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {AVAILABLE_AMENITIES.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            amenities: [...prev.amenities, amenity]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            amenities: prev.amenities.filter(a => a !== amenity)
                          }));
                        }
                      }}
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location</h3>
              <div>
                <Label htmlFor="locationAddress">Address *</Label>
                <Textarea
                  id="locationAddress"
                  value={formData.locationAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, locationAddress: e.target.value }))}
                  placeholder="Complete address with city, state, pincode"
                  rows={2}
                />
                {formErrors.locationAddress && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.locationAddress}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="locationLat">Latitude</Label>
                  <Input
                    id="locationLat"
                    type="number"
                    step="any"
                    value={formData.locationLat}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationLat: e.target.value }))}
                    placeholder="19.0760"
                  />
                </div>

                <div>
                  <Label htmlFor="locationLng">Longitude</Label>
                  <Input
                    id="locationLng"
                    type="number"
                    step="any"
                    value={formData.locationLng}
                    onChange={(e) => setFormData(prev => ({ ...prev, locationLng: e.target.value }))}
                    placeholder="72.8777"
                  />
                </div>
              </div>
            </div>

            {/* Policies and Availability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Policies & Availability</h3>
              
              <div>
                <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                <Textarea
                  id="cancellationPolicy"
                  value={formData.cancellationPolicy}
                  onChange={(e) => setFormData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
                  placeholder="Free cancellation up to 24 hours before pickup"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="availabilityStatus"
                  checked={formData.availabilityStatus}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, availabilityStatus: checked as boolean }))
                  }
                />
                <Label htmlFor="availabilityStatus">Available for booking</Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {showEditModal ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Vehicle Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedVehicle && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  {selectedVehicle.name}
                </DialogTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedVehicle)}
                  <Badge variant="outline">
                    {VEHICLE_TYPES.find(t => t.value === selectedVehicle.type)?.label}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Image Gallery */}
                <div className="space-y-2">
                  <img
                    src={selectedVehicle.galleryImages?.[currentGalleryIndex] || selectedVehicle.imageUrl}
                    alt={selectedVehicle.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  
                  {selectedVehicle.galleryImages && selectedVehicle.galleryImages.length > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentGalleryIndex(prev => 
                          prev === 0 ? selectedVehicle.galleryImages!.length - 1 : prev - 1
                        )}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {currentGalleryIndex + 1} / {selectedVehicle.galleryImages.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentGalleryIndex(prev => 
                          prev === selectedVehicle.galleryImages!.length - 1 ? 0 : prev + 1
                        )}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Vehicle Specifications</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedVehicle.seats} Seats</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedVehicle.transmission}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Fuel className="w-4 h-4 text-muted-foreground" />
                          <span>{selectedVehicle.fuelType}</span>
                        </div>
                        {selectedVehicle.doors && (
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <span>{selectedVehicle.doors} Doors</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Rating & Reviews</h3>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{selectedVehicle.rating}</span>
                        <span className="text-muted-foreground">
                          ({selectedVehicle.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Pricing</h3>
                      <div className="space-y-1">
                        <div className="text-2xl font-bold">
                          {formatPrice(selectedVehicle.pricePerDay)}/day
                        </div>
                        {selectedVehicle.pricePerHour && (
                          <div className="text-muted-foreground">
                            {formatPrice(selectedVehicle.pricePerHour)}/hour
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Location</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{selectedVehicle.locationAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                {selectedVehicle.amenities && selectedVehicle.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVehicle.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cancellation Policy */}
                {selectedVehicle.cancellationPolicy && (
                  <div>
                    <h3 className="font-semibold mb-2">Cancellation Policy</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedVehicle.cancellationPolicy}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Created:</span>{' '}
                      {new Date(selectedVehicle.createdAt).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>{' '}
                      {new Date(selectedVehicle.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Vehicle
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedVehicle?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Actions</DialogTitle>
            <DialogDescription>
              Select an action to apply to {selectedVehicles.length} selected vehicles
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Action</Label>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Activate Vehicles
                    </div>
                  </SelectItem>
                  <SelectItem value="deactivate">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-yellow-500" />
                      Deactivate Vehicles
                    </div>
                  </SelectItem>
                  <SelectItem value="delete">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-red-500" />
                      Delete Vehicles
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bulkAction === 'delete' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Warning</span>
                </div>
                <p className="text-red-700 text-sm">
                  This will permanently delete all selected vehicles. This action cannot be undone.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBulkAction}
              disabled={!bulkAction || actionLoading}
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
            >
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Apply to {selectedVehicles.length} vehicles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}