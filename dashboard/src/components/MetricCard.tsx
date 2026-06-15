'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon?: React.ReactNode;
  color?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  change,
  icon,
  color = 'bg-blue-500',
}: MetricCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-gray-900">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`rounded-lg p-2 ${color} text-white`}>{icon}</div>
        )}
      </div>
      {change !== undefined && (
        <div className="mt-3 flex items-center gap-1 text-sm">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : isNegative ? (
            <TrendingDown className="h-4 w-4 text-red-500" />
          ) : (
            <Minus className="h-4 w-4 text-gray-400" />
          )}
          <span
            className={
              isPositive
                ? 'text-green-600'
                : isNegative
                ? 'text-red-600'
                : 'text-gray-500'
            }
          >
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-gray-400">vs předchozí období</span>
        </div>
      )}
    </div>
  );
}
