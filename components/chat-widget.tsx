'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  MessageCircle, 
  X, 
  Send, 
  Paperclip, 
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  Smile,
  Check,
  CheckCheck
} from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'contractor' | 'system';
  timestamp: Date;
  read: boolean;
  attachments?: Attachment[];
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface Attachment {
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
}

interface ChatWidgetProps {
  bookingId: string;
  userId: string;
  userType: 'customer' | 'contractor';
  recipientId: string;
  recipientName: string;
}

export function ChatWidget({ 
  bookingId, 
  userId, 
  userType, 
  recipientId, 
  recipientName 
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize real-time subscription
  useEffect(() => {
    if (!isOpen) return;

    // Load initial messages
    loadMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`chat:${bookingId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `booking_id=eq.${bookingId}`
      }, (payload: any) => {
        const newMsg = payload.new as Message;
        if (newMsg.senderId !== userId) {
          setMessages(prev => [...prev, newMsg]);
          if (!isOpen) {
            setUnreadCount(prev => prev + 1);
          }
          playNotificationSound();
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = subscription.presenceState();
        const typing = Object.values(state).some(
          (presence: any) => presence[0]?.typing && presence[0]?.user_id !== userId
        );
        setOtherUserTyping(typing);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen, bookingId, userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('timestamp', { ascending: true });

    if (data) {
      setMessages(data);
      markMessagesAsRead();
    }
  };

  const markMessagesAsRead = async () => {
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('booking_id', bookingId)
      .eq('sender_id', recipientId);
    
    setUnreadCount(0);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message: Partial<Message> = {
      content: newMessage,
      senderId: userId,
      senderName: userType === 'customer' ? 'You' : 'Contractor',
      senderType: userType,
      timestamp: new Date(),
      read: false,
      status: 'sending'
    };

    // Optimistically add message
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { ...message, id: tempId } as Message]);
    setNewMessage('');

    // Send to database
    const { data, error } = await supabase
      .from('messages')
      .insert({
        booking_id: bookingId,
        sender_id: userId,
        recipient_id: recipientId,
        content: message.content,
        sender_type: userType
      })
      .select()
      .single();

    if (data) {
      // Update with real message
      setMessages(prev => 
        prev.map(msg => msg.id === tempId ? { ...data, status: 'sent' } : msg)
      );
    }

    // Stop typing indicator
    handleTypingStop();
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      updateTypingStatus(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 1000);
  };

  const handleTypingStop = () => {
    setIsTyping(false);
    updateTypingStatus(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const updateTypingStatus = async (typing: boolean) => {
    const channel = supabase.channel(`chat:${bookingId}`);
    await channel.track({ typing, user_id: userId });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file);

    if (data) {
      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

      // Send message with attachment
      const message: Partial<Message> = {
        content: `Sent ${file.type.startsWith('image/') ? 'an image' : 'a file'}`,
        senderId: userId,
        senderName: userType === 'customer' ? 'You' : 'Contractor',
        senderType: userType,
        timestamp: new Date(),
        attachments: [{
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url: publicUrl,
          name: file.name,
          size: file.size
        }]
      };

      // Send message logic here
    }
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(() => {});
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return messageDate.toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all z-40"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-background border border-border rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {recipientName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{recipientName}</h3>
                {otherUserTyping && (
                  <p className="text-xs text-muted-foreground">Typing...</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Phone className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Video className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <div className="text-center mb-4">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {date}
                  </span>
                </div>
                {msgs.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        message.senderId === userId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      } rounded-lg px-4 py-2`}
                    >
                      {message.attachments?.map((attachment, idx) => (
                        <div key={idx} className="mb-2">
                          {attachment.type === 'image' ? (
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className="rounded-lg max-w-full"
                            />
                          ) : (
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 underline"
                            >
                              <Paperclip className="h-4 w-4" />
                              {attachment.name}
                            </a>
                          )}
                        </div>
                      ))}
                      <p className="break-words">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.senderId === userId && (
                          <span className="text-xs">
                            {message.status === 'read' ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : message.status === 'delivered' ? (
                              <CheckCheck className="h-3 w-3 opacity-50" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-muted border-0 rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Smile className="h-5 w-5 text-muted-foreground" />
              </button>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}