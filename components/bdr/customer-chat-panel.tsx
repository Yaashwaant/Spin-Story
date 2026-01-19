"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CustomerUploadModal } from "@/components/bdr/customer-upload-modal"
import { Plus } from "lucide-react"

// Helper function to parse markdown table to HTML
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

type ChatRole = "user" | "bdr" | "assistant"

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
}

type PlanType = "week" | "trip" | "occasion"

interface PlanResponse {
  planId: string
  preview: string
  pdfUrl?: string
}

interface CustomerChatPanelProps {
  customerId: string
  customerName?: string
  customerProfile?: any
  customerPreferences?: any
  wardrobeUploaded?: boolean
  outfitPlanCount?: number
}

export function CustomerChatPanel({ customerId, customerName, customerProfile, customerPreferences, wardrobeUploaded, outfitPlanCount }: CustomerChatPanelProps) {
  // Debug logging
  console.log("CustomerChatPanel - customerId:", customerId)
  console.log("CustomerChatPanel - customerName:", customerName)
  
  const [activeTab, setActiveTab] = useState<"general" | "plan">("general")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([])
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  // Fetch wardrobe items and preload customer context on mount
  useEffect(() => {
    const fetchWardrobeAndLoadContext = async () => {
      // Fetch wardrobe items if wardrobe is uploaded
      if (wardrobeUploaded && customerId) {
        try {
          const response = await fetch(`/api/wardrobe?customerId=${customerId}`)
          if (response.ok) {
            const data = await response.json()
            setWardrobeItems(data.items || [])
            console.log(`Loaded ${data.items?.length || 0} wardrobe items for customer ${customerId}`)
          } else {
            console.error("Failed to fetch wardrobe items:", response.status)
          }
        } catch (error) {
          console.error("Error fetching wardrobe items:", error)
        }
      }

      // Load customer context
      if (customerProfile || customerPreferences || wardrobeUploaded !== undefined || outfitPlanCount !== undefined) {
        const contextMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Hey ${customerName || 'there'}! How may I style you today?`,
          createdAt: new Date().toISOString(),
        }
        setMessages([contextMessage])
      }
    }

    fetchWardrobeAndLoadContext()
  }, [customerId, customerProfile, customerPreferences, wardrobeUploaded, outfitPlanCount])

  const [planType, setPlanType] = useState<PlanType>("week")
  const [planTitle, setPlanTitle] = useState("")
  const [planNotes, setPlanNotes] = useState("")
  const [lastPlan, setLastPlan] = useState<PlanResponse | null>(null)
  const [planning, setPlanning] = useState(false)

  const handleSendGeneral = async () => {
    if (!input.trim()) return
    if (!customerId) {
      console.error("No customerId available")
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Error: No customer ID available. Please refresh the page.",
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    const now = new Date().toISOString()
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "bdr",
      content: input,
      createdAt: now,
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")
    setSending(true)

    try {
      const requestBody = {
        customerId: customerId || "unknown",
        role: "bdr",
        intent: "general",
        message: newMessage.content,
        customerProfile,
        customerPreferences,
        wardrobeUploaded,
        outfitPlanCount,
        wardrobeItems,
      }
      console.log("Sending chat request:", JSON.stringify(requestBody, null, 2))
      
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("API error response:", res.status, errorText)
        throw new Error(`Failed to get AI response: ${res.status} ${errorText}`)
      }

      const data = (await res.json()) as { message: string }

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Chat API error:", error)
      // Add a user-friendly error message
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I'm sorry, I couldn't process your request. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setSending(false)
    }
  }

  const handleGeneratePlan = async () => {
    if (!planNotes.trim()) return

    setPlanning(true)
    setLastPlan(null)

    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          triggeredBy: "bdr",
          planType,
          conversationNotes: planNotes,
          contextTitle: planTitle || null,
          customerProfile,
          customerPreferences,
          wardrobeUploaded,
          outfitPlanCount,
          wardrobeItems,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to generate plan")
      }

      const data = (await res.json()) as PlanResponse

      setLastPlan(data)

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.preview,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error(error)
    } finally {
      setPlanning(false)
    }
  }

  const handleDownloadPdf = () => {
    if (!lastPlan?.planId) return
    const url = lastPlan.pdfUrl || `/api/plans/${lastPlan.planId}/pdf`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleShareWhatsapp = () => {
    if (!lastPlan?.planId) return
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const pdfUrl = lastPlan.pdfUrl || `${origin}/api/plans/${lastPlan.planId}/pdf`

    const textParts: string[] = []
    if (planTitle) {
      textParts.push(planTitle)
    } else {
      textParts.push("Your personalized outfit plan")
    }
    textParts.push(pdfUrl)

    const message = textParts.join(" - ")
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(waUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <>
      <Card className="rounded-3xl shadow-sm">
      <CardHeader className="border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {customerName ? `AI stylist for ${customerName}` : "AI stylist for this customer"}
            </CardTitle>
            <CardDescription className="text-sm">
              Use the AI to give styling advice or generate week or trip plans based on your conversation notes.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-2xl border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => setUploadModalOpen(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Upload Clothes
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "general" | "plan")}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">General advice</TabsTrigger>
            <TabsTrigger value="plan">Plan outfits</TabsTrigger>
          </TabsList>
          <div className={activeTab === "general" ? "block" : "hidden"}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
              <Card className="border-none bg-slate-50/60">
                <CardContent className="pt-4">
                  <ScrollArea className="h-64 pr-3">
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={msg.role === "assistant" ? "flex justify-start" : "flex justify-end"}
                        >
                          <div
                            className={
                              msg.role === "assistant"
                                ? "max-w-[80%] rounded-2xl px-3 py-2 text-sm bg-white text-foreground border border-border/60"
                                : "max-w-[80%] rounded-2xl px-3 py-2 text-sm bg-primary text-primary-foreground"
                            }
                          >
                            <div dangerouslySetInnerHTML={{ __html: parseTableToHtml(msg.content, true) }} />
                          </div>
                        </div>
                      ))}
                      {messages.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Start by summarizing your phone call or asking what to suggest next for this customer.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="mt-4 space-y-2">
                    <Textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      
                      className="min-h-[80px] rounded-2xl"
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={handleSendGeneral}
                        disabled={sending || !input.trim()}
                        className="rounded-2xl"
                      >
                        {sending ? "Asking AI..." : "Send to AI"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Use this tab for quick questions and styling advice that you want to share with the customer.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Clarify which items from their wardrobe to prioritize.</li>
                  <li>Ask for alternatives if some items are unavailable.</li>
                  <li>Prepare how you will explain the plan to the customer.</li>
                </ul>
              </div>
            </div>
          </div>
          <div className={activeTab === "plan" ? "block" : "hidden"}>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)]">
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Plan type</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={planType === "week" ? "default" : "outline"}
                      size="sm"
                      className="rounded-2xl"
                      onClick={() => setPlanType("week")}
                    >
                      Week plan
                    </Button>
                    <Button
                      type="button"
                      variant={planType === "trip" ? "default" : "outline"}
                      size="sm"
                      className="rounded-2xl"
                      onClick={() => setPlanType("trip")}
                    >
                      Trip plan
                    </Button>
                    <Button
                      type="button"
                      variant={planType === "occasion" ? "default" : "outline"}
                      size="sm"
                      className="rounded-2xl"
                      onClick={() => setPlanType("occasion")}
                    >
                      Occasion
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Plan title
                  </p>
                  <Input
                    value={planTitle}
                    onChange={(event) => setPlanTitle(event.target.value)}
                    placeholder="For example: three day trip plan or next week work outfits"
                    className="rounded-2xl"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Give Details about your Schedule/Itenary
                  </p>
                  <Textarea
                    value={planNotes}
                    onChange={(event) => setPlanNotes(event.target.value)}
                   
                    className="min-h-[120px] rounded-2xl"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleGeneratePlan}
                    disabled={planning || !planNotes.trim()}
                    className="rounded-2xl"
                  >
                    {planning ? "Generating plan..." : "Generate outfit plan"}
                  </Button>
                </div>
              </div>
              <Card className="border-none bg-slate-50/60">
                <CardContent className="pt-4">
                  <ScrollArea className="h-64 pr-3">
                    {lastPlan ? (
                      <div className="space-y-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Plan preview
                        </p>
                        <div className="text-sm text-foreground">
                          <div dangerouslySetInnerHTML={{ __html: parseTableToHtml(lastPlan.preview) }} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Get your Spin-Story Here
                      </p>
                    )}
                  </ScrollArea>
                  {lastPlan && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-2xl"
                        onClick={handleDownloadPdf}
                      >
                        Download PDF
                      </Button>
                      <Button type="button" className="rounded-2xl" onClick={handleShareWhatsapp}>
                        Share via WhatsApp
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
    {customerId && (
      <CustomerUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        customerId={customerId}
        customerName={customerName || "this customer"}
        onUploadComplete={() => {
          // Refresh wardrobe items after successful upload
          const fetchWardrobe = async () => {
            if (customerId) {
              try {
                const response = await fetch(`/api/wardrobe?customerId=${customerId}`)
                if (response.ok) {
                  const data = await response.json()
                  setWardrobeItems(data.items || [])
                }
              } catch (error) {
                console.error("Error refreshing wardrobe items:", error)
              }
            }
          }
          fetchWardrobe()
        }}
      />
    )}
    </>
  )
}

