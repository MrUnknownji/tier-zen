// app/contexts/SettingsContext.tsx
"use client";
import React, { createContext, useContext, useMemo, ReactNode, Dispatch, SetStateAction } from 'react';
import type { ThemeClassNames } from '../types'; // Import ThemeClassNames

export interface SettingsContextState {
  isEditMode: boolean;
  setIsEditMode: Dispatch<SetStateAction<boolean>>;
  isDarkMode: boolean;
  setIsDarkMode: Dispatch<SetStateAction<boolean>>;
  themeClassNames: ThemeClassNames;
}

const SettingsContext = createContext<SettingsContextState | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
  isEditMode: boolean;
  setIsEditMode: Dispatch<SetStateAction<boolean>>;
  isDarkMode: boolean;
  setIsDarkMode: Dispatch<SetStateAction<boolean>>;
}

export const SettingsProvider = ({ 
  children, 
  isEditMode, 
  setIsEditMode, 
  isDarkMode, 
  setIsDarkMode 
}: SettingsProviderProps) => {
  const themeClassNames: ThemeClassNames = useMemo(() => ({
    bgColor: "bg-[var(--background)]", textColor: "text-[var(--foreground)]",
    cardBgColor: "bg-[var(--card-bg)]", borderColor: "border-[var(--border-color)]",
    inputBgColor: "bg-[var(--input-bg)]", inputBorderColor: "border-[var(--input-border)]",
    inputFocusBorderColor: "border-[var(--accent-color)]",
    placeholderColor: "placeholder-[var(--placeholder-color)]",
    secondaryTextColor: "text-[var(--text-secondary)]",
    buttonInactiveBg: "bg-[var(--button-inactive-bg)]",
    buttonInactiveText: "text-[var(--button-inactive-text)]",
    buttonInactiveHoverBg: "hover:bg-[var(--button-inactive-hover-bg)]",
    modalOverlayBg: "bg-[var(--modal-overlay-bg)]",
    tabContainerBg: "bg-[var(--tab-container-bg)]",
    cardHoverBgColor: "hover:bg-[var(--card-hover-bg)]",
    cardBgSubtleColor: "bg-[var(--card-bg-subtle)]",
    iconSecondaryColor: "text-[var(--icon-secondary-color)]",
    cardTextOverlayBgColor: "bg-[var(--card-text-overlay-bg)]",
    cardTextColor: "text-[var(--card-text-color)]",
    inputBgTransparentColor: "bg-[var(--input-bg-transparent)]",
    inputFgColor: "text-[var(--input-fg)]",
  }), []); // These class strings are static

  const value = { isEditMode, setIsEditMode, isDarkMode, setIsDarkMode, themeClassNames };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextState => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
