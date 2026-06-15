import { google, analyticsdata_v1beta } from 'googleapis';

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

function getClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.analyticsdata({ version: 'v1beta', auth });
}

export async function runReport(
  accessToken: string,
  propertyId: string,
  metrics: string[],
  dimensions: string[] = [],
  dateRange: DateRange,
  limit?: number,
  orderBys?: analyticsdata_v1beta.Schema$OrderBy[]
) {
  const client = getClient(accessToken);

  const requestBody: analyticsdata_v1beta.Schema$RunReportRequest = {
    dateRanges: [dateRange],
    metrics: metrics.map((name) => ({ name })),
    dimensions: dimensions.map((name) => ({ name })),
    limit: limit ? String(limit) : undefined,
    orderBys,
  };

  const res = await client.properties.runReport({
    property: propertyId,
    requestBody,
  });

  return res.data;
}

export async function getOverviewMetrics(
  accessToken: string,
  propertyId: string,
  dateRange: DateRange
) {
  const data = await runReport(
    accessToken,
    propertyId,
    [
      'sessions',
      'totalUsers',
      'newUsers',
      'bounceRate',
      'averageSessionDuration',
      'screenPageViews',
      'keyEvents',
      'purchaseRevenue',
    ],
    [],
    dateRange
  );

  const row = data.rows?.[0];
  const values = row?.metricValues || [];

  return {
    sessions: parseInt(values[0]?.value || '0', 10),
    totalUsers: parseInt(values[1]?.value || '0', 10),
    newUsers: parseInt(values[2]?.value || '0', 10),
    bounceRate: parseFloat(values[3]?.value || '0'),
    avgSessionDuration: parseFloat(values[4]?.value || '0'),
    pageViews: parseInt(values[5]?.value || '0', 10),
    conversions: parseInt(values[6]?.value || '0', 10),
    revenue: parseFloat(values[7]?.value || '0'),
  };
}

export async function getTrafficSources(
  accessToken: string,
  propertyId: string,
  dateRange: DateRange
) {
  const data = await runReport(
    accessToken,
    propertyId,
    ['sessions', 'totalUsers'],
    ['sessionDefaultChannelGroup'],
    dateRange,
    10,
    [{ metric: { metricName: 'sessions' }, desc: true }]
  );

  return (data.rows || []).map((row) => ({
    channel: row.dimensionValues?.[0]?.value || 'Unknown',
    sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
    users: parseInt(row.metricValues?.[1]?.value || '0', 10),
  }));
}

export async function getTopPages(
  accessToken: string,
  propertyId: string,
  dateRange: DateRange
) {
  const data = await runReport(
    accessToken,
    propertyId,
    ['screenPageViews', 'sessions', 'averageEngagementTime'],
    ['pageTitle', 'unifiedScreenName'],
    dateRange,
    10,
    [{ metric: { metricName: 'screenPageViews' }, desc: true }]
  );

  return (data.rows || []).map((row) => ({
    pageTitle: row.dimensionValues?.[0]?.value || 'Unknown',
    path: row.dimensionValues?.[1]?.value || '',
    pageViews: parseInt(row.metricValues?.[0]?.value || '0', 10),
    sessions: parseInt(row.metricValues?.[1]?.value || '0', 10),
    avgEngagementTime: parseFloat(row.metricValues?.[2]?.value || '0'),
  }));
}

export async function getConversions(
  accessToken: string,
  propertyId: string,
  dateRange: DateRange
) {
  const data = await runReport(
    accessToken,
    propertyId,
    ['keyEvents', 'eventCount'],
    ['eventName'],
    dateRange,
    20,
    [{ metric: { metricName: 'keyEvents' }, desc: true }]
  );

  return (data.rows || []).map((row) => ({
    eventName: row.dimensionValues?.[0]?.value || 'Unknown',
    conversions: parseInt(row.metricValues?.[0]?.value || '0', 10),
    eventCount: parseInt(row.metricValues?.[1]?.value || '0', 10),
  }));
}

export async function getDailyTrend(
  accessToken: string,
  propertyId: string,
  dateRange: DateRange
) {
  const data = await runReport(
    accessToken,
    propertyId,
    ['sessions', 'totalUsers', 'screenPageViews', 'keyEvents'],
    ['date'],
    dateRange,
    undefined,
    [{ dimension: { dimensionName: 'date' } }]
  );

  return (data.rows || []).map((row) => ({
    date: row.dimensionValues?.[0]?.value || '',
    sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
    users: parseInt(row.metricValues?.[1]?.value || '0', 10),
    pageViews: parseInt(row.metricValues?.[2]?.value || '0', 10),
    conversions: parseInt(row.metricValues?.[3]?.value || '0', 10),
  }));
}
