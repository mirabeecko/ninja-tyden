'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import DashboardShell from '@/components/DashboardShell';
import MetricCard from '@/components/MetricCard';
import DateRangePicker from '@/components/DateRangePicker';
import { TrendChart, TrafficChart, PagesChart, ConversionsChart } from '@/components/Charts';
import { getSiteByPropertyId } from '@/config/sites';
import {
  Users,
  Eye,
  MousePointerClick,
  ShoppingCart,
  Clock,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface OverviewData {
  overview: {
    sessions: number;
    totalUsers: number;
    newUsers: number;
    bounceRate: number;
    avgSessionDuration: number;
    pageViews: number;
    conversions: number;
    revenue: number;
  };
  trend: Array<{
    date: string;
    sessions: number;
    users: number;
    pageViews: number;
    conversions: number;
  }>;
}

interface TrafficData {
  traffic: Array<{
    channel: string;
    sessions: number;
    users: number;
  }>;
}

interface PagesData {
  pages: Array<{
    pageTitle: string;
    path: string;
    pageViews: number;
    sessions: number;
    avgEngagementTime: number;
  }>;
}

interface ConversionsData {
  conversions: Array<{
    eventName: string;
    conversions: number;
    eventCount: number;
  }>;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = decodeURIComponent(params.propertyId as string);
  const { data: session } = useSession();
  const site = getSiteByPropertyId(propertyId);

  const [dateRange, setDateRange] = useState({
    startDate: '30daysAgo',
    endDate: 'today',
  });

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [pages, setPages] = useState<PagesData | null>(null);
  const [conversions, setConversions] = useState<ConversionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [overviewRes, trafficRes, pagesRes, convRes] = await Promise.all([
          fetch(
            `/api/ga4/overview?propertyId=${encodeURIComponent(
              propertyId
            )}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
          ),
          fetch(
            `/api/ga4/traffic?propertyId=${encodeURIComponent(
              propertyId
            )}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
          ),
          fetch(
            `/api/ga4/pages?propertyId=${encodeURIComponent(
              propertyId
            )}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
          ),
          fetch(
            `/api/ga4/conversions?propertyId=${encodeURIComponent(
              propertyId
            )}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
          ),
        ]);

        if (!overviewRes.ok) throw new Error((await overviewRes.json()).error);
        if (!trafficRes.ok) throw new Error((await trafficRes.json()).error);
        if (!pagesRes.ok) throw new Error((await pagesRes.json()).error);
        if (!convRes.ok) throw new Error((await convRes.json()).error);

        setOverview(await overviewRes.json());
        setTraffic(await trafficRes.json());
        setPages(await pagesRes.json());
        setConversions(await convRes.json());
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Chyba při načítání dat');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, propertyId, dateRange]);

  const ov = overview?.overview;

  return (
    <DashboardShell>
      <div className="mb-6">
        <Link
          href="/"
          className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět na přehled
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {site?.name || propertyId}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {site?.domain || ''} · {site?.category === 'ecommerce' ? 'E-commerce' : site?.category === 'leadgen' ? 'Lead generation' : 'Content'}
            </p>
          </div>
          <DateRangePicker onChange={setDateRange} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h3 className="font-semibold">Chyba při načítání dat</h3>
          <p className="mt-1 text-sm">{error}</p>
          {error.includes('property') && (
            <p className="mt-2 text-sm">
              Zkontroluj, že máš správně nastavené GA4 Property ID v{' '}
              <code className="rounded bg-red-100 px-1 py-0.5">src/config/sites.ts</code>.
              Property ID najdeš v GA4 admin pod „Property Settings“.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Relace"
              value={ov?.sessions.toLocaleString('cs-CZ') || '0'}
              icon={<Activity className="h-5 w-5" />}
              color="bg-blue-500"
            />
            <MetricCard
              title="Uživatelé"
              value={ov?.totalUsers.toLocaleString('cs-CZ') || '0'}
              subtitle={`${ov?.newUsers.toLocaleString('cs-CZ') || '0'} nových`}
              icon={<Users className="h-5 w-5" />}
              color="bg-green-500"
            />
            <MetricCard
              title="Zobrazení stránek"
              value={ov?.pageViews.toLocaleString('cs-CZ') || '0'}
              icon={<Eye className="h-5 w-5" />}
              color="bg-purple-500"
            />
            <MetricCard
              title="Bounce rate"
              value={`${((ov?.bounceRate || 0) * 100).toFixed(1)}%`}
              icon={<Activity className="h-5 w-5" />}
              color="bg-orange-500"
            />
            <MetricCard
              title="Prům. délka relace"
              value={`${Math.round((ov?.avgSessionDuration || 0) / 60)} min`}
              icon={<Clock className="h-5 w-5" />}
              color="bg-cyan-500"
            />
            <MetricCard
              title="Konverze"
              value={ov?.conversions.toLocaleString('cs-CZ') || '0'}
              icon={<MousePointerClick className="h-5 w-5" />}
              color="bg-amber-500"
            />
            <MetricCard
              title="Tržby"
              value={`${(ov?.revenue || 0).toLocaleString('cs-CZ')} Kč`}
              icon={<ShoppingCart className="h-5 w-5" />}
              color="bg-emerald-500"
            />
            <MetricCard
              title="Noví uživatelé"
              value={ov?.newUsers.toLocaleString('cs-CZ') || '0'}
              icon={<Users className="h-5 w-5" />}
              color="bg-indigo-500"
            />
          </div>

          {/* Trend chart */}
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Trend v čase
            </h3>
            <TrendChart data={overview?.trend || []} />
          </div>

          {/* Traffic + Pages */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Zdroje návštěvnosti
              </h3>
              <TrafficChart data={traffic?.traffic || []} />
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Nejnavštěvovanější stránky
              </h3>
              <PagesChart data={pages?.pages || []} />
            </div>
          </div>

          {/* Conversions */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Konverze a události
            </h3>
            <ConversionsChart data={conversions?.conversions || []} />
          </div>
        </>
      )}
    </DashboardShell>
  );
}
