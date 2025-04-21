"use client"
import { SparklesText } from '@/components/magicui/sparkles-text'
import { AssistantContext } from '@/context/AssistantContext';
import React, { useContext, useState } from 'react'
import { MessageSquare, Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Default suggestions in case the assistant doesn't have any
const DEFAULT_SUGGESTIONS = [
  "How can you help me today?",
  "What can you do?",
  "Tell me about yourself",
  "What are your capabilities?"
];

function EmptyChatState() {
  const { assistant, setAssistant } = useContext(AssistantContext);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Check if assistant exists and has sampleQuestions property
  const suggestions = assistant?.sampleQuestions || DEFAULT_SUGGESTIONS;
  
  // Function to handle clicking on a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    // You may want to implement this function
    // to automatically send the suggestion as a message
    console.log("Selected suggestion:", suggestion);
    // Potential implementation would be to emit an event or use a callback
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
            {assistant?.id ? "How can I Assist You?" : "Select an assistant to begin"}
          </SparklesText>
          
          <p className='text-gray-400 mt-3 text-center max-w-md mx-auto'>
            {assistant?.id ? 
              "Choose from the suggestions below or type your own question" : 
              "Choose an AI assistant from the sidebar to start a conversation"}
          </p>
        </motion.div>
      </div>
      
      <motion.div 
        className='mt-6 w-full max-w-md space-y-3'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {suggestions.map((suggestion: string, index: number) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div
              className={`p-4 text-lg border border-gray-700 rounded-xl cursor-pointer flex items-center justify-between transition-all duration-300 ${
                hoveredIndex === index ? 'bg-gradient-to-r from-indigo-800/40 to-purple-800/40 border-indigo-500/50 shadow-lg shadow-indigo-900/20' : 'hover:bg-gray-800 hover:border-gray-600'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <span className='flex-1'>{suggestion}</span>
              
              <motion.div
                animate={{ 
                  scale: hoveredIndex === index ? 1.1 : 1,
                  x: hoveredIndex === index ? 2 : 0
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Send className={`w-5 h-5 transition-colors ${
                  hoveredIndex === index ? 'text-indigo-400' : 'text-gray-400'
                }`} />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default EmptyChatState