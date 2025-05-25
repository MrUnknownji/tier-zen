// app/components/PageNotification.tsx
"use client";

import React, { useEffect } from 'react';
import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react'; // Import icons

export interface NotificationMessage {
  id: number; // For unique key, useful if multiple messages can stack
  message: string;
  type: 'error' | 'success' | 'info';
}

interface PageNotificationProps {
  notification: NotificationMessage | null;
  onDismiss: () => void;
}

export default function PageNotification({ notification, onDismiss }: PageNotificationProps) {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000); // Auto-dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [notification, onDismiss]);

  if (!notification) return null;

  const baseClasses = "fixed top-5 right-5 p-4 rounded-lg shadow-lg flex items-center gap-3 z-[100]";
  let typeClasses = "";
  let IconComponent = AlertTriangle;

  switch (notification.type) {
    case 'error':
      typeClasses = "bg-red-500 text-white";
      IconComponent = AlertTriangle;
      break;
    case 'success':
      typeClasses = "bg-green-500 text-white";
      IconComponent = CheckCircle;
      break;
    case 'info':
    default:
      typeClasses = "bg-blue-500 text-white";
      IconComponent = AlertTriangle; // Or an Info icon if available
      break;
  }

  return (
    <div className={`\${baseClasses} \${typeClasses}`}>
      <IconComponent size={24} />
      <span>{notification.message}</span>
      <button onClick={onDismiss} className="ml-auto p-1 rounded-full hover:bg-white/20 transition-colors">
        <XCircle size={20} />
      </button>
    </div>
  );
}
