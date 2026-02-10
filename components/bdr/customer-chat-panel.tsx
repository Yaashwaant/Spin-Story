"use client"

import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CustomerUploadModal } from "@/components/bdr/customer-upload-modal"
import { Plus } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"


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





function parseTableToHtml(markdown: string, wardrobeItems: any[] = [], createItemLink?: (text: string) => string): string {
  if (!markdown) {
    return markdown
  }

  let processedContent = markdown
  if (createItemLink) {
    processedContent = createItemLink(markdown)
  }

  if (!processedContent.includes("|")) {
    return processedContent
  }

  const lines = processedContent.split("\n")
  let html = ""
  let inTable = false

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (trimmedLine.match(/^\s*\|?\s*-+\s*\|?\s*-+\s*\|?\s*-+\s*\|?\s*$/)) {
      continue
    }

    if (trimmedLine.includes("|")) {
      if (!inTable) {
        html += '<table class="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">\n'
        html += '  <thead class="bg-gray-100">\n    <tr>\n'

        const headers = trimmedLine.split("|").map((h) => h.trim()).filter(Boolean)
        headers.forEach((header) => {
          html += `      <th class="px-3 py-2 text-left font-semibold text-gray-700 border border-gray-300 font-serif">${header}</th>\n`
        })

        html += "    </tr>\n  </thead>\n  <tbody>\n"
        inTable = true
        continue
      }

      const cells = trimmedLine.split("|").map((c) => c.trim()).filter(Boolean)
      if (cells.length > 0) {
        html += '    <tr class="border-b border-gray-200 hover:bg-gray-50 transition-colors">\n'
        cells.forEach((cell) => {
          // Cell content is already processed with createItemLink
          html += `      <td class="px-3 py-2 text-gray-800 border border-gray-300">${cell}</td>\n`
        })
        html += "    </tr>\n"
      }
      continue
    }

    if (inTable) {
      html += "  </tbody>\n</table>\n"
      inTable = false
    }

    html += trimmedLine + "\n"
  }

  if (inTable) {
    html += "  </tbody>\n</table>\n"
  }

  return html.trim()
}

