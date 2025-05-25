// app/types.ts
export interface Item {
  id: string;
  name: string;
  imageUrl?: string;
  isPlaceholder?: boolean;
  hasError?: boolean;
}

export interface Tier {
  id: string;
  name: string;
  color: string;
  textColor: string;
  items: Item[];
}

export interface DraggedItemInfo {
  item: Item;
  sourceTierId: string | "unranked";
  sourceIndex: number;
}

// This was previously in SettingsContext.tsx, moved here for wider use if needed.
export interface ThemeClassNames {
  bgColor: string; textColor: string; cardBgColor: string; borderColor: string;
  inputBgColor: string; inputBorderColor: string; inputFocusBorderColor: string;
  placeholderColor: string; secondaryTextColor: string; buttonInactiveBg: string;
  buttonInactiveText: string; buttonInactiveHoverBg: string; modalOverlayBg: string;
  tabContainerBg: string; cardHoverBgColor: string; cardBgSubtleColor: string;
  iconSecondaryColor: string; cardTextOverlayBgColor: string; cardTextColor: string;
  inputBgTransparentColor: string; inputFgColor: string;
}
