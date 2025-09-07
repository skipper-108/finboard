"use client"

import { useEffect, useCallback, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { BarChart3 } from "lucide-react"
import { WidgetManager } from "@/components/widget-manager"
import { FinancialChart } from "@/components/financial-chart"
import { StockTable } from "@/components/stock-table"
import {
  MarketOverviewCard,
  WatchlistCard,
  TopGainersCard,
  TopLosersCard,
  PortfolioCard,
} from "@/components/financial-cards"
import { DragDropProvider } from "@/components/drag-drop-context"
import { DraggableWidget } from "@/components/draggable-widget"
import { DashboardSettings } from "@/components/dashboard-settings"
import { useWidgets, useSettings, useWidgetActions } from "@/lib/stores/dashboard-store"
import { WidgetSettingsDialog } from "@/components/widget-settings-dialog"

export default function FinBoardDashboard() {
  const widgets = useWidgets()
  const settings = useSettings()
  const { addWidget, removeWidget, updateWidget, reorderWidgets } = useWidgetActions()

  const [configureWidgetId, setConfigureWidgetId] = useState<string | null>(null)
  const configureWidget = widgets.find((w) => w.id === configureWidgetId) || null

  useEffect(() => {
    const applyTheme = () => {
      if (settings.theme !== "system") {
        document.documentElement.classList.toggle("dark", settings.theme === "dark")
      } else {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        document.documentElement.classList.toggle("dark", mediaQuery.matches)

        const handleChange = (e: MediaQueryListEvent) => {
          document.documentElement.classList.toggle("dark", e.matches)
        }

        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
      }
    }

    return applyTheme()
  }, [settings.theme])

  const handleConfigureWidget = useCallback((id: string) => {
    setConfigureWidgetId(id)
  }, [])

  const handleSaveWidgetConfig = useCallback(
    (widgetId: string, newConfig: any) => {
      const widget = widgets.find((w) => w.id === widgetId)
      if (widget) {
        updateWidget(widgetId, {
          ...widget,
          title: newConfig.title,
          config: newConfig.config,
        })
      }
    },
    [widgets, updateWidget],
  )

  const renderWidgetContent = useCallback((widget: any) => {
    switch (widget.type) {
      case "market-overview":
        return <MarketOverviewCard />

      case "watchlist":
        return <WatchlistCard symbols={widget.config.symbols} />

      case "gainers":
        return <TopGainersCard />

      case "losers":
        return <TopLosersCard />

      case "portfolio":
        return <PortfolioCard />

      case "chart":
        return <FinancialChart symbol={widget.config.symbol} interval={widget.config.interval} />

      case "table":
        return <StockTable title={widget.title} symbols={widget.config.symbols} />

      default:
        return null
    }
  }, [])

  const getWidgetClassName = useCallback(
    (widget: any) => {
      const baseClass =
        widget.type === "market-overview" || widget.type === "chart" || widget.type === "table"
          ? "col-span-1 md:col-span-2"
          : ""

      return settings.compactMode ? `${baseClass} compact-widget` : baseClass
    },
    [settings.compactMode],
  )

  const gridClassName = useMemo(() => {
    return `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${settings.compactMode ? "gap-4" : "gap-6"}`
  }, [settings.compactMode])

  return (
    <div className={`min-h-screen bg-background ${settings.compactMode ? "compact-mode" : ""}`}>
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-card-foreground">FinBoard</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              Real-time Dashboard
            </Badge>
            {settings.autoRefresh && (
              <Badge variant="outline" className="text-xs">
                Auto-refresh: {settings.refreshInterval / 1000}s
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <DashboardSettings />
            <WidgetManager
              widgets={widgets}
              onAddWidget={addWidget}
              onRemoveWidget={removeWidget}
              onUpdateWidget={updateWidget}
            />
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className={`p-6 ${settings.compactMode ? "p-4" : ""}`}>
        <DragDropProvider items={widgets} onReorder={reorderWidgets}>
          <div className={gridClassName}>
            {widgets.map((widget) => {
              const widgetContent = renderWidgetContent(widget)
              return widgetContent ? (
                <DraggableWidget
                  key={widget.id}
                  widget={widget}
                  onRemove={removeWidget}
                  onConfigure={handleConfigureWidget}
                  className={getWidgetClassName(widget)}
                >
                  {widgetContent}
                </DraggableWidget>
              ) : null
            })}

            {/* Add Widget Placeholder */}
            <div className="border-dashed border-2 border-muted-foreground/25 rounded-lg">
              <div className={`flex items-center justify-center ${settings.compactMode ? "h-[150px]" : "h-[200px]"}`}>
                <WidgetManager
                  widgets={widgets}
                  onAddWidget={addWidget}
                  onRemoveWidget={removeWidget}
                  onUpdateWidget={updateWidget}
                />
              </div>
            </div>
          </div>
        </DragDropProvider>
      </main>

      {/* Widget Settings Dialog */}
      <WidgetSettingsDialog
        widget={configureWidget}
        open={!!configureWidgetId}
        onOpenChange={(open) => !open && setConfigureWidgetId(null)}
        onSave={handleSaveWidgetConfig}
      />

      <style jsx global>{`
        .compact-mode .compact-widget {
          font-size: 0.875rem;
        }
        .compact-mode .compact-widget .text-2xl {
          font-size: 1.5rem;
        }
        .compact-mode .compact-widget .text-lg {
          font-size: 1rem;
        }
      `}</style>
    </div>
  )
}
