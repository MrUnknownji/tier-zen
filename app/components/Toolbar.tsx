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
  ChevronDown,
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

  const btnBase = `flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] focus:ring-offset-[var(--background)]`;
  const iconBtn = `${btnBase} p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300`;
  const primaryBtn = `${btnBase} px-4 py-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white shadow-md hover:shadow-lg font-medium text-sm`;

  // Segmented control style
  const modeBtnBase = "relative z-10 flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200";
  const modeActive = "text-white";
  const modeInactive = "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200";

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Mode Switcher */}
      <div className="relative flex p-1 bg-slate-200 dark:bg-slate-800 rounded-full shadow-inner">
         {/* Animated Background Pill */}
        <div
            className={`absolute top-1 bottom-1 rounded-full bg-[var(--accent-color)] shadow-sm transition-all duration-300 ease-in-out`}
            style={{
                left: isEditMode ? '4px' : '50%',
                width: 'calc(50% - 4px)',
            }}
        />

        <button
          onClick={() => setIsEditMode(true)}
          className={`${modeBtnBase} ${isEditMode ? modeActive : modeInactive} w-24 justify-center`}
          title="Edit Mode"
        >
          <Edit3 size={14} />
          <span>Edit</span>
        </button>
        <button
          onClick={() => setIsEditMode(false)}
          className={`${modeBtnBase} ${!isEditMode ? modeActive : modeInactive} w-24 justify-center`}
          title="Rank Mode"
        >
          <Rows size={14} />
          <span>Rank</span>
        </button>
      </div>

      <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block" />

      {/* Primary Actions (Edit Mode) */}
      {isEditMode && (
        <button
          onClick={() => {
            setItemToEdit(null);
            setShowAddItemModal(true);
          }}
          className={`${primaryBtn}`}
          title="Add a new item"
        >
          <ImagePlus size={16} className="mr-2" />
          <span>Add Item</span>
        </button>
      )}

      {/* Theme Toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`${iconBtn}`}
        title={`Switch to ${isDarkMode ? "Light" : "Dark"} Theme`}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* More Options Dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`${iconBtn} ${showMenu ? 'bg-slate-200 dark:bg-slate-700' : ''}`}
          title="More options"
        >
          <MoreVertical size={20} />
        </button>

        {showMenu && (
          <div
            className={`absolute top-full right-0 mt-2 w-56 rounded-xl shadow-xl py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 z-50 transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200`}
          >
            {isEditMode && (
              <>
                <button
                  onClick={() => {
                    addTier();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <PlusCircle size={16} className="text-[var(--accent-color)]" />
                  Add New Tier
                </button>
                <button
                  onClick={() => {
                    resetAll();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <RotateCcw size={16} />
                  Reset All Items
                </button>
                <div className="h-px my-1 bg-slate-100 dark:bg-slate-700 mx-2" />
              </>
            )}

            <div className="px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Export
            </div>

            <button
              onClick={() => {
                exportToPng();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <Download size={16} />
              Save as Image (PNG)
            </button>
            <button
              onClick={() => {
                exportToXml();
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <FileText size={16} />
              Save as Data (XML)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
