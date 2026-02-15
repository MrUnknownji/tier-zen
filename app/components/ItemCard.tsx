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
import { gsap } from "gsap";

const ITEM_CARD_HEIGHT_CLASS = "h-36";

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
      const boundsTarget = document.documentElement;

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
          gsap.to(el, {
            scale: 1.1,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", // shadow-xl
            duration: 0.2,
            ease: "power2.out"
          });
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
            return (
              centerX >= r.left &&
              centerX <= r.right &&
              centerY >= r.top &&
              centerY <= r.bottom
            );
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
          gsap.to(el, { scale: 1, boxShadow: "none", duration: 0.15, ease: "back.out(1.7)" });
          requestAnimationFrame(() => {
            gsap.set(el, { clearProps: "transform,willChange,zIndex,boxShadow" });
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
      className={`draggable-item m-2 ${themeClassNames.cardBgColor} rounded-xl shadow-md hover:shadow-xl w-24 sm:w-28 ${ITEM_CARD_HEIGHT_CLASS} flex flex-col relative transition-all duration-300 ${
        draggable ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      } group overflow-hidden border border-transparent hover:border-[var(--accent-color)] hover:scale-105`}
      title={item.name}
    >
      <div className="flex-grow relative overflow-hidden rounded-t-xl">
        {item.imageUrl && !item.hasError ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-110"
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

        {/* Text Overlay - improved for readability */}
        <div className="absolute bottom-0 left-0 right-0 pt-6 pb-2 px-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
             <p className="text-xs truncate font-semibold text-white drop-shadow-sm text-center">
              {item.name}
            </p>
        </div>

        {draggable && (
          <GripVertical
            size={16}
            className="absolute top-2 right-2 text-white drop-shadow-md opacity-0 group-hover:opacity-80 transition-opacity"
          />
        )}
      </div>

      {isEditMode && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 rounded-xl transition-all duration-300 z-10">
          <button
            onClick={() => openEditItemModal(item)}
            className="p-2 bg-white text-indigo-600 rounded-full hover:scale-110 hover:shadow-lg transition-all"
            title={`Edit ${item.name}`}
          >
            <Edit3 size={16} />
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
            className="p-2 bg-white text-red-500 rounded-full hover:scale-110 hover:shadow-lg transition-all"
            title={`Delete ${item.name}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
