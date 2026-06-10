# n8n Stripe Notifikace — Kompletní návod (Ninja Týden)

> Self-hosted n8n workflow pro okamžité notifikace ze Stripe na Telegram, e-mail a Google Sheets.

---

## 1. Instalační návod krok za krokem

### 1.1 Požadavky

- **n8n** (self-hosted, např. `n8n.webdo24.cz`) — verze 1.50+
- Přístup do **Stripe Dashboardu**
- **Telegram** účet + mobilní aplikace
- **Google účet** pro Sheets
- **SMTP účet** pro odesílání e-mailů (nebo Gmail OAuth)

### 1.2 Import workflow

1. Otevři svůj n8n editor (`https://tvoje-n8n-domena.cz`)
2. Klikni na **Workflow** → **Import from File**
3. Vyber soubor `n8n-stripe-complete.json`
4. Workflow se otevře — neaktivuj ho zatím (ještě nemáš credentials)

### 1.3 Nastavení credentials

V n8n klikni vlevo na **Settings** (ozubené kolečko) → **Credentials** → **Add Credential**.

Musíš přidat 3 credentials:

| Credential | Typ | Kde získat |
|---|---|---|
| **Telegram Bot** | `telegramApi` | [@BotFather](https://t.me/BotFather) na Telegramu |
| **SMTP** | `smtp` | Od svého hostingu / Gmail / SendGrid |
| **Google Sheets** | `googleSheetsOAuth2Api` | Google Cloud Console |

#### Postup přiřazení credentials k nodům

1. V workflow klikni na node **Telegram Notify**
2. Vpravo uvidíš "Credential for Telegram API" → vyber svůj **Telegram Bot** credential
3. Opakuj pro **Email Notify** → vyber **SMTP** credential
4. Opakuj pro **Check Duplicate** a **Sheets Append** → vyber **Google Sheets** credential

### 1.4 Doplnění hodnot do workflow

Klikni na jednotlivé nodes a doplň:

#### Telegram Notify + Telegram Error Alert
- `Chat ID` → `YOUR_TELEGRAM_CHAT_ID` (viz kapitola 4 níže)

#### Email Notify
- `From Email` → již nastaveno na `info@ninja-tyden.cz`
- `To Email` → již nastaveno na `info@ninja-tyden.cz`
- Uprav dle potřeby

#### Check Duplicate + Sheets Append
- `Document ID` → `YOUR_GOOGLE_SHEET_ID` (viz kapitola 5 níže)
- `Sheet Name` → již nastaveno na `StripeEvents`

#### Stripe Webhook
- Path je již nastaven na `stripe-webhook-ninja`
- **Webhook URL** pro Stripe: `https://tvoje-n8n-domena.cz/webhook/stripe-webhook-ninja`

### 1.5 Aktivace workflow

1. Klikni na **Save** (Ctrl+S)
2. Vpravo nahoře přepni toggle na **Active** (zelený)
3. Workflow je nyní aktivní a čeká na POST požadavky

---

## 2. Přesné URL ve Stripe Dashboardu

### 2.1 Kam kliknout

1. Přihlaš se do [dashboard.stripe.com](https://dashboard.stripe.com)
2. Vlevo dole klikni na **Developers** (ikona `</>`)
3. V menu Developers vyber **Webhooks**
4. Klikni na **+ Add endpoint** (tlačítko vpravo nahoře)

### 2.2 Nastavení endpointu

| Pole | Hodnota |
|---|---|
| **Endpoint URL** | `https://n8n.webdo24.cz/webhook/stripe-webhook-ninja` |
| **Description** | `n8n Ninja Týden notifikace` |
| **Listen to** | Vyber `events on your account` |
| **Select events to listen to** | Zaškrtni následující:

- [x] `checkout.session.completed`
- [x] `checkout.session.async_payment_succeeded`
- [x] `payment_intent.succeeded`
- [x] `payment_intent.payment_failed`

5. Klikni na **Add endpoint**

### 2.3 Signing Secret (volitelné)

Po vytvoření endpointu:
1. Klikni na něj v seznamu
2. Vpravo nahoře klikni na **Reveal** u pole **Signing secret**
3. Zkopíruj hodnotu (začíná `whsec_`)
4. Tento secret se používá pro ověření, že webhook opravdu přišel ze Stripe
5. Pokud ho chceš použít, doplníš ho v budoucnu do backendu (`backend/server.js` v proměnné `STRIPE_WEBHOOK_SECRET`)

> ⚠️ **Upozornění:** Toto workflow **nepoužívá** signing secret přímo v n8n (příjme každý POST). Pokud chceš ověření, přidej mezi "Stripe Webhook" a "Extract Event Data" **Code** node s ověřením podpisem. Napiš mi a dodám ho.

---

## 3. Vytvoření Telegram bota přes BotFather

### 3.1 Postup

1. Otevři Telegram na mobilu nebo desktopu
2. Najdi kontakt **@BotFather** (nebo klikni: [t.me/BotFather](https://t.me/BotFather))
3. Napiš mu příkaz: `/newbot`
4. BotFather se zeptá na jméno bota:
   - Zadej: `Ninja Týden Notifikace`
5. Pak se zeptá na username (musí končit na `bot`):
   - Zadej: `ninja_tyden_bot`
6. BotFather ti pošle **HTTP API token** — vypadá takto:
   ```
   123456789:ABCdefGHIjklMNOpqrSTUvwxyz123456789
   ```
7. **Ulož token** — zobrazí se jen jednou!

### 3.2 Přidání tokenu do n8n

1. V n8n → **Settings** → **Credentials** → **Add Credential**
2. Vyber **Telegram API**
3. Jako **Access Token** vlož token od BotFather
4. Klikni **Save**

### 3.3 Test bota

1. Najdi svého nového bota v Telegramu (pod username, který jsi zadal)
2. Klikni **Start** nebo napiš `/start`
3. Bot by měl odpovědět — funguje!

---

## 4. Zjištění Telegram Chat ID

### 4.1 Metoda 1: Přes bot API (jednoduchá)

1. Otevři v prohlížeči:
   ```
   https://api.telegram.org/bot<TVOJ_TOKEN>/getUpdates
   ```
   Např.:
   ```
   https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrSTUvwxyz123456789/getUpdates
   ```
2. Najdi v JSON odpovědi hodnotu `"chat":{"id":123456789` — to je tvé **Chat ID**
3. Zkopíruj číslo (může být záporné, pokud je to skupina)

### 4.2 Metoda 2: Přes @userinfobot

1. V Telegramu najdi **@userinfobot**
2. Napiš mu cokoli — odpoví ti tvé ID

### 4.3 Pro skupinu

Pokud chceš posílat notifikace do skupiny:
1. Přidej bota do skupiny
2. Dej mu práva na čtení zpráv
3. Použij metodu 1 — v `getUpdates` bude `chat.id` záporné číslo (např. `-123456789`)

### 4.4 Doplnění do workflow

V nodech **Telegram Notify** a **Telegram Error Alert** nahraď `YOUR_TELEGRAM_CHAT_ID` tvým číslem.

---

## 5. Propojení Google Sheets

### 5.1 Vytvoření Google Sheet

1. Jdi na [sheets.new](https://sheets.new)
2. Pojmenuj list: `StripeEvents` (nebo uprav v workflow)
3. Do prvního řádku zadej hlavičky:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| **Datum** | **Typ** | **Jméno** | **Email** | **Částka** | **Měna** | **Stav** | **Stripe ID** | **Metadata** | **Raw JSON** |

### 5.2 Získání Sheet ID

Z URL adresy tvého sheetu:
```
https://docs.google.com/spreadsheets/d/1ABC123def456GHI789jkl/edit#gid=0
```

**Sheet ID** je ta dlouhá část mezi `/d/` a `/edit`:
```
1ABC123def456GHI789jkl
```

### 5.3 OAuth2 nastavení v Google Cloud Console

1. Jdi na [console.cloud.google.com](https://console.cloud.google.com)
2. Vytvoř nový projekt (např. `ninja-tyden-n8n`)
3. V menu vlevo najdi **APIs & Services** → **Library**
4. Najdi a povol **Google Sheets API**
5. Jdi na **APIs & Services** → **Credentials**
6. Klikni **+ Create Credentials** → **OAuth client ID**
7. Jako **Application type** vyber **Web application**
8. Název: `n8n Google Sheets`
9. Do **Authorized redirect URIs** přidej:
   ```
   https://tvoje-n8n-domena.cz/rest/oauth2-credential/callback
   ```
10. Klikni **Create**
11. Zkopíruj **Client ID** a **Client Secret**

### 5.4 Přidání credentials do n8n

1. V n8n → **Settings** → **Credentials** → **Add Credential**
2. Vyber **Google Sheets OAuth2 API**
3. Doplň:
   - **Client ID** (z Google Console)
   - **Client Secret** (z Google Console)
   - **Scope**: `https://www.googleapis.com/auth/spreadsheets`
4. Klikni **Save** → **Connect** → přihlaš se svým Google účtem

### 5.5 Doplnění Sheet ID do workflow

V nodech **Check Duplicate** a **Sheets Append** nahraď `YOUR_GOOGLE_SHEET_ID` tvým ID.

---

## 6. Testovací scénář

### 6.1 Test přes Stripe Dashboard

1. V Stripe Dashboardu jdi na **Developers** → **Webhooks**
2. Klikni na tvůj endpoint `n8n Ninja Týden notifikace`
3. Vpravo nahoře klikni na **Send test event**
4. Vyber event: `checkout.session.completed`
5. Klikni **Send test event**
6. V n8n → **Executions** → měl bys vidět nový běh workflow

### 6.2 Test přes curl (pokud nemáš testovací Stripe účet)

```bash
curl -X POST https://n8n.webdo24.cz/webhook/stripe-webhook-ninja \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_test_001",
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_001",
        "amount_total": 349000,
        "currency": "czk",
        "payment_status": "paid",
        "customer_details": {
          "name": "Test Uživatel",
          "email": "test@example.cz"
        },
        "metadata": {
          "child_name": "Tomáš",
          "parent_name": "Jana Nováková",
          "phone": "735 847 185"
        }
      }
    }
  }'
```

### 6.3 Kontrola výsledku

| Kanál | Co očekávat |
|---|---|
| **Telegram** | Zpráva s ikonou ✅, částkou 3490 CZK, jménem a e-mailem |
| **E-mail** | Stejný text v e-mailu na `info@ninja-tyden.cz` |
| **Google Sheets** | Nový řádek s daty v tabulce StripeEvents |
| **n8n Executions** | Execution ve stavu `Success` |

---

## 7. Ukázkové payloady Stripe

### 7.1 checkout.session.completed

```json
{
  "id": "evt_1RHww4CBgIxNRpERxxxxxxxxxx",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_live_a1b2c3d4e5f6g7h8i9j0",
      "amount_total": 349000,
      "currency": "czk",
      "payment_status": "paid",
      "customer_details": {
        "name": "Jana Nováková",
        "email": "jana@email.cz"
      },
      "metadata": {
        "child_name": "Tomáš",
        "parent_name": "Jana Nováková",
        "phone": "735 847 185"
      }
    }
  }
}
```

### 7.2 payment_intent.succeeded

```json
{
  "id": "evt_1RHww4CBgIxNRpERyyyyyyyyyy",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1RHww4CBgIxNRpERzzzzzzzzz",
      "amount": 349000,
      "currency": "czk",
      "status": "succeeded",
      "receipt_email": "jana@email.cz",
      "metadata": {}
    }
  }
}
```

### 7.3 payment_intent.payment_failed

```json
{
  "id": "evt_1RHww4CBgIxNRpERaaaaaaaaaa",
  "type": "payment_intent.payment_failed",
  "data": {
    "object": {
      "id": "pi_1RHww4CBgIxNRpERbbbbbbbbb",
      "amount": 349000,
      "currency": "czk",
      "status": "requires_payment_method",
      "receipt_email": "jana@email.cz",
      "last_payment_error": {
        "message": "Your card was declined."
      },
      "metadata": {}
    }
  }
}
```

### 7.4 checkout.session.async_payment_succeeded

```json
{
  "id": "evt_1RHww4CBgIxNRpERcccccccccc",
  "type": "checkout.session.async_payment_succeeded",
  "data": {
    "object": {
      "id": "cs_live_a1b2c3d4e5f6g7h8i9j0",
      "amount_total": 349000,
      "currency": "czk",
      "payment_status": "paid",
      "customer_details": {
        "name": "Jana Nováková",
        "email": "jana@email.cz"
      },
      "metadata": {}
    }
  }
}
```

---

## 8. Ošetření duplicitních webhooků

### Jak to funguje ve workflow

Stripe někdy webhooky odesílá vícekrát (např. při timeoutu nebo chybě). Workflow obsahuje ochranu:

1. **Check Duplicate** — Google Sheets node načte všechny existující záznamy
2. **Is Duplicate?** — Code node zkontroluje, zda `eventId` už ve sloupci **H (Stripe ID)** existuje
3. **Skip Duplicate?** — IF node rozhodne:
   - **Ano** → workflow končí u node **Stop: Duplicate**
   - **Ne** → pokračuje k notifikacím

> ⚠️ **Limitace:** Deduplikace funguje jen pokud Google Sheets Read nefailne (např. při nefunkčních credentials). V takovém případě workflow pokračuje bez kontroly duplicity a může poslat duplicitní notifikaci. To je ale přijatelné — notifikace navíc je lepší než žádná.

### Alternativní řešení pro vysoký objem

Pokud očekáváš stovky plateb denně, doporučujeme místo Google Sheets Read použít **n8n Data Store** nebo **Redis** — je rychlejší a nenačítá celou tabulku.

---

## 9. Logování chyb

### Jak to funguje

1. Všechny notifikační nodes (**Telegram Notify**, **Email Notify**, **Sheets Append**) mají zapnuto **Continue On Fail**
2. To znamená: pokud Telegram failne, Email a Sheets se přesto pokusí odeslat
3. Výstupy všech tří nodů vedou do node **Execution Summary**
4. Ten sestaví report o tom, které notifikace proběhly OK a které failnuly
5. Node **Any Errors?** zkontroluje, zda byl nějaký problém
6. Pokud ano → odešle **Telegram Error Alert** s varováním

### Kde vidět logy

V n8n editoru:
1. Klikni vlevo na **Executions**
2. Najdi běh svého workflow
3. Klikni na něj — uvidíš výstup každého nodu včetně případných errorů

### Manuální kontrola

V node **Execution Summary** je vždy výstup ve formátu:
```json
{
  "executionSummary": [
    { "step": 0, "node": "OK", "detail": "Success" },
    { "step": 1, "node": "OK", "detail": "Success" },
    { "step": 2, "node": "FAILED", "detail": "SMTP connection timeout" }
  ],
  "hasError": true,
  "loggedAt": "2026-06-10T12:34:56.789Z"
}
```

---

## 10. Co doplnit v JSON workflow

V souboru `n8n-stripe-complete.json` jsou pouze **3 hodnoty**, které musíš změnit:

### 10.1 V n8n Credentials (není v JSON)

| Credential | Hodnota |
|---|---|
| Telegram Bot API Token | Token od @BotFather |
| SMTP host/user/pass | Přihlašovací údaje k e-mailu |
| Google OAuth2 Client ID + Secret | Z Google Cloud Console |

### 10.2 Přímo v workflow nodes

| Node | Parametr | Hodnota |
|---|---|---|
| **Telegram Notify** | Chat ID | Tvé Telegram Chat ID (např. `123456789`) |
| **Telegram Error Alert** | Chat ID | Stejné jako výše |
| **Check Duplicate** | Document ID | ID Google Sheet (např. `1ABC123...`) |
| **Sheets Append** | Document ID | Stejné jako výše |

Vše ostatní je již nakonfigurováno a připraveno k použití.

---

## Schéma workflow

```
Stripe Webhook (POST)
  → Extract Event Data
    → Check Duplicate (Sheets Read)
      → Is Duplicate? (Code)
        → Skip Duplicate? (IF)
          ├── TRUE  → Stop: Duplicate (NoOp)
          └── FALSE → Route by Event Type (Switch)
            ├── checkout.session.completed → Format → Telegram + Email + Sheets
            ├── payment_intent.succeeded   → Format → Telegram + Email + Sheets
            ├── payment_intent.payment_failed → Format → Telegram + Email + Sheets
            └── async_payment_succeeded    → Format → Telegram + Email + Sheets
                                            ↓
                                        Execution Summary (Code)
                                          → Any Errors? (IF)
                                            ├── TRUE → Telegram Error Alert
                                            └── FALSE → OK: No Errors (NoOp)
```

---

## Podpora

Pokud něco nefunguje, zkontroluj v tomto pořadí:

1. **Executions** v n8n — kde workflow zastavilo?
2. **Credentials** — jsou správně propojené?
3. **Stripe Webhook** — je endpoint aktivní v Dashboardu?
4. **Telegram** — napsal jsi botovi `/start`?
5. **Google Sheets** — máš povolené Google Sheets API?
