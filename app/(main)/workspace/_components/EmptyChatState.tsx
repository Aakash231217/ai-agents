"use client"
import { SparklesText } from '@/components/magicui/sparkles-text'
import { AssistantContext } from '@/context/AssistantContext';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import React, { useContext, useState, useEffect } from 'react'
import { MessageSquare, Search, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BlurFade } from '@/components/magicui/blur-fade';
import Image from 'next/image';
import { AuthContext } from '@/context/AuthContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Define Assistant type
type ASSISTANT = {
    _id: string;
    id: number;
    name: string;
    title: string;
    image: string;
    instruction: string;
    userInstruction: string;
    aiModelId?: string;
};

// Default image for assistants without one
const DEFAULT_ASSISTANT_IMAGE = '/bug-fixer.avif';

// Beta Disclaimer Component
function BetaDisclaimer() {
  return (
    <Alert variant="destructive" className="mb-4 sm:mb-6 bg-amber-100 dark:bg-amber-900/30 border-amber-500 text-amber-800 dark:text-amber-300">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="text-sm sm:text-base">Beta Feature Notice</AlertTitle>
      <AlertDescription className="text-xs sm:text-sm">
        Our speaking-assistant is currently in beta phase and won't be able to read larger articles.
      </AlertDescription>
    </Alert>
  );
}

