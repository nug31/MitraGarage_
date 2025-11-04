import React from 'react';

interface NotificationBadgeProps {
  count?: number;
  showPulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count = 0, 
  showPulse = true, 
  size = 'md',
  color = 'red'
}) => {
  if (count === 0) return null;

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-xs',
    lg: 'w-6 h-6 text-sm'
  };

  const colorClasses = {
    red: 'bg-red-500 text-white',
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    purple: 'bg-purple-500 text-white'
  };

  return (
    <div className="relative">
      <div 
        className={`
          absolute -top-2 -right-2 
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          rounded-full 
          flex items-center justify-center 
          font-bold shadow-lg
          ${showPulse ? 'animate-pulse' : ''}
          transform hover:scale-110 transition-transform duration-200
        `}
      >
        {count > 99 ? '99+' : count}
      </div>
      
      {showPulse && (
        <div 
          className={`
            absolute -top-2 -right-2 
            ${sizeClasses[size]} 
            ${colorClasses[color]}
            rounded-full 
            animate-ping opacity-75
          `}
        />
      )}
    </div>
  );
};

export default NotificationBadge;
