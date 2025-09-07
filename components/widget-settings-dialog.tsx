"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Widget } from "./widget-manager"

interface WidgetSettingsDialogProps {
  widget: Widget | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (widgetId: string, config: any) => void
}

export function WidgetSettingsDialog({ widget, open, onOpenChange, onSave }: WidgetSettingsDialogProps) {
  const [title, setTitle] = useState("")
  const [config, setConfig] = useState<any>({})

  useEffect(() => {
    if (widget) {
      setTitle(widget.title)
      setConfig(widget.config || {})
    }
  }, [widget])

  const handleSave = () => {
    if (widget) {
      onSave(widget.id, { title, config })
      onOpenChange(false)
    }
  }

  const renderConfigFields = () => {
    if (!widget) return null

    switch (widget.type) {
      case "chart":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                value={config.symbol || "AAPL"}
                onChange={(e) => setConfig({ ...config, symbol: e.target.value.toUpperCase() })}
                placeholder="e.g., AAPL, GOOGL, MSFT"
              />
            </div>
            <div>
              <Label htmlFor="interval">Time Interval</Label>
              <Select
                value={config.interval || "1D"}
                onValueChange={(value) => setConfig({ ...config, interval: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">1 Day</SelectItem>
                  <SelectItem value="1W">1 Week</SelectItem>
                  <SelectItem value="1M">1 Month</SelectItem>
                  <SelectItem value="3M">3 Months</SelectItem>
                  <SelectItem value="1Y">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "watchlist":
      case "table":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="symbols">Stock Symbols (comma-separated)</Label>
              <Input
                id="symbols"
                value={config.symbols?.join(", ") || "AAPL, GOOGL, MSFT"}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    symbols: e.target.value.split(",").map((s) => s.trim().toUpperCase()),
                  })
                }
                placeholder="e.g., AAPL, GOOGL, MSFT"
              />
            </div>
          </div>
        )

      case "portfolio":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="portfolio-name">Portfolio Name</Label>
              <Input
                id="portfolio-name"
                value={config.portfolioName || "My Portfolio"}
                onChange={(e) => setConfig({ ...config, portfolioName: e.target.value })}
                placeholder="Portfolio name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-allocation"
                checked={config.showAllocation || false}
                onCheckedChange={(checked) => setConfig({ ...config, showAllocation: checked })}
              />
              <Label htmlFor="show-allocation">Show allocation breakdown</Label>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-sm text-muted-foreground">No additional configuration options for this widget type.</div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Widget Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="widget-title">Widget Title</Label>
            <Input
              id="widget-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter widget title"
            />
          </div>
          {renderConfigFields()}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
