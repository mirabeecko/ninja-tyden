'use client';

import { useState } from 'react';

interface DateRangePickerProps {
  onChange: (range: { startDate: string; endDate: string }) => void;
}

const PRESETS = [
  { label: 'Posledních 7 dní', start: '7daysAgo', end: 'today' },
  { label: 'Posledních 30 dní', start: '30daysAgo', end: 'today' },
  { label: 'Tento měsíc', start: 'startOfMonth', end: 'today' },
  { label: 'Minulý měsíc', start: 'startOfLastMonth', end: 'endOfLastMonth' },
];

export default function DateRangePicker({ onChange }: DateRangePickerProps) {
  const [selected, setSelected] = useState('30daysAgo');

  const handlePreset = (preset: (typeof PRESETS)[0]) => {
    setSelected(preset.start);
    onChange({ startDate: preset.start, endDate: preset.end });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset.label}
          onClick={() => handlePreset(preset)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            selected === preset.start
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
