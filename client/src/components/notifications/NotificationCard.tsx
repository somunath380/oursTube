import React, { useEffect } from 'react';
import type { NotificationCardProps } from '../../interfaces/searchAndNotification';

const NotificationCard: React.FC<NotificationCardProps> = ({
  message,
  type,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'info': return '#17a2b8';
      default: return '#17a2b8';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        background: getBackgroundColor(),
        color: 'white',
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: 10000,
        maxWidth: '350px',
        animation: 'slideIn 0.3s ease-out',
        transform: 'translateX(0)',
        opacity: 1
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: '4px' }}>
            {type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Info'}
          </div>
          <div style={{ fontSize: '14px' }}>{message}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            marginLeft: '12px',
            padding: '0',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};
export default NotificationCard;