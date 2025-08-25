"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CreditCard, 
  Wallet, 
  Receipt, 
  TicketCheck, 
  PanelRight,
  WalletMinimal 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface BookingWidgetProps {
  selectedCar?: {
    id: string;
    name: string;
    image: string;
    pricePerDay: number;
    category: string;
  };
  initialDates?: {
    pickupDate: Date;
    returnDate: Date;
  };
  className?: string;
}

interface BookingFormData {
  pickupAddress: string;
  dropoffAddress: string;
  driverName: string;
  driverPhone: string;
  driverEmail: string;
  promoCode: string;
  extras: {
    insurance: boolean;
    driver: boolean;
    childSeat: boolean;
  };
  paymentMethod: 'full' | 'deposit';
}

interface PriceBreakdown {
  basePrice: number;
  extraInsurance: number;
  extraDriver: number;
  childSeat: number;
  subtotal: number;
  taxes: number;
  deposit: number;
  total: number;
}

export default function BookingWidget({ 
  selectedCar,
  initialDates,
  className 
}: BookingWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [pickupDate, setPickupDate] = useState<Date | undefined>(initialDates?.pickupDate);
  const [returnDate, setReturnDate] = useState<Date | undefined>(initialDates?.returnDate);
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnTime, setReturnTime] = useState('18:00');

  const [formData, setFormData] = useState<BookingFormData>({
    pickupAddress: '',
    dropoffAddress: '',
    driverName: '',
    driverPhone: '',
    driverEmail: '',
    promoCode: '',
    extras: {
      insurance: false,
      driver: false,
      childSeat: false
    },
    paymentMethod: 'full'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate price breakdown
  const calculatePrice = useCallback((): PriceBreakdown => {
    if (!selectedCar || !pickupDate || !returnDate) {
      return {
        basePrice: 0,
        extraInsurance: 0,
        extraDriver: 0,
        childSeat: 0,
        subtotal: 0,
        taxes: 0,
        deposit: 0,
        total: 0
      };
    }

    const days = Math.ceil((returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = selectedCar.pricePerDay * days;
    const extraInsurance = formData.extras.insurance ? 500 * days : 0;
    const extraDriver = formData.extras.driver ? 300 * days : 0;
    const childSeat = formData.extras.childSeat ? 100 * days : 0;
    const subtotal = basePrice + extraInsurance + extraDriver + childSeat;
    const taxes = subtotal * 0.18; // 18% GST
    const total = subtotal + taxes;
    const deposit = total * 0.3; // 30% deposit

    return {
      basePrice,
      extraInsurance,
      extraDriver,
      childSeat,
      subtotal,
      taxes,
      deposit,
      total
    };
  }, [selectedCar, pickupDate, returnDate, formData.extras]);

  const priceBreakdown = calculatePrice();

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!pickupDate) newErrors.pickupDate = 'Pickup date is required';
    if (!returnDate) newErrors.returnDate = 'Return date is required';
    if (!formData.pickupAddress.trim()) newErrors.pickupAddress = 'Pickup address is required';
    if (!formData.dropoffAddress.trim()) newErrors.dropoffAddress = 'Dropoff address is required';
    if (!formData.driverName.trim()) newErrors.driverName = 'Driver name is required';
    if (!formData.driverPhone.trim()) newErrors.driverPhone = 'Driver phone is required';
    if (!formData.driverEmail.trim()) newErrors.driverEmail = 'Driver email is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.driverEmail && !emailRegex.test(formData.driverEmail)) {
      newErrors.driverEmail = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.driverPhone && !phoneRegex.test(formData.driverPhone)) {
      newErrors.driverPhone = 'Please enter a valid 10-digit phone number';
    }

    // Date validation
    if (pickupDate && returnDate && pickupDate >= returnDate) {
      newErrors.returnDate = 'Return date must be after pickup date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [pickupDate, returnDate, formData]);

  // Handle form updates
  const updateFormData = useCallback((updates: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const updateExtras = useCallback((extra: keyof BookingFormData['extras'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      extras: { ...prev.extras, [extra]: value }
    }));
  }, []);

  // Payment processing
  const processPayment = useCallback(async (amount: number) => {
    setIsLoading(true);
    try {
      // Simulate Razorpay integration
      toast.info('Redirecting to secure payment...');
      
      // In real implementation, this would create a Razorpay order
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate payment success
      const newBookingId = `BK${Date.now()}`;
      setBookingId(newBookingId);
      
      // Send notifications
      toast.promise(
        new Promise(resolve => setTimeout(resolve, 1000)),
        {
          loading: 'Sending confirmation notifications...',
          success: 'SMS and email confirmations sent!',
          error: 'Notifications failed - booking confirmed'
        }
      );

      setShowConfirmation(true);
      toast.success('Booking confirmed successfully!');
      
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle booking submission
  const handleBooking = useCallback(async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before proceeding');
      return;
    }

    const amount = formData.paymentMethod === 'full' ? priceBreakdown.total : priceBreakdown.deposit;
    await processPayment(amount);
  }, [validateForm, formData.paymentMethod, priceBreakdown.total, priceBreakdown.deposit, processPayment]);

  // Collapsed view
  if (!isExpanded && !showConfirmation) {
    return (
      <Card className={cn("sticky top-4 w-full max-w-sm", className)}>
        <CardContent className="p-4">
          {selectedCar && (
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={selectedCar.image} 
                alt={selectedCar.name}
                className="w-16 h-12 object-cover rounded-md"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">{selectedCar.name}</h4>
                <p className="text-xs text-muted-foreground">{selectedCar.category}</p>
              </div>
            </div>
          )}
          
          {pickupDate && returnDate && (
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pickup:</span>
                <span>{format(pickupDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Return:</span>
                <span>{format(returnDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>₹{priceBreakdown.total.toLocaleString()}</span>
              </div>
            </div>
          )}
          
          <Button 
            onClick={() => setIsExpanded(true)}
            className="w-full"
            size="sm"
          >
            <PanelRight className="w-4 h-4 mr-2" />
            Open Booking
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Confirmation view
  if (showConfirmation) {
    return (
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <TicketCheck className="w-6 h-6" />
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your booking has been successfully created and payment processed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Booking ID:</span>
                <Badge variant="secondary" className="font-mono">{bookingId}</Badge>
              </div>
              {selectedCar && (
                <div className="flex items-center gap-3">
                  <img 
                    src={selectedCar.image} 
                    alt={selectedCar.name}
                    className="w-20 h-16 object-cover rounded-md"
                  />
                  <div>
                    <h4 className="font-semibold">{selectedCar.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedCar.category}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold mb-2">Trip Details</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Pickup:</span>
                    <span>{pickupDate && format(pickupDate, 'MMM d, yyyy')} at {pickupTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return:</span>
                    <span>{returnDate && format(returnDate, 'MMM d, yyyy')} at {returnTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>From:</span>
                    <span className="text-right max-w-32 truncate">{formData.pickupAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>To:</span>
                    <span className="text-right max-w-32 truncate">{formData.dropoffAddress}</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold mb-2">Payment Summary</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span>₹{(formData.paymentMethod === 'full' ? priceBreakdown.total : priceBreakdown.deposit).toLocaleString()}</span>
                  </div>
                  {formData.paymentMethod === 'deposit' && (
                    <div className="flex justify-between text-orange-600">
                      <span>Remaining:</span>
                      <span>₹{(priceBreakdown.total - priceBreakdown.deposit).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-1 border-t">
                    <span>Total Trip Cost:</span>
                    <span>₹{priceBreakdown.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                <Receipt className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button 
                onClick={() => {
                  setShowConfirmation(false);
                  setIsExpanded(false);
                }}
                className="flex-1"
              >
                Continue Browsing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Expanded booking form
  return (
    <Card className={cn("sticky top-4 w-full max-w-md", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Complete Booking</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Car Summary */}
        {selectedCar && (
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <img 
                src={selectedCar.image} 
                alt={selectedCar.name}
                className="w-16 h-12 object-cover rounded-md"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{selectedCar.name}</h4>
                <p className="text-xs text-muted-foreground">{selectedCar.category}</p>
                <p className="text-sm font-semibold">₹{selectedCar.pricePerDay}/day</p>
              </div>
            </div>
          </div>
        )}

        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Pickup Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  {pickupDate ? format(pickupDate, 'MMM d, yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={pickupDate}
                  onSelect={setPickupDate}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            {errors.pickupDate && <p className="text-xs text-destructive">{errors.pickupDate}</p>}
          </div>

          <div className="space-y-2">
            <Label>Return Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left">
                  {returnDate ? format(returnDate, 'MMM d, yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  disabled={(date) => date <= (pickupDate || new Date())}
                />
              </PopoverContent>
            </Popover>
            {errors.returnDate && <p className="text-xs text-destructive">{errors.returnDate}</p>}
          </div>
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Pickup Time</Label>
            <Select value={pickupTime} onValueChange={setPickupTime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({length: 24}, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return (
                    <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                      {hour}:00
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Return Time</Label>
            <Select value={returnTime} onValueChange={setReturnTime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({length: 24}, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return (
                    <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                      {hour}:00
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pickup-address">Pickup Address *</Label>
            <Textarea
              id="pickup-address"
              placeholder="Enter complete pickup address"
              value={formData.pickupAddress}
              onChange={(e) => updateFormData({ pickupAddress: e.target.value })}
              className="min-h-[60px]"
            />
            {errors.pickupAddress && <p className="text-xs text-destructive">{errors.pickupAddress}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dropoff-address">Dropoff Address *</Label>
            <Textarea
              id="dropoff-address"
              placeholder="Enter complete dropoff address"
              value={formData.dropoffAddress}
              onChange={(e) => updateFormData({ dropoffAddress: e.target.value })}
              className="min-h-[60px]"
            />
            {errors.dropoffAddress && <p className="text-xs text-destructive">{errors.dropoffAddress}</p>}
          </div>
        </div>

        {/* Driver Information */}
        <div className="space-y-4">
          <h5 className="font-semibold">Driver Information</h5>
          
          <div className="space-y-2">
            <Label htmlFor="driver-name">Full Name *</Label>
            <Input
              id="driver-name"
              placeholder="Enter driver's full name"
              value={formData.driverName}
              onChange={(e) => updateFormData({ driverName: e.target.value })}
            />
            {errors.driverName && <p className="text-xs text-destructive">{errors.driverName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver-phone">Phone Number *</Label>
            <Input
              id="driver-phone"
              placeholder="10-digit phone number"
              value={formData.driverPhone}
              onChange={(e) => updateFormData({ driverPhone: e.target.value })}
            />
            {errors.driverPhone && <p className="text-xs text-destructive">{errors.driverPhone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver-email">Email Address *</Label>
            <Input
              id="driver-email"
              type="email"
              placeholder="Enter email address"
              value={formData.driverEmail}
              onChange={(e) => updateFormData({ driverEmail: e.target.value })}
            />
            {errors.driverEmail && <p className="text-xs text-destructive">{errors.driverEmail}</p>}
          </div>
        </div>

        {/* Extras */}
        <div className="space-y-4">
          <h5 className="font-semibold">Optional Extras</h5>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insurance"
                  checked={formData.extras.insurance}
                  onCheckedChange={(checked) => updateExtras('insurance', Boolean(checked))}
                />
                <Label htmlFor="insurance" className="text-sm">Additional Insurance</Label>
              </div>
              <span className="text-sm font-medium">₹500/day</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="driver"
                  checked={formData.extras.driver}
                  onCheckedChange={(checked) => updateExtras('driver', Boolean(checked))}
                />
                <Label htmlFor="driver" className="text-sm">Additional Driver</Label>
              </div>
              <span className="text-sm font-medium">₹300/day</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="child-seat"
                  checked={formData.extras.childSeat}
                  onCheckedChange={(checked) => updateExtras('childSeat', Boolean(checked))}
                />
                <Label htmlFor="child-seat" className="text-sm">Child Safety Seat</Label>
              </div>
              <span className="text-sm font-medium">₹100/day</span>
            </div>
          </div>
        </div>

        {/* Promo Code */}
        <div className="space-y-2">
          <Label htmlFor="promo-code">Promo Code</Label>
          <Input
            id="promo-code"
            placeholder="Enter promo code"
            value={formData.promoCode}
            onChange={(e) => updateFormData({ promoCode: e.target.value })}
          />
        </div>

        {/* Price Breakdown */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h5 className="font-semibold mb-3">Price Breakdown</h5>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Base Price</span>
              <span>₹{priceBreakdown.basePrice.toLocaleString()}</span>
            </div>
            
            {formData.extras.insurance && (
              <div className="flex justify-between">
                <span>Additional Insurance</span>
                <span>₹{priceBreakdown.extraInsurance.toLocaleString()}</span>
              </div>
            )}
            
            {formData.extras.driver && (
              <div className="flex justify-between">
                <span>Additional Driver</span>
                <span>₹{priceBreakdown.extraDriver.toLocaleString()}</span>
              </div>
            )}
            
            {formData.extras.childSeat && (
              <div className="flex justify-between">
                <span>Child Safety Seat</span>
                <span>₹{priceBreakdown.childSeat.toLocaleString()}</span>
              </div>
            )}
            
            <Separator className="my-2" />
            
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{priceBreakdown.subtotal.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Taxes (18% GST)</span>
              <span>₹{priceBreakdown.taxes.toLocaleString()}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span>₹{priceBreakdown.total.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-muted-foreground">
              <span>Deposit (30%)</span>
              <span>₹{priceBreakdown.deposit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-4">
          <h5 className="font-semibold">Payment Options</h5>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="pay-full"
                name="payment-method"
                value="full"
                checked={formData.paymentMethod === 'full'}
                onChange={(e) => updateFormData({ paymentMethod: e.target.value as 'full' | 'deposit' })}
                className="text-primary"
              />
              <Label htmlFor="pay-full" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Full Amount Now</span>
                  </div>
                  <span className="font-semibold">₹{priceBreakdown.total.toLocaleString()}</span>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="pay-deposit"
                name="payment-method"
                value="deposit"
                checked={formData.paymentMethod === 'deposit'}
                onChange={(e) => updateFormData({ paymentMethod: e.target.value as 'full' | 'deposit' })}
                className="text-primary"
              />
              <Label htmlFor="pay-deposit" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WalletMinimal className="w-4 h-4" />
                    <span>Pay Deposit (30%)</span>
                  </div>
                  <span className="font-semibold">₹{priceBreakdown.deposit.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Pay remaining ₹{(priceBreakdown.total - priceBreakdown.deposit).toLocaleString()} at pickup
                </p>
              </Label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleBooking}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                {formData.paymentMethod === 'full' 
                  ? `Pay ₹${priceBreakdown.total.toLocaleString()}` 
                  : `Pay Deposit ₹${priceBreakdown.deposit.toLocaleString()}`
                }
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Razorpay. Your payment information is encrypted and protected.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}