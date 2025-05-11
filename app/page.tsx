"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  PlusCircle,
  Edit3,
  Trash2,
  CheckSquare,
  Rows,
  Columns,
  Palette,
  Sun,
  Moon,
  RotateCcw,
  ImagePlus,
  GripVertical,
  UploadCloud,
  Link2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";

const generateId = () =>
  `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getContrastingTextColor = (hexColor?: string): string => {
  if (!hexColor) return "#000000";
  const hex = hexColor.replace("#", "");
  if (hex.length !== 6 && hex.length !== 3) return "#000000";
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex.substring(0, 1).repeat(2), 16);
    g = parseInt(hex.substring(1, 2).repeat(2), 16);
    b = parseInt(hex.substring(2, 3).repeat(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

interface Item {
  id: string;
  name: string;
  imageUrl?: string;
  isPlaceholder?: boolean;
  hasError?: boolean;
}

interface Tier {
  id: string;
  name: string;
  color: string;
  textColor: string;
  items: Item[];
}

interface DraggedItemInfo {
  item: Item;
  sourceTierId: string | "unranked";
  sourceIndex: number;
}

interface ThemeClassNames {
  bgColor: string;
  textColor: string;
  cardBgColor: string;
  borderColor: string;
  inputBgColor: string;
  inputBorderColor: string;
  inputFocusBorderColor: string;
  placeholderColor: string;
  secondaryTextColor: string;
  buttonInactiveBg: string;
  buttonInactiveText: string;
  buttonInactiveHoverBg: string;
  modalOverlayBg: string;
  tabContainerBg: string;
}

const initialTiersData: Tier[] = [
  {
    id: "tier-s-initial",
    name: "S Tier",
    color: "#ff7f7f",
    textColor: getContrastingTextColor("#ff7f7f"),
    items: [],
  },
  {
    id: "tier-a-initial",
    name: "A Tier",
    color: "#ffbf7f",
    textColor: getContrastingTextColor("#ffbf7f"),
    items: [],
  },
  {
    id: "tier-b-initial",
    name: "B Tier",
    color: "#ffff7f",
    textColor: getContrastingTextColor("#ffff7f"),
    items: [],
  },
];

const initialUnrankedItemsData: Item[] = [
  {
    id: "item-alpha-initial",
    name: "Item Alpha",
    imageUrl: "https://placehold.co/200x200/7F7F7F/FFFFFF?text=Alpha",
  },
  {
    id: "item-beta-initial",
    name: "Item Beta",
    imageUrl: "https://placehold.co/200x200/6A6A6A/FFFFFF?text=Beta",
  },
];

const ITEM_CARD_HEIGHT_CLASS = "h-36"; // Approx 144px
const ITEM_CONTAINER_MIN_HEIGHT_CLASS = "min-h-[156px]"; // Card height + padding

function App() {
  const [tiers, setTiers] = useState<Tier[]>(initialTiersData);
  const [unrankedItems, setUnrankedItems] = useState<Item[]>(
    initialUnrankedItemsData,
  );
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [draggedItem, setDraggedItem] = useState<DraggedItemInfo | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState<boolean>(false);
  const [draggedOverTierId, setDraggedOverTierId] = useState<string | null>(
    null,
  );
  const [dropPreviewIndex, setDropPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTiers = localStorage.getItem("tierListTiersV4");
      setTiers(savedTiers ? JSON.parse(savedTiers) : initialTiersData);
      const savedUnranked = localStorage.getItem("tierListUnrankedItemsV4");
      setUnrankedItems(
        savedUnranked ? JSON.parse(savedUnranked) : initialUnrankedItemsData,
      );
      const savedTheme = localStorage.getItem("tierListThemeV4");
      if (savedTheme !== null) setIsDarkMode(JSON.parse(savedTheme));
      const savedMode = localStorage.getItem("tierListModeV4");
      if (savedMode !== null) setIsEditMode(JSON.parse(savedMode));
    }
  }, []);

  const themeClassNames: ThemeClassNames = useMemo(() => {
    return {
      bgColor: "bg-[var(--background)]",
      textColor: "text-[var(--foreground)]",
      cardBgColor: "bg-[var(--card-bg)]",
      borderColor: "border-[var(--border-color)]",
      inputBgColor: "bg-[var(--input-bg)]",
      inputBorderColor: "border-[var(--input-border)]",
      inputFocusBorderColor: "border-[var(--accent-color)]",
      placeholderColor: "placeholder-[var(--placeholder-color)]",
      secondaryTextColor: "text-[var(--text-secondary)]",
      buttonInactiveBg: "bg-[var(--button-inactive-bg)]",
      buttonInactiveText: "text-[var(--button-inactive-text)]",
      buttonInactiveHoverBg: "hover:bg-[var(--button-inactive-hover-bg)]",
      modalOverlayBg: "bg-[var(--modal-overlay-bg)]",
      tabContainerBg: "bg-[var(--tab-container-bg)]",
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("tierListTiersV4", JSON.stringify(tiers));
  }, [tiers]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(
        "tierListUnrankedItemsV4",
        JSON.stringify(unrankedItems),
      );
  }, [unrankedItems]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tierListThemeV4", JSON.stringify(isDarkMode));
      localStorage.setItem("tierListModeV4", JSON.stringify(isEditMode));
      const root = document.documentElement;
      isDarkMode ? root.classList.add("dark") : root.classList.remove("dark");
    }
  }, [isDarkMode, isEditMode]);

  const addTier = () => {
    const newTier: Tier = {
      id: generateId(),
      name: `New Tier ${tiers.length + 1}`,
      color: "#cccccc",
      textColor: getContrastingTextColor("#cccccc"),
      items: [],
    };
    setTiers([...tiers, newTier]);
  };

  const updateTier = (
    tierId: string,
    updatedProps: Partial<Omit<Tier, "id" | "items" | "textColor">>,
  ) => {
    setTiers((prevTiers) =>
      prevTiers.map((tier) =>
        tier.id === tierId
          ? {
              ...tier,
              ...updatedProps,
              textColor: getContrastingTextColor(
                updatedProps.color ?? tier.color,
              ),
            }
          : tier,
      ),
    );
  };

  const deleteTier = (tierId: string) => {
    const tierToDelete = tiers.find((t) => t.id === tierId);
    if (tierToDelete?.items.length)
      setUnrankedItems((prev) => [
        ...prev,
        ...tierToDelete.items.map((item) => ({ ...item, hasError: false })),
      ]); // Reset error state when moving
    setTiers((prevTiers) => prevTiers.filter((tier) => tier.id !== tierId));
  };

  const handleItemError = useCallback((itemId: string, isError: boolean) => {
    const updateItemError = (items: Item[]) =>
      items.map((item) =>
        item.id === itemId ? { ...item, hasError: isError } : item,
      );
    setTiers((prev) =>
      prev.map((tier) => ({ ...tier, items: updateItemError(tier.items) })),
    );
    setUnrankedItems((prev) => updateItemError(prev));
  }, []);

  const handleAddItemSubmit = (newItemData: Omit<Item, "id">) => {
    const newItem: Item = { id: generateId(), ...newItemData, hasError: false };
    setUnrankedItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItemSubmit = (
    itemId: string,
    updatedProps: Omit<Item, "id">,
  ) => {
    let found = false;
    const updateLogic = (item: Item) => {
      if (item.id === itemId) {
        found = true;
        return { ...item, ...updatedProps, hasError: false };
      } // Reset error on update
      return item;
    };
    setTiers((prevTiers) =>
      prevTiers.map((tier) => ({
        ...tier,
        items: tier.items.map(updateLogic),
      })),
    );
    if (!found) setUnrankedItems((prevItems) => prevItems.map(updateLogic));
  };

  const handleSaveItemFromModal = (data: Omit<Item, "id">, id?: string) => {
    if (id) handleUpdateItemSubmit(id, data);
    else handleAddItemSubmit(data);
    setShowAddItemModal(false);
    setItemToEdit(null);
  };

  const deleteItem = (itemId: string) => {
    let deletedInTiers = false;
    setTiers((prevTiers) =>
      prevTiers.map((tier) => {
        const newItems = tier.items.filter((item) => item.id !== itemId);
        if (newItems.length !== tier.items.length) deletedInTiers = true;
        return { ...tier, items: newItems };
      }),
    );
    if (!deletedInTiers)
      setUnrankedItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId),
      );
  };

  const openEditItemModal = (item: Item) => {
    setItemToEdit(item);
    setShowAddItemModal(true);
  };

  const onDragStartItem = (
    item: Item,
    sourceTierId: string | "unranked",
    sourceIndex: number,
  ) => {
    if (!isEditMode) {
      setDraggedItem({ item, sourceTierId, sourceIndex });
      setIsDraggingGlobal(true);
    }
  };

  const onDragEndItem = () => {
    setIsDraggingGlobal(false);
    setDraggedOverTierId(null);
    setDropPreviewIndex(null);
    setDraggedItem(null);
  };

  const handleDragOverTier = (tierId: string | "unranked", index?: number) => {
    if (!isDraggingGlobal || isEditMode) return;
    setDraggedOverTierId(tierId);
    setDropPreviewIndex(index ?? null);
  };

  const onDragOverItem = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();

  const onDropItem = (
    targetTierId: string | "unranked",
    targetIndexInput?: number,
  ) => {
    if (!draggedItem || isEditMode) return;
    const { item: movedItem, sourceTierId: srcTierId } = draggedItem;
    const getTargetLength = () =>
      targetTierId === "unranked"
        ? unrankedItems.length
        : (tiers.find((t) => t.id === targetTierId)?.items.length ?? 0);
    const targetIndex = targetIndexInput ?? getTargetLength();
    const itemToMove = { ...movedItem, hasError: false }; // Reset error state on drop

    if (srcTierId === "unranked")
      setUnrankedItems((prev) => prev.filter((i) => i.id !== itemToMove.id));
    else
      setTiers((prevTiers) =>
        prevTiers.map((tier) =>
          tier.id === srcTierId
            ? {
                ...tier,
                items: tier.items.filter((i) => i.id !== itemToMove.id),
              }
            : tier,
        ),
      );

    if (targetTierId === "unranked")
      setUnrankedItems((prev) => {
        const ni = [...prev];
        ni.splice(targetIndex, 0, itemToMove);
        return ni;
      });
    else
      setTiers((prevTiers) =>
        prevTiers.map((tier) => {
          if (tier.id === targetTierId) {
            const ni = [...tier.items];
            ni.splice(targetIndex, 0, itemToMove);
            return { ...tier, items: ni };
          }
          return tier;
        }),
      );

    setDraggedItem(null);
    setDraggedOverTierId(null);
    setDropPreviewIndex(null);
  };

  const resetAll = () => {
    if (
      window.confirm(
        "This will reset all tiers and items to their initial state and cannot be undone. Are you sure?",
      )
    ) {
      setTiers(initialTiersData);
      setUnrankedItems(
        initialUnrankedItemsData.map((item) => ({ ...item, hasError: false })),
      );
      setIsEditMode(true);
    }
  };

  return (
    <div
      className={`min-h-screen ${themeClassNames.bgColor} ${themeClassNames.textColor} font-inter p-4 sm:p-6 md:p-8 transition-colors duration-300 flex flex-col items-center`}
      onDragEnd={onDragEndItem}
    >
      <div className="w-full max-w-5xl xl:max-w-6xl">
        <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--accent-color)] transition-colors duration-300">
            TierZen
          </h1>
          <Toolbar
            {...{
              isEditMode,
              setIsEditMode,
              addTier,
              resetAll,
              isDarkMode,
              setIsDarkMode,
              setShowAddItemModal,
              setItemToEdit,
              themeClassNames,
            }}
          />
        </header>
        <main className="space-y-3 sm:space-y-4">
          {tiers.map((tier) => (
            <TierRow
              key={tier.id}
              {...{
                tier,
                updateTier,
                deleteTier,
                isEditMode,
                onDragStartItem,
                onDragOverItem,
                onDropItem: (idx) => onDropItem(tier.id, idx),
                deleteItem,
                openEditItemModal,
                themeClassNames,
                isDarkMode,
                isDraggingGlobal,
                draggedItem,
                draggedOverTierId,
                dropPreviewIndex,
                handleDragOverTier,
                handleItemError,
              }}
            />
          ))}
        </main>
        <UnrankedItemsContainer
          {...{
            items: unrankedItems,
            isEditMode,
            onDragStartItem,
            onDragOverItem,
            onDropItem: (idx) => onDropItem("unranked", idx),
            deleteItem,
            openEditItemModal,
            themeClassNames,
            isDarkMode,
            isDraggingGlobal,
            draggedItem,
            draggedOverTierId,
            dropPreviewIndex,
            handleDragOverTier,
            handleItemError,
          }}
        />
        {showAddItemModal && (
          <AddItemModal
            {...{
              isOpen: showAddItemModal,
              onClose: () => {
                setShowAddItemModal(false);
                setItemToEdit(null);
              },
              onSaveItem: handleSaveItemFromModal,
              itemToEdit,
              themeClassNames,
            }}
          />
        )}
      </div>
      <footer
        className={`mt-8 text-center text-sm ${themeClassNames.secondaryTextColor}`}
      >
        <p>TierZen by Gemini. Drag and drop items in 'Rank' mode.</p>
      </footer>
    </div>
  );
}

interface ToolbarProps {
  isEditMode: boolean;
  setIsEditMode: (v: boolean) => void;
  addTier: () => void;
  resetAll: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  setShowAddItemModal: (v: boolean) => void;
  setItemToEdit: (i: Item | null) => void;
  themeClassNames: ThemeClassNames;
}

function Toolbar({
  isEditMode,
  setIsEditMode,
  addTier,
  resetAll,
  isDarkMode,
  setIsDarkMode,
  setShowAddItemModal,
  setItemToEdit,
  themeClassNames,
}: ToolbarProps) {
  const btnBase = `p-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:ring-offset-1 focus:ring-offset-[var(--raw-card-bg-value)]`;
  const active = `bg-[var(--accent-color)] text-black`;
  const inactive = `${themeClassNames.buttonInactiveBg} ${themeClassNames.buttonInactiveText} ${themeClassNames.buttonInactiveHoverBg}`;

  return (
    <div
      className={`flex flex-wrap gap-2 items-center justify-center sm:justify-end p-2 rounded-lg shadow ${themeClassNames.cardBgColor}`}
    >
      <div
        className={`flex rounded-lg border ${themeClassNames.borderColor} overflow-hidden`}
      >
        <button
          onClick={() => setIsEditMode(true)}
          className={`${btnBase} rounded-none rounded-l-md ${isEditMode ? active : inactive}`}
          title="Edit Mode: Modify tiers, add/edit/delete items."
        >
          <Edit3 size={18} />
        </button>
        <button
          onClick={() => setIsEditMode(false)}
          className={`${btnBase} rounded-none rounded-r-md ${!isEditMode ? active : inactive}`}
          title="Rank Mode: Drag and drop items between tiers."
        >
          <Rows size={18} />
        </button>
      </div>
      {isEditMode && (
        <>
          <button
            onClick={addTier}
            className={`${btnBase} ${inactive}`}
            title="Add a new tier row to the list."
          >
            <PlusCircle size={18} /> Add Tier
          </button>
          <button
            onClick={() => {
              setItemToEdit(null);
              setShowAddItemModal(true);
            }}
            className={`${btnBase} ${inactive}`}
            title="Add a new item to the Unranked Items pool."
          >
            <ImagePlus size={18} /> Add Item
          </button>
          <button
            onClick={resetAll}
            className={`${btnBase} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`}
            title="Reset all tiers and items to default. This action cannot be undone!"
          >
            <RotateCcw size={18} /> Reset All
          </button>
        </>
      )}
      {!isEditMode && <div className="w-px h-6 bg-transparent mx-1"></div>}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`${btnBase} ${inactive}`}
        title={`Switch to ${isDarkMode ? "Light" : "Dark"} Theme`}
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}

interface TierRowProps {
  tier: Tier;
  updateTier: (
    id: string,
    props: Partial<Omit<Tier, "id" | "items" | "textColor">>,
  ) => void;
  deleteTier: (id: string) => void;
  isEditMode: boolean;
  onDragStartItem: (item: Item, srcTierId: string, srcIdx: number) => void;
  onDragOverItem: (e: React.DragEvent<HTMLDivElement>) => void;
  onDropItem: (targetIdx?: number) => void;
  deleteItem: (id: string) => void;
  openEditItemModal: (item: Item) => void;
  themeClassNames: ThemeClassNames;
  isDarkMode: boolean;
  isDraggingGlobal: boolean;
  draggedItem: DraggedItemInfo | null;
  draggedOverTierId: string | null;
  dropPreviewIndex: number | null;
  handleDragOverTier: (tierId: string, index?: number) => void;
  handleItemError: (itemId: string, isError: boolean) => void;
}

function TierRow({
  tier,
  updateTier,
  deleteTier,
  isEditMode,
  onDragStartItem,
  onDragOverItem,
  onDropItem,
  deleteItem,
  openEditItemModal,
  themeClassNames,
  isDarkMode,
  isDraggingGlobal,
  draggedItem,
  draggedOverTierId,
  dropPreviewIndex,
  handleDragOverTier,
  handleItemError,
}: TierRowProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(tier.name);
  useEffect(() => {
    setTempName(tier.name);
  }, [tier.name]);

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

  const isCurrentDropTarget = draggedOverTierId === tier.id;
  const baseDropClasses = `${ITEM_CONTAINER_MIN_HEIGHT_CLASS} flex-grow flex flex-wrap items-start p-2 border-2 rounded-r-lg transition-all duration-150`;

  const highlightClasses =
    isDraggingGlobal && !isEditMode
      ? isCurrentDropTarget
        ? `border-[var(--accent-color)] ring-1 ring-[var(--accent-color)] border-solid`
        : `border-dashed border-[var(--accent-color)]/50`
      : `border-dashed ${themeClassNames.borderColor}`;

  const itemsWithPreview = [...tier.items];
  if (
    isCurrentDropTarget &&
    dropPreviewIndex !== null &&
    !isEditMode &&
    draggedItem &&
    draggedItem.item.id !== "drop-preview-placeholder"
  ) {
    itemsWithPreview.splice(dropPreviewIndex, 0, {
      id: "drop-preview-placeholder",
      name: "PREVIEW",
      isPlaceholder: true,
      imageUrl: draggedItem.item.imageUrl,
    });
  }

  return (
    <div
      className={`flex items-stretch rounded-lg shadow-md transition-shadow duration-300 hover:shadow-xl mb-3 ${themeClassNames.cardBgColor}`}
      onDragOver={(e) => {
        onDragOverItem(e);
        if (isEditMode || !isDraggingGlobal) return;
        handleDragOverTier(tier.id, tier.items.length);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isEditMode || !isDraggingGlobal) return;
        const idx =
          isCurrentDropTarget && dropPreviewIndex !== null
            ? dropPreviewIndex
            : tier.items.length;
        onDropItem(idx);
      }}
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
            className={`w-full text-sm p-1 rounded bg-white/70 text-black focus:outline-none ring-1 ring-[var(--accent-color)] dark:ring-gray-300`}
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
        className={`${baseDropClasses} ${highlightClasses} relative items-container`}
        onDragOver={(e) => {
          onDragOverItem(e);
          e.stopPropagation();
          if (isEditMode || !isDraggingGlobal) return;
          const el = e.currentTarget as HTMLDivElement;
          const items = Array.from(el.children).filter(
            (c) => !c.classList.contains("drop-preview-placeholder-item"),
          );
          let newIdx = items.length;
          for (let i = 0; i < items.length; i++) {
            const r = (items[i] as HTMLElement).getBoundingClientRect();
            if (e.clientX < r.left + r.width / 2) {
              newIdx = i;
              break;
            }
          }
          handleDragOverTier(tier.id, newIdx);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isEditMode || !isDraggingGlobal) return;
          const idx =
            isCurrentDropTarget && dropPreviewIndex !== null
              ? dropPreviewIndex
              : tier.items.length;
          onDropItem(idx);
        }}
      >
        {itemsWithPreview.length === 0 && !isDraggingGlobal && !isEditMode && (
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
              {...{
                item,
                isEditMode,
                onDragStart: () =>
                  onDragStartItem(
                    item,
                    tier.id,
                    tier.items.findIndex((i) => i.id === item.id),
                  ),
                onDragOverItem,
                onDrop: () =>
                  onDropItem(tier.items.findIndex((i) => i.id === item.id)),
                deleteItem,
                openEditItemModal,
                themeClassNames,
                isDarkMode,
                handleItemError,
              }}
            />
          ),
        )}
      </div>
    </div>
  );
}

interface ItemCardProps {
  item: Item;
  isEditMode: boolean;
  onDragStart: () => void;
  deleteItem: (id: string) => void;
  openEditItemModal: (item: Item) => void;
  onDragOverItem: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: () => void;
  themeClassNames: ThemeClassNames;
  isDarkMode: boolean;
  handleItemError: (itemId: string, isError: boolean) => void;
}

function ItemCard({
  item,
  isEditMode,
  onDragStart,
  deleteItem,
  openEditItemModal,
  onDragOverItem,
  onDrop,
  themeClassNames,
  isDarkMode,
  handleItemError,
}: ItemCardProps) {
  const draggable = !isEditMode;

  const onImageError = () => {
    handleItemError(item.id, true);
  };

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
      className={`m-1 ${isDarkMode ? "bg-neutral-800 hover:bg-neutral-700" : "bg-slate-200 hover:bg-slate-300"} rounded-lg shadow-md w-24 sm:w-28 ${ITEM_CARD_HEIGHT_CLASS} flex flex-col relative transition-all duration-150 ${draggable ? "cursor-grab hover:shadow-xl transform hover:-translate-y-0.5" : "cursor-default"} group overflow-hidden`}
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
          <div
            className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-neutral-700" : "bg-slate-100"}`}
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
            className={`absolute top-1 right-1 ${isDarkMode ? "text-white/70" : "text-black/60"} opacity-50 group-hover:opacity-100 transition-opacity`}
          />
        )}
      </div>

      <div
        className={`p-2 w-full ${isDarkMode ? "bg-black/50 backdrop-blur-sm" : "bg-black/30 backdrop-blur-sm"}`}
      >
        <p
          className={`text-xs truncate font-medium ${isDarkMode ? "text-slate-100" : "text-white"}`}
        >
          {item.name}
        </p>
      </div>

      {isEditMode && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-150">
          <button
            onClick={() => openEditItemModal(item)}
            className={`p-2 bg-white/90 dark:bg-neutral-600/90 backdrop-blur-sm rounded-full text-[var(--accent-color)] hover:bg-opacity-100`}
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

interface UnrankedItemsContainerProps {
  items: Item[];
  isEditMode: boolean;
  onDragStartItem: (item: Item, srcTierId: string, srcIdx: number) => void;
  onDragOverItem: (e: React.DragEvent<HTMLDivElement>) => void;
  onDropItem: (targetIdx?: number) => void;
  deleteItem: (id: string) => void;
  openEditItemModal: (item: Item) => void;
  themeClassNames: ThemeClassNames;
  isDarkMode: boolean;
  isDraggingGlobal: boolean;
  draggedItem: DraggedItemInfo | null;
  draggedOverTierId: string | null;
  dropPreviewIndex: number | null;
  handleDragOverTier: (tierId: string | "unranked", index?: number) => void;
  handleItemError: (itemId: string, isError: boolean) => void;
}

function UnrankedItemsContainer({
  items,
  isEditMode,
  onDragStartItem,
  onDragOverItem,
  onDropItem,
  deleteItem,
  openEditItemModal,
  themeClassNames,
  isDarkMode,
  isDraggingGlobal,
  draggedItem,
  draggedOverTierId,
  dropPreviewIndex,
  handleDragOverTier,
  handleItemError,
}: UnrankedItemsContainerProps) {
  const isCurrentDropTarget = draggedOverTierId === "unranked";
  const baseDropClasses = `${ITEM_CONTAINER_MIN_HEIGHT_CLASS} flex flex-wrap items-start p-3 border-2 rounded-lg mt-6 transition-all`;

  const highlightClasses =
    isDraggingGlobal && !isEditMode
      ? isCurrentDropTarget
        ? `border-[var(--accent-color)] ring-1 ring-[var(--accent-color)] border-solid`
        : `border-dashed border-[var(--accent-color)]/50`
      : `border-dashed ${themeClassNames.borderColor}`;

  const itemsWithPreview = [...items];
  if (
    isCurrentDropTarget &&
    dropPreviewIndex !== null &&
    !isEditMode &&
    draggedItem &&
    draggedItem.item.id !== "drop-preview-placeholder-unranked"
  ) {
    itemsWithPreview.splice(dropPreviewIndex, 0, {
      id: "drop-preview-placeholder-unranked",
      name: "PREVIEW_U",
      isPlaceholder: true,
      imageUrl: draggedItem.item.imageUrl,
    });
  }

  return (
    <div
      className={`p-4 rounded-lg shadow-md mt-6 sm:mt-8 ${themeClassNames.cardBgColor}`}
      onDragOver={(e) => {
        onDragOverItem(e);
        if (isEditMode || !isDraggingGlobal) return;
        handleDragOverTier("unranked", items.length);
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isEditMode || !isDraggingGlobal) return;
        const idx =
          isCurrentDropTarget && dropPreviewIndex !== null
            ? dropPreviewIndex
            : items.length;
        onDropItem(idx);
      }}
    >
      <h3
        className={`text-lg sm:text-xl font-semibold mb-3 text-center ${themeClassNames.textColor}`}
      >
        <Columns size={20} className="inline mr-2 align-text-bottom" /> Unranked
        Items
      </h3>
      <div
        className={`${baseDropClasses} ${highlightClasses} justify-center sm:justify-start gap-1 relative items-container`}
        onDragOver={(e) => {
          onDragOverItem(e);
          e.stopPropagation();
          if (isEditMode || !isDraggingGlobal) return;
          const el = e.currentTarget as HTMLDivElement;
          const itemsArr = Array.from(el.children).filter(
            (c) => !c.classList.contains("drop-preview-placeholder-item"),
          );
          let newIdx = itemsArr.length;
          for (let i = 0; i < itemsArr.length; i++) {
            const r = (itemsArr[i] as HTMLElement).getBoundingClientRect();
            if (e.clientX < r.left + r.width / 2) {
              newIdx = i;
              break;
            }
          }
          handleDragOverTier("unranked", newIdx);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isEditMode || !isDraggingGlobal) return;
          const idx =
            isCurrentDropTarget && dropPreviewIndex !== null
              ? dropPreviewIndex
              : items.length;
          onDropItem(idx);
        }}
      >
        {itemsWithPreview.length === 0 && !isDraggingGlobal && !isEditMode && (
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
        {itemsWithPreview.length === 0 && isDraggingGlobal && !isEditMode && (
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
              {...{
                item,
                isEditMode,
                onDragStart: () =>
                  onDragStartItem(
                    item,
                    "unranked",
                    items.findIndex((i) => i.id === item.id),
                  ),
                onDragOverItem,
                onDrop: () =>
                  onDropItem(items.findIndex((i) => i.id === item.id)),
                deleteItem,
                openEditItemModal,
                themeClassNames,
                isDarkMode,
                handleItemError,
              }}
            />
          ),
        )}
      </div>
    </div>
  );
}

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveItem: (data: Omit<Item, "id">, id?: string) => void;
  itemToEdit: Item | null;
  themeClassNames: ThemeClassNames;
}

