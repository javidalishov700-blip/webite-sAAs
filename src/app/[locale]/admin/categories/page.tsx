"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { LayoutGrid, Plus } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { PageHeader } from "@/components/admin/page-header";
import { SortableCategoryRow } from "@/components/admin/sortable-category-row";
import { CategoryFormDialog } from "@/components/admin/category-form-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useReorderCategories,
  useUpdateCategory,
} from "@/hooks/use-categories";
import { useItems } from "@/hooks/use-items";
import { useCompany } from "@/hooks/use-company";
import type { Category } from "@/lib/data/types";

export default function CategoriesPage() {
  const t = useTranslations("admin.categories");
  const tc = useTranslations("common");
  const { data: company } = useCompany();
  const { data: categories, isLoading } = useCategories();
  const { data: items } = useItems();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !categories) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const reordered = [...categories];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorderCategories.mutate(
      reordered.map((c) => c.id),
      { onSuccess: () => toast.success(t("reordered")) },
    );
  }

  async function handleSubmit(values: { name: string; icon: string }) {
    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, ...values });
      toast.success(t("updated"));
    } else {
      await createCategory.mutateAsync(values);
      toast.success(t("created"));
    }
    setFormOpen(false);
    setEditingCategory(null);
  }

  async function handleDelete() {
    if (!deletingCategory) return;
    await deleteCategory.mutateAsync(deletingCategory.id);
    toast.success(t("deleted"));
    setDeletingCategory(null);
  }

  const itemCountByCategory = new Map<string, number>();
  items?.forEach((item) => itemCountByCategory.set(item.categoryId, (itemCountByCategory.get(item.categoryId) ?? 0) + 1));
  const suggestions = (t.raw(`suggestions.${company?.industry ?? "OTHER"}`) as string[] | undefined) ?? [];

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button
            variant="glow"
            onClick={() => {
              setEditingCategory(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            {t("add")}
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-2xl" />
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title={t("empty")}
          description={t("emptyHint")}
          action={
            <Button variant="glow" onClick={() => setFormOpen(true)}>
              <Plus className="size-4" />
              {t("add")}
            </Button>
          }
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        >
          <SortableContext items={categories.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {categories.map((category) => (
                <SortableCategoryRow
                  key={category.id}
                  category={category}
                  itemCount={itemCountByCategory.get(category.id) ?? 0}
                  onToggleVisible={(visible) => updateCategory.mutate({ id: category.id, isVisible: visible })}
                  onEdit={() => {
                    setEditingCategory(category);
                    setFormOpen(true);
                  }}
                  onDelete={() => setDeletingCategory(category)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        suggestions={suggestions}
        onSubmit={handleSubmit}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
      />

      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDescription", {
                name: deletingCategory?.name ?? "",
                count: deletingCategory ? (itemCountByCategory.get(deletingCategory.id) ?? 0) : 0,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{tc("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
