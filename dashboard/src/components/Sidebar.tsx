'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITES } from '@/config/sites';
import {
  BarChart3,
  ShoppingCart,
  Users,
  FileText,
  LogOut,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
          <BarChart3 className="h-6 w-6 text-gray-900" />
          <span className="text-lg font-bold text-gray-900">Analytics Hub</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              pathname === '/'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Přehled všech webů
          </Link>

          <div className="mt-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Weby
            </p>
            <div className="mt-2 space-y-1">
              {SITES.map((site) => (
                <Link
                  key={site.id}
                  href={`/${site.propertyId}`}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    pathname.includes(site.propertyId)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {site.category === 'ecommerce' ? (
                    <ShoppingCart className="h-4 w-4" />
                  ) : site.category === 'leadgen' ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <span className="flex-1 truncate">{site.name}</span>
                  <span className="text-xs text-gray-400">{site.domain}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-gray-200 p-3">
          <a
            href="/api/auth/signout"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            Odhlásit se
          </a>
        </div>
      </div>
    </aside>
  );
}
