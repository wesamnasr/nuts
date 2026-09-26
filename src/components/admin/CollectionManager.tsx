"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Package, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteCollection, toggleCollectionStatus } from "@/actions/collections";
import { toast } from "sonner";
import { CollectionForm } from "./CollectionForm";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/LocaleContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

export type Collection = {
  id: string;
  titleAr: string;
  titleEn: string;
  isActive: boolean;
  _count: { items: number };
  createdAt: string | Date;
};

export interface CollectionManagerProps {
  collections: Collection[];
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

export function CollectionManager({ collections, onRefresh, isLoading }: CollectionManagerProps) {
  const { dir } = useLocale();
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setView("form");
  };

  const handleCreate = () => {
    setEditingId(null);
    setView("form");
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCollection(deletingId);
      await onRefresh();
      toast.success("Collection deleted");
      setDeletingId(null);
    } catch {
      toast.error("Failed to delete collection");
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleCollectionStatus(id, !currentStatus);
      await onRefresh();
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (view === "form") {
    return (
      <CollectionForm
        collectionId={editingId}
        onSuccess={async () => {
          await onRefresh();
          setView("list");
        }}
        onCancel={() => setView("list")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
           <h2 className="text-xl font-bold text-neutral-900">{dir === 'rtl' ? 'المجموعات المخصصة' : 'Custom Collections'}</h2>
           <p className="text-sm text-neutral-500">{dir === 'rtl' ? 'إنشاء وإدارة مجموعات المنتجات المخصصة' : 'Create and manage custom product groupings'}</p>
         </div>
        <Button onClick={handleCreate} className="rounded-xl shadow-lg bg-neutral-900 text-white hover:bg-neutral-800">
          <Plus className={cn("w-4 h-4", dir === 'rtl' ? 'ml-2' : 'mr-2')} />
          {dir === 'rtl' ? 'إضافة مجموعة' : 'Add Collection'}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
             <Package className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-500 font-medium">{dir === 'rtl' ? 'لا توجد مجموعات حتى الآن' : 'No collections found'}</p>
          <Button onClick={handleCreate} variant="link" className="text-primary">
            {dir === 'rtl' ? 'إنشاء أول مجموعة' : 'Create your first collection'}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {collections.map((collection) => (
            <Card
              key={collection.id}
              className="p-4 flex items-center justify-between hover:shadow-md transition-all group border-neutral-200"
            >
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", collection.isActive ? "bg-green-100 text-green-600" : "bg-neutral-100 text-neutral-400")}>
                    <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                    {collection.titleEn}
                    {!collection.isActive && (
                      <span className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Draft</span>
                    )}
                  </h3>
                  <p className="text-neutral-500 text-xs">{collection.titleAr}</p>
                  <p className="text-neutral-400 text-[10px] mt-1 flex items-center gap-1">
                    <span className="font-medium text-neutral-900">{collection._count.items}</span> 
                    {dir === 'rtl' ? 'منتجات' : 'Products'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                 <Button
                  variant="ghost"
                  size="icon"
                  className={cn("rounded-lg hover:bg-neutral-100", collection.isActive ? "text-green-600" : "text-neutral-400")}
                  onClick={() => handleToggleStatus(collection.id, collection.isActive)}
                  title="Toggle Visibility"
                >
                  {collection.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-primary"
                  onClick={() => handleEdit(collection.id)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>

                <Dialog open={deletingId === collection.id} onOpenChange={(open) => !open && setDeletingId(null)}>
                  <DialogTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500"
                        onClick={() => setDeletingId(collection.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure?</DialogTitle>
                      <DialogDescription>
                        This will permanently delete &quot;{collection.titleEn}&quot;. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={handleDelete} variant="destructive" className="bg-red-500 hover:bg-red-600">Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
