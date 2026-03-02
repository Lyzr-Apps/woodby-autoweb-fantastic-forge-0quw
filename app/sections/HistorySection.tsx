'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FiClock, FiPackage, FiShare2, FiLayout, FiChevronDown, FiChevronUp, FiInbox } from 'react-icons/fi'
import type { HistoryItem } from './DashboardSection'

interface HistorySectionProps {
  history: HistoryItem[]
}

function getTypeBadgeVariant(type: string): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'product': return 'default'
    case 'social': return 'secondary'
    case 'advisor': return 'outline'
    default: return 'default'
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'product': return 'Product Page'
    case 'social': return 'Social Post'
    case 'advisor': return 'Advisor'
    default: return type
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'product': return FiPackage
    case 'social': return FiShare2
    case 'advisor': return FiLayout
    default: return FiClock
  }
}

function formatDate(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return timestamp
  }
}

function EmptyState({ type }: { type: string }) {
  const Icon = type === 'all' ? FiInbox : getTypeIcon(type)
  const label = type === 'all' ? 'content' : getTypeLabel(type).toLowerCase() + ' content'
  return (
    <div className="py-16 text-center">
      <Icon className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
      <p className="text-muted-foreground font-sans text-sm">No {label} generated yet</p>
      <p className="text-muted-foreground/60 font-sans text-xs mt-1">Generated content will appear here</p>
    </div>
  )
}

export default function HistorySection({ history }: HistorySectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const safeHistory = Array.isArray(history) ? history : []

  const filterItems = (type: string) => {
    if (type === 'all') return safeHistory
    return safeHistory.filter(item => item.type === type)
  }

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const renderItems = (items: HistoryItem[]) => {
    if (items.length === 0) return null
    return (
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-1">
          {items.map((item, idx) => {
            const Icon = getTypeIcon(item.type)
            const isExpanded = expandedId === item.id
            return (
              <React.Fragment key={item.id}>
                <div className="rounded-md hover:bg-secondary/50 transition-colors">
                  <button className="w-full flex items-center gap-3 py-3 px-3 text-left" onClick={() => toggleExpand(item.id)} type="button">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <Badge variant={getTypeBadgeVariant(item.type)} className="text-[10px] w-20 justify-center shrink-0">
                      {getTypeLabel(item.type)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-medium truncate">{item.title}</p>
                      {!isExpanded && <p className="font-sans text-xs text-muted-foreground truncate">{item.snippet}</p>}
                    </div>
                    <span className="font-sans text-xs text-muted-foreground shrink-0 hidden sm:block">{formatDate(item.timestamp)}</span>
                    {isExpanded ? <FiChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <FiChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 ml-11">
                      <div className="bg-secondary/50 rounded-md p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={item.status === 'completed' ? 'default' : 'destructive'} className="text-[10px]">{item.status}</Badge>
                          <span className="font-sans text-xs text-muted-foreground sm:hidden">{formatDate(item.timestamp)}</span>
                        </div>
                        <p className="font-sans text-sm whitespace-pre-wrap">{item.snippet}</p>
                      </div>
                    </div>
                  )}
                </div>
                {idx < items.length - 1 && <Separator className="opacity-20" />}
              </React.Fragment>
            )
          })}
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-wide text-foreground">Content History</h1>
        <p className="text-muted-foreground mt-1 font-sans text-sm">Browse all previously generated content</p>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="font-sans text-xs">All ({safeHistory.length})</TabsTrigger>
              <TabsTrigger value="product" className="font-sans text-xs">Product Pages ({filterItems('product').length})</TabsTrigger>
              <TabsTrigger value="social" className="font-sans text-xs">Social Posts ({filterItems('social').length})</TabsTrigger>
              <TabsTrigger value="advisor" className="font-sans text-xs">Advisor ({filterItems('advisor').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {filterItems('all').length > 0 ? renderItems(filterItems('all')) : <EmptyState type="all" />}
            </TabsContent>
            <TabsContent value="product">
              {filterItems('product').length > 0 ? renderItems(filterItems('product')) : <EmptyState type="product" />}
            </TabsContent>
            <TabsContent value="social">
              {filterItems('social').length > 0 ? renderItems(filterItems('social')) : <EmptyState type="social" />}
            </TabsContent>
            <TabsContent value="advisor">
              {filterItems('advisor').length > 0 ? renderItems(filterItems('advisor')) : <EmptyState type="advisor" />}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
