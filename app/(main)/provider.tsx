"use client"
import React, { useContext, useEffect, useState } from 'react'
import { GetAuthUserData } from '@/services/GlobalApi';
import { useRouter } from 'next/navigation';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AuthContext } from '@/context/AuthContext';
import Image from 'next/image';
import { AssistantContext } from '@/context/AssistantContext';

function Provider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const convex = useConvex();
    const { user, setUser } = useContext(AuthContext);
    const [assistant,setAssistant] = useState();
    useEffect(() => {
        CheckUseAuth();
    }, []);

    const CheckUseAuth = async () => {
        const token = localStorage.getItem('user_token');
        const user = token && await GetAuthUserData(token);

        if (!user?.email) {
            router.replace('/sign-in');
            return;
        }
        try {
            const result = await convex.query(api.users.GetUser, {
                email: user?.email
            });
            setUser(result);
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <>
        <AssistantContext.Provider value={{ assistant, setAssistant}}>
            <div className="p-3 fixed shadow-sm flex items-center justify-between">
                <div className="flex items-center">
                    <Image
                        src={'/logo.svg'}
                        alt='logo'
                        width={50}
                        height={50}
                    />
                    <h1>Runigene</h1>
                </div>
                
                {user?.picture && (
                    <div className="flex items-center">
                        <Image
                            src={user.picture}
                            alt='profile'
                            width={40}
                            height={40}
                            className="rounded-full"
                        />
                    </div>
                )}
            </div>
            {children}
            </AssistantContext.Provider>
        </>
    )
}

export default Provider;