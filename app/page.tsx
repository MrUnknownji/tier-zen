"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/dist/Draggable";
import { toPng } from "html-to-image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}
import { saveAs } from "file-saver";
import {
  Item,
  Tier,
  DraggedItemInfo,
  ThemeClassNames,
} from "./lib/types";
import { generateId, getContrastingTextColor } from "./lib/utils";
import Toolbar from "./components/Toolbar";
import TierRow from "./components/TierRow";
import UnrankedItemsContainer from "./components/UnrankedItemsContainer";
import AddItemModal from "./components/AddItemModal";

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

const ITEM_CARD_HEIGHT_CLASS = "h-36";
const ITEM_CONTAINER_MIN_HEIGHT_CLASS = "min-h-[156px]";

function App() {
  const [tiers, setTiers] = useState<Tier[]>(initialTiersData);
  const [unrankedItems, setUnrankedItems] = useState<Item[]>(
    initialUnrankedItemsData,
  );
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [draggedItem, setDraggedItem] = useState<DraggedItemInfo | null>(null);
  const [dropPreview, setDropPreview] = useState<{
    tierId: string | "unranked";
    index: number;
  } | null>(null);
  const [justAddedTierId, setJustAddedTierId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTiers = localStorage.getItem("tierListTiersV4");
      setTiers(savedTiers ? JSON.parse(savedTiers) : initialTiersData);
      const savedUnranked = localStorage.getItem("tierListUnrankedItemsV4");
      setUnrankedItems(
        savedUnranked ? JSON.parse(savedUnranked) : initialUnrankedItemsData,
      );
      const savedTheme = localStorage.getItem("tierListThemeV4");
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      } else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)",
        ).matches;
        setIsDarkMode(prefersDark);
      }
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
      // New theme class names
      cardHoverBgColor: "hover:bg-[var(--card-hover-bg)]",
      cardBgSubtleColor: "bg-[var(--card-bg-subtle)]",
      iconSecondaryColor: "text-[var(--icon-secondary-color)]",
      cardTextOverlayBgColor: "bg-[var(--card-text-overlay-bg)]",
      cardTextColor: "text-[var(--card-text-color)]",
      inputBgTransparentColor: "bg-[var(--input-bg-transparent)]",
      inputFgColor: "text-[var(--input-fg)]",
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

  const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&"']/g, (match) => {
      switch (match) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case "&":
          return "&amp;";
        case '"':
          return "&quot;";
        case "'":
          return "&apos;";
        default:
          return match;
      }
    });
  };

  const exportToPng = async () => {
    const element = document.getElementById("tierListContent");
    let originalBgColor = "";

    if (!element) {
      console.error("Element with ID 'tierListContent' not found.");
      alert("Error: Could not find content to export.");
      return;
    }
    try {
      originalBgColor = element.style.backgroundColor;
      element.style.backgroundColor = isDarkMode ? "#1a1a1a" : "#ffffff";

      const dataUrl = await toPng(element, {
        pixelRatio: Math.max(1.5, window.devicePixelRatio || 1),
        filter: (node) => {
          if (
            node.tagName === "BUTTON" &&
            (node.textContent?.includes("Export") ||
              node.classList.contains("toolbar-button-class-if-any"))
          ) {
            return false;
          }
          return true;
        },
      });
      saveAs(dataUrl, "tierlist.png");
      element.style.backgroundColor = originalBgColor;
    } catch (error) {
      console.error("Error exporting to PNG:", error);
      alert("Error: Could not generate PNG. See console for details.");
      if (element) element.style.backgroundColor = originalBgColor;
    }
  };

  const exportToXml = async () => {
    let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<tierlist>\n';

    // Tiers
    xmlString += "  <tiers>\n";
    tiers.forEach((tier) => {
      xmlString += `    <tier name="${escapeXml(tier.name)}" color="${escapeXml(tier.color)}">\n`;
      tier.items.forEach((item) => {
        xmlString += `      <item name="${escapeXml(item.name)}"${item.imageUrl ? ` imageUrl="${escapeXml(item.imageUrl)}"` : ""}></item>\n`;
      });
      xmlString += "    </tier>\n";
    });
    xmlString += "  </tiers>\n";

    // Unranked Items
    xmlString += "  <unrankedItems>\n";
    unrankedItems.forEach((item) => {
      xmlString += `    <item name="${escapeXml(item.name)}"${item.imageUrl ? ` imageUrl="${escapeXml(item.imageUrl)}"` : ""}></item>\n`;
    });
    xmlString += "  </unrankedItems>\n";

    xmlString += "</tierlist>";

    const blob = new Blob([xmlString], {
      type: "application/xml;charset=utf-8",
    });
    saveAs(blob, "tierlist.xml");
  };

  const addTier = () => {
    const newTier: Tier = {
      id: generateId(),
      name: `New Tier ${tiers.length + 1}`,
      color: "#cccccc",
      textColor: getContrastingTextColor("#cccccc"),
      items: [],
    };
    setTiers([...tiers, newTier]);
    setJustAddedTierId(newTier.id);
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
      ]);
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
      }
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

  const handleDragStart = (item: Item, sourceTierId: string | "unranked") => {
    const sourceTier =
      sourceTierId === "unranked"
        ? { items: unrankedItems }
        : tiers.find((t) => t.id === sourceTierId);
    if (!sourceTier) return;
    const sourceIndex = sourceTier.items.findIndex((i) => i.id === item.id);
    setDraggedItem({ item, sourceTierId, sourceIndex });
  };

  const handleDrag = (
    hitTestResult: { tierId: string | "unranked"; index: number } | null,
  ) => {
    if (hitTestResult) {
      setDropPreview(hitTestResult);
    } else {
      setDropPreview(null);
    }
  };

  const handleDrop = () => {
    if (!draggedItem || !dropPreview) {
      setDraggedItem(null);
      setDropPreview(null);
      return;
    }

    const { item: movedItem, sourceTierId } = draggedItem;
    const { tierId: targetTierId, index: targetIndex } = dropPreview;

    // Remove from source
    if (sourceTierId === "unranked") {
      setUnrankedItems((prev) => prev.filter((i) => i.id !== movedItem.id));
    } else {
      setTiers((prevTiers) =>
        prevTiers.map((tier) => {
          if (tier.id === sourceTierId) {
            return {
              ...tier,
              items: tier.items.filter((i) => i.id !== movedItem.id),
            };
          }
          return tier;
        }),
      );
    }

    // Add to destination
    if (targetTierId === "unranked") {
      setUnrankedItems((prev) => {
        const newItems = [...prev];
        newItems.splice(targetIndex, 0, movedItem);
        return newItems;
      });
    } else {
      setTiers((prevTiers) =>
        prevTiers.map((tier) => {
          if (tier.id === targetTierId) {
            const newItems = [...tier.items];
            newItems.splice(targetIndex, 0, movedItem);
            return { ...tier, items: newItems };
          }
          return tier;
        }),
      );
    }

    setDraggedItem(null);
    setDropPreview(null);
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
      className={`min-h-screen ${themeClassNames.bgColor} ${themeClassNames.textColor} font-inter transition-colors duration-300`}
    >
      <header className="sticky top-0 z-10 p-4 sm:p-6 md:p-8 bg-[var(--background)]/80 backdrop-blur-sm border-b border-[var(--border-color)]">
        <div className="w-full max-w-5xl xl:max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--accent-color)] transition-colors duration-300">
            TierZen
          </h1>
          <Toolbar
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            addTier={addTier}
            resetAll={resetAll}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            setShowAddItemModal={setShowAddItemModal}
            setItemToEdit={setItemToEdit}
            themeClassNames={themeClassNames}
            exportToPng={exportToPng}
            exportToXml={exportToXml}
          />
        </div>
      </header>
      <div className="w-full max-w-5xl xl:max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        <div id="tierListContent" className={`${themeClassNames.bgColor}`}>
          <main className="space-y-3 sm:space-y-4">
            {tiers.map((tier) => (
              <TierRow
                key={tier.id}
                tier={tier}
                updateTier={updateTier}
                deleteTier={deleteTier}
                isEditMode={isEditMode}
                deleteItem={deleteItem}
                openEditItemModal={openEditItemModal}
                themeClassNames={themeClassNames}
                isDarkMode={isDarkMode}
                handleItemError={handleItemError}
                handleDragStart={handleDragStart}
                handleDrag={handleDrag}
                handleDrop={handleDrop}
                draggedItem={draggedItem}
                dropPreview={dropPreview}
                justAddedTierId={justAddedTierId}
                setJustAddedTierId={setJustAddedTierId}
              />
            ))}
          </main>
          <UnrankedItemsContainer
            items={unrankedItems}
            isEditMode={isEditMode}
            deleteItem={deleteItem}
            openEditItemModal={openEditItemModal}
            themeClassNames={themeClassNames}
            isDarkMode={isDarkMode}
            handleItemError={handleItemError}
            handleDragStart={handleDragStart}
            handleDrag={handleDrag}
            handleDrop={handleDrop}
            draggedItem={draggedItem}
            dropPreview={dropPreview}
          />
          {showAddItemModal && (
            <AddItemModal
              isOpen={showAddItemModal}
              onClose={() => {
                setShowAddItemModal(false);
                setItemToEdit(null);
              }}
              onSaveItem={handleSaveItemFromModal}
              itemToEdit={itemToEdit}
              themeClassNames={themeClassNames}
            />
          )}
        </div>
        <footer
          className={`mt-8 text-center text-sm ${themeClassNames.secondaryTextColor}`}
        >
          <p>TierZen by Unknown. Drag and drop items in 'Rank' mode.</p>
        </footer>
      </div>
    </div>
  );
}





export default App;
