"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, LogIn, UserRoundCheck, MailCheck, PhoneCall, KeyRound, CircleX, LockKeyhole, Hand } from "lucide-react";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  rememberMe: boolean;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  hasLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export default function AuthModal({ isOpen, onClose, defaultTab = "signin" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otp, setOtp] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Reset form when modal opens/closes or tab changes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
        rememberMe: false,
      });
      setErrors({});
      setShowForgotPassword(false);
      setShowOtpVerification(false);
      setOtp("");
      setResetEmail("");
      setOtpTimer(0);
    }
  }, [isOpen]);

  // OTP timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePhone = useCallback((phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }, []);

  const checkPasswordStrength = useCallback((password: string): PasswordStrength => {
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const score = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

    const feedback: string[] = [];
    if (!hasLength) feedback.push("At least 8 characters");
    if (!hasUpper) feedback.push("One uppercase letter");
    if (!hasLower) feedback.push("One lowercase letter");
    if (!hasNumber) feedback.push("One number");
    if (!hasSpecial) feedback.push("One special character");

    return {
      score,
      feedback,
      hasLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
    };
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<FormData> = {};

    if (activeTab === "signup") {
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }

      if (!formData.acceptTerms) {
        newErrors.acceptTerms = "You must accept the terms and conditions";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      const passwordStrength = checkPasswordStrength(formData.password);
      if (passwordStrength.score < 4) {
        newErrors.password = "Password is too weak";
      }
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [activeTab, formData, validateEmail, validatePhone, checkPasswordStrength]);

  const handleInputChange = useCallback((field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const handleSocialAuth = useCallback(async (provider: "google" | "apple") => {
    setIsLoading(true);
    try {
      // In a real app, this would call Convex OAuth endpoints
      toast.info(`${provider} authentication will be available soon`);
    } catch (error) {
      toast.error(`Failed to authenticate with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      if (activeTab === "signup") {
        // In a real app, this would call Convex signup function
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        
        if (formData.phone) {
          // Show OTP verification for phone
          setShowOtpVerification(true);
          setOtpTimer(60);
          toast.success(`OTP sent to ${formData.phone}`);
        } else {
          // Email verification
          toast.success("Account created! Please check your email to verify your account.");
          localStorage.setItem("auth_session", JSON.stringify({
            email: formData.email,
            name: formData.fullName,
            verified: false
          }));
          onClose();
        }
      } else {
        // Sign in
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        localStorage.setItem("auth_session", JSON.stringify({
          email: formData.email,
          name: "User",
          verified: true
        }));
        
        toast.success("Welcome back!");
        onClose();
      }
    } catch (error) {
      toast.error("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, formData, validateForm, onClose]);

  const handleForgotPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(resetEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    try {
      // In a real app, this would call Convex password reset function
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Password reset instructions sent to your email");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      toast.error("Failed to send reset instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [resetEmail, validateEmail]);

  const handleOtpVerification = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    
    try {
      // In a real app, this would verify OTP via Twilio through Convex
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem("auth_session", JSON.stringify({
        email: formData.email,
        name: formData.fullName,
        verified: true
      }));
      
      toast.success("Phone verified! Account created successfully.");
      onClose();
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [otp, formData, onClose]);

  const handleResendOtp = useCallback(async () => {
    if (otpTimer > 0) return;
    
    setIsLoading(true);
    
    try {
      // In a real app, this would resend OTP via Convex/Twilio
      await new Promise(resolve => setTimeout(resolve, 500));
      setOtpTimer(60);
      toast.success("OTP resent successfully");
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  }, [otpTimer]);

  const passwordStrength = checkPasswordStrength(formData.password);
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  if (showOtpVerification) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PhoneCall className="h-5 w-5 text-primary" />
              Verify Phone Number
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to {formData.phone}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleOtpVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="text-center text-lg tracking-widest"
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {otpTimer > 0 ? `Resend in ${otpTimer}s` : "Didn't receive code?"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendOtp}
                disabled={otpTimer > 0 || isLoading}
                className="h-auto p-0 text-primary"
              >
                Resend OTP
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOtpVerification(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="flex-1"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  if (showForgotPassword) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Reset Password
            </DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you instructions to reset your password.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !resetEmail}
                className="flex-1"
              >
                {isLoading ? "Sending..." : "Send Instructions"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card max-w-md p-0">
        <div className="p-6">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-display">
              Welcome
            </DialogTitle>
            <DialogDescription>
              Sign in to your account or create a new one
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6">
            {/* Social Auth Buttons */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialAuth("google")}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialAuth("apple")}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 13.905c-.003-.027-.003-.054-.003-.081a3.05 3.05 0 013.05-3.05c.027 0 .054 0 .081.003v-.004h.003c.027.001.051.004.076.006a3.05 3.05 0 013.05 3.044c0 .027 0 .054-.003.081v.004c-.001.027-.004.051-.006.076a3.05 3.05 0 01-3.044 3.05c-.027 0-.054 0-.081-.003h-.004c-.027-.001-.051-.004-.076-.006a3.05 3.05 0 01-3.044-3.044z"/>
                </svg>
                Continue with Apple
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Auth Forms */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserRoundCheck className="h-4 w-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={isLoading}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        disabled={isLoading}
                        className={errors.password ? "border-destructive pr-10" : "pr-10"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => handleInputChange("rememberMe", checked === true)}
                        disabled={isLoading}
                      />
                      <Label htmlFor="remember-me" className="text-sm">
                        Remember me
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setShowForgotPassword(true)}
                      disabled={isLoading}
                      className="px-0 font-normal"
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      disabled={isLoading}
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={isLoading}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number (Optional)</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={isLoading}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        disabled={isLoading}
                        className={errors.password ? "border-destructive pr-10" : "pr-10"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {formData.password && (
                      <Card className="mt-2">
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">Password Strength</span>
                              <span className={`text-xs font-medium ${
                                passwordStrength.score >= 4 ? "text-green-600" : 
                                passwordStrength.score >= 3 ? "text-blue-600" :
                                passwordStrength.score >= 2 ? "text-yellow-600" :
                                passwordStrength.score >= 1 ? "text-orange-600" : "text-red-600"
                              }`}>
                                {strengthLabels[passwordStrength.score]}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-1 flex-1 rounded-full ${
                                    i < passwordStrength.score
                                      ? strengthColors[passwordStrength.score]
                                      : "bg-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            {passwordStrength.feedback.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Missing: {passwordStrength.feedback.join(", ")}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        disabled={isLoading}
                        className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="accept-terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => handleInputChange("acceptTerms", checked === true)}
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="accept-terms" className="text-sm font-normal">
                        I accept the{" "}
                        <Button variant="link" size="sm" className="px-0 h-auto font-normal underline">
                          Terms of Service
                        </Button>{" "}
                        and{" "}
                        <Button variant="link" size="sm" className="px-0 h-auto font-normal underline">
                          Privacy Policy
                        </Button>
                      </Label>
                      {errors.acceptTerms && (
                        <p className="text-sm text-destructive">{errors.acceptTerms}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}