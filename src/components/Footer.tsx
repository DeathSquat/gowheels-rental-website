"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Linkedin } from 'lucide-react';
import { toast } from 'sonner';

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [language, setLanguage] = useState('en');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    
    try {
      // Simulate API call to Convex endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would call the Convex serverless endpoint
      // const response = await fetch('/api/newsletter', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });
      
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const quickLinks = [
    { label: 'Fleet', href: '/fleet' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'How it Works', href: '/how-it-works' },
    { label: 'Support', href: '/support' },
    { label: 'Careers', href: '/careers' }
  ];

  const legalLinks = [
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' }
  ];

  const serviceBadges = [
    { name: 'Razorpay', color: 'bg-blue-100 text-blue-800' },
    { name: 'Google Maps', color: 'bg-green-100 text-green-800' },
    { name: 'Twilio', color: 'bg-red-100 text-red-800' },
    { name: 'Convex', color: 'bg-purple-100 text-purple-800' },
    { name: 'MongoDB', color: 'bg-green-100 text-green-800' }
  ];

  return (
    <footer className={`bg-card border-t ${className}`}>
      <div className="container mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand & About */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-lg text-foreground">FleetFlow</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Streamlining fleet management with intelligent automation and real-time insights.
              </p>
            </div>
            
            {/* Service badges */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Powered by
              </p>
              <div className="flex flex-wrap gap-2">
                {serviceBadges.map((service) => (
                  <span
                    key={service.name}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${service.color}`}
                  >
                    {service.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-foreground">Quick Links</h4>
            <nav className="space-y-2">
              {quickLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-foreground">Contact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <a 
                    href="mailto:support@fleetflow.com"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    support@fleetflow.com
                  </a>
                </div>
                <div className="text-muted-foreground">
                  <p>+1 (555) 123-4567</p>
                  <p className="leading-relaxed">
                    123 Business District<br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex space-x-3">
                <a
                  href="https://linkedin.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Follow us on LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="mailto:support@fleetflow.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Send us an email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-3">
              <Label htmlFor="newsletter-email" className="font-display font-semibold text-foreground">
                Newsletter
              </Label>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <Input
                  id="newsletter-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-sm"
                  aria-label="Email address for newsletter subscription"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={isSubscribing}
                  className="w-full"
                >
                  {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <p className="text-muted-foreground text-sm">
                © 2024 FleetFlow. All rights reserved.
              </p>
              <div className="flex space-x-4">
                {legalLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="language-select" className="text-sm text-muted-foreground">
                Language:
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language-select" className="w-24 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">EN</SelectItem>
                  <SelectItem value="es">ES</SelectItem>
                  <SelectItem value="fr">FR</SelectItem>
                  <SelectItem value="de">DE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}