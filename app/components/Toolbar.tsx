import React, { useState, useRef, useEffect } from "react";
import {
  PlusCircle,
  Edit3,
  Rows,
  RotateCcw,
  ImagePlus,
  Download,
  Sun,
  Moon,
  MoreVertical,
  FileText,
} from "lucide-react";
import { Item, ThemeClassNames } from "../lib/types";

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
  exportToPng: () => void;
  exportToXml: () => void;
}

export default function Toolbar({
  isEditMode,
  setIsEditMode,
  addTier,
  resetAll,
  isDarkMode,
  setIsDarkMode,
  setShowAddItemModal,
  setItemToEdit,
  themeClassNames,
  exportToPng,
  exportToXml,
}: ToolbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const btnBase = `p-2 rounded-lg transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] focus:ring-offset-[var(--background)]`;
  const active = `bg-[var(--accent-color)] text-black`;
  const inactive = `${themeClassNames.buttonInactiveBg} ${themeClassNames.buttonInactiveText} ${themeClassNames.buttonInactiveHoverBg}`;

  return (
    <div className="flex gap-2 items-center">
      {/* Mode Switcher */}
      <div
        className={`flex p-1 rounded-lg ${themeClassNames.tabContainerBg}`}
      >
        <button
          onClick={() => setIsEditMode(true)}
          className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${isEditMode ? active : "hover:bg-[var(--button-inactive-hover-bg)]"}`}
          title="Edit Mode"
        >
          <Edit3 size={16} className="sm:hidden" />
          <span className="hidden sm:inline">Edit</span>
        </button>
        <button
          onClick={() => setIsEditMode(false)}
          className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${!isEditMode ? active : "hover:bg-[var(--button-inactive-hover-bg)]"}`}
          title="Rank Mode"
        >
          <Rows size={16} className="sm:hidden" />
          <span className="hidden sm:inline">Rank</span>
        </button>
      </div>

      {/* Primary Actions (Edit Mode) */}
      {isEditMode && (
        <button
          onClick={() => {
            setItemToEdit(null);
            setShowAddItemModal(true);
          }}
          className={`${btnBase} ${active}`}
          title="Add a new item"
        >
          <ImagePlus size={18} />
          <span className="hidden sm:inline ml-2">Add Item</span>
        </button>
      )}

      {/* Theme Toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`${btnBase} ${inactive}`}
        title={`Switch to ${isDarkMode ? "Light" : "Dark"} Theme`}
      >
        {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* More Options Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`${btnBase} ${inactive}`}
          title="More options"
        >
          <MoreVertical size={18} />
        </button>
        {showMenu && (
          <div
            className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg py-1 ${themeClassNames.cardBgColor} border ${themeClassNames.borderColor} z-20`}
          >
            {isEditMode && (
              <>
                <button
                  onClick={() => {
                    addTier();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-[var(--button-inactive-hover-bg)]"
                >
                  <PlusCircle size={16} /> Add Tier
                </button>
                <button
                  onClick={() => {
                    resetAll();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 text-red-500 hover:bg-red-500/10"
                >
                  <RotateCcw size={16} /> Reset All
                </button>
                <div
                  className={`h-px my-1 ${themeClassNames.borderColor} bg-[var(--border-color)]`}
                />
              </>
            )}
            <button
              onClick={() => {
                exportToPng();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-[var(--button-inactive-hover-bg)]"
            >
              <Download size={16} /> Export as PNG
            </button>
            <button
              onClick={() => {
                exportToXml();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-[var(--button-inactive-hover-bg)]"
            >
              <FileText size={16} /> Export as XML
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
