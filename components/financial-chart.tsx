"use client"

import { useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { useChartData, useStockQuote } from "@/hooks/use-financial-data"

interface FinancialChartProps {
  symbol: string
  interval?: string
  className?: string
}

export function FinancialChart({ symbol, interval = "1D", className }: FinancialChartProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line")
  const [timeframe, setTimeframe] = useState(interval)

  const { data: chartData, loading: chartLoading, error: chartError } =
    useChartData(symbol, timeframe, "1M")
  const { data: quote, loading: quoteLoading } = useStockQuote(symbol)

  const currentPrice = quote?.price || 0
  const priceChange = quote?.change || 0
  const percentChange = quote?.changePercent || 0
  const isPositive = priceChange >= 0

  if (chartLoading || quoteLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">{symbol} Price Chart</CardTitle>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-8 w-12" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 mx-auto" />
              <Skeleton className="h-[250px] w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (chartError) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{symbol} Price Chart</CardTitle>
          <AlertCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{chartError}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium">{symbol} Price Chart</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">${currentPrice.toFixed(2)}</span>
            <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {isPositive ? "+" : ""}
              {priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
            </Badge>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant={timeframe === "1D" ? "default" : "outline"} size="sm" onClick={() => setTimeframe("1D")}>
            1D
          </Button>
          <Button variant={timeframe === "1W" ? "default" : "outline"} size="sm" onClick={() => setTimeframe("1W")}>
            1W
          </Button>
          <Button variant={timeframe === "1M" ? "default" : "outline"} size="sm" onClick={() => setTimeframe("1M")}>
            1M
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={chartData}>
                {/* Use theme vars directly (no hsl()) */}
                <CartesianGrid stroke="var(--muted-foreground)" strokeDasharray="3 3" strokeOpacity={0.25} />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.6 }}
                  tickLine={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.6 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.6 }}
                  tickLine={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.6 }}
                  domain={["dataMin - 5", "dataMax + 5"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    color: "var(--card-foreground)",
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="var(--color-chart-1, #00ff88)" /* falls back if not defined */
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    fill: "var(--color-chart-1, #00ff88)",
                    stroke: "var(--background)",
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid stroke="var(--muted-foreground)" strokeDasharray="3 3" strokeOpacity={0.25} />
                <XAxis
                  dataKey="timestamp"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.6 }}
                  tickLine={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.6 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.6 }}
                  tickLine={{ stroke: "var(--muted-foreground)", strokeOpacity: 0.6 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    color: "var(--card-foreground)",
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value: number) => [value.toLocaleString(), "Volume"]}
                />
                <Bar dataKey="volume" fill="var(--color-chart-2, #3b82f6)" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          <Button variant={chartType === "line" ? "default" : "outline"} size="sm" onClick={() => setChartType("line")}>
            Price
          </Button>
          <Button variant={chartType === "bar" ? "default" : "outline"} size="sm" onClick={() => setChartType("bar")}>
            Volume
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
