'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const COLORS = ['#16a34a', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

interface TrendData {
  date: string;
  sessions: number;
  users: number;
  pageViews: number;
  conversions: number;
}

export function TrendChart({ data }: { data: TrendData[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: `${d.date.slice(6, 8)}.${d.date.slice(4, 6)}`,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formatted} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend />
          <Line type="monotone" dataKey="sessions" stroke="#3b82f6" strokeWidth={2} dot={false} name="Relace" />
          <Line type="monotone" dataKey="users" stroke="#16a34a" strokeWidth={2} dot={false} name="Uživatelé" />
          <Line type="monotone" dataKey="conversions" stroke="#f59e0b" strokeWidth={2} dot={false} name="Konverze" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TrafficData {
  channel: string;
  sessions: number;
  users: number;
}

export function TrafficChart({ data }: { data: TrafficData[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="sessions"
            nameKey="channel"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value} relací`, name as string]}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e5e7eb',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface PageData {
  pageTitle: string;
  pageViews: number;
  sessions: number;
}

export function PagesChart({ data }: { data: PageData[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(0, 7)} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis
            dataKey="pageTitle"
            type="category"
            tick={{ fontSize: 11 }}
            width={140}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e5e7eb',
            }}
          />
          <Bar dataKey="pageViews" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Zobrazení stránek" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface ConversionData {
  eventName: string;
  conversions: number;
  eventCount: number;
}

export function ConversionsChart({ data }: { data: ConversionData[] }) {
  const top = data.filter((d) => d.conversions > 0).slice(0, 8);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="eventName" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e5e7eb',
            }}
          />
          <Bar dataKey="conversions" fill="#16a34a" radius={[4, 4, 0, 0]} name="Konverze" />
          <Bar dataKey="eventCount" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Celkem událostí" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
