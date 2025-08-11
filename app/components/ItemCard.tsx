"use client";
import React, { useLayoutEffect } from "react";
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
  const handleDragStartRef = React.useRef(handleDragStart);
  const handleDragRef = React.useRef(handleDrag);
  const handleDropRef = React.useRef(handleDrop);

  // Keep handler refs up to date without recreating Draggable each render
  React.useEffect(() => {
    handleDragStartRef.current = handleDragStart;
  }, [handleDragStart]);
  React.useEffect(() => {
    handleDragRef.current = handleDrag;
  }, [handleDrag]);
  React.useEffect(() => {
    handleDropRef.current = handleDrop;
  }, [handleDrop]);

  useLayoutEffect(() => {
    if (!draggable || !cardRef.current) return;

    let draggableInstance: any = null;
    let isCancelled = false;

    (async () => {
      const { Draggable } = await import("gsap/dist/Draggable");
      if (isCancelled) return;
      const element = cardRef.current;
      if (!element) return;
      gsap.registerPlugin(Draggable);
      // Use a stable concrete element for bounds
      const boundsTarget = document.documentElement;
      // If the element isn't connected yet, wait a frame
      if (!element.isConnected) {
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        if (isCancelled || !element.isConnected) return;
      }

      draggableInstance = Draggable.create(element, {
          type: "x,y",
          bounds: boundsTarget,
          zIndexBoost: true,
          dragResistance: 0,
          edgeResistance: 0.2,
          onPress: function () {
          if (!this.target || !(this.target as Element).isConnected) return;
            const el = this.target as HTMLElement;
            el.classList.add("dragging");
            gsap.set(el, { willChange: "transform", zIndex: 9999 });
            handleDragStartRef.current();
            gsap.to(el, { scale: 1.05, duration: 0.15, ease: "power2.out" });
          },
          onDrag: function () {
            const droppables = Array.from(
              document.querySelectorAll(".droppable-area"),
            ) as HTMLElement[];

            const dragRect = (this.target as HTMLElement).getBoundingClientRect();
            const centerX = dragRect.left + dragRect.width / 2;
            const centerY = dragRect.top + dragRect.height / 2;
            const pointerX: number =
              (this as any).pointerX ??
              ((this as any).x ?? 0) + ((this as any).startPointerX ?? 0);

            const bestDrop = droppables.find((dropEl) => {
              const r = dropEl.getBoundingClientRect();
              return centerX >= r.left &&
                     centerX <= r.right &&
                     centerY >= r.top &&
                     centerY <= r.bottom;
            }) || null;

            if (!bestDrop) {
              handleDragRef.current(null);
              return;
            }

            const tierId = bestDrop.getAttribute("data-tier-id")!;
            const items = Array.from(
              bestDrop.querySelectorAll(".draggable-item"),
            ).filter((el) => el !== (this as any).target) as HTMLElement[];

            let index = items.length;
            for (let j = 0; j < items.length; j++) {
              const r = items[j].getBoundingClientRect();
              if (pointerX < r.left + r.width / 2) {
                index = j;
                break;
              }
            }
            handleDragRef.current({ tierId, index });
          },
          onRelease: function () {
            const el = this.target as HTMLElement;
            handleDropRef.current();
            gsap.to(el, { scale: 1, duration: 0.12, ease: "power2.out" });
            // Clear transform props after a tick; React will re-render in new location
            requestAnimationFrame(() => {
              gsap.set(el, { clearProps: "transform,willChange,zIndex" });
              el.classList.remove("dragging");
            });
          },
        })[0];
    })();

    return () => {
      isCancelled = true;
      if (draggableInstance && typeof draggableInstance.kill === "function") {
        draggableInstance.kill();
      }
    };
  }, [draggable, item.id]);

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
