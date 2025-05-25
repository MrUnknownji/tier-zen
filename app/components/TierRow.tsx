// app/components/TierRow.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { Palette, Trash2, Image as ImageIcon } from 'lucide-react';
import type { Item, Tier, DraggedItemInfo, ThemeClassNames } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import ItemCard from './ItemCard'; // Import ItemCard

export interface TierRowProps {
  tier: Tier;
  updateTier: (id: string, props: Partial<Omit<Tier, "id" | "items" | "textColor">>) => void;
  deleteTier: (id: string) => void;
  onDragStartItem: (item: Item, srcTierId: string, srcIdx: number) => void;
  onDragOverItem: (e: React.DragEvent<HTMLDivElement>) => void;
  onDropItem: (targetIdx?: number) => void;
  deleteItem: (id: string) => void;
  openEditItemModal: (item: Item) => void;
  isDraggingGlobal: boolean;
  draggedItem: DraggedItemInfo | null;
  draggedOverTierId: string | null;
  dropPreviewIndex: number | null;
  handleDragOverTier: (tierId: string, index?: number) => void;
  handleItemError: (itemId: string, isError: boolean) => void;
}

const ITEM_CONTAINER_MIN_HEIGHT_CLASS = "min-h-[156px]"; // Keep local or move
const ITEM_CARD_HEIGHT_CLASS = "h-36"; // Keep local or move

export default function TierRow({
  tier, updateTier, deleteTier, onDragStartItem, onDragOverItem, onDropItem,
  deleteItem, openEditItemModal, isDraggingGlobal, draggedItem, draggedOverTierId,
  dropPreviewIndex, handleDragOverTier, handleItemError,
}: TierRowProps) {
  const { isEditMode, themeClassNames } = useSettings(); // Consume context
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(tier.name);

  useEffect(() => { setTempName(tier.name); }, [tier.name]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setTempName(e.target.value);
  const saveName = () => {
    tempName.trim() ? updateTier(tier.id, { name: tempName.trim() }) : setTempName(tier.name);
    setIsEditingName(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveName();
    if (e.key === "Escape") { setTempName(tier.name); setIsEditingName(false); }
  };
  const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => updateTier(tier.id, { color: e.target.value });

  const isCurrentDropTarget = draggedOverTierId === tier.id;
  const baseDropClasses = `\${ITEM_CONTAINER_MIN_HEIGHT_CLASS} flex-grow flex flex-wrap items-start p-2 border-2 rounded-r-lg transition-all duration-150`;
  const highlightClasses = isDraggingGlobal && !isEditMode ? (isCurrentDropTarget ? `border-[var(--accent-color)] ring-1 ring-[var(--accent-color)] border-solid` : `border-dashed border-[var(--accent-color)]/50`) : `border-dashed \${themeClassNames.borderColor}`;

  const itemsWithPreview = [...tier.items];
  if (isCurrentDropTarget && dropPreviewIndex !== null && !isEditMode && draggedItem && draggedItem.item.id !== "drop-preview-placeholder") {
    itemsWithPreview.splice(dropPreviewIndex, 0, { id: "drop-preview-placeholder", name: "PREVIEW", isPlaceholder: true, imageUrl: draggedItem.item.imageUrl });
  }

  return (
    <div
      className={`flex items-stretch rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl mb-3 \${themeClassNames.cardBgColor}`}
      onDragOver={(e) => { onDragOverItem(e); if (isEditMode || !isDraggingGlobal) return; handleDragOverTier(tier.id, tier.items.length); }}
      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (isEditMode || !isDraggingGlobal) return; const idx = isCurrentDropTarget && dropPreviewIndex !== null ? dropPreviewIndex : tier.items.length; onDropItem(idx); }}
    >
      <div className="w-24 sm:w-28 md:w-32 flex flex-col items-center justify-center p-2 sm:p-3 text-center rounded-l-lg transition-colors" style={{ backgroundColor: tier.color, color: tier.textColor }}>
        {isEditMode && isEditingName ? (
          <input type="text" value={tempName} onChange={handleNameChange} onBlur={saveName} onKeyDown={handleKeyDown} className={`w-full text-sm p-1 rounded \${themeClassNames.inputBgTransparentColor} \${themeClassNames.inputFgColor} focus:outline-none ring-1 ring-[var(--accent-color)] dark:ring-gray-300`} autoFocus />
        ) : (
          <h2 className="text-md sm:text-lg font-semibold break-words w-full cursor-pointer" onClick={() => isEditMode && setIsEditingName(true)} title={isEditMode ? "Click to edit tier name" : tier.name}>{tier.name}</h2>
        )}
        {isEditMode && (
          <div className="mt-2 flex items-center gap-2 sm:gap-3">
            <label htmlFor={`color-\${tier.id}`} className="cursor-pointer group relative" title="Change tier color">
              <Palette size={18} className="opacity-70 group-hover:opacity-100" />
              <input id={`color-\${tier.id}`} type="color" value={tier.color} onChange={handleColor} className="absolute opacity-0 w-0 h-0" />
            </label>
            <button onClick={() => { const msg = tier.items.length ? `Delete tier "\${tier.name}" and move its \${tier.items.length} item(s) to Unranked?` : `Delete tier "\${tier.name}"? This cannot be undone.`; if (window.confirm(msg)) deleteTier(tier.id); }} className="text-red-500 hover:text-red-700" title="Delete tier"><Trash2 size={16} className="opacity-70 hover:opacity-100" /></button>
          </div>
        )}
      </div>
      <div className={`\${baseDropClasses} \${highlightClasses} relative items-container`}
        onDragOver={(e) => { onDragOverItem(e); e.stopPropagation(); if (isEditMode || !isDraggingGlobal) return; const el = e.currentTarget as HTMLDivElement; const items = Array.from(el.children).filter(c => !c.classList.contains("drop-preview-placeholder-item")); let newIdx = items.length; for (let i = 0; i < items.length; i++) { const r = (items[i] as HTMLElement).getBoundingClientRect(); if (e.clientX < r.left + r.width / 2) { newIdx = i; break; } } handleDragOverTier(tier.id, newIdx); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (isEditMode || !isDraggingGlobal) return; const idx = isCurrentDropTarget && dropPreviewIndex !== null ? dropPreviewIndex : tier.items.length; onDropItem(idx); }}
      >
        {itemsWithPreview.length === 0 && !isDraggingGlobal && !isEditMode && (<div className={`w-full h-full flex items-center justify-center \${themeClassNames.secondaryTextColor} italic text-sm`}>Drag items here</div>)}
        {itemsWithPreview.length === 0 && isEditMode && (<div className={`w-full h-full flex items-center justify-center \${themeClassNames.secondaryTextColor} italic text-sm`}>Add items via "Add Item" or drag from Unranked</div>)}
        {itemsWithPreview.map((itemData, index) => itemData.isPlaceholder ? (
            <div key={itemData.id} className={`drop-preview-placeholder-item m-1 w-24 sm:w-28 \${ITEM_CARD_HEIGHT_CLASS} rounded-lg border-2 border-dashed border-[var(--accent-color)] bg-[var(--accent-color)]/10 flex items-center justify-center opacity-70`}><ImageIcon size={32} className="text-[var(--accent-color)] opacity-50" /></div>
          ) : ( 
            <ItemCard 
              key={itemData.id} 
              item={itemData} 
              onDragStart={() => onDragStartItem(itemData, tier.id, tier.items.findIndex(i => i.id === itemData.id))} 
              onDragOverItem={onDragOverItem} 
              onDrop={() => onDropItem(tier.items.findIndex(i => i.id === itemData.id))} 
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
