'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { FiPackage, FiShare2, FiLayout, FiArrowRight, FiFileText, FiTrendingUp } from 'react-icons/fi'

export interface HistoryItem {
  id: string
  type: 'product' | 'social' | 'advisor'
  title: string
  snippet: string
  timestamp: string
  status: 'completed' | 'error'
}

interface DashboardSectionProps {
  onNavigate: (section: string) => void
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

function formatTimeAgo(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function DashboardSection({ onNavigate, history }: DashboardSectionProps) {
  const quickActions = [
    {
      icon: FiPackage,
      title: 'Product Page',
      description: 'Generate SEO-optimized product pages and publish to Shopify',
      section: 'product',
      color: 'bg-primary text-primary-foreground',
    },
    {
      icon: FiShare2,
      title: 'Social Post',
      description: 'Create and publish to Facebook, Instagram, and TikTok',
      section: 'social',
      color: 'bg-accent text-accent-foreground',
    },
    {
      icon: FiLayout,
      title: 'Layout Advice',
      description: 'Get expert website layout recommendations and visual hierarchy tips',
      section: 'advisor',
      color: 'bg-secondary text-secondary-foreground',
    },
  ]

  const productCount = Array.isArray(history) ? history.filter(h => h.type === 'product').length : 0
  const socialCount = Array.isArray(history) ? history.filter(h => h.type === 'social').length : 0
  const advisorCount = Array.isArray(history) ? history.filter(h => h.type === 'advisor').length : 0
  const totalCount = Array.isArray(history) ? history.length : 0
  const recentItems = Array.isArray(history) ? history.slice(0, 10) : []

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-wide text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 font-sans text-sm">Your content automation command center</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Card key={action.section} className="shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer group" onClick={() => onNavigate(action.section)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <FiArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="font-serif text-lg font-semibold tracking-wide mb-1">{action.title}</h3>
                <p className="text-muted-foreground font-sans text-sm leading-relaxed">{action.description}</p>
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={(e) => { e.stopPropagation(); onNavigate(action.section) }}>
                  Create
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FiTrendingUp className="w-4 h-4 text-primary" />
              <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Total</span>
            </div>
            <p className="font-serif text-2xl font-semibold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FiPackage className="w-4 h-4 text-primary" />
              <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Products</span>
            </div>
            <p className="font-serif text-2xl font-semibold">{productCount}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FiShare2 className="w-4 h-4 text-accent" />
              <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Social</span>
            </div>
            <p className="font-serif text-2xl font-semibold">{socialCount}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FiLayout className="w-4 h-4 text-muted-foreground" />
              <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Advisor</span>
            </div>
            <p className="font-serif text-2xl font-semibold">{advisorCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-serif text-lg tracking-wide">Recent Activity</CardTitle>
            {totalCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => onNavigate('history')}>
                View All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {recentItems.length === 0 ? (
            <div className="py-12 text-center">
              <FiFileText className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-sans text-sm">No content generated yet</p>
              <p className="text-muted-foreground/70 font-sans text-xs mt-1">Use the quick actions above to get started</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-1">
                {recentItems.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    <div className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-secondary/50 transition-colors">
                      <Badge variant={getTypeBadgeVariant(item.type)} className="text-[10px] w-20 justify-center shrink-0">
                        {getTypeLabel(item.type)}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium truncate">{item.title}</p>
                        <p className="font-sans text-xs text-muted-foreground truncate">{item.snippet}</p>
                      </div>
                      <span className="font-sans text-xs text-muted-foreground shrink-0">{formatTimeAgo(item.timestamp)}</span>
                    </div>
                    {idx < recentItems.length - 1 && <Separator className="opacity-30" />}
                  </React.Fragment>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
