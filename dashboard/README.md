# Analytics Hub — Multi-site GA4 Dashboard

Next.js dashboard pro sledování metrik a konverzí z Google Analytics 4 napříč více weby. Přihlášení přes Google OAuth, data se načítají v reálném čase z GA4 Data API.

## Sledované weby

| Web | GA4 Property ID | GTM | Kategorie |
|-----|-----------------|-----|-----------|
| sheskates.cz | `properties/XXX` | GTM-KVV3BZGP | E-commerce |
| ninja-tyden.cz | `properties/XXX` | GTM-K946RX5J | Lead gen |
| tjkrupka.cz | `properties/XXX` | GTM-WNJ48SCF | Content |
| webdo24.cz | `properties/XXX` | GTM-KJNB99JZ | Lead gen |

## Hlavní metriky

- **Relace, uživatelé, noví uživatelé**
- **Bounce rate, průměrná délka relace**
- **Zobrazení stránek**
- **Konverze (key events)**
- **Tržby (purchase revenue)**
- **Zdroje návštěvnosti**
- **Nejnavštěvovanější stránky**
- **Trend v čase**

## Požadavky

- Node.js 18+
- Google Cloud projekt s povoleným **Google Analytics Data API**
- GA4 Property ID pro každý web
- OAuth 2.0 Client ID (Web application)

## Nastavení

### 1. Zjisti GA4 Property ID

V Google Analytics 4:
1. Otevři Admin (nastavení)
2. V sloupci „Property“ klikni na „Property Settings“
3. Zkopíruj **Property ID** (vypadá jako `123456789`)
4. Vlož ho do `src/config/sites.ts` ve formátu `properties/123456789`

### 2. Vytvoř Google OAuth credentials

1. Jdi na [Google Cloud Console](https://console.cloud.google.com/)
2. Vyber svůj projekt
3. **APIs & Services → Credentials**
4. Klikni **Create Credentials → OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs přidej:
   - `http://localhost:3000/api/auth/callback/google` (pro vývoj)
   - `https://tvoje-domena.cz/api/auth/callback/google` (produkce)
7. Ulož a zkopíruj **Client ID** a **Client Secret**

### 3. Povol GA4 Data API

1. V Google Cloud Console: **APIs & Services → Library**
2. Vyhledej **Google Analytics Data API**
3. Klikni **Enable**

### 4. Přidej service account do GA4

1. V GA4: **Admin → Property Access Management**
2. Klikni **Add users**
3. Přidej Google účet, kterým se budeš přihlašovat do dashboardu
4. Nastav roli **Viewer** nebo **Analyst**

### 5. Nastav prostředí

```bash
cp .env.local.example .env.local
# Uprav hodnoty:
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# NEXTAUTH_SECRET=$(openssl rand -base64 32)
# NEXTAUTH_URL=http://localhost:3000
```

### 6. Spusť

```bash
npm install
npm run dev
```

Otevři [http://localhost:3000](http://localhost:3000) a přihlas se přes Google.

## Deploy

Produkční build:

```bash
npm run build
npm start
```

Dashboard používá `output: 'standalone'` — ideální pro Docker nebo Vercel.

## Architektura

```
app/
├── page.tsx              # Přehled všech webů
├── [propertyId]/page.tsx # Detail jednoho webu
├── api/
│   ├── auth/[...nextauth]  # NextAuth Google OAuth
│   └── ga4/
│       ├── overview      # Základní metriky + trend
│       ├── traffic       # Zdroje návštěvnosti
│       ├── pages         # Top stránky
│       └── conversions   # Konverze a události
components/
├── Charts.tsx            # Recharts grafy
├── MetricCard.tsx        # Karty metrik
├── DashboardShell.tsx    # Layout + auth
├── Sidebar.tsx           # Navigace
└── DateRangePicker.tsx   # Výběr období
lib/
├── ga4.ts                # GA4 Data API client
└── auth.ts               # NextAuth konfigurace
config/
└── sites.ts              # Konfigurace webů
```

## Troubleshooting

**„Unauthorized“ nebo „Permission denied“**
→ Ujisti se, že Google účet má přístup k GA4 property. Vyzkoušej přihlášení jiným účtem.

**„Property not found“**
→ Zkontroluj, že `propertyId` v `sites.ts` je ve formátu `properties/123456789`.

**„API not enabled“**
→ V Google Cloud Console povol **Google Analytics Data API**.
