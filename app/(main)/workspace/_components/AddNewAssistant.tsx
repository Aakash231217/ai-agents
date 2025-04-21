"use client"
import React, { useContext, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import AiAssistantList from '@/services/AiAssistantList'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { ASSISTANT } from '../../ai-assistants/page'
import { Select } from '@radix-ui/react-select'
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AiModelOptions from '@/services/AiModelOptions'
import { Textarea } from '@/components/ui/textarea'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import AssistantAvatar from './AssistantAvatar'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { AuthContext } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { AssistantContext } from '@/context/AssistantContext'
import { Loader2Icon } from 'lucide-react'

const DEFAULT_ASSISTANT = {
    image: '/bug-fixer.avif',
    name: '',
    title: '',
    instruction: '',
    userInstruction: '',
    id: 0,
    sampleQuestions: [],
    aiModelId: 'OpenAI'
}

function AddNewAssistant({children}: any) {
    const [selectedAssistant, setSelectedAssistant] = useState<ASSISTANT>(DEFAULT_ASSISTANT)
    const AddAssistant = useMutation(api.userAiAssistant.InsertSelectedAssistants)
    const {user} = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const assistantContext = useContext(AssistantContext);
    // Fix: Properly handle context value based on its structure
    const setAssistant = assistantContext ? 
        (Array.isArray(assistantContext) ? assistantContext[1] : assistantContext.setAssistant) : 
        () => {}; 
    
    // Add state to control dialog open/close
    const [isOpen, setIsOpen] = useState(false);

    const onHandleInputChange = (field: string, value: string) => {
        setSelectedAssistant((prev: any) => {
            const updated = {
                ...prev,
                [field]: value
            };
            
            // If updating instruction or userInstruction, keep them in sync
            if (field === 'instruction') {
                updated.userInstruction = value;
            } else if (field === 'userInstruction') {
                updated.instruction = value;
            }
            
            return updated;
        })
    }
    
    const onSave = async () => {
        if (!selectedAssistant?.name || !selectedAssistant?.title || !selectedAssistant?.userInstruction) {
            toast.error('Please fill all the fields');
            return;
        }
        if (!user?._id) {
            toast.error('User not found. Please log in.');
            return;
        }
        
        try {
            setLoading(true);
            
            // Ensure instructions are properly formatted and synchronized
            const assistantToSave = {
                ...selectedAssistant,
                instruction: selectedAssistant.userInstruction, // Synchronize both instruction fields
                userInstruction: selectedAssistant.userInstruction,
            };
            
            const result = await AddAssistant({
                records: [assistantToSave],
                uid: user._id,
            });
            
            toast.success('New Assistant Added');
            setAssistant(null);
            
            // Close the dialog after successful save
            setIsOpen(false);
            
            // Reset to default for next time
            setSelectedAssistant(DEFAULT_ASSISTANT);
        } catch (error) {
            console.error("Error adding assistant:", error);
            toast.error('Failed to add assistant');
        } finally {
            setLoading(false);
        }
    }
    
    // When selecting a prebuilt assistant, ensure instructions are properly loaded
    const handleSelectAssistant = (assistant: ASSISTANT) => {
        // Clone the assistant to avoid reference issues
        const instructionContent = assistant.instruction || assistant.userInstruction || '';
        
        const updatedAssistant = {
            ...assistant,
            // Make sure both instruction fields are synchronized
            instruction: instructionContent,
            userInstruction: instructionContent,
        };
        
        setSelectedAssistant(updatedAssistant);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[600px] w-[95%] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium">Add New Assistant</DialogTitle>
                </DialogHeader>
                
                {/* Responsive grid layout */}
                <div className="flex flex-col md:grid md:grid-cols-5 md:gap-4 gap-6">
                    {/* Assistant list - full width on mobile, sidebar on desktop */}
                    <div className="md:col-span-2 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-4 max-h-[250px] md:max-h-[400px] overflow-y-auto">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            className="w-full mb-4 text-sm"
                            onClick={() => {
                                // Reset to default but ensure both instruction fields are empty
                                setSelectedAssistant({
                                    ...DEFAULT_ASSISTANT,
                                    instruction: '',
                                    userInstruction: '',
                                });
                            }}
                        >
                            + Create New Assistant
                        </Button>
                        
                        <div className="space-y-2">
                            {AiAssistantList.map((assistant, index) => (
                                <div 
                                    key={index} 
                                    className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                                    onClick={() => handleSelectAssistant(assistant)}
                                >
                                    <Image 
                                        src={assistant.image} 
                                        width={32} 
                                        height={32} 
                                        alt={assistant.name}
                                        className="rounded-md object-cover"
                                    />
                                    <div className="text-sm">
                                        {assistant.title}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Assistant details - full width on mobile, right column on desktop */}
                    <div className="md:col-span-3 md:pl-2 flex flex-col items-center justify-start">
                        <div className="mb-4 md:mb-6">
                            {selectedAssistant && (
                                <AssistantAvatar selectedImage={(v: string) => onHandleInputChange('image', v)}>
                                    <Image 
                                        src={selectedAssistant?.image} 
                                        alt="Selected Assistant" 
                                        width={100} 
                                        height={100}
                                        className="rounded-xl object-cover"
                                    />
                                </AssistantAvatar>
                            )}
                        </div>
                        
                        <div className="w-full space-y-4">
                            <Input 
                                placeholder="Name of Assistant" 
                                className="w-full"
                                value={selectedAssistant?.name}
                                onChange={(event) => onHandleInputChange('name', event.target.value)} 
                            />
                            <Input 
                                placeholder="Title"
                                className="w-full"
                                value={selectedAssistant?.title}
                                onChange={(event) => onHandleInputChange('title', event.target.value)}
                            />
                        </div>
                        <div className="mt-4 w-full">
                            <h2 className="text-sm text-gray-500">Model:</h2>
                            <Select 
                                defaultValue={selectedAssistant?.aiModelId || "OpenAI"}
                                onValueChange={(value) => onHandleInputChange('aiModelId', value)}
                            >
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {AiModelOptions.map((model, index) => (
                                        <SelectItem value={model.name} key={index}>
                                            <div className="flex gap-2 items-center m-1"> 
                                                <Image src={model.logo} alt={model.name} height={20} width={20} className="rounded-md"/>
                                                <h2>{model.name}</h2>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mt-5 w-full">
                            <h2 className="text-gray-500">Instruction</h2>
                            <Textarea 
                                placeholder="Add Instructions"
                                value={selectedAssistant.userInstruction}
                                className="h-[150px] md:h-[200px] w-full"
                                onChange={(event) => {
                                    // Update both instruction fields to ensure consistency
                                    const value = event.target.value;
                                    setSelectedAssistant(prev => ({
                                        ...prev,
                                        userInstruction: value,
                                        instruction: value // Make sure both fields are updated
                                    }));
                                }}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Describe how your assistant should behave and what knowledge it should have.
                            </p>
                        </div>
                        <div className="flex gap-3 md:gap-5 justify-end mt-6 md:mt-10 w-full"> 
                            <Button 
                                variant="secondary" 
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                disabled={loading}
                                onClick={onSave}
                            >
                                {loading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin"/>}
                                Add
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddNewAssistant