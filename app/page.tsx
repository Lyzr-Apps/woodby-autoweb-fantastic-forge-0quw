'use client'

import React, { useState, useCallback } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FiHome, FiPackage, FiShare2, FiLayout, FiClock, FiMenu, FiX, FiActivity } from 'react-icons/fi'

import DashboardSection from './sections/DashboardSection'
import ProductContentSection from './sections/ProductContentSection'
import SocialMediaSection from './sections/SocialMediaSection'
import WebsiteAdvisorSection from './sections/WebsiteAdvisorSection'
import HistorySection from './sections/HistorySection'
import type { HistoryItem } from './sections/DashboardSection'

const AGENTS = [
  { id: '69a4eb97f42837c6d016fbf5', name: 'Product Content Agent', purpose: 'SEO pages + Shopify publishing' },
  { id: '69a4ebb218aa743b7cdb5192', name: 'Social Media Agent', purpose: 'Facebook, Instagram & TikTok' },
  { id: '69a4eb989d491c554bab7bc2', name: 'Website Advisor Agent', purpose: 'Layout recommendations' },
]

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: FiHome },
  { key: 'product', label: 'Product Pages', icon: FiPackage },
  { key: 'social', label: 'Social Media', icon: FiShare2 },
  { key: 'advisor', label: 'Website Advisor', icon: FiLayout },
  { key: 'history', label: 'History', icon: FiClock },
]

const SAMPLE_HISTORY: HistoryItem[] = [
  { id: 's1', type: 'product', title: 'Reclaimed Oak Dining Table', snippet: 'Handcrafted from century-old reclaimed oak, this dining table brings warmth and character to any space.', timestamp: '2026-03-02T10:00:00Z', status: 'completed' },
  { id: 's2', type: 'social', title: 'New Walnut Coffee Table Launch', snippet: 'Introducing our latest creation: a stunning walnut coffee table with live-edge detailing. Handcrafted with love.', timestamp: '2026-03-02T09:00:00Z', status: 'completed' },
  { id: 's3', type: 'advisor', title: 'Homepage redesign for better product discovery', snippet: 'Consider a hero carousel showcasing 3-4 featured pieces with lifestyle photography.', timestamp: '2026-03-02T08:00:00Z', status: 'completed' },
  { id: 's4', type: 'product', title: 'Hand-Turned Maple Bowl Set', snippet: 'Beautiful set of three hand-turned maple bowls, each unique in grain pattern and finish.', timestamp: '2026-03-01T16:00:00Z', status: 'completed' },
  { id: 's5', type: 'social', title: 'Behind the Scenes: Workshop Tour', snippet: 'Ever wondered where the magic happens? Step inside our Woodlawn workshop where every piece tells a story.', timestamp: '2026-03-01T14:00:00Z', status: 'completed' },
]

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function Page() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)
  const [sampleData, setSampleData] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const displayHistory = sampleData ? [...SAMPLE_HISTORY, ...history] : history

  const handleNavigate = useCallback((section: string) => {
    setActiveSection(section)
    setMobileMenuOpen(false)
  }, [])

  const handleAddHistory = useCallback((item: HistoryItem) => {
    setHistory(prev => [item, ...prev])
  }, [])

  const handleSetActiveAgent = useCallback((id: string | null) => {
    setActiveAgentId(id)
  }, [])

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex">
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} role="presentation" />
        )}

        <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border/30 flex flex-col transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-xl font-semibold tracking-wide text-foreground leading-tight">WoodiesON</h1>
                <h1 className="font-serif text-xl font-semibold tracking-wide text-foreground leading-tight">Woodlawn</h1>
              </div>
              <button className="lg:hidden p-1 rounded-md hover:bg-secondary" onClick={() => setMobileMenuOpen(false)} type="button">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <p className="font-sans text-xs text-muted-foreground mt-1">Content Automation Hub</p>
          </div>

          <Separator className="opacity-30 mx-4" />

          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.key
              return (
                <button key={item.key} onClick={() => handleNavigate(item.key)} type="button" className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-sans text-sm transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'}`}>
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t border-border/30">
            <div className="flex items-center justify-between mb-3">
              <Label htmlFor="sample-toggle" className="font-sans text-xs text-muted-foreground">Sample Data</Label>
              <Switch id="sample-toggle" checked={sampleData} onCheckedChange={setSampleData} />
            </div>
            <Separator className="opacity-30 mb-3" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <FiActivity className="w-3 h-3 text-muted-foreground" />
                <span className="font-sans text-xs text-muted-foreground uppercase tracking-wider">Agents</span>
              </div>
              {AGENTS.map((agent) => (
                <div key={agent.id} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeAgentId === agent.id ? 'bg-accent animate-pulse' : 'bg-muted-foreground/30'}`} />
                  <div className="min-w-0">
                    <p className="font-sans text-xs font-medium truncate">{agent.name}</p>
                    <p className="font-sans text-[10px] text-muted-foreground truncate">{agent.purpose}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-border/30 bg-card">
            <button onClick={() => setMobileMenuOpen(true)} type="button" className="p-2 rounded-md hover:bg-secondary">
              <FiMenu className="w-5 h-5" />
            </button>
            <span className="font-serif text-lg font-semibold tracking-wide">WoodiesONWoodlawn</span>
            <div className="w-9" />
          </div>

          <ScrollArea className="h-[calc(100vh-0px)] lg:h-screen">
            <div className="p-6 lg:p-8 max-w-6xl mx-auto">
              {activeSection === 'dashboard' && (
                <DashboardSection onNavigate={handleNavigate} history={displayHistory} />
              )}
              {activeSection === 'product' && (
                <ProductContentSection onAddHistory={handleAddHistory} onSetActiveAgent={handleSetActiveAgent} />
              )}
              {activeSection === 'social' && (
                <SocialMediaSection onAddHistory={handleAddHistory} onSetActiveAgent={handleSetActiveAgent} />
              )}
              {activeSection === 'advisor' && (
                <WebsiteAdvisorSection onAddHistory={handleAddHistory} onSetActiveAgent={handleSetActiveAgent} />
              )}
              {activeSection === 'history' && (
                <HistorySection history={displayHistory} />
              )}
            </div>
          </ScrollArea>
        </main>
      </div>
    </ErrorBoundary>
  )
}
