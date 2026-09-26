"use client";

import { useState, useEffect } from "react";
import { Search, X, Plus, Loader2, GripVertical, PackageSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getProducts, getProductsByIds } from "@/actions/product";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragEndEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  image: string;
  images?: Array<{ url: string; altText: string | null }>;
}

interface ProductPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  title: string;
  variant?: "default" | "compact";
}

// --- Sortable Item for the Selected Collection ---
function SortableSelectionItem({ 
  product, 
  onRemove,
}: { 
  product: Product; 
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm group transition-all",
        isDragging && "shadow-2xl ring-2 ring-primary/20 bg-neutral-50 scale-105 z-50",
      )}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-primary transition-colors"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border">
        <Image
          src={product.image}
          alt={product.nameEn}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate leading-tight">{product.nameEn}</p>
        <p className="text-[10px] text-neutral-500 truncate mt-0.5">{product.nameAr}</p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(product.id)}
        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- Draggable Item for the Sidebar ---
interface DraggableSidebarItemProps {
  product: Product;
  onAdd: (id: string) => void;
  variant?: "default" | "compact";
}

function DraggableSidebarItem({ 
  product, 
  onAdd,
  variant = "default"
}: DraggableSidebarItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: `sidebar-${product.id}`,
    data: { product, isSidebar: true }
  });

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.4 : 1,
  };

  const isCompact = variant === "compact";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-center bg-white border rounded-xl cursor-grab active:cursor-grabbing hover:border-primary/30 hover:shadow-md transition-all group",
        isDragging && "ring-2 ring-primary/20 border-primary shadow-lg",
        isCompact ? "gap-2 p-2" : "gap-3 p-3"
      )}
    >
      <div className={cn(
        "relative rounded-lg overflow-hidden bg-neutral-100 shrink-0 border",
        isCompact ? "w-8 h-8" : "w-10 h-10"
      )}>
        <Image 
          src={product.image} 
          alt={product.nameEn} 
          fill 
          className="object-cover" 
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-bold truncate group-hover:text-primary transition-colors",
          isCompact ? "text-[10px]" : "text-xs"
        )}>{product.nameEn}</p>
        {!isCompact && <p className="text-[10px] text-neutral-400 truncate mt-0.5">{product.nameAr}</p>}
      </div>

      <button
        type="button"
        onMouseDown={(e) => {
          e.stopPropagation();
          onAdd(product.id);
        }}
        className={cn(
          "rounded-lg bg-primary/10 text-primary transition-all hover:bg-primary hover:text-white",
          isCompact ? "p-1 opacity-50 hover:opacity-100" : "p-1.5 opacity-0 group-hover:opacity-100"
        )}
        title="Quick Add"
      >
        <Plus className={cn("w-4 h-4", isCompact && "w-3 h-3")} />
      </button>
    </div>
  );
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

export function ProductPicker({ selectedIds, onChange, title, variant = "default" }: ProductPickerProps) {
  const [search, setSearch] = useState("");
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [activeDragProduct, setActiveDragProduct] = useState<Product | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch selected products details
  useEffect(() => {
    let isMounted = true;

    async function fetchSelected() {
      const uniqueIds = Array.from(new Set(selectedIds));
      if (uniqueIds.length === 0) {
        setSelectedProducts([]);
        return;
      }
      setLoading(true);
      try {
        const res = await getProductsByIds(uniqueIds);
        if (isMounted && res.success && res.data) {
          const validProducts = res.data;
          
          // Sort to maintain order of selection if possible, otherwise just valid ones
          const sorted = uniqueIds
            .map((id) => validProducts.find((p: Product) => p.id === id))
            .filter(Boolean) as Product[]; // Ensure strict typing

          setSelectedProducts(sorted);

          // SELF-HEALING: If we requested N products but got < N, some are deleted/invalid.
          // We should update the parent state to reflect reality and "clean" the bad IDs.
          if (sorted.length !== uniqueIds.length) {
             const validIds = sorted.map(p => p.id);
             // Only trigger change if the counts actually differ (double check to avoid infinite loops)
             if (validIds.length !== selectedIds.length) {
                 console.log(`[ProductPicker] Auto-cleaning ${uniqueIds.length - sorted.length} invalid IDs`);
                 onChange(validIds);
             }
          }
        }
      } catch (error) {
        console.error("Failed to fetch selected products", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSelected();

    return () => { isMounted = false; };
  }, [selectedIds, onChange]);

  // Fetch sidebar products
  useEffect(() => {
    const fetchAvailable = async () => {
      setSearching(true);
      const res = await getProducts({ search: search.trim(), limit: 100 });
      if (res.success && res.data) {
        const uniqueIdsSet = new Set(selectedIds);
        const filtered = res.data.products.filter(
          (p: Product) => !uniqueIdsSet.has(p.id)
        ) as unknown as Product[];
        setAvailableProducts(filtered);
      }
      setSearching(false);
    };

    const timer = setTimeout(fetchAvailable, search.trim() ? 500 : 0);
    return () => clearTimeout(timer);
  }, [search, selectedIds]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const product = (active.data.current as { product: Product })?.product || 
                    selectedProducts.find(p => p.id === active.id);
    if (product) setActiveDragProduct(product);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragProduct(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // SCENARIO 1: Drag from Sidebar to Selection Area
    if (activeId.startsWith("sidebar-")) {
      const actualId = activeId.replace("sidebar-", "");
      if (!selectedIds.includes(actualId)) {
        // Find insert position if dropped over a collection item
        const overIndex = selectedIds.indexOf(overId);
        const newIds = [...selectedIds];
        if (overIndex !== -1) {
          newIds.splice(overIndex, 0, actualId);
        } else {
          newIds.push(actualId);
        }
        onChange(Array.from(new Set(newIds)));
      }
      return;
    }

    // SCENARIO 2: Reorder within Selection Area
    if (activeId !== overId) {
      const oldIndex = selectedIds.indexOf(activeId);
      const newIndex = selectedIds.indexOf(overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        onChange(arrayMove(selectedIds, oldIndex, newIndex));
      }
    }
  };

  const removeProduct = (id: string) => {
    onChange(selectedIds.filter(pId => pId !== id));
  };

  return (
    <div className="bg-white border rounded-3xl shadow-xl overflow-hidden">
      <div className="bg-neutral-900 px-6 py-4 flex items-center justify-between border-b border-white/10">
        <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
          {title}
        </h3>
        <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full font-bold">
          {selectedIds.length} Products
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid lg:grid-cols-12 h-[600px] overflow-hidden">
          {/* --- SIDEBAR: Available Products --- */}
          <div className="lg:col-span-4 border-r bg-neutral-50/50 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b bg-white shrink-0 sticky top-0 z-20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  placeholder="Search store catalog..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10 rounded-xl border-neutral-200 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-4 admin-scrollbar">
              <SortableContext items={availableProducts.map(p => `sidebar-${p.id}`)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 pb-20">
                  {searching ? (
                    <div className="py-10 flex flex-col items-center justify-center text-neutral-400">
                      <Loader2 className="w-6 h-6 animate-spin mb-2" />
                      <p className="text-xs">Searching catalog...</p>
                    </div>
                  ) : availableProducts.length === 0 ? (
                    <div className="py-10 text-center px-4">
                       <PackageSearch className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                       <p className="text-xs text-neutral-500 italic">No other products found.</p>
                    </div>
                  ) : (
                    availableProducts.map((product) => (
                      <DraggableSidebarItem 
                        key={`sidebar-${product.id}`} 
                        product={product} 
                        onAdd={(id) => {
                          onChange(Array.from(new Set([...selectedIds, id])));
                        }}
                        variant={variant}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          </div>

          {/* --- MAIN AREA: Selected Collection --- */}
          <div className="lg:col-span-8 flex flex-col h-full bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none opacity-50" />
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 p-6 scroll-smooth z-10 admin-scrollbar">
              <SortableContext items={selectedIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 max-w-2xl mx-auto pb-20">
                  {loading ? (
                    <div className="py-20 flex justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : selectedProducts.length === 0 ? (
                    <div className="py-32 text-center border-4 border-dashed rounded-3xl bg-white/50 border-neutral-100 flex flex-col items-center justify-center px-10">
                      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-8 h-8 text-neutral-300" />
                      </div>
                      <p className="text-neutral-500 font-bold text-lg mb-2">Collection is Empty</p>
                      <p className="text-sm text-neutral-400">Drag items from the left sidebar to add them to this manual collection.</p>
                    </div>
                  ) : (
                    selectedProducts.map((product) => (
                      <SortableSelectionItem
                        key={product.id}
                        product={product}
                        onRemove={removeProduct}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>

            {/* Hint bar */}
            <div className="p-3 bg-neutral-50 border-t text-[10px] text-neutral-500 flex items-center justify-center gap-4">
               <span className="flex items-center gap-1"><GripVertical className="w-3 h-3" /> Reorder items</span>
               <span className="flex items-center gap-1"><Plus className="w-3 h-3" /> Drag from left to add</span>
               <span className="flex items-center gap-1 text-primary-600 font-bold bg-primary/5 px-2 rounded">Auto-logic used if empty</span>
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeDragProduct ? (
            <div className="flex items-center gap-3 p-3 bg-white border-2 border-primary rounded-xl shadow-2xl opacity-90 scale-105">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border">
                <Image src={activeDragProduct.image} alt={activeDragProduct.nameEn} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{activeDragProduct.nameEn}</p>
                <p className="text-[10px] text-neutral-500 truncate">{activeDragProduct.nameAr}</p>
              </div>
              <GripVertical className="w-5 h-5 text-primary" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-scrollbar {
          scrollbar-width: auto !important;
          scrollbar-color: #0f172a #f1f5f9 !important;
        }
        .admin-scrollbar::-webkit-scrollbar {
          width: 14px !important;
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
