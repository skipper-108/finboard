"use client"

import type React from "react"
import { createContext, useContext } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useState } from "react"

interface DragDropContextProps {
  children: React.ReactNode
  items: Array<{ id: string; [key: string]: any }>
  onReorder: (items: Array<{ id: string; [key: string]: any }>) => void
}

interface DragDropContextValue {
  activeId: UniqueIdentifier | null
}

const DragDropContextValue = createContext<DragDropContextValue>({
  activeId: null,
})

export function DragDropProvider({ children, items, onReorder }: DragDropContextProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over?.id)

      const newItems = arrayMove(items, oldIndex, newIndex)
      onReorder(newItems)
    }

    setActiveId(null)
  }

  const activeItem = items.find((item) => item.id === activeId)

  return (
    <DragDropContextValue.Provider value={{ activeId }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
          {children}
        </SortableContext>
        <DragOverlay>
          {activeItem ? (
            <div className="opacity-50 rotate-3 scale-105 transition-transform">
              <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
                <div className="text-sm font-medium text-card-foreground">{activeItem.title}</div>
                <div className="text-xs text-muted-foreground mt-1">Dragging...</div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </DragDropContextValue.Provider>
  )
}

export function useDragDropContext() {
  return useContext(DragDropContextValue)
}

interface SortableItemProps {
  id: string
  children: React.ReactNode
  className?: string
}

export function SortableItem({ id, children, className }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} ${isDragging ? "opacity-50 z-50" : ""}`}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}
