"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, BarChart3, TrendingUp, DollarSign, PieChart, Activity, Table } from "lucide-react"

export interface Widget {
  id: string
  type: string
  title: string
  config: Record<string, any>
  active: boolean
}

interface WidgetManagerProps {
  widgets: Widget[]
  onAddWidget: (widget: Omit<Widget, "id">) => void
  onRemoveWidget: (id: string) => void
  onUpdateWidget: (id: string, updates: Partial<Widget>) => void
}

const WIDGET_TYPES = [
  {
    type: "market-overview",
    name: "Market Overview",
    description: "Display major market indices and their performance",
    icon: Activity,
    defaultConfig: { indices: ["SPY", "QQQ", "DIA"] },
  },
  {
    type: "watchlist",
    name: "Watchlist",
    description: "Track your favorite stocks and their prices",
    icon: DollarSign,
    defaultConfig: { symbols: ["AAPL", "GOOGL", "MSFT"] },
  },
  {
    type: "gainers",
    name: "Top Gainers",
    description: "Show the best performing stocks of the day",
    icon: TrendingUp,
    defaultConfig: { count: 5 },
  },
  {
    type: "losers",
    name: "Top Losers",
    description: "Show the worst performing stocks of the day",
    icon: TrendingUp,
    defaultConfig: { count: 5 },
  },
  {
    type: "chart",
    name: "Price Chart",
    description: "Interactive price chart for any stock symbol",
    icon: BarChart3,
    defaultConfig: { symbol: "AAPL", interval: "1D" },
  },
  {
    type: "table",
    name: "Stock Table",
    description: "Paginated table with stock data and filters",
    icon: Table,
    defaultConfig: { symbols: ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"] },
  },
  {
    type: "portfolio",
    name: "Portfolio Performance",
    description: "Track your portfolio's performance and allocation",
    icon: PieChart,
    defaultConfig: { holdings: [] },
  },
]

export function WidgetManager({ widgets, onAddWidget, onRemoveWidget, onUpdateWidget }: WidgetManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("")
  const [widgetTitle, setWidgetTitle] = useState("")
  const [configOpen, setConfigOpen] = useState<string | null>(null)

  const handleAddWidget = () => {
    const widgetType = WIDGET_TYPES.find((t) => t.type === selectedType)
    if (!widgetType) {
      return
    }

    if (!widgetTitle.trim()) {
      return
    }

    onAddWidget({
      type: selectedType,
      title: widgetTitle.trim(),
      config: widgetType.defaultConfig,
      active: true,
    })

    setSelectedType("")
    setWidgetTitle("")
    setIsOpen(false)
  }

  const handleTypeSelection = (type: string) => {
    setSelectedType(type)
    if (!widgetTitle) {
      const widgetType = WIDGET_TYPES.find((t) => t.type === type)
      if (widgetType) {
        setWidgetTitle(widgetType.name)
      }
    }
  }

  return (
    <>
      {/* Add Widget Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Widget
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Add New Widget</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            <div className="space-y-2">
              <Label htmlFor="widget-title">Widget Title</Label>
              <Input
                id="widget-title"
                placeholder="Enter widget title..."
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
              />
              {!widgetTitle.trim() && selectedType && (
                <p className="text-sm text-muted-foreground">Please enter a title for your widget</p>
              )}
            </div>

            <div className="space-y-4">
              <Label>Select Widget Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {WIDGET_TYPES.map((widgetType) => {
                  const Icon = widgetType.icon
                  return (
                    <Card
                      key={widgetType.type}
                      className={`cursor-pointer transition-colors ${
                        selectedType === widgetType.type ? "border-primary bg-primary/5" : "hover:border-primary/50"
                      }`}
                      onClick={() => handleTypeSelection(widgetType.type)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <CardTitle className="text-sm">{widgetType.name}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-xs">{widgetType.description}</CardDescription>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWidget} disabled={!selectedType || !widgetTitle.trim()}>
              Add Widget
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Widget Configuration Dialog */}
      <Dialog open={!!configOpen} onOpenChange={() => setConfigOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Widget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Widget configuration will be implemented in the next phase.</p>
            <div className="flex justify-end">
              <Button onClick={() => setConfigOpen(null)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