function AddItemModal({
  isOpen,
  onClose,
  onSaveItem,
  itemToEdit,
  themeClassNames,
}: AddItemModalProps) {
  const [name, setName] = useState("");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url");

  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setName(itemToEdit.name);
        if (
          itemToEdit.imageUrl &&
          itemToEdit.imageUrl.startsWith("data:image")
        ) {
          setImageInputMode("upload");
          setImagePreview(itemToEdit.imageUrl);
          setImageUrlInput("");
        } else {
          setImageInputMode("url");
          setImageUrlInput(itemToEdit.imageUrl || "");
          setImagePreview(itemToEdit.imageUrl || null);
        }
      } else {
        setName("");
        setImageUrlInput("");
        setImagePreview(null);
        setImageInputMode("url");
      }
    }
  }, [itemToEdit, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageUrlInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Item name is required.");
      return;
    }
    let finalImageUrl =
      imageInputMode === "upload" && imagePreview?.startsWith("data:image")
        ? imagePreview
        : imageUrlInput;
    const itemData = { name, imageUrl: finalImageUrl || undefined };
    itemToEdit ? onSaveItem(itemData, itemToEdit.id) : onSaveItem(itemData);
  };

  if (!isOpen) return null;

  const inputClasses = `w-full p-3 border rounded-lg ${themeClassNames.inputBgColor} ${themeClassNames.inputBorderColor} ${themeClassNames.textColor} ${themeClassNames.placeholderColor} focus:ring-1 focus:ring-[var(--accent-color)] focus:${themeClassNames.inputFocusBorderColor} transition-colors`;
  const tabButtonBase = `flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:ring-offset-1 focus:ring-offset-[var(--raw-card-bg-value)]`;
  const activeTabClasses = `bg-[var(--accent-color)] text-black shadow-sm`;
  const inactiveTabClasses = `${themeClassNames.buttonInactiveBg} ${themeClassNames.buttonInactiveText} ${themeClassNames.buttonInactiveHoverBg}`;

  return (
    <div
      className={`fixed inset-0 ${themeClassNames.modalOverlayBg} backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300`}
    >
      <div
        className={`${themeClassNames.cardBgColor} p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100`}
      >
        <h2
          className={`text-2xl sm:text-3xl font-semibold mb-6 ${themeClassNames.textColor} text-center`}
        >
          {itemToEdit ? "Edit Item" : "Add New Item"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="itemName"
              className={`block text-sm font-medium mb-1.5 ${themeClassNames.textColor}`}
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="itemName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              required
              className={inputClasses}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${themeClassNames.textColor}`}
            >
              Image Source
            </label>
            <div
              className={`flex gap-1 p-1 rounded-lg mb-3 ${themeClassNames.tabContainerBg}`}
            >
              <button
                type="button"
                onClick={() => {
                  setImageInputMode("url");
                  if (imageUrlInput) setImagePreview(imageUrlInput);
                  else if (!itemToEdit?.imageUrl?.startsWith("data:"))
                    setImagePreview(null);
                }}
                className={`${tabButtonBase} ${imageInputMode === "url" ? activeTabClasses : inactiveTabClasses}`}
              >
                <Link2 size={16} className="inline mr-1.5" /> URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageInputMode("upload");
                  if (!imagePreview?.startsWith("data:image"))
                    setImagePreview(null);
                }}
                className={`${tabButtonBase} ${imageInputMode === "upload" ? activeTabClasses : inactiveTabClasses}`}
              >
                <UploadCloud size={16} className="inline mr-1.5" /> Upload
              </button>
            </div>
            {imageInputMode === "url" ? (
              <input
                id="itemImageUrl"
                type="url"
                value={imageUrlInput}
                onChange={(e) => {
                  setImageUrlInput(e.target.value);
                  setImagePreview(e.target.value || null);
                }}
                placeholder="https://example.com/image.png"
                className={inputClasses}
              />
            ) : (
              <label
                htmlFor="itemImageFile"
                className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer ${themeClassNames.inputBorderColor} ${themeClassNames.buttonInactiveHoverBg} transition-colors`}
              >
                <UploadCloud
                  size={32}
                  className={`${themeClassNames.secondaryTextColor} mb-2`}
                />
                <span
                  className={`text-sm font-medium ${themeClassNames.textColor}`}
                >
                  Click to upload or drag & drop
                </span>
                <span
                  className={`text-xs ${themeClassNames.secondaryTextColor}`}
                >
                  SVG, PNG, JPG or GIF (Max 2MB)
                </span>
                <input
                  id="itemImageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            )}
            {imagePreview && (
              <div
                className={`mt-4 p-2 border rounded-lg ${themeClassNames.borderColor} flex justify-center items-center h-32`}
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            {!imagePreview && imageInputMode === "upload" && (
              <div
                className={`mt-4 p-2 border-2 border-dashed rounded-lg ${themeClassNames.borderColor} flex flex-col justify-center items-center h-32 text-center ${themeClassNames.secondaryTextColor}`}
              >
                <ImageIcon size={32} className="mb-1" />{" "}
                <p className="text-sm">Image Preview</p>
              </div>
            )}
          </div>
          <div
            className={`flex justify-end gap-3 pt-4 border-t ${themeClassNames.borderColor} mt-8`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 text-sm font-medium rounded-lg ${themeClassNames.buttonInactiveBg} ${themeClassNames.buttonInactiveText} ${themeClassNames.buttonInactiveHoverBg} transition-colors shadow hover:shadow-md`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-sm font-medium rounded-lg bg-[var(--accent-color)] text-black hover:bg-opacity-90 transition-colors shadow hover:shadow-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:ring-offset-1 focus:ring-offset-[var(--raw-card-bg-value)]`}
            >
              {itemToEdit ? (
                <>
                  <CheckSquare size={18} className="inline mr-1.5" /> Save
                  Changes
                </>
              ) : (
                <>
                  <PlusCircle size={18} className="inline mr-1.5" /> Add Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default App;
