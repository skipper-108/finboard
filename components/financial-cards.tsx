"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart, AlertCircle } from "lucide-react"
import { useMarketIndices, useMultipleQuotes, useTopGainers, useTopLosers } from "@/hooks/use-financial-data"

interface FinancialMetric {
  label: string
  value: string | number
  change?: number
  changePercent?: number
  trend?: "up" | "down" | "neutral"
}

interface FinancialCardProps {
  title: string
  metrics: FinancialMetric[]
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  loading?: boolean
  error?: string | null
}

export function FinancialCard({
  title,
  metrics,
  icon: Icon = Activity,
  className,
  loading,
  error,
}: FinancialCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <p className="text-sm text-muted-foreground text-center">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="text-lg font-bold">{metric.value}</p>
              </div>
              {metric.change !== undefined && metric.changePercent !== undefined && (
                <div className="text-right">
                  <div className="flex items-center text-xs">
                    {metric.trend === "up" || metric.change > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    <Badge variant={metric.change >= 0 ? "default" : "destructive"} className="text-xs">
                      {metric.change >= 0 ? "+" : ""}
                      {metric.change.toFixed(2)} ({metric.changePercent.toFixed(1)}%)
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function MarketOverviewCard({ className }: { className?: string }) {
  const { data: indices, loading, error } = useMarketIndices()

  const metrics: FinancialMetric[] = indices.map((index) => ({
    label: index.name,
    value: index.price.toFixed(2),
    change: index.change,
    changePercent: index.changePercent,
    trend: index.change >= 0 ? "up" : ("down" as const),
  }))

  return (
    <FinancialCard
      title="Market Overview"
      metrics={metrics}
      icon={Activity}
      className={className}
      loading={loading}
      error={error}
    />
  )
}

export function WatchlistCard({
  symbols = ["AAPL", "GOOGL", "MSFT"],
  className,
}: { symbols?: string[]; className?: string }) {
  const { data: quotes, loading, error } = useMultipleQuotes(symbols)

  const metrics: FinancialMetric[] = quotes.map((quote) => ({
    label: quote.symbol,
    value: `$${quote.price.toFixed(2)}`,
    change: quote.change,
    changePercent: quote.changePercent,
    trend: quote.change >= 0 ? "up" : ("down" as const),
  }))

  return (
    <FinancialCard
      title="My Watchlist"
      metrics={metrics}
      icon={DollarSign}
      className={className}
      loading={loading}
      error={error}
    />
  )
}

export function TopGainersCard({ className }: { className?: string }) {
  const { data: gainers, loading, error } = useTopGainers(3)

  const metrics: FinancialMetric[] = gainers.map((stock) => ({
    label: stock.symbol,
    value: `$${stock.price.toFixed(2)}`,
    change: stock.change,
    changePercent: stock.changePercent,
    trend: "up" as const,
  }))

  return (
    <FinancialCard
      title="Top Gainers"
      metrics={metrics}
      icon={TrendingUp}
      className={className}
      loading={loading}
      error={error}
    />
  )
}

export function TopLosersCard({ className }: { className?: string }) {
  const { data: losers, loading, error } = useTopLosers(3)

  const metrics: FinancialMetric[] = losers.map((stock) => ({
    label: stock.symbol,
    value: `$${stock.price.toFixed(2)}`,
    change: stock.change,
    changePercent: stock.changePercent,
    trend: "down" as const,
  }))

  return (
    <FinancialCard
      title="Top Losers"
      metrics={metrics}
      icon={TrendingDown}
      className={className}
      loading={loading}
      error={error}
    />
  )
}

export function PortfolioCard({ className }: { className?: string }) {
  // Mock portfolio data - in real app, this would come from user's portfolio API
  const metrics: FinancialMetric[] = [
    { label: "Total Value", value: "$125,430.50", change: 2340.25, changePercent: 1.9, trend: "up" },
    { label: "Day's Gain/Loss", value: "$1,234.56", change: 1234.56, changePercent: 1.0, trend: "up" },
    { label: "Total Gain/Loss", value: "$15,430.50", change: 15430.5, changePercent: 14.0, trend: "up" },
  ]

  return <FinancialCard title="Portfolio Performance" metrics={metrics} icon={PieChart} className={className} />
}
