'use client'
import { AssistantContext } from '@/context/AssistantContext'
import React, { useContext, useState, useEffect } from 'react'
import Image from 'next/image'
import { toast } from 'react-hot-toast' // Import the toast library
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import AiModelOptions from '@/services/AiModelOptions'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2Icon, Save, Trash } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import ConfirmationAlert from '../ConfirmationDialog'

function AssistantSettings() {
    const { assistant, setAssistant } = useContext(AssistantContext)
    const UpdateAssistant = useMutation(api.userAiAssistant.UpdateUserAssistant)
    const [loading, setLoading] = useState(false);
    const DeleteAssistant = useMutation(api.userAiAssistant.DeleteAssistant)
    
    // Debug: Log the assistant data when it changes
    useEffect(() => {
        if (assistant) {
            console.log("Current assistant data:", assistant);
        }
    }, [assistant]);
    
    const onHandleInputChange = (
        field: string,
        value: string,
    ) => {
        setAssistant((prev: any) => ({
            ...prev,
            [field]: value
        }))
    }
    
    const OnSave = async () => {
        setLoading(true)
        try {
            console.log("Attempting to save with data:", {
                assistantId: assistant._id,
                origId: assistant.id,
                userInstruction: assistant.userInstruction,
                aiModelId: assistant.aiModelId || "OpenAI"
            });
            
            // Try with the original ID field if _id doesn't exist
            const idToUse = assistant._id || assistant.id;
            
            if (!idToUse) {
                throw new Error("No valid ID found for this assistant");
            }
            
            const result = await UpdateAssistant({
                id: idToUse,
                userInstruction: assistant.userInstruction || "",
                aiModelId: assistant.aiModelId || "OpenAI"
            })
            
            console.log("Update successful:", result);
            toast.success('Saved!') // Use the toast library correctly
            return result;
        } catch (error) {
            console.error("Error updating assistant:", error);
            toast.error('Failed to save!') // Show error toast
        } finally {
            setLoading(false)
        }
    }
    
    const onDelete = async () => {
        console.log('Delete')
        setLoading(true);
        try {
            await DeleteAssistant({
                id: assistant?._id
            })
            setAssistant(null);
            toast.success('Assistant deleted successfully');
        } catch (error) {
            console.error("Error deleting assistant:", error);
            toast.error('Failed to delete assistant');
        } finally {
            setLoading(false);
        }
    }
    
    return assistant ? (
        <div className='p-5 bg-secondary border-l-[1px] h-screen'>
            <h2 className='font-bold text-2xl'>Settings</h2>
            <div className='mt-4 flex gap-3'>
                <Image 
                    src={assistant.image} 
                    alt='assistant'
                    width={80}
                    height={80}
                    className='rounded-full h-20 w-20 object-cover'
                />
                <div>
                    <h2 className='font-bold'>{assistant.name}</h2>
                    <p className='text-gray-700 dark:text-gray-300'>{assistant.title}</p>
                </div>
            </div>
            <div className='text-gray-200 mt-4'>
                <h2>Model:</h2>
                <Select 
                    defaultValue={assistant.aiModelId || "OpenAI"}
                    onValueChange={(value) => onHandleInputChange('aiModelId', value)}
                >
                    <SelectTrigger className='w-[200px]'>
                        <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                       {AiModelOptions.map((model, index) => (
                            <SelectItem value={model.name} key={index}>
                                <div className='flex gap-2 items-center m-1'> 
                                    <Image src={model.logo} alt={model.name} height={20} width={20} className='rounded-md'/>
                                    <h2>{model.name}</h2>
                                </div>
                            </SelectItem>
                       ))}
                    </SelectContent>
                </Select>
            </div>
            <div className='mt-4'>
                <h2 className='text-gray-200'>Instructions:</h2>
                <Textarea 
                    placeholder='Add Instruction' 
                    className="text-gray-400 h-[180px] bg-white" 
                    value={assistant?.userInstruction || ""}
                    onChange={(e) => onHandleInputChange('userInstruction', e.target.value)} 
                />
            </div>
            <div className='absolute bottom-10 right-0 flex gap-5'>
                <Button onClick={OnSave} disabled={loading}>
                    {loading ? <Loader2Icon className='animate-pulse mr-2'/> : <Save className='mr-2'/>}
                    Save
                </Button>
                <ConfirmationAlert onDelete={onDelete}>
                    <Button variant="ghost" disabled={loading}>
                        <Trash className='mr-2'/>Delete
                    </Button>
                </ConfirmationAlert>
            </div>
        </div>
    ) : null
}

export default AssistantSettings