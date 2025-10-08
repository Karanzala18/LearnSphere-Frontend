import React from 'react';

const Notification = React.memo(({ notification }) => {
  if (!notification) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all ${
      notification.type === 'success' 
        ? 'bg-blue-50 text-blue-700' 
        : 'bg-red-50 text-red-700'
    }`}>
      {notification.message}
    </div>
  );
});

Notification.displayName = 'Notification';
export default Notification;
