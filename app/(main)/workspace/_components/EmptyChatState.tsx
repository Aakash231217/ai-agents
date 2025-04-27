"use client"
import { SparklesText } from '@/components/magicui/sparkles-text'
import { AssistantContext } from '@/context/AssistantContext';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import React, { useContext, useState, useEffect } from 'react'
import { MessageSquare, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BlurFade } from '@/components/magicui/blur-fade';
import Image from 'next/image';
import { AuthContext } from '@/context/AuthContext';

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
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-4'>
      <div className='mb-8 relative'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='absolute -top-16 left-1/2 transform -translate-x-1/2'
        >
          {assistant?.id ? (
            <div className='p-3 bg-indigo-600 rounded-full shadow-lg'>
              <Sparkles className='w-8 h-8 text-white' />
            </div>
          ) : (
            <div className='p-3 bg-gray-600 rounded-full shadow-lg'>
              <MessageSquare className='w-8 h-8 text-white' />
            </div>
          )}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <SparklesText className='text-4xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600'>
            {assistant?.id ? "How can I Assist You?" : "Choose Your Assistant"}
          </SparklesText>
          
          <p className='text-gray-400 mt-3 text-center max-w-md mx-auto'>
            {assistant?.id ? 
              "Type your question to begin the conversation" : 
              "Select one of your AI assistants below to start chatting"}
          </p>
        </motion.div>
      </div>
      
      {!assistant?.id && (
        <motion.div 
          className='mt-6 w-full max-w-md'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Search box for assistants */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              className='bg-white dark:bg-gray-800 pl-10 border border-gray-300 dark:border-gray-700 rounded-xl' 
              placeholder='Search Assistant' 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Assistant list */}
          <ScrollArea className="h-[50vh] pr-2 -mr-2">
            {filteredList.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                {searchQuery ? 'No assistants match your search' : 'No assistants yet'}
              </div>
            ) : (
              <div className='space-y-3'>
                {filteredList.map((assistant_, index) => (
                  <BlurFade key={assistant_._id || index} delay={0.25 + index * 0.05} inView>
                    <motion.div
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={`p-3 flex gap-3 items-center rounded-xl cursor-pointer transition-all duration-300 ${
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
                        className='rounded-lg w-[60px] h-[60px] object-cover'
                      />
                      <div className="flex-1">
                        <h2 className='font-bold'>{assistant_.name}</h2>
                        <h2 className='text-gray-500 text-sm dark:text-gray-400'>{assistant_.title}</h2>
                      </div>
                      <motion.div
                        animate={{ 
                          scale: hoveredIndex === index ? 1.1 : 1,
                          x: hoveredIndex === index ? 2 : 0
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Sparkles className={`w-5 h-5 transition-colors ${
                          hoveredIndex === index ? 'text-indigo-400' : 'text-gray-400'
                        }`} />
                      </motion.div>
                    </motion.div>
                  </BlurFade>
                ))}
              </div>
            )}
          </ScrollArea>
        </motion.div>
      )}
    </div>
  )
}

export default EmptyChatState
