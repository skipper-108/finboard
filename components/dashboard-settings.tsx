"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Settings, Download, Upload, RotateCcw, CheckCircle, XCircle } from "lucide-react"
import { useSettings, useSettingsActions, useDashboardActions } from "@/lib/stores/dashboard-store"

export function DashboardSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const [importData, setImportData] = useState("")
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")

  const settings = useSettings()
  const { updateSettings } = useSettingsActions()
  const { exportDashboard, importDashboard, resetDashboard } = useDashboardActions()

  const handleExport = () => {
    const data = exportDashboard()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `finboard-dashboard-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    if (!importData.trim()) return

    const success = importDashboard(importData)
    setImportStatus(success ? "success" : "error")

    if (success) {
      setImportData("")
      setTimeout(() => {
        setImportStatus("idle")
        setIsOpen(false)
      }, 2000)
    } else {
      setTimeout(() => setImportStatus("idle"), 3000)
    }
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your dashboard? This will remove all widgets and settings.")) {
      resetDashboard()
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dashboard Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Settings</CardTitle>
              <CardDescription>Configure your dashboard preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Refresh</Label>
                  <p className="text-xs text-muted-foreground">Automatically refresh financial data</p>
                </div>
                <Switch
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) => updateSettings({ autoRefresh: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Refresh Interval</Label>
                <Select
                  value={settings.refreshInterval.toString()}
                  onValueChange={(value) => updateSettings({ refreshInterval: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30000">30 seconds</SelectItem>
                    <SelectItem value="60000">1 minute</SelectItem>
                    <SelectItem value="300000">5 minutes</SelectItem>
                    <SelectItem value="600000">10 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">Use smaller widgets and reduced spacing</p>
                </div>
                <Switch
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value: "light" | "dark" | "system") => updateSettings({ theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Import/Export */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dashboard Backup</CardTitle>
              <CardDescription>Export or import your dashboard configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleExport} variant="outline" className="flex-1 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export Dashboard
                </Button>
                <Button onClick={handleReset} variant="outline" className="flex-1 bg-transparent">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Dashboard
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Import Dashboard</Label>
                <Textarea
                  placeholder="Paste your dashboard configuration JSON here..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={4}
                />
                <div className="flex items-center gap-2">
                  <Button onClick={handleImport} disabled={!importData.trim()} size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  {importStatus === "success" && (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Import successful!
                    </div>
                  )}
                  {importStatus === "error" && (
                    <div className="flex items-center text-red-600 text-sm">
                      <XCircle className="h-4 w-4 mr-1" />
                      Import failed. Please check your data.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
