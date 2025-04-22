"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useGoogleLogin } from "@react-oauth/google"
import { useContext, useState, useEffect } from "react"
import { GetAuthUserData } from "@/services/GlobalApi"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AuthContext } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Loader2, LogIn } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

function SignIn() {
  const createUser = useMutation(api.users.CreateUser)
  const { setUser } = useContext(AuthContext)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true) // Start with loading true
  const [error, setError] = useState(null)

  // Check for existing authentication on mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        // Get token and expiration from localStorage
        const userToken = localStorage.getItem("user_token")
        const tokenExpiry = localStorage.getItem("token_expiry")
        
        // If token exists and hasn't expired, try to use it
        if (userToken && tokenExpiry && new Date().getTime() < parseInt(tokenExpiry)) {
          // Get user data using the existing token
          const googleUser = await GetAuthUserData(userToken)
          
          // Save/update user in database
          const dbUser = await createUser({
            name: googleUser.name,
            email: googleUser.email,
            picture: googleUser.picture,
          })
          
          // Set user in context
          
          // Redirect to workspace
          router.replace("/workspace")
          return
        }
        
        // If we reach here, no valid token exists
        if (userToken) {
          // Clear expired tokens
          localStorage.removeItem("user_token")
          localStorage.removeItem("token_expiry")
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        // Clear potentially invalid tokens
        localStorage.removeItem("user_token")
        localStorage.removeItem("token_expiry")
      } finally {
        setIsLoading(false)
      }
    }
    
    checkExistingAuth()
  }, [router, createUser, setUser])

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true)
        setError(null)

        // Store token with 3-day expiration
        const expiryTime = new Date().getTime() + (3 * 24 * 60 * 60 * 1000) // Current time + 3 days in milliseconds
        
        if (typeof window !== "undefined") {
          localStorage.setItem("user_token", tokenResponse.access_token)
          localStorage.setItem("token_expiry", expiryTime.toString())
        }

        const googleUser = await GetAuthUserData(tokenResponse.access_token)

        // Save user to database
        const dbUser = await createUser({
          name: googleUser.name,
          email: googleUser.email,
          picture: googleUser.picture,
        })

        // Check if user data returned correctly
        if (!dbUser) {
          throw new Error("Failed to create or retrieve user")
        }

        // Update context

        // Navigate after successful authentication
        router.replace("/ai-assistants")
      } catch (error) {
        console.error("Login failed:", error)
  

        if (typeof window !== "undefined") {
          localStorage.removeItem("user_token")
          localStorage.removeItem("token_expiry")
        }
      } finally {
        setIsLoading(false)
      }
    },
    onError: (errorResponse) => {
      console.error("Google login error:", errorResponse)
  
      setIsLoading(false)
    },
  })

  // Show a loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl opacity-20 pointer-events-none">
          <svg width="1000" height="1000" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="500" cy="500" r="500" fill="url(#paint0_radial)" />
            <defs>
              <radialGradient
                id="paint0_radial"
                cx="0"
                cy="0"
                r="1"
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(500 500) rotate(90) scale(500)"
              >
                <stop stopColor="#3B82F6" />
                <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-2 bg-white rounded-2xl shadow-sm mb-4">
            <Image src={"/logo.svg"} alt="Runigene logo" width={80} height={80} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome to Runigene</h1>
          <p className="mt-2 text-slate-600">Your Personal AI Agent</p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">Sign in to your account</CardTitle>
            <CardDescription className="text-center">
              Continue with Google to access your personal AI assistant
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={() => googleLogin()}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white transition-all duration-300 flex items-center justify-center gap-2 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  <span>Sign in with Google</span>
                </>
              )}
            </Button>

            <div className="mt-6 text-center text-sm text-slate-500">
              By signing in, you agree to our
              <a href="#" className="text-blue-600 hover:underline ml-1">
                Terms of Service
              </a>{" "}
              and
              <a href="#" className="text-blue-600 hover:underline ml-1">
                Privacy Policy
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center gap-2">
            <span className="text-sm text-slate-500">Powered by</span>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-700">Runigene AI</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn