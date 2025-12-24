"use client";

import {
    updateWidgetOrder,
    updateWidgetVisibility,
} from "@/app/actions.dashboard";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    getWidgetById,
    type WidgetId,
    type WidgetSettings,
} from "@/lib/widgets";
import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

interface SortableWidgetItemProps {
  id: WidgetId;
  enabled: boolean;
  onToggle: (id: WidgetId, enabled: boolean) => void;
  isPending: boolean;
}

function SortableWidgetItem({
  id,
  enabled,
  onToggle,
  isPending,
}: SortableWidgetItemProps) {
  const widget = getWidgetById(id);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!widget) return null;

  const Icon = widget.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-3 rounded-lg border p-3
        bg-card transition-all duration-200
        ${isDragging ? "z-50 shadow-lg ring-2 ring-primary/20 scale-[1.02]" : ""}
        ${enabled ? "border-border" : "border-dashed border-muted-foreground/30 opacity-60"}
      `}
    >
      {/* Drag Handle */}
      <button
        type="button"
        className="touch-none cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors"
        {...attributes}
        {...listeners}
        aria-label={`Drag to reorder ${widget.name}`}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Widget Icon */}
      <div
        className={`
          flex h-9 w-9 shrink-0 items-center justify-center rounded-md
          ${enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
        `}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Widget Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{widget.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {widget.description}
        </div>
      </div>

      {/* Toggle Button */}
      <div className="flex items-center gap-2">
        {isPending && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <button
          type="button"
          onClick={() => onToggle(id, !enabled)}
          disabled={isPending}
          className={`
            relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
            ${enabled ? "bg-primary" : "bg-input"}
            ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
          role="switch"
          aria-checked={enabled}
          aria-label={`${enabled ? "Hide" : "Show"} ${widget.name} widget`}
        >
          <span
            className={`
              block h-5 w-5 rounded-full bg-background shadow-sm ring-0
              transition-transform duration-200
              ${enabled ? "translate-x-5" : "translate-x-0.5"}
            `}
          />
        </button>
      </div>
    </div>
  );
}

interface DashboardConfigSheetProps {
  settings: WidgetSettings;
  isAdmin: boolean;
}

export function DashboardConfigSheet({
  settings,
}: DashboardConfigSheetProps) {
  const sheetId = useId();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [localSettings, setLocalSettings] = useState(settings);

  // Sort widgets by order for display
  const sortedWidgets = [...localSettings.widgets].sort(
    (a, b) => a.order - b.order
  );
  const widgetIds = sortedWidgets.map((w) => w.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleToggle(widgetId: WidgetId, enabled: boolean) {
    // Optimistic update
    setLocalSettings((prev) => ({
      widgets: prev.widgets.map((w) =>
        w.id === widgetId ? { ...w, enabled } : w
      ),
    }));

    startTransition(() => {
      performVisibilityUpdate(widgetId, enabled);
    });
  }

  async function performVisibilityUpdate(widgetId: WidgetId, enabled: boolean) {
    const result = await updateWidgetVisibility(widgetId, enabled);
    if (result.error) {
      // Revert on error
      setLocalSettings((prev) => ({
        widgets: prev.widgets.map((w) =>
          w.id === widgetId ? { ...w, enabled: !enabled } : w
        ),
      }));
    } else {
      // Refresh to sync DashboardGrid
      router.refresh();
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const currentWidgetIds = sortedWidgets.map((w) => w.id);
      const oldIndex = currentWidgetIds.indexOf(active.id as WidgetId);
      const newIndex = currentWidgetIds.indexOf(over.id as WidgetId);
      const newOrder = arrayMove(currentWidgetIds, oldIndex, newIndex);

      // Optimistic update
      setLocalSettings((prev) => ({
        widgets: prev.widgets.map((w) => ({
          ...w,
          order: newOrder.indexOf(w.id),
        })),
      }));

      startTransition(() => {
        performOrderUpdate(newOrder);
      });
    }
  }

  async function performOrderUpdate(newOrder: WidgetId[]) {
    const result = await updateWidgetOrder(newOrder);
    if (result.error) {
      // Revert on error
      setLocalSettings(settings);
    } else {
      // Refresh to sync DashboardGrid
      router.refresh();
    }
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      setLocalSettings(settings);
    }
    setIsOpen(open);
  }

  const enabledCount = localSettings.widgets.filter((w) => w.enabled).length;
  const totalCount = localSettings.widgets.length;

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild id={`${sheetId}-trigger`}>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">Configure</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Dashboard Widgets
          </SheetTitle>
          <SheetDescription>
            Toggle widgets on or off, and drag to reorder them.
            <span className="block mt-1 text-xs">
              Showing {enabledCount} of {totalCount} widgets
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={widgetIds}
              strategy={verticalListSortingStrategy}
            >
              {sortedWidgets.map((widget) => (
                <SortableWidgetItem
                  key={widget.id}
                  id={widget.id}
                  enabled={widget.enabled}
                  onToggle={handleToggle}
                  isPending={isPending}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            💡 Tip: Changes are saved automatically
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