function EmptyChatState() {
  const { assistant, setAssistant } = useContext(AssistantContext);
  const { user } = useContext(AuthContext);
  const convex = useConvex();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [assistantList, setAssistantList] = useState<ASSISTANT[]>([]);
  const [filteredList, setFilteredList] = useState<ASSISTANT[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch assistants when component mounts or user changes
  useEffect(() => {
    user && GetUserAssistants();
  }, [user]);
  
  // Filter assistants when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredList(assistantList);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredList(
        assistantList.filter(
          (item) => 
            item.name.toLowerCase().includes(query) || 
            item.title.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, assistantList]);
  
  // Fetch assistants from Convex
  const GetUserAssistants = async () => {
    if (!user) return;
    try {
      const result = await convex.query(api.userAiAssistant.GetAllUserAssistants, {
        uid: user._id
      });
      
      // Process and deduplicate assistants
      const processedAssistants = result.map((item: any) => ({
        _id: item._id,
        id: item.id,
        name: item.name,
        title: item.title,
        image: item.image || item.logo || DEFAULT_ASSISTANT_IMAGE,
        instruction: item.instruction,
        userInstruction: item.userInstruction || "",
        aiModelId: item.aiModelId || "OpenAI",
      }));
      
      // Deduplicate by name
      const uniqueAssistants = processedAssistants.reduce((acc: ASSISTANT[], current: ASSISTANT) => {
        const existingIndex = acc.findIndex(item => item.name === current.name);
        if (existingIndex === -1) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      setAssistantList(uniqueAssistants);
      setFilteredList(uniqueAssistants);
    } catch (error) {
      console.error("Error fetching assistants:", error);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-3 sm:px-4 lg:px-6 max-w-full'>
      {/* Beta Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xs sm:max-w-md lg:max-w-lg"
      >
        <BetaDisclaimer />
      </motion.div>
      
      <div className='mb-6 sm:mb-8 relative w-full max-w-xs sm:max-w-md lg:max-w-lg'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='absolute -top-12 sm:-top-16 left-1/2 transform -translate-x-1/2'
        >
          {assistant?.id ? (
            <div className='p-2 sm:p-3 bg-indigo-600 rounded-full shadow-lg'>
              <Sparkles className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
            </div>
          ) : (
            <div className='p-2 sm:p-3 bg-gray-600 rounded-full shadow-lg'>
              <MessageSquare className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <SparklesText className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 leading-tight'>
            {assistant?.id ? "How can I Assist You?" : "Choose Your Assistant"}
          </SparklesText>
          
          <p className='text-gray-400 mt-2 sm:mt-3 text-sm sm:text-base max-w-xs sm:max-w-md mx-auto px-2'>
            {assistant?.id ? 
              "Type your question to begin the conversation" : 
              "Select one of your AI assistants below to start chatting"}
          </p>
        </motion.div>
      </div>
      
      {!assistant?.id && (
        <motion.div 
          className='mt-4 sm:mt-6 w-full max-w-xs sm:max-w-md lg:max-w-lg'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search box for assistants */}
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              className='bg-white dark:bg-gray-800 pl-10 pr-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-700 rounded-xl text-sm sm:text-base w-full' 
              placeholder='Search Assistant' 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Assistant list */}
          <ScrollArea className="h-[40vh] sm:h-[45vh] lg:h-[50vh] pr-2 -mr-2">
            {filteredList.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm sm:text-base">
                {searchQuery ? 'No assistants match your search' : 'No assistants yet'}
              </div>
            ) : (
              <div className='space-y-2 sm:space-y-3'>
                {filteredList.map((assistant_, index) => (
                  <BlurFade key={assistant_._id || index} delay={0.25 + index * 0.05} inView>
                    <motion.div
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={`p-2 sm:p-3 flex gap-2 sm:gap-3 items-center rounded-xl cursor-pointer transition-all duration-300 ${
                        hoveredIndex === index ? 
                          'bg-gradient-to-r from-indigo-800/40 to-purple-800/40 border border-indigo-500/50 shadow-lg shadow-indigo-900/20' : 
                          'hover:bg-gray-200 dark:hover:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                      onClick={() => {
                        console.log("Setting assistant:", assistant_);
                        setAssistant(assistant_);
                      }}
                    >
                      <div className="flex-shrink-0">
                        <Image
                          src={assistant_.image}
                          alt={assistant_.name}
                          width={50}
                          height={50}
                          className='rounded-lg w-10 h-10 sm:w-12 sm:h-12 lg:w-[60px] lg:h-[60px] object-cover'
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className='font-bold text-sm sm:text-base truncate'>{assistant_.name}</h2>
                        <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 sm:line-clamp-1'>{assistant_.title}</p>
                      </div>
                    </motion.div>
                  </BlurFade>
                ))}
              </div>
            )}
          </ScrollArea>
        </motion.div>
      )}
    </div>
  );
}

export default EmptyChatState;
"use client"
import { SparklesText } from '@/components/magicui/sparkles-text'
import { AssistantContext } from '@/context/AssistantContext';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import React, { useContext, useState, useEffect } from 'react'
import { MessageSquare, Search, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BlurFade } from '@/components/magicui/blur-fade';
import Image from 'next/image';
import { AuthContext } from '@/context/AuthContext';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Define Assistant type
type ASSISTANT = {
    _id: string;
    id: number;
    name: string;
    title: string;
    image: string;
    instruction: string;
    userInstruction: string;
    aiModelId?: string;
};

// Default image for assistants without one
const DEFAULT_ASSISTANT_IMAGE = '/bug-fixer.avif';

// Beta Disclaimer Component
function BetaDisclaimer() {
  return (
    <Alert variant="destructive" className="mb-4 sm:mb-6 bg-amber-100 dark:bg-amber-900/30 border-amber-500 text-amber-800 dark:text-amber-300">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="text-sm sm:text-base">Beta Feature Notice</AlertTitle>
      <AlertDescription className="text-xs sm:text-sm">
        Our speaking-assistant is currently in beta phase and won't be able to read larger articles.
      </AlertDescription>
    </Alert>
  );
}

function EmptyChatState() {
  const { assistant, setAssistant } = useContext(AssistantContext);
  const { user } = useContext(AuthContext);
  const convex = useConvex();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [assistantList, setAssistantList] = useState<ASSISTANT[]>([]);
  const [filteredList, setFilteredList] = useState<ASSISTANT[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch assistants when component mounts or user changes
  useEffect(() => {
    user && GetUserAssistants();
  }, [user]);
  
  // Filter assistants when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredList(assistantList);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredList(
        assistantList.filter(
          (item) => 
            item.name.toLowerCase().includes(query) || 
            item.title.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, assistantList]);
  
  // Fetch assistants from Convex
  const GetUserAssistants = async () => {
    if (!user) return;
    try {
      const result = await convex.query(api.userAiAssistant.GetAllUserAssistants, {
        uid: user._id
      });
      
      // Process and deduplicate assistants
      const processedAssistants = result.map((item: any) => ({
        _id: item._id,
        id: item.id,
        name: item.name,
        title: item.title,
        image: item.image || item.logo || DEFAULT_ASSISTANT_IMAGE,
        instruction: item.instruction,
        userInstruction: item.userInstruction || "",
        aiModelId: item.aiModelId || "OpenAI",
      }));
      
      // Deduplicate by name
      const uniqueAssistants = processedAssistants.reduce((acc: ASSISTANT[], current: ASSISTANT) => {
        const existingIndex = acc.findIndex(item => item.name === current.name);
        if (existingIndex === -1) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      setAssistantList(uniqueAssistants);
      setFilteredList(uniqueAssistants);
    } catch (error) {
      console.error("Error fetching assistants:", error);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6 lg:px-8'>
      {/* Beta Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm sm:max-w-md lg:max-w-lg"
      >
        <BetaDisclaimer />
      </motion.div>
      
      <div className='mb-6 sm:mb-8 relative'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='absolute -top-12 sm:-top-16 left-1/2 transform -translate-x-1/2'
        >
          {assistant?.id ? (
            <div className='p-2 sm:p-3 bg-indigo-600 rounded-full shadow-lg'>
              <Sparkles className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
            </div>
          ) : (
            <div className='p-2 sm:p-3 bg-gray-600 rounded-full shadow-lg'>
              <MessageSquare className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <SparklesText className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 px-2'>
            {assistant?.id ? "How can I Assist You?" : "Choose Your Assistant"}
          </SparklesText>
          
          <p className='text-gray-400 mt-2 sm:mt-3 text-center max-w-xs sm:max-w-md mx-auto text-sm sm:text-base px-2'>
            {assistant?.id ? 
              "Type your question to begin the conversation" : 
              "Select one of your AI assistants below to start chatting"}
          </p>
        </motion.div>
      </div>
      
      {!assistant?.id && (
        <motion.div 
          className='mt-4 sm:mt-6 w-full max-w-sm sm:max-w-md lg:max-w-lg'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search box for assistants */}
          <div className="relative mb-3 sm:mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              className='bg-white dark:bg-gray-800 pl-10 border border-gray-300 dark:border-gray-700 rounded-xl text-sm sm:text-base' 
              placeholder='Search Assistant' 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Assistant list */}
          <ScrollArea className="h-[40vh] sm:h-[45vh] lg:h-[50vh] pr-2 -mr-2">
            {filteredList.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm sm:text-base">
                {searchQuery ? 'No assistants match your search' : 'No assistants yet'}
              </div>
            ) : (
              <div className='space-y-2 sm:space-y-3'>
                {filteredList.map((assistant_, index) => (
                  <BlurFade key={assistant_._id || index} delay={0.25 + index * 0.05} inView>
                    <motion.div
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={`p-2 sm:p-3 flex gap-2 sm:gap-3 items-center rounded-xl cursor-pointer transition-all duration-300 ${
                        hoveredIndex === index ? 
                          'bg-gradient-to-r from-indigo-800/40 to-purple-800/40 border border-indigo-500/50 shadow-lg shadow-indigo-900/20' : 
                          'hover:bg-gray-200 dark:hover:bg-gray-800 border border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                      onClick={() => {
                        console.log("Setting assistant:", assistant_);
                        setAssistant(assistant_);
                      }}
                    >
                      <Image
                        src={assistant_.image}
                        alt={assistant_.name}
                        width={50}
                        height={50}
                        className='rounded-lg w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] lg:w-[60px] lg:h-[60px] object-cover flex-shrink-0'
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className='font-bold text-sm sm:text-base truncate'>{assistant_.name}</h2>
                        <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2'>{assistant_.title}</p>
                      </div>
                    </motion.div>
                  </BlurFade>
                ))}
              </div>
            )}
          </ScrollArea>
        </motion.div>
      )}
    </div>
  );
}

export default EmptyChatState;