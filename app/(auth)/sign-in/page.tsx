'use client'
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useGoogleLogin } from '@react-oauth/google';
import React, { useContext, useEffect } from 'react';
import { GetAuthUserData } from '@/services/GlobalApi';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

function SignIn() {
    const CreateUser = useMutation(api.users.CreateUser);
    const { setUser } = useContext(AuthContext); // Fixed destructuring
    const router = useRouter();
    const [mounted, setMounted] = React.useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false); // Cleanup on unmount
    }, []);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('user_token', tokenResponse.access_token);
                }

                const googleUser = await GetAuthUserData(tokenResponse.access_token);
                
                // Save user to database
                const dbUser = await CreateUser({
                    name: googleUser.name,
                    email: googleUser.email,
                    picture: googleUser.picture,
                });

                // Update context only if component is mounted
                if (mounted) {
                    setUser(dbUser);
                    router.replace('/ai-assistants');
                }
            } catch (error) {
                console.error('Login failed:', error);
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('user_token');
                }
            }
        },
        onError: errorResponse => console.error('Google login error:', errorResponse)
    });

    return (
        <div className='flex items-center justify-center h-screen bg-gray-100'>
            <div className='flex flex-col items-center p-10 bg-white rounded-lg shadow-md w-96'>
                <Image 
                    src={'/logo.svg'} 
                    alt='logo'
                    width={80}
                    height={80}
                    className="mb-6"
                />
                <h2 className='text-xl font-medium mb-5 text-gray-700'>
                    Sign In To Runigene - Your Personal Agent
                </h2>
                <Button 
                    onClick={() => googleLogin()} 
                    className="bg-black text-white w-full py-2 rounded hover:bg-gray-800"
                >
                    Sign in with Gmail
                </Button>
            </div>
        </div>
    );
}

export default SignIn;