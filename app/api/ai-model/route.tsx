// route.tsx
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const requestData = await req.json();
    
    // Extract the provider from the request or use a default
    const provider = requestData.provider || "openai"; // Default to OpenAI if not specified
    
    // Get message content
    const messages = requestData.messages || [];
    
    // Define the type for API configurations
    type ApiConfig = {
      url: string;
      headers: Record<string, string>;
      body: any;
      queryParams?: string;
    };

    // Define API configurations for different providers
    const apiConfigs: Record<string, ApiConfig> = {
      openai: {
        url: "https://api.openai.com/v1/chat/completions",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: {
          model: "gpt-4o",  // You can change this or make it dynamic
          messages: messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: 0.7
        }
      },
      claude: {
        url: "https://api.anthropic.com/v1/messages",
        headers: {
          "x-api-key": `${process.env.ANTHROPIC_API_KEY}`,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: (() => {
          // Handle system messages separately for Claude API
          const systemMessages = messages.filter((msg: any) => msg.role === "system");
          const nonSystemMessages = messages.filter((msg: any) => msg.role !== "system");
          
          const systemPrompt = systemMessages.map((msg: any) => msg.content).join("\n");
          
          return {
            model: "claude-5-sonnet-20240229",  // Using Claude Sonnet model as requested
            system: systemPrompt, // Claude uses a top-level system parameter
            messages: nonSystemMessages.map((msg: any) => ({
              role: msg.role === "user" ? "user" : "assistant",
              content: msg.content
            })),
            max_tokens: 1000
          };
        })()
      },
      gemini: {
        url: "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          // For Gemini, prepend system messages to first user message
          contents: (() => {
            const systemMessages = messages.filter((msg: any) => msg.role === "system");
            const nonSystemMessages = messages.filter((msg: any) => msg.role !== "system");
            
            // If there are system messages, prepend them to the first user message
            if (systemMessages.length > 0 && nonSystemMessages.length > 0) {
              const firstUserIndex = nonSystemMessages.findIndex((msg: any) => msg.role === "user");
              if (firstUserIndex !== -1) {
                const systemContent = systemMessages.map((msg: any) => msg.content).join("\n");
                nonSystemMessages[firstUserIndex] = {
                  ...nonSystemMessages[firstUserIndex],
                  content: `System Instructions: ${systemContent}\n\nUser Message: ${nonSystemMessages[firstUserIndex].content}`
                };
              }
            }
            
            // Convert to Gemini format
            return nonSystemMessages.map((msg: any) => ({
              role: msg.role === "user" ? "user" : "model",
              parts: [{ text: msg.content }]
            }));
          })()
        },
        queryParams: `?key=${process.env.GOOGLE_API_KEY}`
      },
      // Removed Deepseek and Mistral providers as requested by user
    };

    // Select the configuration based on the provider
    const config = apiConfigs[provider as keyof typeof apiConfigs];
    
    if (!config) {
      return new Response(JSON.stringify({ error: "Invalid AI provider specified" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Prepare URL with any query parameters
    const url = config.queryParams ? `${config.url}${config.queryParams}` : config.url;

    // Make the API call to the selected provider
    const response = await fetch(url, {
      method: "POST",
      headers: config.headers,
      body: JSON.stringify(config.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      return new Response(JSON.stringify({ 
        error: `Provider API error: ${response.status}`,
        details: errorText
      }), {
        status: 502, // Bad Gateway - indicates an issue with the upstream server
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse the response
    const data = await response.json();

    // Format the response based on the provider to maintain consistent structure
    let formattedResponse;
    
    switch(provider) {
      case "openai":
        formattedResponse = {
          model: "openai",
          response: data.choices[0].message.content,
          raw: data
        };
        break;
      case "claude":
        formattedResponse = {
          model: "claude",
          response: data.content[0].text,
          raw: data
        };
        break;
      case "gemini":
        formattedResponse = {
          model: "gemini",
          response: data.candidates[0].content.parts[0].text,
          raw: data
        };
        break;
      case "deepseek":
        formattedResponse = {
          model: "deepseek",
          response: data.choices[0].message.content,
          raw: data
        };
        break;
      case "mistral":
        formattedResponse = {
          model: "mistral",
          response: data.choices[0].message.content,
          raw: data
        };
        break;
      default:
        formattedResponse = {
          model: provider,
          response: "Could not parse response from provider",
          raw: data
        };
    }

    // Return the formatted response
    return new Response(JSON.stringify(formattedResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    console.error("Error processing AI request:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to process request", 
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
