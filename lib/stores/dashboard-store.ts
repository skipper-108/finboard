"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Widget } from "@/components/widget-manager"

interface DashboardSettings {
  theme: "light" | "dark" | "system"
  refreshInterval: number
  autoRefresh: boolean
  compactMode: boolean
}

interface DashboardState {
  // Widget Management
  widgets: Widget[]
  addWidget: (widget: Omit<Widget, "id">) => void
  removeWidget: (id: string) => void
  updateWidget: (id: string, updates: Partial<Widget>) => void
  reorderWidgets: (widgets: Widget[]) => void

  // Dashboard Settings
  settings: DashboardSettings
  updateSettings: (settings: Partial<DashboardSettings>) => void

  // Layout Management
  layout: Record<string, { x: number; y: number; w: number; h: number }>
  updateLayout: (layout: Record<string, { x: number; y: number; w: number; h: number }>) => void

  // Import/Export
  exportDashboard: () => string
  importDashboard: (data: string) => boolean
  resetDashboard: () => void

  // Persistence
  lastSaved: number
  markSaved: () => void
}

const defaultWidgets: Widget[] = [
  {
    id: "default-1",
    type: "market-overview",
    title: "Market Overview",
    active: true,
    config: { indices: ["SPY", "QQQ", "DIA"] },
  },
  {
    id: "default-2",
    type: "watchlist",
    title: "My Watchlist",
    active: true,
    config: { symbols: ["AAPL", "GOOGL", "MSFT"] },
  },
  {
    id: "default-3",
    type: "gainers",
    title: "Top Gainers",
    active: true,
    config: { count: 5 },
  },
]

const defaultSettings: DashboardSettings = {
  theme: "system",
  refreshInterval: 60000, // 1 minute
  autoRefresh: true,
  compactMode: false,
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial State
      widgets: defaultWidgets,
      settings: defaultSettings,
      layout: {},
      lastSaved: Date.now(),

      // Widget Management Actions
      addWidget: (widget) =>
        set((state) => {
          const newWidget: Widget = {
            ...widget,
            id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          }
          return {
            widgets: [...state.widgets, newWidget],
            lastSaved: Date.now(),
          }
        }),

      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
          layout: Object.fromEntries(Object.entries(state.layout).filter(([key]) => key !== id)),
          lastSaved: Date.now(),
        })),

      updateWidget: (id, updates) =>
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
          lastSaved: Date.now(),
        })),

      reorderWidgets: (widgets) =>
        set(() => ({
          widgets,
          lastSaved: Date.now(),
        })),

      // Settings Management
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
          lastSaved: Date.now(),
        })),

      // Layout Management
      updateLayout: (layout) =>
        set(() => ({
          layout,
          lastSaved: Date.now(),
        })),

      // Import/Export Functions
      exportDashboard: () => {
        const state = get()
        const exportData = {
          widgets: state.widgets,
          settings: state.settings,
          layout: state.layout,
          exportedAt: new Date().toISOString(),
          version: "1.0.0",
        }
        return JSON.stringify(exportData, null, 2)
      },

      importDashboard: (data) => {
        try {
          const importData = JSON.parse(data)

          // Validate the imported data structure
          if (!importData.widgets || !Array.isArray(importData.widgets)) {
            throw new Error("Invalid dashboard data: missing or invalid widgets")
          }

          // Validate each widget has required fields
          const validWidgets = importData.widgets.every(
            (w: any) => w.id && w.type && w.title && typeof w.active === "boolean" && w.config,
          )

          if (!validWidgets) {
            throw new Error("Invalid dashboard data: widgets missing required fields")
          }

          set(() => ({
            widgets: importData.widgets,
            settings: { ...defaultSettings, ...importData.settings },
            layout: importData.layout || {},
            lastSaved: Date.now(),
          }))

          return true
        } catch (error) {
          console.error("Failed to import dashboard:", error)
          return false
        }
      },

      resetDashboard: () =>
        set(() => ({
          widgets: defaultWidgets,
          settings: defaultSettings,
          layout: {},
          lastSaved: Date.now(),
        })),

      // Persistence Helper
      markSaved: () =>
        set(() => ({
          lastSaved: Date.now(),
        })),
    }),
    {
      name: "finboard-dashboard",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        widgets: state.widgets,
        settings: state.settings,
        layout: state.layout,
        lastSaved: state.lastSaved,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle migration between versions if needed
        if (version === 0) {
          // Migrate from version 0 to 1
          return {
            ...persistedState,
            settings: { ...defaultSettings, ...persistedState.settings },
          }
        }
        return persistedState
      },
    },
  ),
)

// Selector hooks for better performance
export const useWidgets = () => useDashboardStore((state) => state.widgets)
export const useSettings = () => useDashboardStore((state) => state.settings)
export const useLayout = () => useDashboardStore((state) => state.layout)

// Action hooks
export const useWidgetActions = () => {
  const addWidget = useDashboardStore((state) => state.addWidget)
  const removeWidget = useDashboardStore((state) => state.removeWidget)
  const updateWidget = useDashboardStore((state) => state.updateWidget)
  const reorderWidgets = useDashboardStore((state) => state.reorderWidgets)

  return { addWidget, removeWidget, updateWidget, reorderWidgets }
}

export const useSettingsActions = () => {
  const updateSettings = useDashboardStore((state) => state.updateSettings)
  return { updateSettings }
}

export const useDashboardActions = () => {
  const exportDashboard = useDashboardStore((state) => state.exportDashboard)
  const importDashboard = useDashboardStore((state) => state.importDashboard)
  const resetDashboard = useDashboardStore((state) => state.resetDashboard)

  return { exportDashboard, importDashboard, resetDashboard }
}
