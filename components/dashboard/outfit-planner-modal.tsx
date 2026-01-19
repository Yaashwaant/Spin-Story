"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Brain, Send, User, Bot } from "lucide-react"

// Helper function to parse markdown table to HTML (same as CustomerChatPanel)
function parseTableToHtml(markdown: string, isChatMessage: boolean = false): string {
  if (!markdown || !markdown.includes('|')) {
    return markdown
  }

  const lines = markdown.split('\n')
  let html = ''
  let inTable = false
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Skip separator lines (lines with only dashes and pipes)
    if (trimmedLine.match(/^\s*\|?\s*-+\s*\|?\s*-+\s*\|?\s*-+\s*\|?\s*$/)) {
      continue
    }
    
    // Check if this is a table row
    if (trimmedLine.includes('|')) {
      if (!inTable) {
        if (isChatMessage) {
          html += '<table class="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden my-2">\n'
          html += '  <thead class="bg-gray-100">\n    <tr>\n'
          
          // Parse header row
          const headers = trimmedLine.split('|').map(h => h.trim()).filter(h => h)
          headers.forEach(header => {
            html += `      <th class="px-2 py-1 text-left font-semibold text-gray-700 border border-gray-300 text-xs">${header}</th>\n`
          })
        } else {
          html += '<table class="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">\n'
          html += '  <thead class="bg-gray-100">\n    <tr>\n'
          
          // Parse header row
          const headers = trimmedLine.split('|').map(h => h.trim()).filter(h => h)
          headers.forEach(header => {
            html += `      <th class="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300">${header}</th>\n`
          })
        }
        
        html += '    </tr>\n  </thead>\n  <tbody>\n'
        inTable = true
      } else {
        // Parse data row
        const cells = trimmedLine.split('|').map(c => c.trim()).filter(c => c)
        if (cells.length > 0) {
          if (isChatMessage) {
            html += '    <tr class="border-b border-gray-200">\n'
            cells.forEach(cell => {
              html += `      <td class="px-2 py-1 text-gray-800 border border-gray-300 text-xs">${cell}</td>\n`
            })
          } else {
            html += '    <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors">\n'
            cells.forEach(cell => {
              html += `      <td class="px-3 py-2 text-gray-800 border border-gray-300">${cell}</td>\n`
            })
          }
          html += '    </tr>\n'
        }
      }
    } else if (inTable) {
      // End of table
      html += '  </tbody>\n</table>\n'
      inTable = false
      html += trimmedLine + '\n'
    } else {
      // Non-table content
      html += trimmedLine + '\n'
    }
  }
  
  // Close table if still open
  if (inTable) {
    html += '  </tbody>\n</table>\n'
  }
  
  return html.trim()
}

type ChatRole = "user" | "assistant"

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}

interface OutfitPlannerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userProfile?: any
  userPreferences?: any
}

export function OutfitPlannerModal({ open, onOpenChange, userId, userProfile, userPreferences }: OutfitPlannerModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([])
  const [wardrobeUploaded, setWardrobeUploaded] = useState(false)

  // Fetch wardrobe items and user context on mount
  useEffect(() => {
    if (userId && open) {
      fetchWardrobeAndLoadContext()
    }
  }, [userId, open])

  const fetchWardrobeAndLoadContext = async () => {
    try {
      // Check if wardrobe exists
      const wardrobeResponse = await fetch(`/api/wardrobe?customerId=${userId}`)
      if (wardrobeResponse.ok) {
        const wardrobeData = await wardrobeResponse.json()
        setWardrobeItems(wardrobeData.items || [])
        setWardrobeUploaded(wardrobeData.items && wardrobeData.items.length > 0)
      }

      // Load initial context message
      const contextMessage = generateContextMessage()
      setMessages([{
        id: Date.now().toString(),
        role: "assistant",
        content: contextMessage,
        createdAt: new Date().toISOString()
      }])
    } catch (error) {
      console.error("Error loading context:", error)
      setMessages([{
        id: Date.now().toString(),
        role: "assistant", 
        content: "Hello! I'm your AI stylist. How can I help you plan your outfits today?",
        createdAt: new Date().toISOString()
      }])
    }
  }

  const generateContextMessage = () => {
    let context = "Hello! I'm your AI stylist. "
    
    if (userProfile) {
      context += `I can see you're ${userProfile.height || 'average height'} with ${userProfile.physique || 'average'} build. `
      context += `Your preferred fit is ${userProfile.fitPreference || 'regular'} and you're comfortable with ${userProfile.colorComfort || 'neutral'} colors. `
    }
    
    if (userPreferences) {
      context += `Your budget range is ₹${userPreferences.budgetMin || '0'} - ₹${userPreferences.budgetMax || 'unlimited'}. `
    }
    
    if (wardrobeUploaded && wardrobeItems.length > 0) {
      context += `I can see you have ${wardrobeItems.length} items in your wardrobe. `
    }
    
    context += "How can I help you create amazing outfits today?"
    
    return context
  }

  const sendMessage = async () => {
    if (!input.trim() || sending) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setSending(true)

    try {
      const response = await fetch("/api/chat/outfit-planner", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: input.trim(),
          userId,
          userProfile,
          userPreferences,
          wardrobeItems,
          wardrobeUploaded
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I'm sorry, I couldn't generate a response. Please try again.",
        createdAt: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        createdAt: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Outfit Planner
          </DialogTitle>
          <DialogDescription>
            Chat with your personal AI stylist to get outfit recommendations and planning assistance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col h-full">
          {/* Chat Messages */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.role === "user" ? "order-1" : ""}`}>
                    <div className={`rounded-lg px-4 py-2 ${
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    }`}>
                      <div 
                        dangerouslySetInnerHTML={{
                          __html: parseTableToHtml(message.content, true)
                        }}
                        className="prose prose-sm max-w-none"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center order-2">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
              
              {sending && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          {/* Input Area */}
          <div className="border-t p-6">
            <div className="flex gap-2">
              <Textarea
                placeholder="Ask me about outfit planning, styling advice, or wardrobe recommendations..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] max-h-[120px] resize-none"
                disabled={sending}
              />
              <Button 
                onClick={sendMessage} 
                disabled={!input.trim() || sending}
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge 
                variant="outline" 
                className="cursor-pointer text-xs"
                onClick={() => setInput("What should I wear for a casual day out?")}
              >
                Casual Day
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer text-xs"
                onClick={() => setInput("Plan outfits for a business meeting")}
              >
                Business Meeting
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer text-xs"
                onClick={() => setInput("What colors suit me best?")}
              >
                Color Advice
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer text-xs"
                onClick={() => setInput("Help me organize my wardrobe")}
              >
                Wardrobe Organization
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}