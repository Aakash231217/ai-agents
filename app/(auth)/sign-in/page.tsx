'use client'
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useGoogleLogin } from '@react-oauth/google';
import React, { useContext, useState } from 'react';
import { GetAuthUserData } from '@/services/GlobalApi';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

function SignIn() {
    const createUser = useMutation(api.users.CreateUser);
    const { setUser } = useContext(AuthContext);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setIsLoading(true);
                setError(null);

                if (typeof window !== 'undefined') {
                    localStorage.setItem('user_token', tokenResponse.access_token);
                }

                const googleUser = await GetAuthUserData(tokenResponse.access_token);
                
                // Save user to database
                const dbUser = await createUser({
                    name: googleUser.name,
                    email: googleUser.email,
                    picture: googleUser.picture,
                });

                // Check if user data returned correctly
                if (!dbUser) {
                    throw new Error("Failed to create or retrieve user");
                }

                // Update context - cast to proper type if needed
                
                // Navigate after successful authentication
                router.replace('/ai-assistants');
            } catch (error: any) {
                console.error('Login failed:', error);
                setError(error.message || "Authentication failed");
                
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('user_token');
                }
            } finally {
                setIsLoading(false);
            }
        },
        onError: (errorResponse) => {
            console.error('Google login error:', errorResponse);
            setError("Google authentication failed");
            setIsLoading(false);
        }
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
                
                {error && (
                    <div className="w-full p-3 mb-4 text-sm text-red-700 bg-red-100 rounded">
                        {error}
                    </div>
                )}
                
                <Button 
                    onClick={() => googleLogin()} 
                    className="bg-black text-white w-full py-2 rounded hover:bg-gray-800"
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing in...' : 'Sign in with Gmail'}
                </Button>
            </div>
        </div>
    );
}

export default SignIn;