"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Check, Leaf, Snowflake, Sun, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ClothingItem {
  id: string
  name: string
  image: string
  type: string
  color: string
  season: string
  styles: string[]
  customerId: string
  createdAt: Date
  updatedAt: Date
}

interface WardrobePreviewProps {
  items?: ClothingItem[]
  onRefresh?: () => void
  isLoading?: boolean
}

export function WardrobePreview({ items, onRefresh, isLoading }: WardrobePreviewProps) {
  const displayItems = items ?? []

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card className="min-h-[420px] rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold">Wardrobe Preview</CardTitle>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onRefresh}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            <Check className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="grid max-h-[300px] grid-cols-5 gap-2 overflow-hidden">
                {[...Array(10)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="relative aspect-square rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 animate-pulse"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                        <svg className="w-3 h-3 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 bg-muted/20 rounded animate-pulse w-20"></div>
                <div className="h-4 bg-muted/20 rounded animate-pulse w-12"></div>
              </div>
            </motion.div>
          ) : displayItems.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-5 gap-2">
                {displayItems.slice(0, 15).map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl border bg-muted transition-all hover:scale-105"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15, delay: index * 0.01, ease: "easeOut" }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-2xl">👔</span>
                      </div>
                    )}
                    <div className="hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/90 to-muted/70">
                      <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center">
                        <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="absolute bottom-2 left-2 text-white">
                        <p className="text-xs font-medium">{item.name}</p>
                        <p className="text-[10px] opacity-80">{item.type}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{displayItems.length} items{displayItems.length > 15 ? ' (showing first 15)' : ''}</span>
                <span>•</span>
                <span>Updated just now</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground mb-2">No wardrobe items yet</p>
              <p className="text-xs text-muted-foreground/60">Upload some clothes to get started</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}