import React, { useState, useEffect, useRef } from "react";
import {
  Palette,
  Trash2,
  Image as ImageIcon,
  Edit2,
  Check,
  X,
} from "lucide-react";
import {
  Tier,
  Item,
  ThemeClassNames,
  DraggedItemInfo,
} from "../lib/types";
import ItemCard from "./ItemCard";

const ITEM_CARD_HEIGHT_CLASS = "h-36";
const ITEM_CONTAINER_MIN_HEIGHT_CLASS = "min-h-[160px]";

interface TierRowProps {
  tier: Tier;
  updateTier: (
    id: string,
    props: Partial<Omit<Tier, "id" | "items" | "textColor">>,
  ) => void;
  deleteTier: (id: string) => void;
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
  justAddedTierId: string | null;
  setJustAddedTierId: (id: string | null) => void;
}

export default function TierRow({
  tier,
  updateTier,
  deleteTier,
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
  justAddedTierId,
  setJustAddedTierId,
}: TierRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(tier.name);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempName(tier.name);
  }, [tier.name]);

  useEffect(() => {
    if (tier.id === justAddedTierId) {
      setTimeout(() => {
        setJustAddedTierId(null);
      }, 500);
    }
  }, [justAddedTierId, tier.id, setJustAddedTierId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setTempName(e.target.value);

  const saveName = () => {
    tempName.trim()
      ? updateTier(tier.id, { name: tempName.trim() })
      : setTempName(tier.name);
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveName();
    }
    if (e.key === "Escape") {
      setTempName(tier.name);
      setIsEditingName(false);
    }
  };

  const handleColor = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateTier(tier.id, { color: e.target.value });

  const isCurrentDropTarget = dropPreview?.tierId === tier.id;

  // Refined styling for the drop area
  const baseDropClasses = `${ITEM_CONTAINER_MIN_HEIGHT_CLASS} flex-grow flex flex-wrap items-center content-center p-3 transition-all duration-200`;
  const highlightClasses =
    draggedItem && !isEditMode
      ? isCurrentDropTarget
        ? `bg-[var(--accent-color)]/10 ring-2 ring-inset ring-[var(--accent-color)]`
        : `bg-[var(--accent-color)]/5 ring-1 ring-inset ring-dashed ring-[var(--accent-color)]/40`
      : `${themeClassNames.cardBgColor}`;

  const itemsWithPreview = [...tier.items];
  if (isCurrentDropTarget && dropPreview && draggedItem) {
    itemsWithPreview.splice(dropPreview.index, 0, {
      id: "drop-preview-placeholder",
      name: "PREVIEW",
      isPlaceholder: true,
      imageUrl: draggedItem.item.imageUrl,
    });
  }

  return (
    <div
      ref={rowRef}
      className={`flex rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 mb-4 bg-white dark:bg-slate-900 ${tier.id === justAddedTierId ? "animate-new-tier" : ""}`}
    >
      {/* Tier Label Section */}
      <div
        className="w-28 sm:w-36 md:w-44 flex flex-col items-center justify-center p-4 text-center transition-colors relative group"
        style={{ backgroundColor: tier.color, color: tier.textColor }}
      >
        {isEditMode && isEditingName ? (
          <div className="w-full flex flex-col items-center gap-2">
            <textarea
              value={tempName}
              onChange={handleNameChange}
              onBlur={saveName}
              onKeyDown={handleKeyDown}
              className="w-full text-center text-lg font-bold bg-black/20 text-inherit rounded p-1 resize-none focus:outline-none focus:ring-2 focus:ring-white/50"
              rows={2}
              autoFocus
            />
            <div className="flex gap-2">
                <button onMouseDown={(e) => { e.preventDefault(); saveName(); }} className="p-1 bg-black/20 hover:bg-black/40 rounded text-inherit">
                    <Check size={16} />
                </button>
                <button onMouseDown={(e) => { e.preventDefault(); setTempName(tier.name); setIsEditingName(false); }} className="p-1 bg-black/20 hover:bg-black/40 rounded text-inherit">
                    <X size={16} />
                </button>
            </div>
          </div>
        ) : (
          <>
            <h2
              className="text-xl sm:text-2xl font-bold uppercase tracking-wider break-words w-full select-none"
              title={tier.name}
            >
              {tier.name}
            </h2>
            {isEditMode && (
                <button
                    onClick={() => setIsEditingName(true)}
                    className="absolute top-2 right-2 p-1.5 bg-black/10 hover:bg-black/30 rounded-full text-inherit opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Rename Tier"
                >
                    <Edit2 size={14} />
                </button>
            )}
          </>
        )}

        {isEditMode && !isEditingName && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <label
              htmlFor={`color-${tier.id}`}
              className="p-1.5 bg-black/20 hover:bg-black/40 rounded-full cursor-pointer text-inherit transition-colors backdrop-blur-sm"
              title="Change Color"
            >
              <Palette size={16} />
              <input
                id={`color-${tier.id}`}
                type="color"
                value={tier.color}
                onChange={handleColor}
                className="absolute opacity-0 w-0 h-0"
              />
            </label>
            <button
              onClick={() => {
                const msg = tier.items.length
                  ? `Delete tier "${tier.name}" and move its ${tier.items.length} item(s) to Unranked?`
                  : `Delete tier "${tier.name}"? This cannot be undone.`;
                if (window.confirm(msg)) deleteTier(tier.id);
              }}
              className="p-1.5 bg-black/20 hover:bg-red-500/80 rounded-full text-inherit transition-colors backdrop-blur-sm"
              title="Delete Tier"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Drop Area */}
      <div
        className={`${baseDropClasses} ${highlightClasses} relative items-container droppable-area w-full min-h-[160px]`}
        data-tier-id={tier.id}
      >
        {itemsWithPreview.length === 0 && !isEditMode && (
          <div className="w-full h-full flex items-center justify-center opacity-40 select-none pointer-events-none">
             <span className="text-4xl font-black text-slate-200 dark:text-slate-800 tracking-[0.2em] uppercase">
                Empty
             </span>
          </div>
        )}
        {itemsWithPreview.length === 0 && isEditMode && (
            <div className={`w-full h-full flex items-center justify-center ${themeClassNames.secondaryTextColor} italic text-sm select-none`}>
                Empty Tier
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
              handleDragStart={() => handleDragStart(item, tier.id)}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
            />
          ),
        )}
      </div>
    </div>
  );
}
