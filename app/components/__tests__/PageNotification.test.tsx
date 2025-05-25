// app/components/__tests__/PageNotification.test.tsx
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageNotification from '../PageNotification';
import type { NotificationMessage } from '../PageNotification';

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'), 
  XCircle: () => <svg data-testid="x-circle-icon" />,
  AlertTriangle: () => <svg data-testid="alert-triangle-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
}));

describe('PageNotification Component', () => {
  jest.useFakeTimers(); 

  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    mockOnDismiss.mockClear(); 
  });

  it('should not render if notification prop is null', () => {
    render(<PageNotification notification={null} onDismiss={mockOnDismiss} />);
    // Use queryByRole with a more generic role or testid if specific alert role isn't set
    expect(screen.queryByTestId('alert-triangle-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('check-circle-icon')).not.toBeInTheDocument();
  });

  it('should render error notification correctly', () => {
    const notification: NotificationMessage = { id: 1, message: 'Error message', type: 'error' };
    render(<PageNotification notification={notification} onDismiss={mockOnDismiss} />);
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    const notificationElement = screen.getByText('Error message').closest('div');
    // *** MODIFIED ASSERTION ***
    expect(notificationElement?.className).toContain('bg-red-500');
  });

  it('should render success notification correctly', () => {
    const notification: NotificationMessage = { id: 2, message: 'Success message', type: 'success' };
    render(<PageNotification notification={notification} onDismiss={mockOnDismiss} />);
    
    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
    const notificationElement = screen.getByText('Success message').closest('div');
    // *** MODIFIED ASSERTION ***
    expect(notificationElement?.className).toContain('bg-green-500');
  });

  it('should render info notification correctly (default)', () => {
    const notification: NotificationMessage = { id: 3, message: 'Info message', type: 'info' };
    render(<PageNotification notification={notification} onDismiss={mockOnDismiss} />);
    
    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument(); 
    const notificationElement = screen.getByText('Info message').closest('div');
    // *** MODIFIED ASSERTION ***
    expect(notificationElement?.className).toContain('bg-blue-500');
  });

  it('should call onDismiss when close button is clicked', () => {
    const notification: NotificationMessage = { id: 4, message: 'Test message', type: 'info' };
    render(<PageNotification notification={notification} onDismiss={mockOnDismiss} />);
    
    // Assuming the close button is the only button, or add a more specific testid/aria-label
    const closeButton = screen.getByRole('button'); 
    fireEvent.click(closeButton);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('should auto-dismiss after 5 seconds', () => {
    const notification: NotificationMessage = { id: 5, message: 'Auto dismiss test', type: 'info' };
    render(<PageNotification notification={notification} onDismiss={mockOnDismiss} />);
    
    expect(screen.getByText('Auto dismiss test')).toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(5000); 
    });
    
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('should clear timer on unmount', () => {
    const notification: NotificationMessage = { id: 6, message: 'Unmount test', type: 'info' };
    const { unmount } = render(<PageNotification notification={notification} onDismiss={mockOnDismiss} />);
    
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    unmount(); 
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1); 
    clearTimeoutSpy.mockRestore();
  });
});
