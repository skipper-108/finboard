"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical, X, Settings } from "lucide-react"
import { SortableItem, useDragDropContext } from "./drag-drop-context"
import type { Widget } from "./widget-manager"

interface DraggableWidgetProps {
  widget: Widget
  onRemove: (id: string) => void
  onConfigure: (id: string) => void
  children: React.ReactNode
  className?: string
}

export function DraggableWidget({ widget, onRemove, onConfigure, children, className }: DraggableWidgetProps) {
  const { activeId } = useDragDropContext()
  const isDragging = activeId === widget.id

  return (
    <SortableItem id={widget.id} className={className}>
      <Card
        className={`relative group transition-all duration-200 ${isDragging ? "shadow-lg scale-105" : "hover:shadow-md"}`}
      >
        {/* Drag Handle and Controls */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="flex items-center gap-1">
            <div className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50 transition-colors">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Widget Controls */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-muted/50"
              onClick={(e) => {
                e.stopPropagation()
                onConfigure(widget.id)
              }}
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(widget.id)
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Widget Content */}
        <div className={`${isDragging ? "pointer-events-none" : ""}`}>{children}</div>

        {/* Dragging Indicator */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-lg flex items-center justify-center">
            <div className="text-sm font-medium text-primary">Moving widget...</div>
          </div>
        )}
      </Card>
    </SortableItem>
  )
}
