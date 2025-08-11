import React, { useEffect } from "react";
import {
  Edit3,
  Trash2,
  GripVertical,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { Item, ThemeClassNames } from "../lib/types";

const ITEM_CARD_HEIGHT_CLASS = "h-36";

import { gsap } from "gsap";
import { Draggable } from "gsap/dist/Draggable";

interface ItemCardProps {
  item: Item;
  isEditMode: boolean;
  deleteItem: (id: string) => void;
  openEditItemModal: (item: Item) => void;
  themeClassNames: ThemeClassNames;
  isDarkMode: boolean;
  handleItemError: (itemId: string, isError: boolean) => void;
  handleDragStart: () => void;
  handleDrag: (
    hitTestResult: { tierId: string | "unranked"; index: number } | null,
  ) => void;
  handleDrop: () => void;
}

export default function ItemCard({
  item,
  isEditMode,
  deleteItem,
  openEditItemModal,
  themeClassNames,
  isDarkMode,
  handleItemError,
  handleDragStart,
  handleDrag,
  handleDrop,
}: ItemCardProps) {
  const draggable = !isEditMode;
  const cardRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!draggable || !cardRef.current) return;

    const ctx = gsap.context(() => {
      Draggable.create(cardRef.current, {
        type: "x,y",
        bounds: "body",
        onPress: function () {
          handleDragStart();
          gsap.to(this.target, { scale: 1.05, duration: 0.2 });
        },
        onDrag: function () {
          const droppables = document.querySelectorAll(".droppable-area");
          let hit = false;
          for (let i = 0; i < droppables.length; i++) {
            if (Draggable.hitTest(this.target, droppables[i], "50%")) {
              const tierId = droppables[i].getAttribute("data-tier-id")!;
              const items = Array.from(
                droppables[i].querySelectorAll(".group"),
              ).filter((el) => !el.contains(this.target));
              let index = items.length;
              for (let j = 0; j < items.length; j++) {
                const r = items[j].getBoundingClientRect();
                if (this.x < r.left + r.width / 2) {
                  index = j;
                  break;
                }
              }
              handleDrag({ tierId, index });
              hit = true;
              break;
            }
          }
          if (!hit) {
            handleDrag(null);
          }
        },
        onRelease: function () {
          gsap.to(this.target, {
            scale: 1,
            duration: 0.2,
            x: 0,
            y: 0,
            onComplete: handleDrop,
          });
        },
      });
    }, cardRef);

    return () => ctx.revert();
  }, [
    draggable,
    handleDragStart,
    handleDrag,
    handleDrop,
    item.id,
  ]);

  const onImageError = () => {
    handleItemError(item.id, true);
  };

  return (
    <div
      ref={cardRef}
      className={`m-1 ${themeClassNames.cardBgColor} rounded-lg shadow-md w-24 sm:w-28 ${ITEM_CARD_HEIGHT_CLASS} flex flex-col relative transition-all duration-300 ${draggable ? "cursor-grab" : "cursor-default"} group overflow-hidden border-2 border-transparent hover:border-[var(--accent-color)]/50`}
      title={item.name}
    >
      <div className="flex-grow relative overflow-hidden">
        {item.imageUrl && !item.hasError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-300 group-hover:scale-105"
            onError={onImageError}
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${themeClassNames.cardBgSubtleColor}`}
          >
            {item.hasError ? (
              <AlertCircle size={32} className="text-red-500" />
            ) : (
              <ImageIcon
                size={32}
                className={`${themeClassNames.secondaryTextColor} opacity-50`}
              />
            )}
          </div>
        )}
        {draggable && (
          <GripVertical
            size={18}
            className={`absolute top-1 right-1 ${themeClassNames.iconSecondaryColor} opacity-50 group-hover:opacity-100 transition-opacity`}
          />
        )}
      </div>

      <div
        className={`p-2 w-full ${themeClassNames.cardTextOverlayBgColor} backdrop-blur-sm`}
      >
        <p
          className={`text-xs truncate font-medium ${themeClassNames.cardTextColor}`}
        >
          {item.name}
        </p>
      </div>

      {isEditMode && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300">
          <button
            onClick={() => openEditItemModal(item)}
            className={`p-2 bg-white/90 dark:bg-neutral-600/90 backdrop-blur-sm rounded-full text-[var(--accent-color)] hover:bg-opacity-100 hover:scale-110 transition-transform`}
            title={`Edit ${item.name}`}
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to delete "${item.name}"? This cannot be undone.`,
                )
              )
                deleteItem(item.id);
            }}
            className="p-2 bg-white/90 dark:bg-neutral-600/90 backdrop-blur-sm rounded-full text-red-500 hover:text-red-700 hover:bg-opacity-100"
            title={`Delete ${item.name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
