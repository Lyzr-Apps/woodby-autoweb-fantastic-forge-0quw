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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { FiShare2, FiRefreshCw, FiCopy, FiCheck, FiAlertCircle, FiImage, FiHash, FiZap, FiVideo } from 'react-icons/fi'
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa'
import type { HistoryItem } from './DashboardSection'

const AGENT_ID = '69a4ebb218aa743b7cdb5192'

interface SocialResult {
  post_text?: string
  platform?: string
  hashtags?: string[]
  image_suggestion?: string
  engagement_hook?: string
  post_style?: string
  published_status?: string
  video_concept?: string
}

interface SocialMediaSectionProps {
  onAddHistory: (item: HistoryItem) => void
  onSetActiveAgent: (id: string | null) => void
}

function parseAgentResult(raw: unknown): SocialResult {
  let parsed = raw
  if (typeof parsed === 'string') {
    try { parsed = JSON.parse(parsed) } catch { return {} }
  }
  if (parsed && typeof parsed === 'object' && 'result' in (parsed as Record<string, unknown>) && typeof (parsed as Record<string, unknown>).result === 'object') {
    parsed = (parsed as Record<string, unknown>).result
  }
  return (parsed as SocialResult) ?? {}
}

const PLATFORMS = [
  { value: 'Facebook', label: 'Facebook', icon: FaFacebook, color: 'text-blue-600', maxChars: 500 },
  { value: 'Instagram', label: 'Instagram', icon: FaInstagram, color: 'text-pink-600', maxChars: 2200 },
  { value: 'TikTok', label: 'TikTok', icon: FaTiktok, color: 'text-foreground', maxChars: 150 },
]

function getPlatformIcon(platform: string) {
  const p = PLATFORMS.find(pl => pl.value.toLowerCase() === (platform || '').toLowerCase())
  if (p) {
    const Icon = p.icon
    return <Icon className={`w-4 h-4 ${p.color}`} />
  }
  return <FiShare2 className="w-4 h-4" />
}

function getPlatformMaxChars(platform: string) {
  const p = PLATFORMS.find(pl => pl.value === platform)
  return p?.maxChars ?? 500
}

export default function SocialMediaSection({ onAddHistory, onSetActiveAgent }: SocialMediaSectionProps) {
  const [formData, setFormData] = useState({
    topic: '',
    platform: 'Facebook',
    style: 'Promotional',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<SocialResult | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Please enter a topic or product')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    onSetActiveAgent(AGENT_ID)

    try {
      const message = `Topic/Product: ${formData.topic}\nPlatform: ${formData.platform}\nPost Style: ${formData.style}\nCustom Notes: ${formData.notes || 'None'}`
      const res = await callAIAgent(message, AGENT_ID)
      if (res.success) {
        const data = parseAgentResult(res?.response?.result)
        setResult(data)
        onAddHistory({
          id: Date.now().toString(),
          type: 'social',
          title: `${formData.platform}: ${formData.topic}`,
          snippet: data?.post_text || 'Social post generated',
          timestamp: new Date().toISOString(),
          status: 'completed',
        })
      } else {
        setError('Failed to generate social post. Please try again.')
      }
    } catch {
      setError('An error occurred while generating the post.')
    } finally {
      setLoading(false)
      onSetActiveAgent(null)
    }
  }

  const handleCopy = () => {
    if (!result?.post_text) return
    const hashtags = Array.isArray(result.hashtags) ? result.hashtags.map(h => h.startsWith('#') ? h : `#${h}`).join(' ') : ''
    const fullText = `${result.post_text}\n\n${hashtags}`
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const postLength = (result?.post_text ?? '').length
  const maxChars = getPlatformMaxChars(result?.platform || formData.platform)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-wide text-foreground">Social Media Command</h1>
        <p className="text-muted-foreground mt-1 font-sans text-sm">Create and publish content across Facebook, Instagram, and TikTok</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-lg tracking-wide flex items-center gap-2">
              <FiShare2 className="w-4 h-4" />
              Post Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="topic" className="font-sans text-sm">Topic / Product *</Label>
              <Input id="topic" placeholder="e.g., New handcrafted walnut coffee table" value={formData.topic} onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))} />
            </div>

            <div>
              <Label className="font-sans text-sm">Platform</Label>
              <div className="flex gap-3 mt-2">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon
                  const isSelected = formData.platform === platform.value
                  return (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, platform: platform.value }))}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all font-sans text-sm ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-foreground shadow-sm'
                          : 'border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? platform.color : ''}`} />
                      {platform.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <Label className="font-sans text-sm">Post Style</Label>
              <RadioGroup value={formData.style} onValueChange={(val) => setFormData(prev => ({ ...prev, style: val }))} className="flex gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Promotional" id="promo" />
                  <Label htmlFor="promo" className="font-sans text-sm cursor-pointer">Promotional</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Educational" id="edu" />
                  <Label htmlFor="edu" className="font-sans text-sm cursor-pointer">Educational</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Behind-the-Scenes" id="bts" />
                  <Label htmlFor="bts" className="font-sans text-sm cursor-pointer">Behind-the-Scenes</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="notes" className="font-sans text-sm">Custom Notes (optional)</Label>
              <Textarea id="notes" placeholder="Any specific angle, tone, or details to include..." rows={3} value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} />
            </div>

            <Button className="w-full" onClick={handleGenerate} disabled={loading || !formData.topic.trim()}>
              {loading ? (
                <><FiRefreshCw className="w-4 h-4 mr-2 animate-spin" /> Generating for {formData.platform}...</>
              ) : (
                <>Generate & Post to {formData.platform}</>
              )}
            </Button>

            {formData.platform === 'TikTok' && (
              <p className="text-muted-foreground/70 font-sans text-xs text-center">TikTok posts will be generated as ready-to-use captions. Copy and paste into TikTok.</p>
            )}

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm font-sans">
                <FiAlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {loading && (
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-16 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        )}

        {!loading && result && (
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-lg tracking-wide flex items-center gap-2">
                  {getPlatformIcon(result.platform || formData.platform)}
                  <span>{result.platform || formData.platform} Post</span>
                </CardTitle>
                <div className="flex items-center gap-2">
                  {result.published_status && (
                    <Badge variant="outline" className="font-sans text-xs">{result.published_status}</Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <><FiCheck className="w-3 h-3 mr-1" /> Copied</> : <><FiCopy className="w-3 h-3 mr-1" /> Copy</>}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Post Text</span>
                  <span className={`font-sans text-xs ${postLength > maxChars ? 'text-destructive' : 'text-muted-foreground'}`}>{postLength}/{maxChars}</span>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap">{result.post_text ?? 'N/A'}</div>
              </div>

              <Separator className="opacity-30" />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiHash className="w-3 h-3 text-muted-foreground" />
                  <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Hashtags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(result.hashtags) && result.hashtags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="font-sans text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator className="opacity-30" />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiImage className="w-3 h-3 text-muted-foreground" />
                  <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Image Suggestion</span>
                </div>
                <p className="font-sans text-sm text-muted-foreground">{result.image_suggestion ?? 'N/A'}</p>
              </div>

              {result.video_concept && result.video_concept !== 'N/A' && (
                <>
                  <Separator className="opacity-30" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FiVideo className="w-3 h-3 text-muted-foreground" />
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Video Concept</span>
                    </div>
                    <p className="font-sans text-sm text-muted-foreground">{result.video_concept}</p>
                  </div>
                </>
              )}

              <Separator className="opacity-30" />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FiZap className="w-3 h-3 text-muted-foreground" />
                  <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Engagement Hook</span>
                </div>
                <p className="font-sans text-sm font-medium">{result.engagement_hook ?? 'N/A'}</p>
              </div>

              {result.post_style && (
                <>
                  <Separator className="opacity-30" />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Style:</span>
                      <Badge variant="outline" className="font-sans text-xs">{result.post_style}</Badge>
                    </div>
                    {result.platform && (
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Platform:</span>
                        <Badge variant="outline" className="font-sans text-xs flex items-center gap-1">
                          {getPlatformIcon(result.platform)}
                          {result.platform}
                        </Badge>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {!loading && !result && !error && (
          <Card className="shadow-sm">
            <CardContent className="py-16 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FaFacebook className="w-8 h-8 text-blue-600/40" />
                <FaInstagram className="w-8 h-8 text-pink-600/40" />
                <FaTiktok className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-sans text-sm">Create engaging posts for Facebook, Instagram, and TikTok</p>
              <p className="text-muted-foreground/60 font-sans text-xs mt-1">Select a platform, fill in the details, then click Generate</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
