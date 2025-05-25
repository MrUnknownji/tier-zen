// app/page.tsx
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";

import type { Item, Tier, DraggedItemInfo } from './types';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

import Toolbar from './components/Toolbar';
import TierRow from './components/TierRow';
import UnrankedItemsContainer from './components/UnrankedItemsContainer';
import AddItemModal from './components/AddItemModal';
import PageNotification from './components/PageNotification';
import type { NotificationMessage } from './components/PageNotification';
import { generateId, getContrastingTextColor, escapeXml } from './utils';

const initialTiersData: Tier[] = [
  { id: "tier-s-initial", name: "S Tier", color: "#ff7f7f", textColor: getContrastingTextColor("#ff7f7f"), items: [] },
  { id: "tier-a-initial", name: "A Tier", color: "#ffbf7f", textColor: getContrastingTextColor("#ffbf7f"), items: [] },
  { id: "tier-b-initial", name: "B Tier", color: "#ffff7f", textColor: getContrastingTextColor("#ffff7f"), items: [] },
];

const initialUnrankedItemsData: Item[] = [
  { id: "item-alpha-initial", name: "Item Alpha", imageUrl: "https://placehold.co/200x200/7F7F7F/FFFFFF?text=Alpha" },
  { id: "item-beta-initial", name: "Item Beta", imageUrl: "https://placehold.co/200x200/6A6A6A/FFFFFF?text=Beta" },
];

