import React from "react";
import { Columns, Image as ImageIcon } from "lucide-react";
import {
  Item,
  ThemeClassNames,
  DraggedItemInfo,
} from "../lib/types";
import ItemCard from "./ItemCard";

const ITEM_CARD_HEIGHT_CLASS = "h-36";
const ITEM_CONTAINER_MIN_HEIGHT_CLASS = "min-h-[160px]";

interface UnrankedItemsContainerProps {
  items: Item[];
  isEditMode: boolean;
  deleteItem: (id: string) => void;
  openEditItemModal: (item: Item) => void;
  themeClassNames: ThemeClassNames;
  isDarkMode: boolean;
  handleItemError: (itemId: string, isError: boolean) => void;
  handleDragStart: (item: Item, sourceTierId: string | "unranked") => void;
  handleDrag: (
    hitTestResult: { tierId: string | "unranked"; index: number } | null,
  ) => void;
  handleDrop: () => void;
  draggedItem: DraggedItemInfo | null;
  dropPreview: { tierId: string | "unranked"; index: number } | null;
}

export default function UnrankedItemsContainer({
  items,
  isEditMode,
  deleteItem,
  openEditItemModal,
  themeClassNames,
  isDarkMode,
  handleItemError,
  handleDragStart,
  handleDrag,
  handleDrop,
  draggedItem,
  dropPreview,
}: UnrankedItemsContainerProps) {
  const isCurrentDropTarget = dropPreview?.tierId === "unranked";

  // Refined styling for the drop area to match TierRow
  const baseDropClasses = `${ITEM_CONTAINER_MIN_HEIGHT_CLASS} flex flex-wrap items-center justify-center sm:justify-start content-center p-3 rounded-xl transition-all duration-200 min-h-[180px]`;
  const highlightClasses =
    draggedItem && !isEditMode
      ? isCurrentDropTarget
        ? `bg-[var(--accent-color)]/10 ring-2 ring-inset ring-[var(--accent-color)]`
        : `bg-[var(--accent-color)]/5 ring-1 ring-inset ring-dashed ring-[var(--accent-color)]/40`
      : `bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700`;

  const itemsWithPreview = [...items];
  if (isCurrentDropTarget && dropPreview && draggedItem) {
    itemsWithPreview.splice(dropPreview.index, 0, {
      id: "drop-preview-placeholder-unranked",
      name: "PREVIEW_U",
      isPlaceholder: true,
      imageUrl: draggedItem.item.imageUrl,
    });
  }

  return (
    <div
      className={`p-6 rounded-2xl shadow-lg mt-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800`}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-[var(--accent-color)]/10 rounded-lg text-[var(--accent-color)]">
             <Columns size={20} />
        </div>
        <h3
            className={`text-xl font-bold text-slate-800 dark:text-slate-100`}
        >
            Unranked Items
        </h3>
        <span className="ml-auto text-sm font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
            {items.length}
        </span>
      </div>

      <div
        className={`${baseDropClasses} ${highlightClasses} gap-2 relative items-container droppable-area`}
        data-tier-id="unranked"
      >
        {itemsWithPreview.length === 0 && !isEditMode && !draggedItem && (
          <div className="text-center p-8">
            <p className="text-slate-400 italic">
                All items ranked!
            </p>
            <p className="text-xs text-slate-300 mt-1">Drag items here or from tiers to unrank.</p>
          </div>
        )}
        {itemsWithPreview.length === 0 && isEditMode && (
          <div className="text-center p-8">
             <p className="text-slate-400 italic">
                No items yet.
             </p>
             <p className="text-xs text-[var(--accent-color)] mt-2 font-medium">Click "Add Item" to get started.</p>
          </div>
        )}
        {itemsWithPreview.length === 0 && draggedItem && !isEditMode && (
           <div className="text-center p-8">
            <p className="text-[var(--accent-color)] font-medium animate-pulse">
                Drop item here to unrank
            </p>
          </div>
        )}

        {itemsWithPreview.map((item) =>
          item.isPlaceholder ? (
            <div
              key={item.id}
              className={`drop-preview-placeholder-item m-2 w-24 sm:w-28 ${ITEM_CARD_HEIGHT_CLASS} rounded-xl border-2 border-dashed border-[var(--accent-color)] bg-[var(--accent-color)]/10 flex items-center justify-center animate-pulse`}
            >
              <ImageIcon
                size={32}
                className="text-[var(--accent-color)] opacity-50"
              />
            </div>
          ) : (
            <ItemCard
              key={item.id}
              item={item}
              isEditMode={isEditMode}
              deleteItem={deleteItem}
              openEditItemModal={openEditItemModal}
              themeClassNames={themeClassNames}
              isDarkMode={isDarkMode}
              handleItemError={handleItemError}
              handleDragStart={() => handleDragStart(item, "unranked")}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
            />
          ),
        )}
      </div>
    </div>
  );
}
