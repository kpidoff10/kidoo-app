/**
 * Context pour contrôler l'ouverture/fermeture du bottomsheet des notifications
 */

import React, { createContext, useContext, useCallback } from 'react';
import type { UseBottomSheetReturn } from '@/hooks';

interface NotificationsSheetContextType {
  bottomSheet: UseBottomSheetReturn;
  openNotifications: () => Promise<void>;
}

const NotificationsSheetContext = createContext<NotificationsSheetContextType | undefined>(
  undefined
);

export function NotificationsSheetProvider({
  children,
  bottomSheet,
}: {
  children: React.ReactNode;
  bottomSheet: UseBottomSheetReturn;
}) {
  const openNotifications = useCallback(() => {
    return bottomSheet.open();
  }, [bottomSheet]);

  return (
    <NotificationsSheetContext.Provider value={{ bottomSheet, openNotifications }}>
      {children}
    </NotificationsSheetContext.Provider>
  );
}

export function useNotificationsSheet() {
  const context = useContext(NotificationsSheetContext);
  if (!context) {
    throw new Error('useNotificationsSheet must be used within NotificationsSheetProvider');
  }
  return context;
}
