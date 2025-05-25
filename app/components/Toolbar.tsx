// app/components/Toolbar.tsx
"use client";
import React from 'react';
import { PlusCircle, Edit3, Rows, Sun, Moon, RotateCcw, ImagePlus, Download } from "lucide-react";
import { useSettings } from '../contexts/SettingsContext';
import type { Item } from '../types'; // Import Item type

export interface ToolbarProps {
  addTier: () => void;
  resetAll: () => void;
  setShowAddItemModal: (show: boolean) => void;
  setItemToEdit: (item: Item | null) => void;
  exportToPng: () => void;
  exportToXml: () => void;
}

export default function Toolbar({
  addTier, resetAll, setShowAddItemModal, setItemToEdit, exportToPng, exportToXml,
}: ToolbarProps) {
  const { isEditMode, setIsEditMode, isDarkMode, setIsDarkMode, themeClassNames } = useSettings();

  const btnBase = `p-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:ring-offset-1 focus:ring-offset-[var(--raw-card-bg-value)]`;
  const active = `bg-[var(--accent-color)] text-black`;
  const inactive = `\${themeClassNames.buttonInactiveBg} \${themeClassNames.buttonInactiveText} \${themeClassNames.buttonInactiveHoverBg}`;

  return (
    <div className={`flex flex-wrap gap-2 items-center justify-center sm:justify-end p-2 rounded-lg shadow \${themeClassNames.cardBgColor}`}>
      <div className={`flex rounded-lg border \${themeClassNames.borderColor} overflow-hidden`}>
        <button onClick={() => setIsEditMode(true)} className={`\${btnBase} rounded-none rounded-l-md \${isEditMode ? active : inactive}`} title="Edit Mode: Modify tiers, add/edit/delete items."><Edit3 size={18} /></button>
        <button onClick={() => setIsEditMode(false)} className={`\${btnBase} rounded-none rounded-r-md \${!isEditMode ? active : inactive}`} title="Rank Mode: Drag and drop items between tiers."><Rows size={18} /></button>
      </div>
      {isEditMode && (
        <>
          <button onClick={addTier} className={`\${btnBase} \${inactive}`} title="Add a new tier row to the list."><PlusCircle size={18} /> Add Tier</button>
          <button onClick={() => { setItemToEdit(null); setShowAddItemModal(true); }} className={`\${btnBase} \${inactive}`} title="Add a new item to the Unranked Items pool."><ImagePlus size={18} /> Add Item</button>
          <button onClick={resetAll} className={`\${btnBase} bg-red-600 hover:bg-red-700 text-white focus:ring-red-500`} title="Reset all tiers and items to default. This action cannot be undone!"><RotateCcw size={18} /> Reset All</button>
        </>
      )}
      {!isEditMode && <div className="w-px h-6 bg-transparent mx-1"></div>}
      <button onClick={exportToPng} className={`\${btnBase} \${inactive}`} title="Export tier list as PNG"><Download size={18} /> Export PNG</button>
      <button onClick={exportToXml} className={`\${btnBase} \${inactive}`} title="Export tier list data as XML"><Download size={18} /> Export XML</button>
      <button onClick={() => setIsDarkMode(!isDarkMode)} className={`\${btnBase} \${inactive}`} title={`Switch to \${isDarkMode ? "Light" : "Dark"} Theme`}>{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
    </div>
  );
}
