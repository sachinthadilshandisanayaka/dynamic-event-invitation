import { useRef, useEffect } from 'react'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCenter,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBuilderStore } from '../../store/builderStore'
import { WidgetRenderer } from '../widgets/WidgetRenderer'
import type { Section } from '../../types'
import { GripVertical, Trash2, Copy } from 'lucide-react'
import { useState } from 'react'
import { ensureGoogleFontsForSections } from '../../lib/googleFonts'

function SortableSection({ section, isSelected, onSelect, onDelete, onDuplicate }: {
  section: Section
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={`relative group cursor-pointer`} onClick={onSelect}>
      {/* Selection ring */}
      <div className={`absolute inset-0 z-10 pointer-events-none border-2 rounded transition-all ${
        isSelected ? 'border-indigo-500' : 'border-transparent group-hover:border-indigo-200'
      }`} />

      {/* Toolbar */}
      <div className={`absolute top-2 right-2 z-20 flex items-center gap-1 transition-opacity ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <button {...listeners} {...attributes}
          className="p-1.5 bg-white border border-gray-200 rounded shadow-sm cursor-grab active:cursor-grabbing hover:bg-gray-50"
          onClick={(e) => e.stopPropagation()}>
          <GripVertical size={14} className="text-gray-500" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate() }}
          className="p-1.5 bg-white border border-gray-200 rounded shadow-sm hover:bg-blue-50 hover:text-blue-600">
          <Copy size={14} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="p-1.5 bg-white border border-gray-200 rounded shadow-sm hover:bg-red-50 hover:text-red-500">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Widget preview — CSS vars mirror what EventPage sets on the section wrapper */}
      <div
        className="pointer-events-none select-none"
        style={{
          ...(section.props.fontFamily ? {
            '--font-heading': section.props.fontFamily as string,
            '--font-body':    section.props.fontFamily as string,
          } as React.CSSProperties : {}),
          ...(section.props.textColor ? {
            '--color-text': section.props.textColor as string,
          } as React.CSSProperties : {}),
        }}
      >
        <WidgetRenderer section={section} preview />
      </div>
    </div>
  )
}

export function BuilderCanvas({ slug, onOpenTemplates }: { slug: string; onOpenTemplates?: () => void }) {
  const { sections, selectedId, selectSection, removeSection, reorderSections, addSection } = useBuilderStore()
  const [activeSection, setActiveSection] = useState<Section | null>(null)

  // Pre-load all Google Fonts used in the current layout
  useEffect(() => { ensureGoogleFontsForSections(sections) }, [sections])
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragStart = (event: DragStartEvent) => {
    const section = sections.find((s) => s.id === event.active.id)
    if (section) setActiveSection(section)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSection(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    reorderSections(arrayMove(sections, oldIndex, newIndex))
  }

  const handleDuplicate = (section: Section) => {
    addSection({
      ...section,
      id: crypto.randomUUID(),
      order: sections.length,
      props: { ...section.props },
    })
  }

  return (
    <div
      className="flex-1 overflow-auto bg-gray-200 relative"
      onDragOver={(e) => e.preventDefault()}
    >
      {sections.length === 0 ? (
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-sm">
            <div className="text-6xl mb-5">🎨</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Start building your event page</h3>
            <p className="text-sm text-gray-400 mb-6">
              Pick a ready-made template to get started instantly, or drag individual widgets from the left panel.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {onOpenTemplates && (
                <button
                  onClick={onOpenTemplates}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
                >
                  Choose a Template
                </button>
              )}
              <span className="text-xs text-gray-300">or drag a widget from the left</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto my-6 bg-white shadow-2xl rounded-xl overflow-hidden min-h-96">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  isSelected={selectedId === section.id}
                  onSelect={() => selectSection(section.id)}
                  onDelete={() => removeSection(section.id)}
                  onDuplicate={() => handleDuplicate(section)}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeSection && (
                <div className="opacity-80 shadow-2xl">
                  <WidgetRenderer section={activeSection} preview />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  )
}
