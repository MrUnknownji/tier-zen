// app/components/UnrankedItemsContainer.tsx
"use client";
import React from 'react';
import { Columns, Image as ImageIcon } from 'lucide-react';
import type { Item, DraggedItemInfo, ThemeClassNames } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import ItemCard from './ItemCard'; // Import ItemCard

export interface UnrankedItemsContainerProps {
  items: Item[];
  onDragStartItem: (item: Item, srcTierId: string, srcIdx: number) => void;
  onDragOverItem: (e: React.DragEvent<HTMLDivElement>) => void;
  onDropItem: (targetIdx?: number) => void;
  deleteItem: (id: string) => void;
  openEditItemModal: (item: Item) => void;
  isDraggingGlobal: boolean;
  draggedItem: DraggedItemInfo | null;
  draggedOverTierId: string | null;
  dropPreviewIndex: number | null;
  handleDragOverTier: (tierId: string | "unranked", index?: number) => void;
  handleItemError: (itemId: string, isError: boolean) => void;
}

const ITEM_CONTAINER_MIN_HEIGHT_CLASS = "min-h-[156px]"; // Keep local or move
const ITEM_CARD_HEIGHT_CLASS = "h-36"; // Keep local or move

export default function UnrankedItemsContainer({
  items, onDragStartItem, onDragOverItem, onDropItem, deleteItem, openEditItemModal,
  isDraggingGlobal, draggedItem, draggedOverTierId, dropPreviewIndex,
  handleDragOverTier, handleItemError,
}: UnrankedItemsContainerProps) {
  const { isEditMode, themeClassNames } = useSettings(); // Consume context
  const isCurrentDropTarget = draggedOverTierId === "unranked";
  const baseDropClasses = `\${ITEM_CONTAINER_MIN_HEIGHT_CLASS} flex flex-wrap items-start p-3 border-2 rounded-lg mt-6 transition-all`;
  const highlightClasses = isDraggingGlobal && !isEditMode ? (isCurrentDropTarget ? `border-[var(--accent-color)] ring-1 ring-[var(--accent-color)] border-solid` : `border-dashed border-[var(--accent-color)]/50`) : `border-dashed \${themeClassNames.borderColor}`;
  
  const itemsWithPreview = [...items];
  if (isCurrentDropTarget && dropPreviewIndex !== null && !isEditMode && draggedItem && draggedItem.item.id !== "drop-preview-placeholder-unranked") {
    itemsWithPreview.splice(dropPreviewIndex, 0, { id: "drop-preview-placeholder-unranked", name: "PREVIEW_U", isPlaceholder: true, imageUrl: draggedItem.item.imageUrl });
  }

  return (
    <div
      className={`p-4 rounded-lg shadow-md mt-6 sm:mt-8 \${themeClassNames.cardBgColor}`}
      onDragOver={(e) => { onDragOverItem(e); if (isEditMode || !isDraggingGlobal) return; handleDragOverTier("unranked", items.length); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (isEditMode || !isDraggingGlobal) return; const idx = isCurrentDropTarget && dropPreviewIndex !== null ? dropPreviewIndex : items.length; onDropItem(idx); }}
    >
      <h3 className={`text-lg sm:text-xl font-semibold mb-3 text-center \${themeClassNames.textColor}`}><Columns size={20} className="inline mr-2 align-text-bottom" /> Unranked Items</h3>
      <div
        className={`\${baseDropClasses} \${highlightClasses} justify-center sm:justify-start gap-1 relative items-container`}
        onDragOver={(e) => { onDragOverItem(e); e.stopPropagation(); if (isEditMode || !isDraggingGlobal) return; const el = e.currentTarget as HTMLDivElement; const itemsArr = Array.from(el.children).filter(c => !c.classList.contains("drop-preview-placeholder-item")); let newIdx = itemsArr.length; for (let i = 0; i < itemsArr.length; i++) { const r = (itemsArr[i] as HTMLElement).getBoundingClientRect(); if (e.clientX < r.left + r.width / 2) { newIdx = i; break; } } handleDragOverTier("unranked", newIdx); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (isEditMode || !isDraggingGlobal) return; const idx = isCurrentDropTarget && dropPreviewIndex !== null ? dropPreviewIndex : items.length; onDropItem(idx); }}
      >
        {itemsWithPreview.length === 0 && !isDraggingGlobal && !isEditMode && (<p className={`\${themeClassNames.secondaryTextColor} italic p-4 text-center w-full text-sm`}>All items ranked! Drag items here or from tiers.</p>)}
        {itemsWithPreview.length === 0 && isEditMode && (<p className={`\${themeClassNames.secondaryTextColor} italic p-4 text-center w-full text-sm`}>Add new items using the "Add Item" button above.</p>)}
        {itemsWithPreview.length === 0 && isDraggingGlobal && !isEditMode && (<p className={`\${themeClassNames.secondaryTextColor} italic p-4 text-center w-full text-sm`}>Drop item here to unrank it.</p>)}
        {itemsWithPreview.map((itemData, index) => itemData.isPlaceholder ? (
            <div key={itemData.id} className={`drop-preview-placeholder-item m-1 w-24 sm:w-28 \${ITEM_CARD_HEIGHT_CLASS} rounded-lg border-2 border-dashed border-[var(--accent-color)] bg-[var(--accent-color)]/10 flex items-center justify-center opacity-70`}><ImageIcon size={32} className="text-[var(--accent-color)] opacity-50" /></div>
          ) : (
            <ItemCard 
              key={itemData.id} 
              item={itemData} 
              onDragStart={() => onDragStartItem(itemData, "unranked", items.findIndex(i => i.id === itemData.id))} 
              onDragOverItem={onDragOverItem} 
              onDrop={() => onDropItem(items.findIndex(i => i.id === itemData.id))} 
              deleteItem={deleteItem} 
              openEditItemModal={openEditItemModal} 
              handleItemError={handleItemError} 
            />
          )
        )}
      </div>
    </div>
  );
}
