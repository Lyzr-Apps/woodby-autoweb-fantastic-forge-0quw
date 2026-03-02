'use client'

import React, { useState } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { FiLayout, FiRefreshCw, FiAlertCircle, FiGrid, FiLayers, FiEye, FiCheckSquare } from 'react-icons/fi'
import type { HistoryItem } from './DashboardSection'

const AGENT_ID = '69a4eb989d491c554bab7bc2'

interface LayoutSuggestion {
  title?: string
  description?: string
  reasoning?: string
}

interface ProductPlacement {
  title?: string
  description?: string
}

interface ActionItem {
  priority?: string
  task?: string
  impact?: string
}

interface AdvisorResult {
  layout_suggestions?: LayoutSuggestion[]
  product_placement?: ProductPlacement[]
  visual_hierarchy_tips?: string[]
  action_items?: ActionItem[]
}

interface WebsiteAdvisorSectionProps {
  onAddHistory: (item: HistoryItem) => void
  onSetActiveAgent: (id: string | null) => void
}

function parseAgentResult(raw: unknown): AdvisorResult {
  let parsed = raw
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed) } catch { return {} }
  }
  if (parsed && typeof parsed === 'object' && 'result' in (parsed as Record<string, unknown>) && typeof (parsed as Record<string, unknown>).result === 'object') {
    parsed = (parsed as Record<string, unknown>).result
  }
  return (parsed as AdvisorResult) ?? {}
}

function getPriorityColor(priority: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  const p = (priority ?? '').toLowerCase()
  if (p === 'high') return 'destructive'
  if (p === 'medium') return 'default'
  return 'secondary'
}

export default function WebsiteAdvisorSection({ onAddHistory, onSetActiveAgent }: WebsiteAdvisorSectionProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<AdvisorResult | null>(null)

  const handleSubmit = async () => {
    if (!query.trim()) {
      setError('Please describe your layout challenge or goal')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    onSetActiveAgent(AGENT_ID)

    try {
      const res = await callAIAgent(query, AGENT_ID)
      if (res.success) {
        const data = parseAgentResult(res?.response?.result)
        setResult(data)
        const firstSuggestion = Array.isArray(data?.layout_suggestions) && data.layout_suggestions.length > 0 ? data.layout_suggestions[0]?.title : 'Website recommendations'
        onAddHistory({
          id: Date.now().toString(),
          type: 'advisor',
          title: query.slice(0, 60) + (query.length > 60 ? '...' : ''),
          snippet: firstSuggestion ?? 'Advisor recommendations generated',
          timestamp: new Date().toISOString(),
          status: 'completed',
        })
      } else {
        setError('Failed to get recommendations. Please try again.')
      }
    } catch {
      setError('An error occurred while getting recommendations.')
    } finally {
      setLoading(false)
      onSetActiveAgent(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-wide text-foreground">Website Advisor</h1>
        <p className="text-muted-foreground mt-1 font-sans text-sm">Get expert layout and design recommendations</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="font-serif text-lg tracking-wide flex items-center gap-2">
            <FiLayout className="w-4 h-4" />
            Describe Your Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="query" className="font-sans text-sm">Layout Challenge or Goal</Label>
            <Textarea id="query" placeholder="e.g., I want to redesign the homepage to better showcase new furniture arrivals and improve the path to purchase..." rows={4} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleSubmit} disabled={loading || !query.trim()}>
            {loading ? (
              <><FiRefreshCw className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              'Get Recommendations'
            )}
          </Button>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm font-sans">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-4">
          <Card className="shadow-sm"><CardContent className="p-6 space-y-3"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></CardContent></Card>
          <Card className="shadow-sm"><CardContent className="p-6 space-y-3"><Skeleton className="h-5 w-1/4" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
          <Card className="shadow-sm"><CardContent className="p-6 space-y-3"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-4 w-full" /></CardContent></Card>
        </div>
      )}

      {!loading && result && (
        <ScrollArea className="max-h-[700px]">
          <div className="space-y-6 pr-2">
            {Array.isArray(result.layout_suggestions) && result.layout_suggestions.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-base tracking-wide flex items-center gap-2">
                    <FiGrid className="w-4 h-4 text-primary" />
                    Layout Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {result.layout_suggestions.map((item, i) => (
                      <AccordionItem key={i} value={`layout-${i}`}>
                        <AccordionTrigger className="font-sans text-sm font-medium hover:no-underline">
                          {item?.title ?? `Suggestion ${i + 1}`}
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            <p className="font-sans text-sm">{item?.description ?? ''}</p>
                            {item?.reasoning && (
                              <div className="bg-secondary/50 rounded-md p-3 mt-2">
                                <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Reasoning</span>
                                <p className="font-sans text-sm mt-1">{item.reasoning}</p>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {Array.isArray(result.product_placement) && result.product_placement.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-base tracking-wide flex items-center gap-2">
                    <FiLayers className="w-4 h-4 text-accent" />
                    Product Placement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.product_placement.map((item, i) => (
                    <div key={i} className="border border-border/30 rounded-md p-4">
                      <h4 className="font-sans text-sm font-semibold mb-1">{item?.title ?? `Placement ${i + 1}`}</h4>
                      <p className="font-sans text-sm text-muted-foreground">{item?.description ?? ''}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {Array.isArray(result.visual_hierarchy_tips) && result.visual_hierarchy_tips.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-base tracking-wide flex items-center gap-2">
                    <FiEye className="w-4 h-4 text-primary" />
                    Visual Hierarchy Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.visual_hierarchy_tips.map((tip, i) => (
                      <li key={i} className="font-sans text-sm flex items-start gap-2">
                        <span className="text-accent mt-0.5 shrink-0 font-bold">--</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {Array.isArray(result.action_items) && result.action_items.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="font-serif text-base tracking-wide flex items-center gap-2">
                    <FiCheckSquare className="w-4 h-4 text-primary" />
                    Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.action_items.map((item, i) => (
                    <div key={i} className="border border-border/30 rounded-md p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getPriorityColor(item?.priority ?? '')} className="font-sans text-xs">{item?.priority ?? 'Normal'}</Badge>
                      </div>
                      <p className="font-sans text-sm font-medium mb-1">{item?.task ?? ''}</p>
                      <p className="font-sans text-xs text-muted-foreground">Impact: {item?.impact ?? 'N/A'}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      )}

      {!loading && !result && !error && (
        <Card className="shadow-sm">
          <CardContent className="py-16 text-center">
            <FiLayout className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-sans text-sm">Describe your website layout challenge for expert recommendations</p>
            <p className="text-muted-foreground/60 font-sans text-xs mt-1">Get layout suggestions, product placement ideas, and action items</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
