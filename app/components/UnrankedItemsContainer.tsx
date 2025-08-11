import React from "react";
import { Columns, Image as ImageIcon } from "lucide-react";
import {
  Item,
  ThemeClassNames,
  DraggedItemInfo,
} from "../lib/types";
import ItemCard from "./ItemCard";

const ITEM_CARD_HEIGHT_CLASS = "h-36";
const ITEM_CONTAINER_MIN_HEIGHT_CLASS = "min-h-[156px]";

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
  const baseDropClasses = `${ITEM_CONTAINER_MIN_HEIGHT_CLASS} flex flex-wrap items-start p-3 border-2 rounded-lg mt-6 transition-all`;
  const highlightClasses =
    draggedItem && !isEditMode
      ? isCurrentDropTarget
        ? `border-[var(--accent-color)] ring-1 ring-[var(--accent-color)] border-solid`
        : `border-dashed border-[var(--accent-color)]/50`
      : `border-dashed ${themeClassNames.borderColor}`;

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
      className={`p-4 rounded-lg shadow-md mt-6 sm:mt-8 ${themeClassNames.cardBgColor}`}
    >
      <h3
        className={`text-lg sm:text-xl font-semibold mb-3 text-center ${themeClassNames.textColor}`}
      >
        <Columns size={20} className="inline mr-2 align-text-bottom" /> Unranked
        Items
      </h3>
      <div
        className={`${baseDropClasses} ${highlightClasses} justify-center sm:justify-start gap-1 relative items-container droppable-area`}
        data-tier-id="unranked"
      >
        {itemsWithPreview.length === 0 && !isEditMode && !draggedItem && (
          <p
            className={`${themeClassNames.secondaryTextColor} italic p-4 text-center w-full text-sm`}
          >
            All items ranked! Drag items here or from tiers.
          </p>
        )}
        {itemsWithPreview.length === 0 && isEditMode && (
          <p
            className={`${themeClassNames.secondaryTextColor} italic p-4 text-center w-full text-sm`}
          >
            Add new items using the "Add Item" button above.
          </p>
        )}
        {itemsWithPreview.length === 0 && draggedItem && !isEditMode && (
          <p
            className={`${themeClassNames.secondaryTextColor} italic p-4 text-center w-full text-sm`}
          >
            Drop item here to unrank it.
          </p>
        )}

        {itemsWithPreview.map((item) =>
          item.isPlaceholder ? (
            <div
              key={item.id}
              className={`drop-preview-placeholder-item m-1 w-24 sm:w-28 ${ITEM_CARD_HEIGHT_CLASS} rounded-lg border-2 border-dashed border-[var(--accent-color)] bg-[var(--accent-color)]/10 flex items-center justify-center opacity-70`}
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
