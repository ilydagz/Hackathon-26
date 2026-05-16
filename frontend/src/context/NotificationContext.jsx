import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notif) => {
    // Only add if it's for the current user
    const currentUserId = Number(localStorage.getItem('userId'));
    if (notif.userId && Number(notif.userId) !== currentUserId) {
      console.log("Notification ignored: userId mismatch", notif.userId, currentUserId);
      return;
    }

    setNotifications(prev => [{
      ...notif,
      id: Date.now(),
      timestamp: new Date().toISOString()
    }, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const clearNotifications = () => {
    setUnreadCount(0);
  };

  const resetNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('lastMessageCheck');
  };

  const checkNewMessages = useCallback(async () => {
    const auth = localStorage.getItem('auth') === 'true';
    if (!auth) return;

    try {
      const currentUserId = Number(localStorage.getItem('userId'));
      const chats = await api.getChats();
      const lastCheck = localStorage.getItem('lastMessageCheck') || '0';
      
      let newMsgs = 0;
      chats.forEach(chat => {
        // Only notify if someone else sent the message and it's new
        if (Number(chat.sender_id) !== currentUserId && new Date(chat.timestamp).getTime() > Number(lastCheck)) {
          newMsgs++;
        }
      });

      if (newMsgs > 0) {
        addNotification({
          titleKey: 'notif.newMessages',
          messageKey: 'notif.newMessagesDesc',
          variables: { count: newMsgs },
          type: 'message',
          userId: currentUserId
        });
        localStorage.setItem('lastMessageCheck', Date.now().toString());
      }
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, [addNotification]);

  useEffect(() => {
    const handleAuthChange = () => {
      resetNotifications();
    };
    window.addEventListener('auth-change', handleAuthChange);

    // Poll every 30 seconds
    const interval = setInterval(checkNewMessages, 30000);
    
    // Initial check
    checkNewMessages();

    return () => {
      clearInterval(interval);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [checkNewMessages]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      clearNotifications,
      resetNotifications,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