export function CustomerChatPanel({ customerId, customerName, customerProfile, customerPreferences, wardrobeUploaded, outfitPlanCount }: CustomerChatPanelProps) {
  const [activeTab, setActiveTab] = useState<"general" | "plan">("plan")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([])
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  useEffect(() => {
    const fetchWardrobeAndLoadContext = async () => {
      if (customerId) {
        try {
          const response = await fetch(`/api/wardrobe?customerId=${customerId}`)
          if (response.ok) {
            const data = await response.json()
            setWardrobeItems(data.items || [])
          } else {
            setWardrobeItems([])
          }
        } catch (error) {
          console.error("Error fetching wardrobe items:", error)
          setWardrobeItems([])
        }
      }

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

  const linkReplacements = useMemo(() => {
    const escapeHtml = (value: string) =>
      value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;")

    const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

    const tokenize = (value: string) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/[_-]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)

    const pickPrimaryColor = (item: any) => {
      const source = typeof item?.color === "string" ? item.color : typeof item?.name === "string" ? item.name : ""
      const tokens = tokenize(source)
      const common = new Set([
        "white",
        "black",
        "blue",
        "navy",
        "teal",
        "green",
        "red",
        "maroon",
        "pink",
        "purple",
        "brown",
        "beige",
        "cream",
        "grey",
        "gray",
        "orange",
        "yellow",
      ])
      return tokens.find((t) => common.has(t)) || ""
    }

    const stopwords = new Set([
      "classic",
      "minimalist",
      "crew",
      "neck",
      "regular",
      "fit",
      "oversized",
      "slim",
      "tailored",
      "formal",
      "casual",
      "vintage",
      "modern",
      "leather",
      "denim",
    ])

    const replacements: Array<{ regex: RegExp; html: string; key: string }> = []
    const seen = new Set<string>()

    // Debug: Log wardrobe items with images for troubleshooting
    console.log(`Processing ${wardrobeItems.length} wardrobe items for link creation`)

    for (const item of wardrobeItems) {
      const name = typeof item?.name === "string" ? item.name.trim() : ""
      const image = typeof item?.image === "string" ? item.image.trim() : ""
      
      // Debug: Log items that are being skipped
      if (!name) {
        console.log(`Skipping item: No valid name`, item)
        continue
      }
      if (!image) {
        console.log(`Skipping item "${name}": No valid image URL`, item)
        continue
      }

      // Validate image URL
      const isValidUrl = image.startsWith('http://') || image.startsWith('https://')
      if (!isValidUrl) {
        console.log(`Skipping item "${name}": Invalid image URL format: ${image}`)
        continue
      }

      console.log(`Creating link for "${name}" with image URL: ${image}`)

      const safeName = escapeHtml(name)
      const safeHref = escapeHtml(image)
      
      // Simple, clean link that opens the image
      const html = `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-medium font-serif">${safeName}</a>`

      const addAlias = (alias: string) => {
        const cleaned = alias.trim()
        if (!cleaned) return
        const key = cleaned.toLowerCase()
        if (seen.has(key)) return
        seen.add(key)
        const regex = new RegExp(`\\b${escapeRegex(cleaned)}\\b`, "gi")
        replacements.push({ regex, html, key })
      }

      addAlias(name)

      const nameTokens = tokenize(name)
      const lastWord = nameTokens[nameTokens.length - 1] || ""
      const primaryColor = pickPrimaryColor(item)
      if (primaryColor && lastWord) {
        addAlias(`${primaryColor} ${lastWord}`)
      }

      const filtered = nameTokens.filter((t) => !stopwords.has(t))
      if (filtered.length >= 2) {
        const filteredAlias = filtered.join(" ")
        if (filteredAlias.toLowerCase() !== name.toLowerCase()) {
          addAlias(filteredAlias)
        }
      }
    }

    replacements.sort((a, b) => b.key.length - a.key.length)
    return replacements
  }, [wardrobeItems])

  const createItemLink = (text: string): string => {
    console.log(`createItemLink input: "${text}"`)
    console.log(`Available replacements: ${linkReplacements.length}`)
    
    let modifiedText = text
    let replacementCount = 0
    
    for (const rep of linkReplacements) {
      const matches = modifiedText.match(rep.regex)
      if (matches) {
        console.log(`Found match for "${rep.key}": ${matches.length} occurrences`)
        replacementCount += matches.length
      }
      modifiedText = modifiedText.replace(rep.regex, rep.html)
    }
    
    console.log(`createItemLink output: "${modifiedText}" (${replacementCount} replacements made)`)
    return modifiedText
  }

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
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("API error response:", res.status, errorText)
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

    // If there are no wardrobe items, do not generate a generic plan.
    // Instead, show a clear message asking to upload clothes first.
    if (!wardrobeItems || wardrobeItems.length === 0) {
      setLastPlan({
        planId: "",
        preview:
          "To generate a personalized outfit plan, please upload at least one item to the wardrobe for this customer.",
      })
      return
    }

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
      <Card className="rounded-3xl shadow-sm">
      <CardHeader className="border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold font-serif">
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
            <TabsTrigger value="plan">Plan outfits</TabsTrigger>
            <TabsTrigger value="general">General advice</TabsTrigger>
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
                            {msg.role === "assistant" ? (
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    h1: ({ children }) => (
                                      <h1 className="text-lg font-bold mb-3 mt-4 text-foreground">{children}</h1>
                                    ),
                                    h2: ({ children }) => (
                                      <h2 className="text-base font-semibold mb-2 mt-3 text-foreground">{children}</h2>
                                    ),
                                    h3: ({ children }) => (
                                      <h3 className="text-sm font-semibold mb-2 mt-2 text-foreground">{children}</h3>
                                    ),
                                    p: ({ children }) => (
                                      <p className="mb-3 last:mb-0 leading-relaxed text-foreground">{children}</p>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-semibold text-primary">{children}</strong>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-disc pl-6 space-y-1 mb-3 text-foreground">{children}</ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-decimal pl-6 space-y-1 mb-3 text-foreground">{children}</ol>
                                    ),
                                    li: ({ children }) => (
                                      <li className="leading-relaxed text-foreground">{children}</li>
                                    ),
                                    table: ({ children }) => (
                                      <table className="w-full border-collapse border border-border my-3 text-sm">{children}</table>
                                    ),
                                    th: ({ children }) => (
                                      <th className="border border-border px-3 py-2 bg-muted font-semibold text-foreground">{children}</th>
                                    ),
                                    td: ({ children }) => (
                                      <td className="border border-border px-3 py-2 text-foreground">{children}</td>
                                    ),
                                    blockquote: ({ children }) => (
                                      <blockquote className="border-l-4 border-primary pl-4 my-3 italic text-muted-foreground">
                                        {children}
                                      </blockquote>
                                    ),
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                            )}
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground font-serif">Plan type</p>
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
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground font-serif">
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
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-lg font-bold mb-3 mt-4 text-foreground">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-base font-semibold mb-2 mt-3 text-foreground">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-sm font-semibold mb-2 mt-2 text-foreground">{children}</h3>
                              ),
                              p: ({ children }) => (
                                <p className="mb-3 last:mb-0 leading-relaxed text-foreground">{children}</p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-primary">{children}</strong>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-6 space-y-1 mb-3 text-foreground">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-6 space-y-1 mb-3 text-foreground">{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="leading-relaxed text-foreground">{children}</li>
                              ),
                              table: ({ children }) => (
                                <table className="w-full border-collapse border border-border my-3 text-sm">{children}</table>
                              ),
                              th: ({ children }) => (
                                <th className="border border-border px-3 py-2 bg-muted font-semibold text-foreground">{children}</th>
                              ),
                              td: ({ children }) => (
                                <td className="border border-border px-3 py-2 text-foreground">{children}</td>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-primary pl-4 my-3 italic text-muted-foreground">
                                  {children}
                                </blockquote>
                              ),
                            }}
                          >
                            {lastPlan.preview}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Get your Spin-Storey Here
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
      </motion.div>
    </>
  )
}
