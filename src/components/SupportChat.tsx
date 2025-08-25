"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  MessageSquareMore, 
  MessageSquarePlus,
  MessageCircleOff,
  MessageCircleWarning,
  MessageSquareReply,
  Bot,
  Sparkles,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  attachment?: {
    type: 'image';
    url: string;
    name: string;
  };
  escalated?: boolean;
  typing?: boolean;
  aiGenerated?: boolean;
}

interface ConversationState {
  id: string;
  status: 'active' | 'closed';
  agent?: {
    name: string;
    avatar?: string;
    isAI: boolean;
  };
  sla: string;
  unreadCount: number;
}

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'offline';

export default function SupportChat() {
  // Core state
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationState | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  
  // Queue for offline messages
  const [messageQueue, setMessageQueue] = useState<Omit<Message, 'id' | 'timestamp'>[]>([]);
  
  // UI state
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showEscalationNotice, setShowEscalationNotice] = useState(false);
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0);
  
  // User state
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced AI Agent responses
  const generateAIResponse = useCallback((userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Car rental specific responses
    if (message.includes('book') || message.includes('reservation')) {
      const responses = [
        "I'd be happy to help you with your booking! Could you please tell me your preferred pickup location and dates?",
        "Great! Let me assist you with making a reservation. What type of vehicle are you looking for?",
        "I can help you book a car right away. Do you have a specific pickup location and time in mind?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (message.includes('cancel') || message.includes('refund')) {
      return "I understand you need to cancel your booking. Let me help you with that. Could you please provide your booking reference number?";
    }
    
    if (message.includes('price') || message.includes('cost') || message.includes('rate')) {
      return "Our pricing is transparent with no hidden fees! Rates vary by vehicle type and duration. Would you like me to show you current pricing for specific dates?";
    }
    
    if (message.includes('location') || message.includes('pickup') || message.includes('drop')) {
      return "We have pickup locations across major cities. Where would you like to pick up your vehicle? I can check availability for you.";
    }
    
    if (message.includes('insurance') || message.includes('coverage')) {
      return "All our rentals include basic insurance coverage. We also offer comprehensive protection plans. Would you like details about our coverage options?";
    }
    
    if (message.includes('fuel') || message.includes('gas') || message.includes('petrol')) {
      return "Our vehicles come with a full tank of fuel. You can return it with any fuel level - we'll only charge for what you use at competitive rates.";
    }
    
    if (message.includes('electric') || message.includes('ev') || message.includes('tesla')) {
      return "Yes! We have a growing fleet of electric vehicles including Tesla Model 3, BMW i3, and more. They come fully charged and include charging cables.";
    }
    
    if (message.includes('support') || message.includes('help') || message.includes('assistance')) {
      return "I'm here to help! Our AI-powered support is available 24/7. What specific assistance do you need with your car rental?";
    }
    
    if (message.includes('luxury') || message.includes('premium') || message.includes('bmw') || message.includes('mercedes') || message.includes('audi')) {
      return "Our luxury fleet includes BMW, Mercedes-Benz, Audi, and other premium vehicles. These come with additional amenities and personalized service. Interested in a specific model?";
    }
    
    if (message.includes('airport') || message.includes('terminal')) {
      return "We have convenient airport pickup locations at all major terminals. I can arrange for your car to be ready when you land. Which airport are you flying into?";
    }
    
    if (message.includes('long term') || message.includes('monthly') || message.includes('weekly')) {
      return "We offer excellent rates for weekly and monthly rentals! Long-term customers get priority vehicle selection and additional perks. How long do you need the vehicle?";
    }
    
    // General helpful responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm your AI assistant from Go Wheels. I'm here to help you with car rentals, bookings, pricing, and any questions you might have. I can instantly assist with most requests and connect you to humans when needed. How can I help you today?";
    }
    
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're very welcome! I'm always happy to help. Is there anything else I can assist you with regarding your car rental?";
    }
    
    // Default intelligent response
    const defaultResponses = [
      "I understand you need assistance with that. Let me provide you with the best solution. Could you give me a bit more detail about your specific needs?",
      "That's a great question! I'm here to help you find the perfect car rental solution. What specific information would be most helpful?",
      "I want to make sure I give you the most accurate information. Could you tell me more about what you're looking for?",
      "Thanks for reaching out! I'm your AI assistant and I'm here to help with any car rental questions or bookings you might have."
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }, []);

  // Quick reply options
  const quickReplies = [
    { id: 'booking', label: 'Book a car', value: 'I want to book a car for my trip' },
    { id: 'cancel', label: 'Cancel booking', value: 'I need to cancel my booking' },
    { id: 'pricing', label: 'View pricing', value: 'What are your rental rates?' },
    { id: 'locations', label: 'Pickup locations', value: 'Where can I pick up a car?' },
    { id: 'luxury', label: 'Luxury cars', value: 'Do you have luxury vehicles available?' },
    { id: 'electric', label: 'Electric cars', value: 'What electric vehicles do you offer?' }
  ];

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Connection management
  const connectToRealtime = useCallback(() => {
    setConnectionStatus('connecting');
    
    // Simulate connection attempt
    setTimeout(() => {
      const isOnline = typeof window !== "undefined" ? navigator.onLine : true;
      if (isOnline) {
        setConnectionStatus('connected');
        toast.success('🤖 AI Assistant connected and ready to help!');
        
        // Process queued messages
        if (messageQueue.length > 0) {
          messageQueue.forEach(queuedMessage => {
            sendMessage(queuedMessage.content, queuedMessage.attachment);
          });
          setMessageQueue([]);
        }
      } else {
        setConnectionStatus('offline');
        toast.error('You are offline. Messages will be queued.');
      }
    }, 1000);
  }, [messageQueue]);

  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    
    pollingIntervalRef.current = setInterval(() => {
      // Simulate polling for new messages
      fetchMessages();
    }, 5000);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Message handling
  const fetchMessages = useCallback(async () => {
    if (!conversation) return;
    
    try {
      setIsLoadingHistory(true);
      
      // Simulate API call to fetch messages
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // This would be replaced with actual Convex query
      // const messages = await convex.query(api.chat.getMessages, { conversationId: conversation.id });
      
      setIsLoadingHistory(false);
    } catch (error) {
      setIsLoadingHistory(false);
      toast.error('Failed to load messages');
    }
  }, [conversation]);

  const sendMessage = useCallback(async (content: string, attachment?: Message['attachment']) => {
    if (!content.trim() && !attachment) return;
    if (rateLimitCooldown > 0) {
      toast.error(`Please wait ${rateLimitCooldown} seconds before sending another message`);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    const message: Message = {
      id: Math.random().toString(36),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
      attachment
    };

    // Check for escalation keywords
    const escalationKeywords = ['urgent', 'emergency', 'complaint', 'manager', 'escalate', 'supervisor'];
    const shouldEscalate = escalationKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    if (shouldEscalate) {
      message.escalated = true;
      setShowEscalationNotice(true);
      setTimeout(() => setShowEscalationNotice(false), 3000);
    }

    if (connectionStatus === 'offline') {
      // Queue message for later
      setMessageQueue(prev => [...prev, { content, sender: 'user', attachment }]);
      toast.info('Message queued. Will send when back online.');
      return;
    }

    setIsSending(true);

    try {
      // Add message locally first
      setMessages(prev => [...prev, message]);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // This would be replaced with actual Convex mutation
      // await convex.mutation(api.chat.sendMessage, { 
      //   conversationId: conversation.id,
      //   content,
      //   attachment 
      // });

      if (shouldEscalate && notificationsEnabled) {
        toast.success('🚨 Message escalated to our human agents');
      } else {
        toast.success('Message sent');
      }

      // Show AI typing indicator
      setIsAgentTyping(true);

      // Generate intelligent AI response
      setTimeout(() => {
        setIsAgentTyping(false);
        
        let agentResponseContent;
        if (shouldEscalate) {
          agentResponseContent = "I understand this is urgent. I'm connecting you with our human support team right away. In the meantime, I can still help with immediate questions.";
        } else {
          agentResponseContent = generateAIResponse(content);
        }

        const agentResponse: Message = {
          id: Math.random().toString(36),
          content: agentResponseContent,
          sender: 'agent',
          timestamp: new Date(),
          aiGenerated: true
        };
        
        setMessages(prev => [...prev, agentResponse]);
        
        if (conversation) {
          setConversation(prev => prev ? { ...prev, unreadCount: prev.unreadCount + 1 } : null);
        }
      }, Math.random() * 2000 + 1000); // Random delay 1-3 seconds

      // Simple rate limiting
      setRateLimitCooldown(2);
      const countdown = setInterval(() => {
        setRateLimitCooldown(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      toast.error('Failed to send message');
      // Remove message from UI on failure
      setMessages(prev => prev.filter(m => m.id !== message.id));
    } finally {
      setIsSending(false);
    }
  }, [connectionStatus, rateLimitCooldown, isAuthenticated, conversation, notificationsEnabled, generateAIResponse]);

  const handleQuickReply = useCallback((reply: string) => {
    setMessageInput(reply);
  }, []);

  const handleFileAttach = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const attachment: Message['attachment'] = {
          type: 'image',
          url: e.target?.result as string,
          name: file.name
        };
        sendMessage('', attachment);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Only image files are supported');
    }

    // Reset file input
    event.target.value = '';
  }, [sendMessage]);

  const requestTranscript = useCallback(async () => {
    if (!userEmail) {
      toast.error('Please provide an email address first');
      return;
    }

    try {
      // This would call a Convex function that uses Nodemailer
      // await convex.mutation(api.chat.requestTranscript, { 
      //   conversationId: conversation.id,
      //   email: userEmail 
      // });
      
      toast.success('Transcript will be sent to your email shortly');
    } catch (error) {
      toast.error('Failed to send transcript');
    }
  }, [userEmail, conversation]);

  const initializeConversation = useCallback(() => {
    setIsLoadingHistory(true);
    
    // Initialize or load existing conversation
    setTimeout(() => {
      setConversation({
        id: Math.random().toString(36),
        status: 'active',
        agent: { 
          name: 'Sarah (AI Assistant)', 
          isAI: true 
        },
        sla: 'AI Response: Instant • Human backup: 2-3 minutes',
        unreadCount: 0
      });

      // Load welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "👋 Hi there! I'm Sarah, your AI-powered assistant from Go Wheels. I'm here to help you with car rentals, bookings, pricing, and any questions you might have. I can instantly assist with most requests and connect you to humans when needed. How can I help you today?",
        sender: 'agent',
        timestamp: new Date(),
        aiGenerated: true
      };
      setMessages([welcomeMessage]);
      setIsLoadingHistory(false);
    }, 800);
  }, []);

  const handleAuthSubmit = useCallback(() => {
    if (!userEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsAuthenticated(true);
    setShowAuthDialog(false);
    toast.success('🤖 Ready to chat with our AI assistant!');
  }, [userEmail]);

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && !conversation) {
      initializeConversation();
    }
  }, [isOpen, conversation, initializeConversation]);

  useEffect(() => {
    if (isOpen) {
      connectToRealtime();
      
      // Fallback to polling if realtime fails
      const fallbackTimeout = setTimeout(() => {
        if (connectionStatus === 'connecting') {
          setConnectionStatus('disconnected');
          startPolling();
          toast.warning('Realtime connection failed. Using polling mode.');
        }
      }, 5000);

      return () => {
        clearTimeout(fallbackTimeout);
        stopPolling();
      };
    }
  }, [isOpen, connectionStatus, connectToRealtime, startPolling, stopPolling]);

  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('connected');
      connectToRealtime();
    };

    const handleOffline = () => {
      setConnectionStatus('offline');
      toast.info('You are offline. Messages will be queued.');
    };

    if (typeof window !== "undefined") {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [connectToRealtime]);

  // Calculate unread count and recent message preview
  const unreadCount = conversation?.unreadCount || 0;
  const lastMessage = messages[messages.length - 1];
  const previewText = lastMessage?.sender === 'agent' ? lastMessage.content : '';

  return (
    <>
      {/* Enhanced Floating Chat Bubble */}
      {!isOpen && (
        <motion.div 
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, duration: 0.5, type: "spring" }}
        >
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(59, 130, 246, 0.3)',
                '0 0 30px rgba(59, 130, 246, 0.5)',
                '0 0 20px rgba(59, 130, 246, 0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="relative h-16 w-16 rounded-full bg-gradient-to-r from-primary to-blue-600 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bot className="h-7 w-7 text-primary-foreground" />
              </motion.div>
              
              {/* AI Indicator */}
              <motion.div 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Sparkles className="h-2 w-2 text-white" />
              </motion.div>
              
              {/* Connection status indicator */}
              <div className={`absolute -bottom-1 -left-1 h-4 w-4 rounded-full border-2 border-background ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' :
                connectionStatus === 'offline' ? 'bg-gray-400' : 'bg-red-500'
              }`} />
              
              {/* Unread badge */}
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground p-0 flex items-center justify-center text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </motion.div>

          {/* Enhanced Preview tooltip */}
          {previewText && unreadCount > 0 && (
            <motion.div 
              className="absolute bottom-20 right-0 mb-2 max-w-xs"
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-card/95 backdrop-blur-lg border-white/20 shadow-2xl">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-primary">AI Assistant</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{previewText}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Enhanced Chat Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="fixed bottom-0 right-0 h-full w-full md:bottom-6 md:right-6 md:h-[700px] md:w-[420px] md:rounded-xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <Card className="h-full flex flex-col bg-card/95 backdrop-blur-xl border-white/20">
                {/* Enhanced Header */}
                <CardHeader className="flex-shrink-0 pb-4 bg-gradient-to-r from-primary/10 to-blue-600/10 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <motion.div 
                        className="flex items-center space-x-2"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="relative">
                          <div className={`h-3 w-3 rounded-full ${
                            connectionStatus === 'connected' ? 'bg-green-500' :
                            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                            connectionStatus === 'offline' ? 'bg-gray-400' : 'bg-red-500'
                          }`} />
                          <motion.div
                            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                            className="absolute inset-0 bg-green-500 rounded-full"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Bot className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold">
                            {conversation?.agent?.name || 'AI Assistant'}
                          </h3>
                          <Sparkles className="h-3 w-3 text-yellow-400" />
                        </div>
                      </motion.div>
                      
                      {showEscalationNotice && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse">
                            🚨 Escalated
                          </Badge>
                        </motion.div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-white/10">
                            <MessageSquareMore className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur border-white/20">
                          <DropdownMenuItem onClick={requestTranscript}>
                            📧 Email transcript
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setConversation(prev => prev ? { ...prev, status: 'closed' } : null);
                            toast.success('Conversation closed');
                          }}>
                            ❌ Close conversation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setIsOpen(false);
                          if (conversation) {
                            setConversation(prev => prev ? { ...prev, unreadCount: 0 } : null);
                          }
                        }}
                        className="hover:bg-white/10"
                      >
                        ✕
                      </Button>
                    </div>
                  </div>

                  {conversation?.sla && (
                    <motion.p 
                      className="text-sm text-muted-foreground flex items-center gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Zap className="h-3 w-3" />
                      {conversation.sla}
                    </motion.p>
                  )}

                  {connectionStatus !== 'connected' && (
                    <div className="flex items-center space-x-2 text-sm">
                      {connectionStatus === 'offline' && <MessageCircleOff className="h-4 w-4" />}
                      {connectionStatus === 'disconnected' && <MessageCircleWarning className="h-4 w-4" />}
                      <span className="text-muted-foreground">
                        {connectionStatus === 'connecting' && 'Connecting AI...'}
                        {connectionStatus === 'disconnected' && 'Connection issues'}
                        {connectionStatus === 'offline' && 'Offline mode'}
                      </span>
                    </div>
                  )}
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
                  <ScrollArea className="flex-1 pr-4">
                    {isLoadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="rounded-full h-6 w-6 border-2 border-primary border-t-transparent"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4 pb-4">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                message.sender === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted/80 backdrop-blur border border-white/10'
                              }`}
                            >
                              {message.sender === 'agent' && message.aiGenerated && (
                                <div className="flex items-center gap-1 mb-2 text-xs opacity-70">
                                  <Bot className="h-3 w-3" />
                                  <span>AI Assistant</span>
                                  <Sparkles className="h-2 w-2" />
                                </div>
                              )}
                              
                              {message.attachment && (
                                <div className="mb-2">
                                  <img 
                                    src={message.attachment.url} 
                                    alt={message.attachment.name}
                                    className="max-w-full h-auto rounded"
                                  />
                                </div>
                              )}
                              
                              <p className="text-sm">{message.content}</p>
                              
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs opacity-70">
                                  {message.timestamp.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                
                                {message.escalated && (
                                  <MessageCircleWarning className="h-3 w-3 opacity-70" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        
                        {/* AI Typing Indicator */}
                        <AnimatePresence>
                          {isAgentTyping && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="flex justify-start"
                            >
                              <div className="bg-muted/80 backdrop-blur border border-white/10 rounded-lg p-3 flex items-center gap-2">
                                <Bot className="h-3 w-3 text-primary" />
                                <div className="flex space-x-1">
                                  <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                                    className="w-2 h-2 bg-primary rounded-full"
                                  />
                                  <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                                    className="w-2 h-2 bg-primary rounded-full"
                                  />
                                  <motion.div
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                                    className="w-2 h-2 bg-primary rounded-full"
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">AI is typing...</span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Enhanced Quick Replies */}
                  {messages.length <= 1 && (
                    <motion.div 
                      className="flex flex-wrap gap-2 py-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                    >
                      {quickReplies.map((reply) => (
                        <motion.div
                          key={reply.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickReply(reply.value)}
                            className="text-xs hover:bg-primary/10 border-white/20 backdrop-blur"
                          >
                            {reply.label}
                          </Button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Message Queued indicator */}
                  {messageQueue.length > 0 && (
                    <motion.div 
                      className="bg-yellow-500/20 border border-yellow-500/30 rounded p-2 text-sm text-yellow-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      📡 {messageQueue.length} message(s) queued for when you're back online
                    </motion.div>
                  )}

                  {/* Enhanced Composer */}
                  <div className="flex-shrink-0 space-y-2">
                    <div className="flex space-x-2">
                      <Textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 min-h-0 resize-none bg-background/50 backdrop-blur border-white/20"
                        rows={2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(messageInput);
                            setMessageInput('');
                          }
                        }}
                      />
                      
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="hover:bg-white/10"
                        >
                          📎
                        </Button>
                        
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={() => {
                              sendMessage(messageInput);
                              setMessageInput('');
                            }}
                            disabled={isSending || (!messageInput.trim())}
                            size="sm"
                            className="bg-gradient-to-r from-primary to-blue-600"
                          >
                            {isSending ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                              />
                            ) : (
                              <MessageSquareReply className="h-4 w-4" />
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    {rateLimitCooldown > 0 && (
                      <motion.p 
                        className="text-xs text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        ⏰ Please wait {rateLimitCooldown}s before sending another message
                      </motion.p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Connect with AI Assistant
            </DialogTitle>
            <DialogDescription>
              Get instant help from our AI-powered support. Just provide your email to get started.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email address *</label>
              <Input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-background/50 backdrop-blur border-white/20"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Phone (optional)</label>
              <Input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="bg-background/50 backdrop-blur border-white/20"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notifications"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
              <label htmlFor="notifications" className="text-sm">
                Send me SMS/WhatsApp notifications for urgent issues
              </label>
            </div>
            
            <Button onClick={handleAuthSubmit} className="w-full bg-gradient-to-r from-primary to-blue-600">
              🚀 Start AI Chat
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileAttach}
        className="hidden"
      />
    </>
  );
}