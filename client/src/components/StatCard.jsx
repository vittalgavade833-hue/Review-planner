import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  trend,
  onClick,
}) => {
  const variantStyles = {
    blue: {
      border: 'border-blue-100 hover:border-blue-300',
      iconBg: 'bg-blue-50 text-blue-600',
      badge: 'bg-blue-50 text-blue-700',
      glow: 'group-hover:from-blue-500/5',
    },
    green: {
      border: 'border-emerald-100 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700',
      glow: 'group-hover:from-emerald-500/5',
    },
    yellow: {
      border: 'border-amber-100 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-600',
      badge: 'bg-amber-50 text-amber-700',
      glow: 'group-hover:from-amber-500/5',
    },
    red: {
      border: 'border-rose-100 hover:border-rose-300',
      iconBg: 'bg-rose-50 text-rose-600',
      badge: 'bg-rose-50 text-rose-700',
      glow: 'group-hover:from-rose-500/5',
    },
    purple: {
      border: 'border-indigo-100 hover:border-indigo-300',
      iconBg: 'bg-indigo-50 text-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700',
      glow: 'group-hover:from-indigo-500/5',
    },
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-xs transition-all duration-300 ${style.border} ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${style.glow} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</span>
            {trend && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}>
                {trend}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${style.iconBg} ring-1 ring-black/5 shadow-2xs`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
