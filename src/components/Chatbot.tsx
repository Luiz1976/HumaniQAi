import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, User, Loader2, Minimize2, Camera, Mic, Smile, Paperclip } from 'lucide-react';
import Lottie from 'lottie-react';
import robotWaving from '@/assets/robot-waving.json';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id?: string;
}

interface DateGroup {
  date: string;
  messages: Message[];
}

// Função util para obter base da API de forma segura
const getApiBase = () => {
  const raw = import.meta.env.VITE_API_URL || '';
  const trimmed = raw.replace(/\/+$/, '');
  return trimmed.replace(/\/api$/, '');
};

// Funções auxiliares para formatação e agrupamento
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Hoje';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  }
};

const groupMessagesByDate = (messages: Message[]): DateGroup[] => {
  const groups: { [key: string]: Message[] } = {};
  
  messages.forEach(message => {
    const dateKey = message.timestamp.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
  });

  return Object.entries(groups).map(([date, messages]) => ({
    date: formatDate(new Date(date)),
    messages
  }));
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  // Oculta o gatilho flutuante especificamente na Landing (/ e /landing)
  const hideFloatingTriggerOnThisPage = path === '/' || path === '/landing';

  const emojis = ['😀', '😂', '😍', '🥰', '😊', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '✅', '👋', '🙏', '💪', '🎯'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addEmoji = (emoji: string) => {
    setInputMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadWelcomeMessage();
    }
  }, [isOpen]);

  // Permite abrir/alternar/fechar o chatbot por eventos globais do window
  useEffect(() => {
    const openHandler = () => setIsOpen(true);
    const toggleHandler = () => setIsOpen(prev => !prev);
    const closeHandler = () => setIsOpen(false);

    window.addEventListener('chatbot:open', openHandler as unknown as EventListener);
    window.addEventListener('chatbot:toggle', toggleHandler as unknown as EventListener);
    window.addEventListener('chatbot:close', closeHandler as unknown as EventListener);

    return () => {
      window.removeEventListener('chatbot:open', openHandler as unknown as EventListener);
      window.removeEventListener('chatbot:toggle', toggleHandler as unknown as EventListener);
      window.removeEventListener('chatbot:close', closeHandler as unknown as EventListener);
    };
  }, []);

  const loadWelcomeMessage = async () => {
    try {
      const apiBase = getApiBase();
      const url = `${apiBase}/api/chatbot/welcome`;
      console.log('🤖 [CHATBOT] Buscando mensagem de boas-vindas em:', url);

      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('❌ [CHATBOT] Resposta não OK:', response.status, errText?.slice(0, 200));
        throw new Error(`HTTP ${response.status}: ${errText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const rawText = await response.text();
        console.error('❌ [CHATBOT] Conteúdo não-JSON recebido:', rawText?.slice(0, 200));
        throw new Error('Resposta inválida da API (não-JSON)');
      }

      const data = await response.json();
      
      setMessages([{
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      }]);
    } catch (error) {
      console.error('Erro ao carregar mensagem de boas-vindas:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          chatHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(data.timestamp),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Desculpe. Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    // Na LandingPage, o gatilho será fornecido pelo header; aqui não renderizamos o botão flutuante
    if (hideFloatingTriggerOnThisPage) {
      return null;
    }
    return (
      <button
        onClick={() => setIsOpen(true)}
        data-testid="button-open-chat"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9998] flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 hover:scale-110 transition-all duration-300"
        aria-label="Abrir chat"
      >
        <Lottie 
          animationData={robotWaving} 
          loop={true}
          className="w-full h-full"
        />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9998]">
        <button
          onClick={() => setIsMinimized(false)}
          data-testid="button-restore-chat"
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8">
            <Lottie 
              animationData={robotWaving} 
              loop={true}
              className="w-full h-full"
            />
          </div>
          <span className="font-medium text-sm sm:text-base">HumaniQ</span>
          {messages.length > 1 && (
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[10000]
                 w-full h-[100dvh] sm:w-[380px] sm:h-auto sm:max-h-[85vh] md:w-[400px] lg:w-[420px]
                 bg-[#ece5dd] dark:bg-[#0b141a]
                 rounded-none sm:rounded-2xl 
                 shadow-none sm:shadow-2xl border-none sm:border
                 flex flex-col overflow-hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      data-testid="chatbot-container"
    >
      {/* Header - Estilo WhatsApp */}
      <div className="bg-[#075e54] dark:bg-[#202c33] p-3 sm:p-4 flex items-center justify-between text-white flex-shrink-0 relative z-[10001]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 relative">
            <Lottie 
              animationData={robotWaving} 
              loop={true}
              className="w-full h-full rounded-full"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#075e54] dark:border-[#202c33]"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-white truncate">HumaniQ</h3>
            <p className="text-xs text-green-300">online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(true)}
            data-testid="button-minimize-chat"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Minimizar"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            data-testid="button-close-chat"
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area - Estilo WhatsApp */}
      <div className="flex-1 overflow-y-auto bg-[#ece5dd] dark:bg-[#0b141a] relative">
        {/* Fundo com padrão WhatsApp */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="whatsapp-bg" x="0" y="0" width="400" height="400" patternUnits="userSpaceOnUse">
                <rect width="400" height="400" fill="#e5ddd5"/>
                <circle cx="50" cy="50" r="50" fill="#d4ccc4" opacity="0.5"/>
                <circle cx="250" cy="150" r="70" fill="#d4ccc4" opacity="0.5"/>
                <circle cx="350" cy="350" r="40" fill="#d4ccc4" opacity="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#whatsapp-bg)"/>
          </svg>
        </div>
        
        <div className="relative z-10 p-3 sm:p-4 space-y-1">
          {groupMessagesByDate(messages).map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1">
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-[rgba(255,255,255,0.6)] dark:bg-[rgba(42,57,66,0.8)] px-4 py-1 rounded-full">
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{group.date}</span>
                </div>
              </div>
              
              {group.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${message.role}-${index}`}
                >
                  <div className={`max-w-[70%] sm:max-w-[65%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`
                      relative px-3 py-2 rounded-lg shadow-sm
                      ${message.role === 'user' 
                        ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-slate-900 dark:text-white rounded-tr-none' 
                        : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-white rounded-tl-none'
                      }
                    `}>
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <div className={`flex items-center gap-1 mt-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.role === 'user' && (
                          <svg width="16" height="16" viewBox="0 0 16 16" className="text-blue-500">
                            <path fill="currentColor" d="M8 0L10.5 3L16 5L13 8L16 11L10.5 13L8 16L5.5 13L0 11L3 8L0 5L5.5 3L8 0Z"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-2 justify-start">
              <div className="max-w-[65%]">
                <div className="bg-white dark:bg-[#202c33] px-3 py-2 rounded-lg rounded-tl-none shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                    <span className="text-xs text-slate-500">digitando</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Estilo WhatsApp */}
      <div className="bg-white dark:bg-[#202c33] p-3 flex items-center gap-2 border-t border-slate-200 dark:border-slate-700">
        <div className="relative">
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 bg-white dark:bg-[#2a3942] rounded-lg shadow-lg p-3 grid grid-cols-4 gap-2 z-50">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => addEmoji(emoji)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <Paperclip className="w-5 h-5" />
        </button>
        
        <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
          <Camera className="w-5 h-5" />
        </button>
        
        <div className="flex-1 relative">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite uma mensagem"
            disabled={isLoading}
            data-testid="input-chat-message"
            className="w-full rounded-full bg-slate-100 dark:bg-[#2a3942] border-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 text-sm px-4 py-2"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e as any);
              }
            }}
          />
        </div>
        
        {inputMessage.trim() ? (
          <Button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            data-testid="button-send-message"
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition-colors"
            onClick={sendMessage}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        ) : (
          <Button
            type="button"
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 transition-colors"
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
