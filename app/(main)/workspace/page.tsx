"use client";
import React, { useState } from 'react';
import AssistantList from './_components/AssistantList';
import AssistantSettings from './_components/AssistantSettings';
import ChatUi from './_components/ChatUi';
import { Menu, X, Settings } from 'lucide-react';
import Image from 'next/image';

export default function AiAssistantsPage() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <div className='h-screen w-full flex flex-col bg-black text-white'>
      {/* Mobile Header - Only visible on small screens */}
      <div className='md:hidden flex justify-between items-center p-3 border-b border-gray-800 z-10'>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSidebar(true)} 
            className='p-2 rounded-full hover:bg-gray-800 transition-colors'
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
              <Image 
                src="/logo.svg" 
                alt="Runigene" 
                fill
                className="object-contain"
              />
            </div>
            <span className="font-medium">Runigene</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          
          
          <button 
            onClick={() => setShowSettings(true)} 
            className='p-2 rounded-full hover:bg-gray-800 transition-colors'
            aria-label="Open settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
      
      <div className='flex-1 flex overflow-hidden relative'>
        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setShowSidebar(false)}>
            <div className="absolute top-0 left-0 h-full w-3/4 max-w-xs bg-black" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h2 className="font-bold">Your Personal AI Assistant</h2>
                <button 
                  onClick={() => setShowSidebar(false)} 
                  className="p-1 rounded-full hover:bg-gray-800"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto h-[calc(100%-60px)]">
                <AssistantList />
              </div>
            </div>
          </div>
        )}
        
        {/* Mobile Settings Overlay */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setShowSettings(false)}>
            <div className="absolute top-0 right-0 h-full w-3/4 max-w-xs bg-black" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <h2 className="font-bold">Assistant Settings</h2>
                <button 
                  onClick={() => setShowSettings(false)} 
                  className="p-1 rounded-full hover:bg-gray-800"
                  aria-label="Close settings"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto h-[calc(100%-60px)]">
                <AssistantSettings />
              </div>
            </div>
          </div>
        )}
        
        {/* Left sidebar - Assistant List (Desktop only) */}
        <div className='hidden md:block md:w-1/5 border-r border-gray-800 overflow-y-auto'>
          <AssistantList />
        </div>
        
        {/* Main content - Chat UI */}
        <div className='flex-1 overflow-y-auto'>
          <ChatUi />
        </div>
        
        {/* Right sidebar - Settings (Desktop only) */}
        <div className='hidden lg:block lg:w-1/5 border-l border-gray-800 overflow-y-auto'>
          <AssistantSettings />
        </div>
      </div>
    </div>
  );
}