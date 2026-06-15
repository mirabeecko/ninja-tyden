'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/DashboardShell';
import MetricCard from '@/components/MetricCard';
import DateRangePicker from '@/components/DateRangePicker';
import { SITES } from '@/config/sites';
import {
  Users,
  Eye,
  MousePointerClick,
  ShoppingCart,
  TrendingUp,
  Globe,
} from 'lucide-react';
import Link from 'next/link';

interface SiteMetrics {
  propertyId: string;
  siteName: string;
  domain: string;
  overview: {
    sessions: number;
    totalUsers: number;
    newUsers: number;
    bounceRate: number;
    pageViews: number;
    conversions: number;
    revenue: number;
  } | null;
  loading: boolean;
  error: string | null;
}

export default function OverviewPage() {
  const { data: session } = useSession();
  const [dateRange, setDateRange] = useState({
    startDate: '30daysAgo',
    endDate: 'today',
  });
  const [metrics, setMetrics] = useState<SiteMetrics[]>(
    SITES.map((s) => ({
      propertyId: s.propertyId,
      siteName: s.name,
      domain: s.domain,
      overview: null,
      loading: true,
      error: null,
    }))
  );

  useEffect(() => {
    if (!session) return;

    const fetchAll = async () => {
      setMetrics((prev) =>
        prev.map((m) => ({ ...m, loading: true, error: null }))
      );

      const results = await Promise.allSettled(
        SITES.map(async (site) => {
          const res = await fetch(
            `/api/ga4/overview?propertyId=${encodeURIComponent(
              site.propertyId
            )}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
          );
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed');
          }
          return { propertyId: site.propertyId, data: await res.json() };
        })
      );

      setMetrics((prev) =>
        prev.map((m) => {
          const idx = SITES.findIndex((s) => s.propertyId === m.propertyId);
          const result = results[idx];
          if (result.status === 'fulfilled') {
            return {
              ...m,
              overview: result.value.data.overview,
              loading: false,
              error: null,
            };
          } else {
            return {
              ...m,
              overview: null,
              loading: false,
              error: result.reason?.message || 'Error',
            };
          }
        })
      );
    };

    fetchAll();
  }, [session, dateRange]);

  const totals = metrics.reduce(
    (acc, m) => {
      if (m.overview) {
        acc.sessions += m.overview.sessions;
        acc.users += m.overview.totalUsers;
        acc.pageViews += m.overview.pageViews;
        acc.conversions += m.overview.conversions;
        acc.revenue += m.overview.revenue;
      }
      return acc;
    },
    { sessions: 0, users: 0, pageViews: 0, conversions: 0, revenue: 0 }
  );

  return (
    <DashboardShell>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Přehled všech webů</h1>
          <p className="mt-1 text-sm text-gray-500">
            Souhrnné metriky napříč všemi sledovanými weby
          </p>
        </div>
        <DateRangePicker onChange={setDateRange} />
      </div>

      {/* Totals */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Celkem relací"
          value={totals.sessions.toLocaleString('cs-CZ')}
          icon={<Globe className="h-5 w-5" />}
          color="bg-blue-500"
        />
        <MetricCard
          title="Celkem uživatelů"
          value={totals.users.toLocaleString('cs-CZ')}
          icon={<Users className="h-5 w-5" />}
          color="bg-green-500"
        />
        <MetricCard
          title="Zobrazení stránek"
          value={totals.pageViews.toLocaleString('cs-CZ')}
          icon={<Eye className="h-5 w-5" />}
          color="bg-purple-500"
        />
        <MetricCard
          title="Konverze"
          value={totals.conversions.toLocaleString('cs-CZ')}
          icon={<MousePointerClick className="h-5 w-5" />}
          color="bg-amber-500"
        />
        <MetricCard
          title="Tržby"
          value={`${totals.revenue.toLocaleString('cs-CZ')} Kč`}
          icon={<ShoppingCart className="h-5 w-5" />}
          color="bg-emerald-500"
        />
      </div>

      {/* Per site */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Detailně po webech</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {metrics.map((m) => (
          <Link
            key={m.propertyId}
            href={`/${m.propertyId}`}
            className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-gray-300 hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                  {m.siteName}
                </h3>
                <p className="text-sm text-gray-500">{m.domain}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-gray-300 group-hover:text-blue-500" />
            </div>

            {m.loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
                Načítání dat...
              </div>
            ) : m.error ? (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {m.error.includes('property') || m.error.includes('Permission')
                  ? 'Zkontroluj GA4 Property ID v konfiguraci'
                  : m.error}
              </div>
            ) : m.overview ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-400">Relace</p>
                  <p className="text-lg font-bold text-gray-900">
                    {m.overview.sessions.toLocaleString('cs-CZ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Uživatelé</p>
                  <p className="text-lg font-bold text-gray-900">
                    {m.overview.totalUsers.toLocaleString('cs-CZ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Konverze</p>
                  <p className="text-lg font-bold text-gray-900">
                    {m.overview.conversions.toLocaleString('cs-CZ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Zobrazení</p>
                  <p className="text-lg font-bold text-gray-900">
                    {m.overview.pageViews.toLocaleString('cs-CZ')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Bounce rate</p>
                  <p className="text-lg font-bold text-gray-900">
                    {(m.overview.bounceRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Tržby</p>
                  <p className="text-lg font-bold text-gray-900">
                    {m.overview.revenue.toLocaleString('cs-CZ')} Kč
                  </p>
                </div>
              </div>
            ) : null}
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
