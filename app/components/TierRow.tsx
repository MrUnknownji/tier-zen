import React, { useState, useEffect, useRef } from "react";
import {
  Palette,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import {
  Tier,
  Item,
  ThemeClassNames,
  DraggedItemInfo,
} from "../lib/types";
import ItemCard from "./ItemCard";

const ITEM_CARD_HEIGHT_CLASS = "h-36";
const ITEM_CONTAINER_MIN_HEIGHT_CLASS = "min-h-[156px]";

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
      }, 500); // Duration of the animation
    }
  }, [justAddedTierId, tier.id, setJustAddedTierId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTempName(e.target.value);
  const saveName = () => {
    tempName.trim()
      ? updateTier(tier.id, { name: tempName.trim() })
      : setTempName(tier.name);
    setIsEditingName(false);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveName();
    if (e.key === "Escape") {
      setTempName(tier.name);
      setIsEditingName(false);
    }
  };
  const handleColor = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateTier(tier.id, { color: e.target.value });

  const isCurrentDropTarget = dropPreview?.tierId === tier.id;
  const baseDropClasses = `${ITEM_CONTAINER_MIN_HEIGHT_CLASS} flex-grow flex flex-wrap items-start p-2 border-2 rounded-r-lg transition-all duration-150`;
  const highlightClasses =
    draggedItem && !isEditMode
      ? isCurrentDropTarget
        ? `border-[var(--accent-color)] ring-1 ring-[var(--accent-color)] border-solid`
        : `border-dashed border-[var(--accent-color)]/50`
      : `border-dashed ${themeClassNames.borderColor}`;

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
      className={`flex items-stretch rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl mb-3 ${themeClassNames.cardBgColor} ${tier.id === justAddedTierId ? "animate-new-tier" : ""}`}
    >
      <div
        className="w-24 sm:w-28 md:w-32 flex flex-col items-center justify-center p-2 sm:p-3 text-center rounded-l-lg transition-colors"
        style={{ backgroundColor: tier.color, color: tier.textColor }}
      >
        {isEditMode && isEditingName ? (
          <input
            type="text"
            value={tempName}
            onChange={handleNameChange}
            onBlur={saveName}
            onKeyDown={handleKeyDown}
            className={`w-full text-sm p-1 rounded ${themeClassNames.inputBgTransparentColor} ${themeClassNames.inputFgColor} focus:outline-none ring-1 ring-[var(--accent-color)] dark:ring-gray-300`}
            autoFocus
          />
        ) : (
          <h2
            className="text-md sm:text-lg font-semibold break-words w-full cursor-pointer"
            onClick={() => isEditMode && setIsEditingName(true)}
            title={isEditMode ? "Click to edit tier name" : tier.name}
          >
            {tier.name}
          </h2>
        )}
        {isEditMode && (
          <div className="mt-2 flex items-center gap-2 sm:gap-3">
            <label
              htmlFor={`color-${tier.id}`}
              className="cursor-pointer group relative"
              title="Change tier color"
            >
              <Palette
                size={18}
                className="opacity-70 group-hover:opacity-100"
              />
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
              className="text-red-500 hover:text-red-700"
              title="Delete tier"
            >
              <Trash2 size={16} className="opacity-70 hover:opacity-100" />
            </button>
          </div>
        )}
      </div>
      <div
        className={`${baseDropClasses} ${highlightClasses} relative items-container droppable-area`}
        data-tier-id={tier.id}
      >
        {itemsWithPreview.length === 0 && !isEditMode && (
          <div
            className={`w-full h-full flex items-center justify-center ${themeClassNames.secondaryTextColor} italic text-sm`}
          >
            Drag items here
          </div>
        )}
        {itemsWithPreview.length === 0 && isEditMode && (
          <div
            className={`w-full h-full flex items-center justify-center ${themeClassNames.secondaryTextColor} italic text-sm`}
          >
            Add items via "Add Item" or drag from Unranked
          </div>
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
