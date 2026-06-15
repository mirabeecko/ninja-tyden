export interface Site {
  id: string;
  name: string;
  domain: string;
  measurementId: string;
  propertyId: string; // GA4 property ID, e.g. "properties/123456789"
  gtmId: string;
  category: 'ecommerce' | 'leadgen' | 'content';
}

export const SITES: Site[] = [
  {
    id: 'sheskates',
    name: 'SheSkates',
    domain: 'sheskates.cz',
    measurementId: 'G-KDMZ8KZC3F',
    propertyId: 'properties/YOUR_PROPERTY_ID', // <-- NASTAV GA4 Property ID
    gtmId: 'GTM-KVV3BZGP',
    category: 'ecommerce',
  },
  {
    id: 'ninja-tyden',
    name: 'Ninja Týden',
    domain: 'ninja-tyden.cz',
    measurementId: 'G-GBBN7TXHSV',
    propertyId: 'properties/YOUR_PROPERTY_ID', // <-- NASTAV GA4 Property ID
    gtmId: 'GTM-K946RX5J',
    category: 'leadgen',
  },
  {
    id: 'tjkrupka',
    name: 'TJ Krupka',
    domain: 'tjkrupka.cz',
    measurementId: 'G-NM6R8S2X39',
    propertyId: 'properties/YOUR_PROPERTY_ID', // <-- NASTAV GA4 Property ID
    gtmId: 'GTM-WNJ48SCF',
    category: 'content',
  },
  {
    id: 'webdo24',
    name: 'WebDo24',
    domain: 'webdo24.cz',
    measurementId: 'G-815XCLCGY8',
    propertyId: 'properties/YOUR_PROPERTY_ID', // <-- NASTAV GA4 Property ID
    gtmId: 'GTM-KJNB99JZ',
    category: 'leadgen',
  },
];

export function getSiteById(id: string): Site | undefined {
  return SITES.find((s) => s.id === id);
}

export function getSiteByPropertyId(propertyId: string): Site | undefined {
  return SITES.find((s) => s.propertyId === propertyId);
}
