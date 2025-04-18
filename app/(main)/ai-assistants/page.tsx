"use client"; 
import { Button } from '@/components/ui/button';
import AiAssistantList from '@/services/AiAssistantList';
import React, { useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { BlurFade } from '@/components/magicui/blur-fade';
import { useConvex, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AuthContext } from '@/context/AuthContext';
import { Id } from '@/convex/_generated/dataModel';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type ASSISTANT = {
  id: number;
  name: string;
  title: string;
  image: string;
  instruction: string;
  userInstruction: string;
  sampleQuestions: string[];
  aiModelId?: string;
}

function AIAssistants() {
  const router = useRouter();
  const [selectedAssistant, setSelectedAssistant] = useState<ASSISTANT[]>([]);
  const insertAssistant = useMutation(api.userAiAssistant.InsertSelectedAssistants);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const convex = useConvex();

  useEffect(() => {
    if (user) {
      GetUserAssistants();
    }
  }, [user]);

  const GetUserAssistants = async () => {
    if (!user) return;
    try {
      const result = await convex.query(api.userAiAssistant.GetAllUserAssistants, {
        uid: user._id
      });
      
      if (result.length > 0) {
        router.replace('/workspace');
      }
    } catch (error) {
      console.error("Error fetching user assistants:", error);
    }
  }

  const onSelect = (assistant: ASSISTANT) => {
    const item = selectedAssistant.find((item: ASSISTANT) => item.id === assistant.id);
    if (item) {
      setSelectedAssistant(selectedAssistant.filter((item: ASSISTANT) => item.id !== assistant.id));
    } else {
      setSelectedAssistant(prev => [...prev, assistant]);
    }
  }

  const isAssistantSelected = (assistant: ASSISTANT) => {
    return selectedAssistant.some((item: ASSISTANT) => item.id === assistant.id);
  }

  const OnClickContinue = async () => {
    if (!user || !user._id) {
      console.error("User is not logged in or missing ID");
      return;
    }

    try {
      setLoading(true);
      
      await insertAssistant({
        records: selectedAssistant,
        uid: user._id as Id<"users">
      });
      
      // Navigate to workspace after successful insertion
      router.push('/workspace');
    } catch (error) {
      console.error("Error inserting assistants:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col w-full min-h-screen pb-20">
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 mt-8 md:mt-16 w-full">
        <div className="flex flex-col space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-center sm:text-left">Welcome to the world of AI Assistants</h2>
            <p className="text-lg mt-2 text-center sm:text-left">Choose your AI companion to simplify your tasks</p>
          </div>
          
          <div className="flex justify-center sm:justify-start mt-4 mb-6">
            <Button 
              disabled={selectedAssistant.length === 0 || loading} 
              onClick={OnClickContinue}
              className="w-full sm:w-auto"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 pb-10 overflow-y-auto">
        {AiAssistantList.map((assistant, index) => (
          <BlurFade key={assistant.id} delay={0.25 + index * 0.05} inView>
            <div 
              className="border border-transparent hover:border-gray-300 dark:hover:border-gray-600 p-2 sm:p-3 rounded-xl hover:scale-105 transition-all duration-300 ease-in-out cursor-pointer relative"
              onClick={() => onSelect(assistant)}
              aria-label={`Select ${assistant.name}`}
            >
              <Checkbox 
                className="absolute top-3 left-3 z-10" 
                checked={isAssistantSelected(assistant)}
              />
              <Image 
                src={assistant.image} 
                alt={assistant.title} 
                width={500} 
                height={300}
                className="rounded-xl w-full h-[140px] sm:h-[180px] object-cover" 
              />
              <h2 className="text-center font-bold text-base sm:text-lg mt-2">{assistant.name}</h2>
              <h3 className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300">{assistant.title}</h3>
            </div>
          </BlurFade>
        ))}
      </div>

      {/* Fixed button at bottom for mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-10">
        <Button 
          disabled={selectedAssistant.length === 0 || loading} 
          onClick={OnClickContinue}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue with {selectedAssistant.length} assistant{selectedAssistant.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </main>
  );
}

export default AIAssistants;