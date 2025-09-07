"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ChevronDown, ChevronRight, Check, X, Search } from "lucide-react"

interface ApiField {
  path: string
  type: string
  value?: any
  children?: ApiField[]
}

interface ApiWidgetCreatorProps {
  onAdd: (widget: any) => void
  onCancel: () => void
}

export function ApiWidgetCreator({ onAdd, onCancel }: ApiWidgetCreatorProps) {
  const [widgetName, setWidgetName] = useState("")
  const [apiUrl, setApiUrl] = useState("")
  const [refreshInterval, setRefreshInterval] = useState("30")
  const [displayMode, setDisplayMode] = useState("card")
  const [isTestingApi, setIsTestingApi] = useState(false)
  const [apiTestResult, setApiTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)
  const [availableFields, setAvailableFields] = useState<ApiField[]>([])
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set())

  const parseJsonToFields = (obj: any, prefix = ""): ApiField[] => {
    const fields: ApiField[] = []

    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key
      const field: ApiField = {
        path,
        type: typeof value,
        value: value,
      }

      if (value && typeof value === "object" && !Array.isArray(value)) {
        field.children = parseJsonToFields(value, path)
        field.type = "object"
      } else if (Array.isArray(value)) {
        field.type = "array"
        if (value.length > 0 && typeof value[0] === "object") {
          field.children = parseJsonToFields(value[0], `${path}[0]`)
        }
      }

      fields.push(field)
    }

    return fields
  }

  const testApiConnection = async () => {
    if (!apiUrl) return

    setIsTestingApi(true)
    setApiTestResult(null)

    try {
      const response = await fetch("/api/test-external-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: apiUrl }),
      })

      const result = await response.json()

      if (response.ok && result.data) {
        const fields = parseJsonToFields(result.data)
        setAvailableFields(fields)
        setApiTestResult({
          success: true,
          message: `API connection successful! ${fields.length} top-level fields found`,
          data: result.data,
        })
      } else {
        setApiTestResult({
          success: false,
          message: result.error || "Failed to connect to API",
        })
      }
    } catch (error) {
      setApiTestResult({
        success: false,
        message: "Network error: Unable to test API connection",
      })
    } finally {
      setIsTestingApi(false)
    }
  }

  const toggleFieldExpansion = (path: string) => {
    const newExpanded = new Set(expandedFields)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedFields(newExpanded)
  }

  const toggleFieldSelection = (path: string) => {
    setSelectedFields((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]))
  }

  const renderField = (field: ApiField, level = 0) => {
    const isExpanded = expandedFields.has(field.path)
    const isSelected = selectedFields.includes(field.path)
    const hasChildren = field.children && field.children.length > 0

    if (searchTerm && !field.path.toLowerCase().includes(searchTerm.toLowerCase())) {
      return null
    }

    return (
      <div key={field.path} className="space-y-1">
        <div
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-800/50 cursor-pointer"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasChildren && (
            <button onClick={() => toggleFieldExpansion(field.path)} className="p-1 hover:bg-gray-700 rounded">
              {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>
          )}

          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleFieldSelection(field.path)}
            className="data-[state=checked]:bg-blue-600"
          />

          <span className="text-sm font-mono text-gray-300">{field.path}</span>
          <Badge variant="outline" className="text-xs">
            {field.type}
          </Badge>

          {field.value !== undefined && field.type !== "object" && (
            <span className="text-xs text-gray-500 truncate max-w-32">{String(field.value)}</span>
          )}
        </div>

        {hasChildren && isExpanded && <div>{field.children!.map((child) => renderField(child, level + 1))}</div>}
      </div>
    )
  }

  const handleAddWidget = () => {
    if (!widgetName || !apiUrl || selectedFields.length === 0) return

    const widget = {
      id: Date.now().toString(),
      title: widgetName,
      type: "api-custom",
      config: {
        apiUrl,
        refreshInterval: Number.parseInt(refreshInterval),
        displayMode,
        selectedFields,
        fieldMapping: selectedFields.reduce(
          (acc, field) => {
            acc[field] = field.split(".").pop() || field
            return acc
          },
          {} as Record<string, string>,
        ),
      },
    }

    onAdd(widget)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="widget-name">Widget Name</Label>
          <Input
            id="widget-name"
            value={widgetName}
            onChange={(e) => setWidgetName(e.target.value)}
            placeholder="Enter widget name..."
            className="bg-gray-800 border-gray-700"
          />
        </div>

        <div>
          <Label htmlFor="api-url">API URL</Label>
          <div className="flex gap-2">
            <Input
              id="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.example.com/data"
              className="bg-gray-800 border-gray-700 flex-1"
            />
            <Button
              onClick={testApiConnection}
              disabled={!apiUrl || isTestingApi}
              className="bg-green-600 hover:bg-green-700"
            >
              {isTestingApi ? "Testing..." : "Test"}
            </Button>
          </div>

          {apiTestResult && (
            <div
              className={`mt-2 p-3 rounded flex items-center gap-2 ${apiTestResult.success
                  ? "bg-green-900/50 border border-green-700 text-green-300"
                  : "bg-red-900/50 border border-red-700 text-red-300"
                }`}
            >
              {apiTestResult.success ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {apiTestResult.message}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
          <Input
            id="refresh-interval"
            type="number"
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(e.target.value)}
            className="bg-gray-800 border-gray-700"
            min="5"
          />
        </div>

        <div>
          <Label>Display Mode</Label>
          <RadioGroup value={displayMode} onValueChange={setDisplayMode} className="flex gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card">Card</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="table" id="table" />
              <Label htmlFor="table">Table</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="chart" id="chart" />
              <Label htmlFor="chart">Chart</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {availableFields.length > 0 && (
        <div className="space-y-4">
          <div>
            <Label>Search Fields</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for fields..."
                className="bg-gray-800 border-gray-700 pl-10"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Checkbox checked={selectedFields.length > 0} className="data-[state=checked]:bg-blue-600" />
              <span className="text-sm text-gray-400">Show arrays only (for table view)</span>
            </div>
          </div>

          <div>
            <Label>Available Fields</Label>
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto">{availableFields.map((field) => renderField(field))}</div>
              </CardContent>
            </Card>
          </div>

          {selectedFields.length > 0 && (
            <div>
              <Label>Selected Fields</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-800 rounded border border-gray-700">
                {selectedFields.map((field) => (
                  <Badge key={field} variant="secondary" className="bg-blue-600 text-white">
                    {field}
                    <button
                      onClick={() => toggleFieldSelection(field)}
                      className="ml-2 hover:bg-blue-700 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleAddWidget}
          disabled={!widgetName || !apiUrl || selectedFields.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Widget
        </Button>
      </div>
    </div>
  )
}
