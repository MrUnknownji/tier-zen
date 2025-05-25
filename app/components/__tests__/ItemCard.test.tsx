// app/components/__tests__/ItemCard.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemCard, { ItemCardProps } from '../ItemCard';
import { SettingsProvider } from '../../contexts/SettingsContext'; // To provide context
import type { Item, ThemeClassNames } from '../../types';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Edit3: () => <svg data-testid="edit3-icon" />,
  Trash2: () => <svg data-testid="trash2-icon" />,
  GripVertical: () => <svg data-testid="grip-vertical-icon" />,
  ImageIcon: () => <svg data-testid="image-icon" />,
  AlertCircle: () => <svg data-testid="alert-circle-icon" />,
}));

// Mock window.confirm
global.confirm = jest.fn(() => true); // Default to true (user confirms)

const mockDefaultItem: Item = {
  id: 'item1',
  name: 'Test Item 1',
  imageUrl: 'https://via.placeholder.com/150',
  hasError: false,
};

const mockThemeClassNames: ThemeClassNames = {
  bgColor: "bg-white", textColor: "text-black", cardBgColor: "bg-gray-100",
  borderColor: "border-gray-300", inputBgColor: "bg-gray-50",
  inputBorderColor: "border-gray-200", inputFocusBorderColor: "border-blue-500",
  placeholderColor: "placeholder-gray-400", secondaryTextColor: "text-gray-500",
  buttonInactiveBg: "bg-gray-200", buttonInactiveText: "text-gray-700",
  buttonInactiveHoverBg: "hover:bg-gray-300", modalOverlayBg: "bg-black/50",
  tabContainerBg: "bg-gray-50", cardHoverBgColor: "hover:bg-gray-200",
  cardBgSubtleColor: "bg-gray-50", iconSecondaryColor: "text-gray-400",
  cardTextOverlayBgColor: "bg-black/40", cardTextColor: "text-white",
  inputBgTransparentColor: "bg-white/70", inputFgColor: "text-black",
};

const renderWithSettings = (
  ui: React.ReactElement,
  { isEditMode = false, isDarkMode = false } = {}
) => {
  // Mock setIsEditMode and setIsDarkMode as they are not used by ItemCard directly but required by Provider
  const mockSetIsEditMode = jest.fn();
  const mockSetIsDarkMode = jest.fn();

  return render(
    <SettingsProvider
      isEditMode={isEditMode}
      setIsEditMode={mockSetIsEditMode}
      isDarkMode={isDarkMode}
      setIsDarkMode={mockSetIsDarkMode}
    >
      {ui}
    </SettingsProvider>
  );
};

