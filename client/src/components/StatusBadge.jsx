import React from 'react';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { STATUS_COLORS } from '../utils/constants';

const StatusBadge = ({ status, daysRemaining, statusText, showDays = true, size = 'md' }) => {
  const normStatus = (status || 'CURRENT').toUpperCase();
  const theme = STATUS_COLORS[normStatus] || STATUS_COLORS.CURRENT;

  let Icon = CheckCircle2;
  if (normStatus === 'DUE SOON') Icon = Clock;
  if (normStatus === 'OVERDUE') Icon = AlertTriangle;

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'lg' 
    ? 'text-sm px-3.5 py-1.5' 
    : 'text-xs px-2.5 py-1';

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs transition-all ${theme.bg} ${sizeClasses}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
        <Icon className={`w-3.5 h-3.5 ${theme.iconColor}`} />
        <span className="font-semibold tracking-wide uppercase">{theme.label}</span>
      </span>
      {showDays && statusText && (
        <span
          className={`text-[11px] font-medium tracking-tight ${
            normStatus === 'OVERDUE'
              ? 'text-rose-600 font-semibold'
              : normStatus === 'DUE SOON'
              ? 'text-amber-700 font-semibold'
              : 'text-slate-500'
          }`}
        >
          {statusText}
        </span>
      )}
    </div>
  );
};

export default StatusBadge;
