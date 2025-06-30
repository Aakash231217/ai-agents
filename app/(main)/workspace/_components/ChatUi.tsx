"use client"
import React, { useContext, useEffect, useRef, useState } from 'react'
import EmptyChatState from './EmptyChatState'
import { AssistantContext } from '@/context/AssistantContext';
import { Input } from '@/components/ui/input';
import { Loader2Icon, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Assistant {
    instruction: string;
    id: string;
    image: any;
    userInstruction: string;
    aiModelId: 1 | 2 | 3 ;
}

type MESSAGE = {
    role: string,
    content: string,
};

const VOICE_OPTIONS = {
  male: [
    { name: "Alex", pitch: 0.8, rate: 1.0 },
    { name: "Archiee", pitch: 0.7, rate: 0.9 },
    { name: "Levi", pitch: 0.6, rate: 0.95 },
    { name: "Harmozi", pitch: 0.5, rate: 0.93 }

  ],
  female: [
    { name: "Lisa", pitch: 1.2, rate: 1.0 },
    { name: "Mahira", pitch: 1.3, rate: 1.05 },
    { name: "Heena", pitch: 1.1, rate: 0.95 },
    { name: "Shalini", pitch: 1.4, rate: 1.03 }

  ]
};

const getStoredMessages = (assistantId: string): MESSAGE[] => {
    if (!assistantId) return [];
    
    const key = `assistant-${assistantId}`;
    const storedData = localStorage.getItem(key);
    
    if (storedData) {
      try {
        const { messages, timestamp } = JSON.parse(storedData);
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        
        if (Date.now() - timestamp < threeDays) {
          return messages;
        }
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error parsing stored messages:', e);
      }
    }
    return [];
};
  
const storeMessages = (assistantId: string, messages: MESSAGE[]) => {
    if (!assistantId) return;
    
    const key = `assistant-${assistantId}`;
    const data = {
      messages,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
};

const DEFAULT_ASSISTANT_IMAGE = '/bug-fixer.avif';

function ChatUi() {
    const [input, setInput] = useState<string>('');
    const { assistant } = useContext(AssistantContext);
    const [messages, setMessages] = useState<MESSAGE[]>([]);
    const [loading, setLoading] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    
    // Speech state management
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');
    const [selectedVoice, setSelectedVoice] = useState<any>(null);
    const [autoSpeak, setAutoSpeak] = useState(true);
    const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            
            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result) => result.transcript)
                    .join('');
                setInput(transcript);
            };
            
            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event);
                setIsListening(false);
            };
        }

        selectRandomVoice(voiceGender);
        
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    useEffect(() => {
        selectRandomVoice(voiceGender);
    }, [voiceGender]);

    useEffect(() => {
        if (assistant?.id) {
            const storedMessages = getStoredMessages(assistant.id);
            setMessages(storedMessages);
        } else {
            setMessages([]);
        }
    }, [assistant?.id]);

    useEffect(() => {
        if (assistant?.id && messages.length > 0) {
            storeMessages(assistant.id, messages);
        }
    }, [messages, assistant?.id]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);
    
    const selectRandomVoice = (gender: 'male' | 'female') => {
        const voices = VOICE_OPTIONS[gender];
        const randomIndex = Math.floor(Math.random() * voices.length);
        setSelectedVoice(voices[randomIndex]);
    };
    
    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition not supported");
            return;
        }
        
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };
    
    const speakText = (text: string) => {
        if (!window.speechSynthesis) return;
        
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const cleanText = text
            .replace(/```[\s\S]*?```/g, "Code block removed for speech.")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/\*\*([^*]+)\*\*/g, "$1")
            .replace(/\*([^*]+)\*/g, "$1")
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{2100}-\u{214F}]/gu, "");

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = selectedVoice.rate;
        utterance.pitch = selectedVoice.pitch;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentUtterance(null);
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setCurrentUtterance(null);
        };

        setCurrentUtterance(utterance);
        window.speechSynthesis.speak(utterance);
    };
    
    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setCurrentUtterance(null);
        }
    };

    const onSendMessage = async () => {
        if (!input.trim() || loading || !assistant) return;
        
        const userInput = input.trim();
        setInput('');
        setLoading(true);
        
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }

        const newMessages = [
            ...messages,
            { role: 'user', content: userInput },
            { role: 'assistant', content: 'Loading...' }
        ];
        setMessages(newMessages);

        try {
            // Handle both numeric IDs and string model names
            let provider = "openai"; // Default provider
            
            if (typeof assistant.aiModelId === 'number') {
                // Handle numeric model ID (1-5)
                const providerMap = { 1: "openai", 2: "claude", 3: "gemini"};
                provider = providerMap[assistant.aiModelId as keyof typeof providerMap] || "openai";
            }

            const response = await axios.post('/api/chat', {
                messages: [...messages, { role: 'user', content: userInput }],
                instruction: assistant.instruction,
                userInstruction: assistant.userInstruction,
                provider: provider
            });

            const assistantMessage = response.data.message;
            
            const finalMessages = [
                ...messages,
                { role: 'user', content: userInput },
                { role: 'assistant', content: assistantMessage }
            ];
            
            setMessages(finalMessages);
            
            if (autoSpeak && assistantMessage) {
                setTimeout(() => {
                    speakText(assistantMessage);
                }, 100);
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessages = [
                ...messages,
                { role: 'user', content: userInput },
                { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
            ];
            setMessages(errorMessages);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    if (!assistant) {
        return <EmptyChatState />;
    }

    return (
        <div className="chat-container flex flex-col h-full max-h-screen">
            {/* Header - responsive */}
            <div className="chat-header flex items-center gap-3 p-3 sm:p-4 border-b bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Image 
                        src={assistant.image || DEFAULT_ASSISTANT_IMAGE} 
                        alt="Assistant" 
                        width={32} 
                        height={32} 
                        className="rounded-full flex-shrink-0 sm:w-10 sm:h-10" 
                    />
                    <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm sm:text-base truncate">AI Assistant</h3>
                        <p className="text-xs text-gray-500 hidden sm:block">Online</p>
                    </div>
                </div>
                
                {/* Voice controls - responsive */}
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Select value={voiceGender} onValueChange={(value: 'male' | 'female') => setVoiceGender(value)}>
                        <SelectTrigger className="w-16 sm:w-20 h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAutoSpeak(!autoSpeak)}
                        className={`h-8 w-8 p-0 ${autoSpeak ? 'text-blue-600' : 'text-gray-400'}`}
                        title={autoSpeak ? 'Auto-speak enabled' : 'Auto-speak disabled'}
                    >
                        {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </Button>
                    
                    {isSpeaking && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={stopSpeaking}
                            className="h-8 w-8 p-0 text-red-600"
                            title="Stop speaking"
                        >
                            <VolumeX size={16} />
                        </Button>
                    )}
                </div>
            </div>

            {/* Messages area - responsive */}
            <div 
                ref={chatRef}
                className="chat-messages flex-1 overflow-y-auto p-3 sm:p-4 space-y-4"
                style={{ maxHeight: 'calc(100vh - 140px)' }}
            >
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <p className="text-sm sm:text-base">Start a conversation with your AI assistant</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-3 ${
                                message.role === 'user' 
                                    ? 'bg-blue-600 text-white ml-auto' 
                                    : 'bg-gray-100 text-gray-900'
                            }`}>
                                {message.role === 'assistant' ? (
                                    <div className="prose prose-sm sm:prose max-w-none">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeHighlight]}
                                            components={{
                                                code: ({node, inline, className, children, ...props}) => {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !inline && match ? (
                                                        <pre className="bg-gray-900 text-gray-100 p-2 sm:p-3 rounded text-xs sm:text-sm overflow-x-auto">
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        </pre>
                                                    ) : (
                                                        <code className="bg-gray-200 px-1 py-0.5 rounded text-xs sm:text-sm" {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                p: ({children}) => <p className="text-sm sm:text-base mb-2 last:mb-0">{children}</p>,
                                                h1: ({children}) => <h1 className="text-lg sm:text-xl font-bold mb-2">{children}</h1>,
                                                h2: ({children}) => <h2 className="text-base sm:text-lg font-bold mb-2">{children}</h2>,
                                                h3: ({children}) => <h3 className="text-sm sm:text-base font-bold mb-2">{children}</h3>,
                                                ul: ({children}) => <ul className="list-disc pl-4 mb-2 text-sm sm:text-base">{children}</ul>,
                                                ol: ({children}) => <ol className="list-decimal pl-4 mb-2 text-sm sm:text-base">{children}</ol>,
                                                li: ({children}) => <li className="mb-1">{children}</li>,
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <p className="text-sm sm:text-base">{message.content}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
                
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                            <Loader2Icon className="animate-spin" size={16} />
                            <span className="text-sm text-gray-600">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input area - responsive */}
            <div className="chat-input border-t bg-white p-3 sm:p-4">
                <div className="flex gap-2 items-end">
                    <div className="flex-1 relative">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            disabled={loading}
                            className="pr-10 text-sm sm:text-base min-h-[40px] sm:min-h-[44px] resize-none"
                            style={{ paddingRight: '40px' }}
                        />
                        
                        {/* Voice input button - positioned inside input on mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleListening}
                            disabled={loading}
                            className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                                isListening ? 'text-red-600 animate-pulse' : 'text-gray-400 hover:text-gray-600'
                            }`}
                            title={isListening ? 'Stop listening' : 'Start voice input'}
                        >
                            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                        </Button>
                    </div>
                    
                    <Button 
                        onClick={onSendMessage} 
                        disabled={loading || !input.trim()}
                        size="sm"
                        className="h-10 w-10 sm:h-11 sm:w-11 p-0 flex-shrink-0"
                    >
                        {loading ? (
                            <Loader2Icon className="animate-spin" size={16} />
                        ) : (
                            <Send size={16} />
                        )}
                    </Button>
                </div>
                
                {/* Status indicators - mobile friendly */}
                {(isListening || isSpeaking) && (
                    <div className="flex gap-2 mt-2 text-xs text-gray-500">
                        {isListening && (
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                Listening...
                            </span>
                        )}
                        {isSpeaking && (
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                Speaking...
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatUi;
"use client"
import React, { useContext, useEffect, useRef, useState } from 'react'
import EmptyChatState from './EmptyChatState'
import { AssistantContext } from '@/context/AssistantContext';
import { Input } from '@/components/ui/input';
import { Loader2Icon, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Assistant {
    instruction: string;
    id: string;
    image: any;
    userInstruction: string;
    aiModelId: 1 | 2 | 3 ;
}

type MESSAGE = {
    role: string,
    content: string,
};

const VOICE_OPTIONS = {
  male: [
    { name: "Alex", pitch: 0.8, rate: 1.0 },
    { name: "Archiee", pitch: 0.7, rate: 0.9 },
    { name: "Levi", pitch: 0.6, rate: 0.95 },
    { name: "Harmozi", pitch: 0.5, rate: 0.93 }

  ],
  female: [
    { name: "Lisa", pitch: 1.2, rate: 1.0 },
    { name: "Mahira", pitch: 1.3, rate: 1.05 },
    { name: "Heena", pitch: 1.1, rate: 0.95 },
    { name: "Shalini", pitch: 1.4, rate: 1.03 }

  ]
};

const getStoredMessages = (assistantId: string): MESSAGE[] => {
    if (!assistantId) return [];
    
    const key = `assistant-${assistantId}`;
    const storedData = localStorage.getItem(key);
    
    if (storedData) {
      try {
        const { messages, timestamp } = JSON.parse(storedData);
        const threeDays = 3 * 24 * 60 * 60 * 1000;
        
        if (Date.now() - timestamp < threeDays) {
          return messages;
        }
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Error parsing stored messages:', e);
      }
    }
    return [];
};
  
const storeMessages = (assistantId: string, messages: MESSAGE[]) => {
    if (!assistantId) return;
    
    const key = `assistant-${assistantId}`;
    const data = {
      messages,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(data));
};

const DEFAULT_ASSISTANT_IMAGE = '/bug-fixer.avif';

function ChatUi() {
    const [input, setInput] = useState<string>('');
    const { assistant } = useContext(AssistantContext);
    const [messages, setMessages] = useState<MESSAGE[]>([]);
    const [loading, setLoading] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    
    // Speech state management
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');
    const [selectedVoice, setSelectedVoice] = useState<any>(null);
    const [autoSpeak, setAutoSpeak] = useState(true);
    const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            
            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result) => result.transcript)
                    .join('');
                setInput(transcript);
            };
            
            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error', event);
                setIsListening(false);
            };
        }

        selectRandomVoice(voiceGender);
        
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    useEffect(() => {
        selectRandomVoice(voiceGender);
    }, [voiceGender]);

    useEffect(() => {
        if (assistant?.id) {
            const storedMessages = getStoredMessages(assistant.id);
            setMessages(storedMessages);
        } else {
            setMessages([]);
        }
    }, [assistant?.id]);

    useEffect(() => {
        if (assistant?.id && messages.length > 0) {
            storeMessages(assistant.id, messages);
        }
    }, [messages, assistant?.id]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);
    
    const selectRandomVoice = (gender: 'male' | 'female') => {
        const voices = VOICE_OPTIONS[gender];
        const randomIndex = Math.floor(Math.random() * voices.length);
        setSelectedVoice(voices[randomIndex]);
    };
    
    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition not supported");
            return;
        }
        
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };
    
    const speakText = (text: string) => {
        if (!window.speechSynthesis) return;
        
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const cleanText = text
            .replace(/```[\s\S]*?```/g, "Code block removed for speech.")
            .replace(/`([^`]+)`/g, "$1")
            .replace(/\*\*([^*]+)\*\*/g, "$1")
            .replace(/\*([^*]+)\*/g, "$1")
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
            .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F2FF}\u{2100}-\u{214F}]/gu, "");

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = selectedVoice.rate;
        utterance.pitch = selectedVoice.pitch;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentUtterance(null);
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setCurrentUtterance(null);
        };

        setCurrentUtterance(utterance);
        window.speechSynthesis.speak(utterance);
    };
    
    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setCurrentUtterance(null);
        }
    };

    const onSendMessage = async () => {
        if (!input.trim() || loading || !assistant) return;
        
        const userInput = input.trim();
        setInput('');
        setLoading(true);
        
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }

        const newMessages = [
            ...messages,
            { role: 'user', content: userInput },
            { role: 'assistant', content: 'Loading...' }
        ];
        setMessages(newMessages);

        try {
            // Handle both numeric IDs and string model names
            let provider = "openai"; // Default provider
            
            if (typeof assistant.aiModelId === 'number') {
                // Handle numeric model ID (1-5)
                const providerMap = { 1: "openai", 2: "claude", 3: "gemini"};
                provider = providerMap[assistant.aiModelId as keyof typeof providerMap] || "openai";
            }

            const response = await axios.post('/api/chat', {
                messages: [...messages, { role: 'user', content: userInput }],
                instruction: assistant.instruction,
                userInstruction: assistant.userInstruction,
                provider: provider
            });

            const assistantMessage = response.data.message;
            
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantMessage };
                return updated;
            });

            if (autoSpeak && assistantMessage) {
                setTimeout(() => speakText(assistantMessage), 500);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
                return updated;
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    if (!assistant) {
        return <EmptyChatState />;
    }

    return (
        <div className="chat-container">
            {/* Voice Controls - Mobile Optimized */}
            <div className="voice-controls">
                <div className="voice-controls-row">
                    <Select value={voiceGender} onValueChange={(value: 'male' | 'female') => setVoiceGender(value)}>
                        <SelectTrigger className="voice-select">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male Voice</SelectItem>
                            <SelectItem value="female">Female Voice</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoSpeak(!autoSpeak)}
                        className={`auto-speak-btn ${autoSpeak ? 'active' : ''}`}
                    >
                        {autoSpeak ? <Volume2 className="icon" /> : <VolumeX className="icon" />}
                        <span className="btn-text">Auto</span>
                    </Button>
                    
                    {isSpeaking && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={stopSpeaking}
                            className="stop-speaking-btn"
                        >
                            <VolumeX className="icon" />
                            <span className="btn-text">Stop</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Chat Messages */}
            <div ref={chatRef} className="chat-messages">
                {messages.length === 0 ? (
                    <div className="welcome-message">
                        <Image
                            src={assistant.image || DEFAULT_ASSISTANT_IMAGE}
                            alt="Assistant"
                            width={80}
                            height={80}
                            className="assistant-avatar"
                        />
                        <h3>Chat with {assistant.instruction.split(' ')[0] || 'Assistant'}</h3>
                        <p>Start a conversation by typing a message below.</p>
                    </div>
                ) : (
                    messages.map((message, index) => (
                        <div key={index} className={`message ${message.role}`}>
                            {message.role === 'assistant' && (
                                <Image
                                    src={assistant.image || DEFAULT_ASSISTANT_IMAGE}
                                    alt="Assistant"
                                    width={32}
                                    height={32}
                                    className="message-avatar"
                                />
                            )}
                            <div className="message-content">
                                {message.role === 'assistant' ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeHighlight]}
                                        className="markdown-content"
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                ) : (
                                    <p>{message.content}</p>
                                )}
                            </div>
                            {message.role === 'assistant' && message.content !== 'Loading...' && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => speakText(message.content)}
                                    className="speak-btn"
                                >
                                    <Volume2 className="icon" />
                                </Button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Input Area - Sticky Bottom */}
            <div className="chat-input-container">
                <div className="input-row">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleListening}
                        className={`mic-btn ${isListening ? 'listening' : ''}`}
                        disabled={loading}
                    >
                        {isListening ? <MicOff className="icon" /> : <Mic className="icon" />}
                    </Button>
                    
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={loading}
                        className="message-input"
                    />
                    
                    <Button
                        onClick={onSendMessage}
                        disabled={!input.trim() || loading}
                        size="sm"
                        className="send-btn"
                    >
                        {loading ? <Loader2Icon className="icon animate-spin" /> : <Send className="icon" />}
                    </Button>
                </div>
            </div>

            <style jsx>{`
                .chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    max-height: 100vh;
                    overflow: hidden;
                }

                .voice-controls {
                    padding: 1rem;
                    border-bottom: 1px solid hsl(var(--border));
                    background: hsl(var(--background));
                    flex-shrink: 0;
                }

                .voice-controls-row {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                    flex-wrap: wrap;
                }

                .voice-select {
                    min-width: 120px;
                    flex: 1;
                    max-width: 200px;
                }

                .auto-speak-btn,
                .stop-speaking-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    white-space: nowrap;
                }

                .auto-speak-btn.active {
                    background: hsl(var(--primary));
                    color: hsl(var(--primary-foreground));
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .welcome-message {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    height: 100%;
                    gap: 1rem;
                    color: hsl(var(--muted-foreground));
                }

                .assistant-avatar {
                    border-radius: 50%;
                    object-fit: cover;
                }

                .message {
                    display: flex;
                    gap: 0.75rem;
                    align-items: flex-start;
                    max-width: 100%;
                }

                .message.user {
                    flex-direction: row-reverse;
                    margin-left: 2rem;
                }

                .message.assistant {
                    margin-right: 2rem;
                }

                .message-avatar {
                    border-radius: 50%;
                    object-fit: cover;
                    flex-shrink: 0;
                }

                .message-content {
                    flex: 1;
                    min-width: 0;
                }

                .message.user .message-content {
                    background: hsl(var(--primary));
                    color: hsl(var(--primary-foreground));
                    padding: 0.75rem 1rem;
                    border-radius: 1rem;
                    border-bottom-right-radius: 0.25rem;
                }

                .message.assistant .message-content {
                    background: hsl(var(--muted));
                    padding: 0.75rem 1rem;
                    border-radius: 1rem;
                    border-bottom-left-radius: 0.25rem;
                }

                .markdown-content {
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }

                .markdown-content pre {
                    overflow-x: auto;
                    max-width: 100%;
                }

                .speak-btn {
                    flex-shrink: 0;
                    padding: 0.25rem;
                }

                .chat-input-container {
                    padding: 1rem;
                    border-top: 1px solid hsl(var(--border));
                    background: hsl(var(--background));
                    flex-shrink: 0;
                }

                .input-row {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                .message-input {
                    flex: 1;
                    min-width: 0;
                }

                .mic-btn,
                .send-btn {
                    flex-shrink: 0;
                    padding: 0.5rem;
                }

                .mic-btn.listening {
                    background: hsl(var(--destructive));
                    color: hsl(var(--destructive-foreground));
                }

                .icon {
                    width: 1rem;
                    height: 1rem;
                }

                .btn-text {
                    font-size: 0.75rem;
                }

                /* Mobile Responsive Styles */
                @media (max-width: 768px) {
                    .chat-container {
                        height: 100dvh;
                    }

                    .voice-controls {
                        padding: 0.75rem;
                    }

                    .voice-controls-row {
                        gap: 0.375rem;
                    }

                    .voice-select {
                        min-width: 100px;
                        font-size: 0.875rem;
                    }

                    .btn-text {
                        display: none;
                    }

                    .auto-speak-btn,
                    .stop-speaking-btn {
                        padding: 0.5rem;
                        min-width: 2.5rem;
                    }

                    .chat-messages {
                        padding: 0.75rem;
                        gap: 0.75rem;
                    }

                    .message.user {
                        margin-left: 1rem;
                    }

                    .message.assistant {
                        margin-right: 1rem;
                    }

                    .message-content {
                        font-size: 0.9rem;
                        padding: 0.625rem 0.875rem;
                    }

                    .assistant-avatar {
                        width: 60px;
                        height: 60px;
                    }

                    .message-avatar {
                        width: 28px;
                        height: 28px;
                    }

                    .chat-input-container {
                        padding: 0.75rem;
                    }

                    .input-row {
                        gap: 0.375rem;
                    }

                    .message-input {
                        font-size: 1rem;
                    }

                    .markdown-content pre {
                        font-size: 0.8rem;
                    }
                }

                /* Small Mobile Styles */
                @media (max-width: 480px) {
                    .voice-controls-row {
                        flex-wrap: wrap;
                    }

                    .voice-select {
                        flex: 1;
                        min-width: 80px;
                    }

                    .message.user {
                        margin-left: 0.5rem;
                    }

                    .message.assistant {
                        margin-right: 0.5rem;
                    }

                    .welcome-message h3 {
                        font-size: 1.25rem;
                    }

                    .welcome-message p {
                        font-size: 0.9rem;
                        padding: 0 1rem;
                    }
                }

                /* Large Screen Optimizations */
                @media (min-width: 1024px) {
                    .chat-messages {
                        padding: 2rem;
                    }

                    .message.user {
                        margin-left: 4rem;
                    }

                    .message.assistant {
                        margin-right: 4rem;
                    }

                    .voice-controls {
                        padding: 1.5rem;
                    }

                    .chat-input-container {
                        padding: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
}

export default ChatUi;