describe('ItemCard Component', () => {
  let mockProps: ItemCardProps;

  beforeEach(() => {
    mockProps = {
      item: { ...mockDefaultItem },
      onDragStart: jest.fn(),
      deleteItem: jest.fn(),
      openEditItemModal: jest.fn(),
      onDragOverItem: jest.fn(),
      onDrop: jest.fn(),
      handleItemError: jest.fn(),
    };
    (global.confirm as jest.Mock).mockClear().mockReturnValue(true); // Reset confirm mock
  });

  it('should render item name and image', () => {
    renderWithSettings(<ItemCard {...mockProps} />);
    expect(screen.getByText('Test Item 1')).toBeInTheDocument();
    expect(screen.getByAltText('Test Item 1')).toHaveAttribute('src', mockDefaultItem.imageUrl);
  });

  it('should render placeholder icon if imageUrl is missing', () => {
    mockProps.item.imageUrl = undefined;
    renderWithSettings(<ItemCard {...mockProps} />);
    expect(screen.getByTestId('image-icon')).toBeInTheDocument();
  });

  it('should render error icon if item hasError is true', () => {
    mockProps.item.hasError = true;
    renderWithSettings(<ItemCard {...mockProps} />);
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
  });

  it('should call handleItemError on image load error', () => {
    renderWithSettings(<ItemCard {...mockProps} />);
    const image = screen.getByAltText('Test Item 1');
    fireEvent.error(image);
    expect(mockProps.handleItemError).toHaveBeenCalledWith(mockDefaultItem.id, true);
  });

  describe('Rank Mode (isEditMode: false)', () => {
    it('should be draggable and show grip icon', () => {
      renderWithSettings(<ItemCard {...mockProps} />, { isEditMode: false });
      expect(screen.getByTitle('Test Item 1').closest('div')).toHaveAttribute('draggable', 'true');
      expect(screen.getByTestId('grip-vertical-icon')).toBeInTheDocument();
    });

    it('should call onDragStart when dragged', () => {
      renderWithSettings(<ItemCard {...mockProps} />, { isEditMode: false });
      const draggableElement = screen.getByTitle('Test Item 1').closest('div')!;
      fireEvent.dragStart(draggableElement);
      expect(mockProps.onDragStart).toHaveBeenCalledTimes(1);
    });

    it('should not show edit/delete buttons', () => {
      renderWithSettings(<ItemCard {...mockProps} />, { isEditMode: false });
      // Buttons are shown on hover, but the container for them should not exist or be visible
      // For simplicity, we check they are not in document. A more robust test might check for opacity or visibility.
      expect(screen.queryByTestId('edit3-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('trash2-icon')).not.toBeInTheDocument();
    });
  });

  describe('Edit Mode (isEditMode: true)', () => {
    it('should not be draggable and not show grip icon', () => {
      renderWithSettings(<ItemCard {...mockProps} />, { isEditMode: true });
      expect(screen.getByTitle('Test Item 1').closest('div')).toHaveAttribute('draggable', 'false');
      expect(screen.queryByTestId('grip-vertical-icon')).not.toBeInTheDocument();
    });

    it('should show edit/delete buttons on hover (presence check)', () => {
      // Note: Testing exact hover behavior is tricky with RTL. We'll check for presence.
      // The buttons are conditionally rendered within a div that appears on group-hover.
      renderWithSettings(<ItemCard {...mockProps} />, { isEditMode: true });
      // These icons are expected to be in the document when isEditMode is true,
      // their visibility is controlled by CSS (opacity on group-hover).
      expect(screen.getByTestId('edit3-icon')).toBeInTheDocument();
      expect(screen.getByTestId('trash2-icon')).toBeInTheDocument();
    });

    it('should call openEditItemModal when edit button is clicked', () => {
      renderWithSettings(<ItemCard {...mockProps} />, { isEditMode: true });
      // The button is nested, find it by its title or role if more specific
      const editButtonContainer = screen.getByTestId('edit3-icon').closest('button');
      expect(editButtonContainer).toBeInTheDocument();
      fireEvent.click(editButtonContainer!);
      expect(mockProps.openEditItemModal).toHaveBeenCalledWith(mockProps.item);
    });

    it('should call deleteItem when delete button is clicked and confirmed', () => {
      renderWithSettings(<ItemCard {...mockProps} />, { isEditMode: true });
      const deleteButtonContainer = screen.getByTestId('trash2-icon').closest('button');
      expect(deleteButtonContainer).toBeInTheDocument();
      
      fireEvent.click(deleteButtonContainer!);
      expect(global.confirm).toHaveBeenCalledWith(`Are you sure you want to delete "${mockProps.item.name}"? This cannot be undone.`);
      expect(mockProps.deleteItem).toHaveBeenCalledWith(mockProps.item.id);
    });

    it('should not call deleteItem if confirmation is cancelled', () => {
      (global.confirm as jest.Mock).mockReturnValueOnce(false); // User cancels
      renderWithSettings(<ItemCard {...mockProps} />, { isEditMode: true });
      const deleteButtonContainer = screen.getByTestId('trash2-icon').closest('button');
      fireEvent.click(deleteButtonContainer!);
      expect(global.confirm).toHaveBeenCalledTimes(1);
      expect(mockProps.deleteItem).not.toHaveBeenCalled();
    });
  });
  
  it('applies theme class for card background', () => {
    // Check if one of the theme classes is applied (e.g., cardBgColor)
    // This is a basic check, not exhaustive for all theme properties.
    renderWithSettings(<ItemCard {...mockProps} />);
    const cardElement = screen.getByTitle(mockDefaultItem.name).closest('div');
    expect(cardElement).toHaveClass(mockThemeClassNames.cardBgColor);
  });

});
```
