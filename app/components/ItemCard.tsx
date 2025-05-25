// app/components/ItemCard.tsx
"use client";
import React from 'react';
import { Edit3, Trash2, GripVertical, Image as ImageIcon, AlertCircle } from 'lucide-react';
import type { Item, ThemeClassNames } from '../types'; // Import ThemeClassNames
import { useSettings } from '../contexts/SettingsContext';

export interface ItemCardProps {
  item: Item;
  onDragStart: () => void;
  deleteItem: (id: string) => void;
  openEditItemModal: (item: Item) => void;
  onDragOverItem: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: () => void; 
  // themeClassNames will come from useSettings
  handleItemError: (itemId: string, isError: boolean) => void;
}

export default function ItemCard({
  item, onDragStart, deleteItem, openEditItemModal, onDragOverItem, onDrop, handleItemError,
}: ItemCardProps) {
  const { isEditMode, themeClassNames } = useSettings(); // Consume context
  const draggable = !isEditMode;

  const onImageError = () => {
    handleItemError(item.id, true);
  };

  const ITEM_CARD_HEIGHT_CLASS = "h-36"; // Keep constant local or move to types/constants file if shared more

  return (
    <div
      draggable={draggable}
      onDragStart={draggable ? onDragStart : undefined}
      onDragOver={draggable ? onDragOverItem : undefined}
      onDrop={
        draggable
          ? (e: React.DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              e.stopPropagation();
              onDrop();
            }
          : undefined
      }
      className={`m-1 ${themeClassNames.cardBgColor} rounded-lg shadow-md w-24 sm:w-28 ${ITEM_CARD_HEIGHT_CLASS} flex flex-col relative transition-all duration-150 ${draggable ? "cursor-grab hover:shadow-xl transform hover:-translate-y-0.5" : "cursor-default"} group overflow-hidden`}
      title={item.name}
    >
      <div className="flex-grow relative">
        {item.imageUrl && !item.hasError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            onError={onImageError}
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${themeClassNames.cardBgSubtleColor}`}>
            {item.hasError ? (
              <AlertCircle size={32} className="text-red-500" />
            ) : (
              <ImageIcon size={32} className={`${themeClassNames.secondaryTextColor} opacity-50`} />
            )}
          </div>
        )}
        {draggable && (
          <GripVertical size={18} className={`absolute top-1 right-1 ${themeClassNames.iconSecondaryColor} opacity-50 group-hover:opacity-100 transition-opacity`} />
        )}
      </div>
      <div className={`p-2 w-full ${themeClassNames.cardTextOverlayBgColor} backdrop-blur-sm`}>
        <p className={`text-xs truncate font-medium ${themeClassNames.cardTextColor}`}>{item.name}</p>
      </div>
      {isEditMode && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-150">
          <button onClick={() => openEditItemModal(item)} className={`p-2 bg-white/90 dark:bg-neutral-600/90 backdrop-blur-sm rounded-full text-[var(--accent-color)] hover:bg-opacity-100`} title={`Edit ${item.name}`}><Edit3 size={14} /></button>
          <button onClick={() => { if (window.confirm(`Are you sure you want to delete "${item.name}"? This cannot be undone.`)) deleteItem(item.id); }} className="p-2 bg-white/90 dark:bg-neutral-600/90 backdrop-blur-sm rounded-full text-red-500 hover:text-red-700 hover:bg-opacity-100" title={`Delete ${item.name}`}><Trash2 size={14} /></button>
        </div>
      )}
    </div>
  );
}
