import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Sparkles, Bot, Zap, Code, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden relative">
      {/* 3D Shapes Background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-500 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-blue-500 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-pink-500 blur-3xl"></div>
      </div>

      {/* Floating 3D Elements */}
      <div className="absolute top-20 right-20 animate-bounce-slow">
        <div className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-xl rotate-12 border border-white/20"></div>
      </div>
      <div className="absolute bottom-32 left-20 animate-float">
        <div className="w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full border border-white/20"></div>
      </div>
      <div className="absolute top-40 left-1/4 animate-pulse">
        <div className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-lg rotate-45 border border-white/20"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-8">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium">Build AI Assistants in Minutes</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500">
            Create Powerful AI Assistants
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-3xl">
            Design, build, and deploy custom AI assistants that understand your business needs. No coding required.
          </p>

          <Link href="/sign-in">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 rounded-xl text-lg font-medium flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-105">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="mt-20 flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            How To Use It?
          </h2>
          <div className="w-full max-w-4xl bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
            <div className="aspect-video w-full rounded-xl overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/EZcuXyNzIU0"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10">
            <div className="bg-purple-500/20 p-3 rounded-xl w-fit mb-6">
              <Bot className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Custom Assistants</h3>
            <p className="text-slate-300">
              Build AI assistants tailored to your specific needs and workflows.
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
            <div className="bg-blue-500/20 p-3 rounded-xl w-fit mb-6">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-slate-300">Build in minutes with our intuitive interface and pre-built templates.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl border border-white/10 hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/10">
            <div className="bg-pink-500/20 p-3 rounded-xl w-fit mb-6">
              <Code className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">No Code Required</h3>
            <p className="text-slate-300">Create sophisticated AI assistants without writing a single line of code.</p>
          </div>
        </div>

        {/* Existing 3D Illustration Section (Remains Unchanged) */}
        <div className="mt-20 flex justify-center">
          <div className="relative w-full max-w-2xl h-80 bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-2xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/ethan.avif"
                width={500}
                height={300}
                alt="AI Assistant Platform"
                className="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <p className="text-sm text-slate-300">Experience the future of AI assistant development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}