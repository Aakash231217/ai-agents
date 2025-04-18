"use client"
import React, { useContext, useEffect, useState } from 'react'
import { GetAuthUserData } from '@/services/GlobalApi';
import { useRouter } from 'next/navigation';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AuthContext } from '@/context/AuthContext';
import Image from 'next/image';
import { AssistantContext } from '@/context/AssistantContext';
import { Settings } from 'lucide-react';

function Provider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const convex = useConvex();
    const { user, setUser } = useContext(AuthContext);
    const [assistant, setAssistant] = useState();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        CheckUserAuth();
    }, []);

    const CheckUserAuth = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('user_token');
            if (!token) {
                router.replace('/sign-in');
                return;
            }

            const googleUser = await GetAuthUserData(token);
            
            if (!googleUser?.email) {
                router.replace('/sign-in');
                return;
            }

            const result = await convex.query(api.users.GetUser, {
                email: googleUser.email
            });

            if (result) {
                setUser(result);
            } else {
                router.replace('/sign-in');
            }
        } catch (e) {
            console.error("Auth error:", e);
            router.replace('/sign-in');
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <AssistantContext.Provider value={{ assistant, setAssistant }}>
            <div className="h-screen flex flex-col bg-black text-white">
                {/* Header */}
                <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800 z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9">
                            <Image
                                src="/logo.svg"
                                alt="logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h1 className="font-medium text-xl">Runigene</h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {user?.picture && (
                            <div className="flex items-center gap-3">
                                <Image
                                    src={user.picture}
                                    alt="profile"
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                                
                                <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
                                    <Settings size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </header>
                
                {/* Main Content */}
                <div className="flex-1 overflow-hidden">
                    {children}
                </div>
            </div>
        </AssistantContext.Provider>
    )
}

export default Provider;