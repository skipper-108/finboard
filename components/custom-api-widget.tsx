"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle, Globe } from "lucide-react"

interface CustomApiWidgetProps {
  widget: {
    id: string
    title: string
    config: {
      apiUrl: string
      refreshInterval: number
      displayMode: "card" | "table" | "chart"
      selectedFields: string[]
      fieldMapping: Record<string, string>
    }
  }
}

export function CustomApiWidget({ widget }: CustomApiWidgetProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-external-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: widget.config.apiUrl }),
      })

      const result = await response.json()

      if (response.ok && result.data) {
        setData(result.data)
        setLastUpdated(new Date())
      } else {
        setError(result.error || "Failed to fetch data")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    const interval = setInterval(fetchData, widget.config.refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [widget.config.apiUrl, widget.config.refreshInterval])

  const getFieldValue = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => {
      if (key.includes("[") && key.includes("]")) {
        const [arrayKey, indexStr] = key.split("[")
        const index = Number.parseInt(indexStr.replace("]", ""))
        return current?.[arrayKey]?.[index]
      }
      return current?.[key]
    }, obj)
  }

  const renderCardMode = () => {
    if (!data) return null

    return (
      <div className="space-y-3">
        {widget.config.selectedFields.map((field) => {
          const value = getFieldValue(data, field)
          const displayName = widget.config.fieldMapping[field] || field

          return (
            <div key={field} className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{displayName}</span>
              <span className="font-mono text-sm">
                {typeof value === "number" ? value.toLocaleString() : String(value)}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const renderTableMode = () => {
    if (!data) return null

    const rows = widget.config.selectedFields.map((field) => ({
      field,
      displayName: widget.config.fieldMapping[field] || field,
      value: getFieldValue(data, field),
    }))

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-2 text-gray-400">Field</th>
              <th className="text-left p-2 text-gray-400">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.field} className="border-b border-gray-800">
                <td className="p-2 text-gray-300">{row.displayName}</td>
                <td className="p-2 font-mono">
                  {typeof row.value === "number" ? row.value.toLocaleString() : String(row.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <CardTitle className="text-lg">{widget.title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {lastUpdated && <span className="text-xs text-gray-500">{lastUpdated.toLocaleTimeString()}</span>}
            <Button variant="ghost" size="sm" onClick={fetchData} disabled={loading} className="h-8 w-8 p-0">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {widget.config.displayMode}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {widget.config.refreshInterval}s refresh
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <span className="ml-2 text-gray-400">Loading data...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-800 rounded text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {data && !error && (
          <>
            {widget.config.displayMode === "card" && renderCardMode()}
            {widget.config.displayMode === "table" && renderTableMode()}
            {widget.config.displayMode === "chart" && (
              <div className="text-center py-8 text-gray-400">Chart visualization coming soon</div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
