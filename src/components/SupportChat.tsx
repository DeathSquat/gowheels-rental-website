"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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
  MessageSquareReply
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
}

interface ConversationState {
  id: string;
  status: 'active' | 'closed';
  agent?: {
    name: string;
    avatar?: string;
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

  // Quick reply options
  const quickReplies = [
    { id: 'booking', label: 'Help with booking', value: 'I need help with my booking' },
    { id: 'cancel', label: 'Cancel booking', value: 'I want to cancel my booking' },
    { id: 'pickup', label: 'Change pickup', value: 'I need to change my pickup location' },
    { id: 'other', label: 'Other question', value: 'I have a different question' }
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
        toast.success('Connected to support');
        
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
    const escalationKeywords = ['urgent', 'booking', 'cancel', 'refund', 'emergency'];
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
        // Simulate escalation notification
        toast.success('Message sent and escalated to our team');
      } else {
        toast.success('Message sent');
      }

      // Simulate agent response
      setTimeout(() => {
        const agentResponse: Message = {
          id: Math.random().toString(36),
          content: shouldEscalate 
            ? "Thanks for reaching out! I can see this is urgent. Let me get you connected with the right team member right away."
            : "Thanks for your message! I'll help you with that. Can you provide a bit more detail?",
          sender: 'agent',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentResponse]);
        
        if (conversation) {
          setConversation(prev => prev ? { ...prev, unreadCount: prev.unreadCount + 1 } : null);
        }
      }, 2000);

      // Simple rate limiting
      setRateLimitCooldown(3);
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
  }, [connectionStatus, rateLimitCooldown, isAuthenticated, conversation, notificationsEnabled]);

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
        agent: { name: 'Sarah' },
        sla: 'Typical response: 2-3 minutes',
        unreadCount: 0
      });

      // Load welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        content: "Hi! I'm Sarah from support. How can I help you today?",
        sender: 'agent',
        timestamp: new Date()
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
    toast.success('Ready to chat!');
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
      {/* Floating Chat Bubble */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="relative h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105"
          >
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
            
            {/* Status indicator */}
            <div className={`absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${
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

          {/* Preview tooltip */}
          {previewText && unreadCount > 0 && (
            <div className="absolute bottom-16 right-0 mb-2 max-w-xs bg-card border rounded-lg shadow-lg p-3 animate-in slide-in-from-bottom-2">
              <p className="text-sm text-muted-foreground truncate">{previewText}</p>
            </div>
          )}
        </div>
      )}

      {/* Chat Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed bottom-0 right-0 h-full w-full md:bottom-6 md:right-6 md:h-[600px] md:w-[400px] md:rounded-lg overflow-hidden shadow-2xl">
            <Card className="h-full flex flex-col">
              {/* Header */}
              <CardHeader className="flex-shrink-0 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${
                        connectionStatus === 'connected' ? 'bg-green-500' :
                        connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                        connectionStatus === 'offline' ? 'bg-gray-400' : 'bg-red-500'
                      }`} />
                      <h3 className="font-semibold">
                        {conversation?.agent?.name || 'Support'}
                      </h3>
                    </div>
                    
                    {showEscalationNotice && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse">
                        Escalation sent
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MessageSquareMore className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={requestTranscript}>
                          Email transcript
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setConversation(prev => prev ? { ...prev, status: 'closed' } : null);
                          toast.success('Conversation closed');
                        }}>
                          Close conversation
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
                    >
                      ✕
                    </Button>
                  </div>
                </div>

                {conversation?.sla && (
                  <p className="text-sm text-muted-foreground">{conversation.sla}</p>
                )}

                {connectionStatus !== 'connected' && (
                  <div className="flex items-center space-x-2 text-sm">
                    {connectionStatus === 'offline' && <MessageCircleOff className="h-4 w-4" />}
                    {connectionStatus === 'disconnected' && <MessageCircleWarning className="h-4 w-4" />}
                    <span className="text-muted-foreground">
                      {connectionStatus === 'connecting' && 'Connecting...'}
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
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4 pb-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.sender === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
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
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Quick Replies */}
                {messages.length <= 1 && (
                  <div className="flex flex-wrap gap-2 py-2">
                    {quickReplies.map((reply) => (
                      <Button
                        key={reply.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply.value)}
                        className="text-xs"
                      >
                        {reply.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Message Queued indicator */}
                {messageQueue.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-sm text-yellow-700">
                    {messageQueue.length} message(s) queued for when you're back online
                  </div>
                )}

                {/* Composer */}
                <div className="flex-shrink-0 space-y-2">
                  <div className="flex space-x-2">
                    <Textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 min-h-0 resize-none"
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
                      >
                        📎
                      </Button>
                      
                      <Button
                        onClick={() => {
                          sendMessage(messageInput);
                          setMessageInput('');
                        }}
                        disabled={isSending || (!messageInput.trim())}
                        size="sm"
                      >
                        {isSending ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                        ) : (
                          <MessageSquareReply className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {rateLimitCooldown > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Please wait {rateLimitCooldown}s before sending another message
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Let's get you connected</DialogTitle>
            <DialogDescription>
              Please provide your contact information to start the chat.
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
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Phone (optional)</label>
              <Input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
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
            
            <Button onClick={handleAuthSubmit} className="w-full">
              Start Chat
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