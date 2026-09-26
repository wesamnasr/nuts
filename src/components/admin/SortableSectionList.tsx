"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
  visible: boolean;
}

interface SortableSectionListProps {
  sections: Section[];
  onOrderChange: (newOrder: string[]) => void;
  onVisibilityToggle: (id: string) => void;
}

function SortableItem({ id, label, visible, onToggle }: { 
  id: string; 
  label: string; 
  visible: boolean; 
  onToggle: () => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-4 p-4 bg-white border rounded-xl shadow-sm transition-all",
        isDragging && "shadow-2xl ring-2 ring-primary/20 bg-neutral-50",
        !visible && "opacity-60 bg-neutral-50"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-neutral-100 rounded"
      >
        <GripVertical className="w-5 h-5 text-neutral-400" />
      </button>

      <div className="flex-1 flex items-center gap-3">
        <span className="font-bold text-neutral-700">{label}</span>
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          onToggle();
        }}
        className={cn(
          "p-2 rounded-full transition-colors",
          visible ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-neutral-400 bg-neutral-100 hover:bg-neutral-200"
        )}
      >
        {visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
      </button>
    </div>
  );
}

export function SortableSectionList({ sections, onOrderChange, onVisibilityToggle }: SortableSectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      
      const newArray = arrayMove(sections, oldIndex, newIndex);
      onOrderChange(newArray.map((s) => s.id));
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold bg-neutral-50 p-3 rounded-lg border-l-4 border-primary">
        Drag to Reorder Homepage Sections
      </h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-scroll p-2 admin-scrollbar pr-4 pb-40">
            {sections.map((section) => (
              <SortableItem
                key={section.id}
                id={section.id}
                label={section.label}
                visible={section.visible}
                onToggle={() => onVisibilityToggle(section.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-scrollbar {
          scrollbar-width: auto !important;
          scrollbar-color: #0f172a #f1f5f9 !important;
        }
        .admin-scrollbar::-webkit-scrollbar {
          width: 12px !important;
          display: block !important;
        }
        .admin-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9 !important;
          border-radius: 0px !important;
          border-left: 1px solid #e2e8f0 !important;
        }
        .admin-scrollbar::-webkit-scrollbar-thumb {
          background: #0f172a !important;
          border-radius: 0px !important;
          border: 2px solid #f1f5f9 !important;
        }
        .admin-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #000000 !important;
        }
      `}} />
    </div>
  );
}
