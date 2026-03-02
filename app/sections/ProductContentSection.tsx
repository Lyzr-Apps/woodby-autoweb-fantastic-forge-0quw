'use client'

import React, { useState } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FiPackage, FiRefreshCw, FiCopy, FiCheck, FiAlertCircle, FiImage, FiTarget, FiList, FiShoppingCart, FiExternalLink } from 'react-icons/fi'
import type { HistoryItem } from './DashboardSection'

const AGENT_ID = '69a4eb97f42837c6d016fbf5'

interface ProductResult {
  seo_title?: string
  meta_description?: string
  product_description?: string
  feature_list?: string[]
  image_suggestions?: string[]
  target_keywords?: string[]
  shopify_status?: string
}

interface ProductContentSectionProps {
  onAddHistory: (item: HistoryItem) => void
  onSetActiveAgent: (id: string | null) => void
}

function parseAgentResult(raw: unknown): ProductResult {
  let parsed = raw
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed) } catch { return {} }
  }
  if (parsed && typeof parsed === 'object' && 'result' in (parsed as Record<string, unknown>) && typeof (parsed as Record<string, unknown>).result === 'object') {
    parsed = (parsed as Record<string, unknown>).result
  }
  return (parsed as ProductResult) ?? {}
}

export default function ProductContentSection({ onAddHistory, onSetActiveAgent }: ProductContentSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    features: '',
    priceRange: '',
    keywords: '',
  })
  const [publishToShopify, setPublishToShopify] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ProductResult | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!formData.name.trim()) {
      setError('Please enter a product name')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    onSetActiveAgent(AGENT_ID)

    try {
      const shopifyLine = publishToShopify
        ? '\nPublish to Shopify: Yes - Please create this product in the Shopify store.'
        : '\nPublish to Shopify: No'
      const message = `Product Name: ${formData.name}\nCategory: ${formData.category || 'General'}\nKey Features: ${formData.features}\nPrice Range: ${formData.priceRange}\nTarget Keywords: ${formData.keywords}${shopifyLine}`
      const res = await callAIAgent(message, AGENT_ID)
      if (res.success) {
        const data = parseAgentResult(res?.response?.result)
        setResult(data)
        onAddHistory({
          id: Date.now().toString(),
          type: 'product',
          title: data?.seo_title || formData.name,
          snippet: data?.meta_description || 'Product content generated',
          timestamp: new Date().toISOString(),
          status: 'completed',
        })
      } else {
        setError('Failed to generate content. Please try again.')
      }
    } catch {
      setError('An error occurred while generating content.')
    } finally {
      setLoading(false)
      onSetActiveAgent(null)
    }
  }

  const handleCopyAll = () => {
    if (!result) return
    const text = [
      `SEO Title: ${result.seo_title ?? ''}`,
      `Meta Description: ${result.meta_description ?? ''}`,
      `\nProduct Description:\n${result.product_description ?? ''}`,
      `\nFeatures:\n${Array.isArray(result.feature_list) ? result.feature_list.map(f => `- ${f}`).join('\n') : ''}`,
      `\nImage Suggestions:\n${Array.isArray(result.image_suggestions) ? result.image_suggestions.map(s => `- ${s}`).join('\n') : ''}`,
      `\nTarget Keywords: ${Array.isArray(result.target_keywords) ? result.target_keywords.join(', ') : ''}`,
    ].join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-wide text-foreground">Product Content Studio</h1>
        <p className="text-muted-foreground mt-1 font-sans text-sm">Generate SEO-optimized product pages and publish to Shopify</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-lg tracking-wide flex items-center gap-2">
              <FiPackage className="w-4 h-4" />
              Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="font-sans text-sm">Product Name *</Label>
              <Input id="name" placeholder="e.g., Reclaimed Oak Dining Table" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div>
              <Label className="font-sans text-sm">Category</Label>
              <Select value={formData.category} onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Home Decor">Home Decor</SelectItem>
                  <SelectItem value="Kitchen">Kitchen</SelectItem>
                  <SelectItem value="Garden">Garden</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="features" className="font-sans text-sm">Key Features</Label>
              <Textarea id="features" placeholder="Describe key features, materials, dimensions..." rows={3} value={formData.features} onChange={(e) => setFormData(prev => ({ ...prev, features: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="price" className="font-sans text-sm">Price Range</Label>
              <Input id="price" placeholder="e.g., $500 - $800" value={formData.priceRange} onChange={(e) => setFormData(prev => ({ ...prev, priceRange: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="keywords" className="font-sans text-sm">Target Keywords (comma separated)</Label>
              <Input id="keywords" placeholder="e.g., reclaimed wood, dining table, handcrafted" value={formData.keywords} onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))} />
            </div>

            <Separator className="opacity-30" />

            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10">
                  <FiShoppingCart className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <Label htmlFor="shopify-toggle" className="font-sans text-sm font-medium cursor-pointer">Publish to Shopify</Label>
                  <p className="font-sans text-xs text-muted-foreground">Auto-create this product in your Shopify store</p>
                </div>
              </div>
              <Switch id="shopify-toggle" checked={publishToShopify} onCheckedChange={setPublishToShopify} />
            </div>

            <Button className="w-full" onClick={handleGenerate} disabled={loading || !formData.name.trim()}>
              {loading ? (
                <><FiRefreshCw className="w-4 h-4 mr-2 animate-spin" /> {publishToShopify ? 'Generating & Publishing to Shopify...' : 'Generating...'}</>
              ) : (
                <>{publishToShopify ? 'Generate & Publish to Shopify' : 'Generate Product Page'}</>
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

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-lg tracking-wide">Content Preview</CardTitle>
              {result && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopyAll}>
                    {copied ? <><FiCheck className="w-3 h-3 mr-1" /> Copied</> : <><FiCopy className="w-3 h-3 mr-1" /> Copy All</>}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
                    <FiRefreshCw className="w-3 h-3 mr-1" /> Regenerate
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : result ? (
              <ScrollArea className="max-h-[600px] pr-2">
                <div className="space-y-5">
                  {result.shopify_status && result.shopify_status.toLowerCase() !== 'not published' && result.shopify_status.toLowerCase() !== 'n/a' && (
                    <>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <FiShoppingCart className="w-5 h-5 text-primary shrink-0" />
                        <div className="flex-1">
                          <p className="font-sans text-sm font-medium text-foreground">Shopify Status</p>
                          <p className="font-sans text-xs text-muted-foreground">{result.shopify_status}</p>
                        </div>
                        <Badge variant="default" className="font-sans text-xs shrink-0">
                          <FiExternalLink className="w-3 h-3 mr-1" />
                          Published
                        </Badge>
                      </div>
                      <Separator className="opacity-30" />
                    </>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">SEO Title</span>
                      <span className="font-sans text-xs text-muted-foreground">{(result.seo_title ?? '').length}/60 chars</span>
                    </div>
                    <p className="font-serif text-lg font-semibold">{result.seo_title ?? 'N/A'}</p>
                  </div>
                  <Separator className="opacity-30" />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Meta Description</span>
                      <span className="font-sans text-xs text-muted-foreground">{(result.meta_description ?? '').length}/160 chars</span>
                    </div>
                    <p className="font-sans text-sm text-muted-foreground">{result.meta_description ?? 'N/A'}</p>
                  </div>
                  <Separator className="opacity-30" />
                  <div>
                    <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Product Description</span>
                    <div className="mt-2 font-sans text-sm leading-relaxed whitespace-pre-wrap">{result.product_description ?? 'N/A'}</div>
                  </div>
                  <Separator className="opacity-30" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FiList className="w-3 h-3 text-muted-foreground" />
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Features</span>
                    </div>
                    <ul className="space-y-1">
                      {Array.isArray(result.feature_list) && result.feature_list.map((feat, i) => (
                        <li key={i} className="font-sans text-sm flex items-start gap-2">
                          <span className="text-primary mt-1 shrink-0">--</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator className="opacity-30" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FiImage className="w-3 h-3 text-muted-foreground" />
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Image Suggestions</span>
                    </div>
                    <ul className="space-y-1">
                      {Array.isArray(result.image_suggestions) && result.image_suggestions.map((sug, i) => (
                        <li key={i} className="font-sans text-sm text-muted-foreground">{sug}</li>
                      ))}
                    </ul>
                  </div>
                  <Separator className="opacity-30" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FiTarget className="w-3 h-3 text-muted-foreground" />
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Target Keywords</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(result.target_keywords) && result.target_keywords.map((kw, i) => (
                        <Badge key={i} variant="secondary" className="font-sans text-xs">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="py-16 text-center">
                <FiPackage className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-sans text-sm">Enter product details to generate SEO-optimized content</p>
                <p className="text-muted-foreground/60 font-sans text-xs mt-1">Fill in the form on the left and click Generate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