function TierZenPage() {
  // Core application data state
  const [tiers, setTiers] = useState<Tier[]>(initialTiersData);
  const [unrankedItems, setUnrankedItems] = useState<Item[]>(initialUnrankedItemsData);

  // UI and settings state (passed to SettingsProvider)
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  
  // Modal visibility and data state
  const [showAddItemModal, setShowAddItemModal] = useState<boolean>(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  
  // Drag and Drop state variables
  const [draggedItem, setDraggedItem] = useState<DraggedItemInfo | null>(null); // Info about the item being dragged
  const [isDraggingGlobal, setIsDraggingGlobal] = useState<boolean>(false); // True if any D&D operation is active
  const [draggedOverTierId, setDraggedOverTierId] = useState<string | null>(null); // ID of the tier the item is currently dragged over
  const [dropPreviewIndex, setDropPreviewIndex] = useState<number | null>(null); // Calculated index for drop preview placeholder
  
  const [pageNotification, setPageNotification] = useState<NotificationMessage | null>(null);

  // Effect for loading initial data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTiersData = localStorage.getItem("tierListTiersV4");
      if (savedTiersData) { try { setTiers(JSON.parse(savedTiersData)); } catch (e) { console.error("Error parsing saved tiers:", e); setTiers(initialTiersData); }} else { setTiers(initialTiersData); }
      const savedUnrankedData = localStorage.getItem("tierListUnrankedItemsV4");
      if (savedUnrankedData) { try { setUnrankedItems(JSON.parse(savedUnrankedData)); } catch (e) { console.error("Error parsing saved unranked items:", e); setUnrankedItems(initialUnrankedItemsData); }} else { setUnrankedItems(initialUnrankedItemsData); }
      const savedTheme = localStorage.getItem("tierListThemeV4");
      if (savedTheme !== null) try { setIsDarkMode(JSON.parse(savedTheme)); } catch(e){ console.error("Error parsing saved theme:", e); setIsDarkMode(true); } else { setIsDarkMode(true); }
      const savedMode = localStorage.getItem("tierListModeV4");
      if (savedMode !== null) try { setIsEditMode(JSON.parse(savedMode)); } catch(e){ console.error("Error parsing saved mode:", e); setIsEditMode(false); } else { setIsEditMode(false); }
    }
  }, []);

  // Effects for persisting state changes to localStorage
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("tierListTiersV4", JSON.stringify(tiers)); }, [tiers]);
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("tierListUnrankedItemsV4", JSON.stringify(unrankedItems)); }, [unrankedItems]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("tierListThemeV4", JSON.stringify(isDarkMode));
      localStorage.setItem("tierListModeV4", JSON.stringify(isEditMode));
      document.documentElement.classList.toggle("dark", isDarkMode);
    }
  }, [isDarkMode, isEditMode]);

  const displayNotification = (message: string, type: 'error' | 'success' | 'info') => {
    setPageNotification({ id: Date.now(), message, type });
  };

  const exportToPng = async () => {
    const element = document.getElementById("tierListContent");
    if (!element) {
      console.error("Element 'tierListContent' not found for PNG export.");
      displayNotification("Error: Could not find content to export.", "error");
      return;
    }
    const originalBgStyle = element.style.backgroundColor;
    element.style.backgroundColor = isDarkMode ? '#101010' : '#f8fafc'; 
    try {
      const dataUrl = await toPng(element, {
        pixelRatio: Math.max(1.5, window.devicePixelRatio || 1),
        filter: (node) => {
          if (node instanceof HTMLButtonElement && node.title?.toLowerCase().includes("export")) {
            return false; 
          }
          return true;
        },
      });
      saveAs(dataUrl, "tierlist.png");
      displayNotification("Exported to PNG successfully!", "success");
    } catch (error) {
      console.error("Error exporting to PNG:", error);
      displayNotification("Error: Could not generate PNG. See console for details.", "error");
    } finally {
      element.style.backgroundColor = originalBgStyle; 
    }
  };

  const exportToXml = async () => {
    let xmlString = `<?xml version="1.0" encoding="UTF-8"?>\n<tierlist>\n`;
    xmlString += "  <tiers>\n";
    tiers.forEach(tier => {
      xmlString += `    <tier name="${escapeXml(tier.name)}" color="${escapeXml(tier.color)}">\n`;
      tier.items.forEach(item => { xmlString += `      <item name="${escapeXml(item.name)}"${item.imageUrl ? ` imageUrl="${escapeXml(item.imageUrl)}"` : ""}></item>\n`; });
      xmlString += "    </tier>\n";
    });
    xmlString += "  </tiers>\n";
    xmlString += "  <unrankedItems>\n";
    unrankedItems.forEach(item => { xmlString += `    <item name="${escapeXml(item.name)}"${item.imageUrl ? ` imageUrl="${escapeXml(item.imageUrl)}"` : ""}></item>\n`; });
    xmlString += "  </unrankedItems>\n";
    xmlString += "</tierlist>";
    const blob = new Blob([xmlString], { type: "application/xml;charset=utf-8" });
    saveAs(blob, "tierlist.xml");
    displayNotification("Exported to XML successfully!", "success");
  };
  
  // Tier and Item CRUD operations
  const addTier = () => { const newTier: Tier = { id: generateId(), name: `New Tier ${tiers.length + 1}`, color: "#cccccc", textColor: getContrastingTextColor("#cccccc"), items: [] }; setTiers([...tiers, newTier]); };
  const updateTier = (tierId: string, updatedProps: Partial<Omit<Tier, "id" | "items" | "textColor">>) => { setTiers(prevTiers => prevTiers.map(tier => tier.id === tierId ? { ...tier, ...updatedProps, textColor: getContrastingTextColor(updatedProps.color ?? tier.color) } : tier)); };
  const deleteTier = (tierId: string) => { const tierToDelete = tiers.find(t => t.id === tierId); if (window.confirm(`Delete tier "${tierToDelete?.name || 'this tier'}" and move its items to Unranked?`)) { if (tierToDelete?.items.length) setUnrankedItems(prev => [...prev, ...tierToDelete.items.map(item => ({ ...item, hasError: false }))]); setTiers(prevTiers => prevTiers.filter(tier => tier.id !== tierId)); }};
  
  const handleItemError = useCallback((itemId: string, isError: boolean) => {
    const updateItemError = (items: Item[]) => items.map(item => item.id === itemId ? { ...item, hasError: isError } : item);
    setTiers(prev => prev.map(tier => ({ ...tier, items: updateItemError(tier.items) })));
    setUnrankedItems(prev => updateItemError(prev));
  }, []); // Empty dependency array is correct due to functional updates

  const handleAddItemSubmit = (newItemData: Omit<Item, "id">) => { const newItem: Item = { id: generateId(), ...newItemData, hasError: false }; setUnrankedItems(prev => [...prev, newItem]); };
  const handleUpdateItemSubmit = (itemId: string, updatedProps: Omit<Item, "id">) => { let found = false; const updateLogic = (item: Item) => { if (item.id === itemId) { found = true; return { ...item, ...updatedProps, hasError: false }; } return item; }; setTiers(prevTiers => prevTiers.map(tier => ({ ...tier, items: tier.items.map(updateLogic) }))); if (!found) setUnrankedItems(prevItems => prevItems.map(updateLogic)); };
  const handleSaveItemFromModal = (data: Omit<Item, "id">, id?: string) => { if (id) handleUpdateItemSubmit(id, data); else handleAddItemSubmit(data); setShowAddItemModal(false); setItemToEdit(null); };
  const deleteItem = (itemId: string) => { const itemToDelete = tiers.flatMap(t => t.items).find(i => i.id === itemId) || unrankedItems.find(i => i.id === itemId); if (window.confirm(`Are you sure you want to delete "${itemToDelete?.name || 'this item'}"? This cannot be undone.`)) { let deletedInTiers = false; setTiers(prevTiers => prevTiers.map(tier => { const newItems = tier.items.filter(item => item.id !== itemId); if (newItems.length !== tier.items.length) deletedInTiers = true; return { ...tier, items: newItems }; })); if (!deletedInTiers) setUnrankedItems(prevItems => prevItems.filter(item => item.id !== itemId)); }};
  
  // Modal control
  const openEditItemModal = (item: Item) => { setItemToEdit(item); setShowAddItemModal(true); };

  // Drag and Drop handlers
  const onDragStartItem = (item: Item, sourceTierId: string | "unranked", sourceIndex: number) => {
    if (!isEditMode) { // Dragging only allowed in Rank mode
      setDraggedItem({ item, sourceTierId, sourceIndex });
      setIsDraggingGlobal(true);
    }
  };

  const onDragEndItem = () => {
    // Reset all drag-related states
    setIsDraggingGlobal(false);
    setDraggedOverTierId(null);
    setDropPreviewIndex(null);
    setDraggedItem(null);
  };

  const handleDragOverTier = (tierId: string | "unranked", index?: number) => {
    if (!isDraggingGlobal || isEditMode) return; // Ensure dragging is active and not in edit mode
    setDraggedOverTierId(tierId);
    setDropPreviewIndex(index ?? null); // If index is undefined, it's usually the end of the list
  };

  const onDragOverItem = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const onDropItem = (targetTierId: string | "unranked", targetIndexInput?: number) => {
    if (!draggedItem || isEditMode) return; // Ensure there's a dragged item and not in edit mode

    const { item: movedItem, sourceTierId: srcTierId } = draggedItem;
    
    // Determine the exact target index. If not provided, item is added to the end.
    const getTargetLength = () => targetTierId === "unranked"
        ? unrankedItems.length
        : (tiers.find(t => t.id === targetTierId)?.items.length ?? 0);
    const targetIndex = targetIndexInput ?? getTargetLength();
    
    const itemToMove = { ...movedItem, hasError: false }; // Reset error state on move

    // Remove item from source
    if (srcTierId === "unranked") {
      setUnrankedItems(prev => prev.filter(i => i.id !== itemToMove.id));
    } else {
      setTiers(prevTiers =>
        prevTiers.map(tier =>
          tier.id === srcTierId
            ? { ...tier, items: tier.items.filter(i => i.id !== itemToMove.id) }
            : tier,
        ),
      );
    }

    // Add item to target
    if (targetTierId === "unranked") {
      setUnrankedItems(prev => {
        const newItems = [...prev];
        newItems.splice(targetIndex, 0, itemToMove);
        return newItems;
      });
    } else {
      setTiers(prevTiers =>
        prevTiers.map(tier => {
          if (tier.id === targetTierId) {
            const newItems = [...tier.items];
            newItems.splice(targetIndex, 0, itemToMove);
            return { ...tier, items: newItems };
          }
          return tier;
        }),
      );
    }
    
    // Reset D&D state (already handled by onDragEndItem, but good for clarity here too if onDragEndItem isn't guaranteed after onDrop)
    // setDraggedItem(null); 
    // setDraggedOverTierId(null);
    // setDropPreviewIndex(null);
    // setIsDraggingGlobal(false); // onDragEndItem handles this
  };
  
  const resetAll = () => { if (window.confirm("This will reset all tiers and items to their initial state and cannot be undone. Are you sure?")) { setTiers(initialTiersData); setUnrankedItems(initialUnrankedItemsData.map(item => ({ ...item, hasError: false }))); setIsEditMode(true); } };

  // AppInternalContent component to consume context & render UI
  function AppInternalContent() {
    const { themeClassNames } = useSettings(); 
    return (
      <> 
        <PageNotification notification={pageNotification} onDismiss={() => setPageNotification(null)} />
        <div className={`w-full max-w-5xl xl:max-w-6xl ${themeClassNames.textColor}`}>
          <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--accent-color)] transition-colors duration-300">TierZen</h1>
            <Toolbar addTier={addTier} resetAll={resetAll} setShowAddItemModal={setShowAddItemModal} setItemToEdit={setItemToEdit} exportToPng={exportToPng} exportToXml={exportToXml} />
          </header>
          <div id="tierListContent" className={`${themeClassNames.bgColor} p-4`}>
            <main className="space-y-3 sm:space-y-4">
              {tiers.map((tier) => ( 
                <TierRow 
                  key={tier.id} tier={tier} updateTier={updateTier} deleteTier={deleteTier} 
                  onDragStartItem={onDragStartItem} onDragOverItem={onDragOverItem} 
                  onDropItem={(idx) => onDropItem(tier.id, idx)} deleteItem={deleteItem} 
                  openEditItemModal={openEditItemModal} 
                  isDraggingGlobal={isDraggingGlobal} draggedItem={draggedItem} 
                  draggedOverTierId={draggedOverTierId} dropPreviewIndex={dropPreviewIndex} 
                  handleDragOverTier={handleDragOverTier} handleItemError={handleItemError} 
                /> 
              ))}
            </main>
            <UnrankedItemsContainer 
              items={unrankedItems} 
              onDragStartItem={onDragStartItem} onDragOverItem={onDragOverItem} 
              onDropItem={(idx) => onDropItem("unranked", idx)} deleteItem={deleteItem} 
              openEditItemModal={openEditItemModal} 
              isDraggingGlobal={isDraggingGlobal} draggedItem={draggedItem} 
              draggedOverTierId={draggedOverTierId} dropPreviewIndex={dropPreviewIndex} 
              handleDragOverTier={handleDragOverTier} handleItemError={handleItemError} 
            />
            {showAddItemModal && ( 
              <AddItemModal 
                isOpen={showAddItemModal} 
                onClose={() => { setShowAddItemModal(false); setItemToEdit(null); }} 
                onSaveItem={handleSaveItemFromModal} 
                itemToEdit={itemToEdit} 
              /> 
            )}
          </div>
          <footer className={`mt-8 text-center text-sm ${themeClassNames.secondaryTextColor}`}>
            <p>TierZen by Gemini. Drag and drop items in 'Rank' mode.</p>
          </footer>
        </div>
      </>
    );
  }

  return (
    <div className={`min-h-screen font-inter p-4 sm:p-6 md:p-8 transition-colors duration-300 flex flex-col items-center ${isDarkMode ? "dark" : ""}`} onDragEnd={onDragEndItem}>
      <SettingsProvider isEditMode={isEditMode} setIsEditMode={setIsEditMode} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}>
        <AppInternalContent />
      </SettingsProvider>
    </div>
  );
}

export default TierZenPage;
