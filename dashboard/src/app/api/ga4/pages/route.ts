import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getTopPages } from '@/lib/ga4';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get('propertyId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!propertyId) {
    return NextResponse.json({ error: 'Missing propertyId' }, { status: 400 });
  }

  const dateRange = {
    startDate: startDate || '30daysAgo',
    endDate: endDate || 'today',
  };

  try {
    const accessToken = session.accessToken;
    const pages = await getTopPages(accessToken, propertyId, dateRange);
    return NextResponse.json({ pages });
  } catch (err: unknown) {
    console.error('GA4 pages error:', err instanceof Error ? err.message : err);
    const msg = err instanceof Error ? err.message : 'Failed to fetch pages data';
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
