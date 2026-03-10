# 🇮🇳 India FTA Tracker

A comprehensive, interactive tracker of all Free Trade Agreements (FTAs) India has signed since 1991 — built as a static web app deployable on GitHub Pages.

## Features

- **Chronological Timeline** — all 15 FTAs/trade arrangements in sidebar order from 1991–2024
- **Agreement Detail Panel** — click any FTA for:
  - Full summary, signed/effective dates, status badge
  - Trade balance indicator (surplus/deficit with partner)
  - Key market access provisions (tariff lines, duty-free %, coverage notes)
  - Market access grid with total tariff lines, zero-duty lines, coverage %
- **Trade Flow Charts** — line graphs of:
  - India's total exports (USD) to the partner country: 1991–2025
  - India's total imports (USD) from the partner country: 1991–2025
  - FTA signature year marked on both charts as an annotated vertical line
- **FTA Utilisation Rate** — circular gauge + stacked bar chart:
  - Formula: (Dutiable Imports Using FTA / Total Eligible Dutiable Imports) × 100
  - Breakdown table with FTA-scheme imports vs total eligible
  - Analyst note on factors affecting utilisation
- **Top 5 Export Goods** — horizontal bar chart + detailed table with:
  - Pre-FTA tariff rate → Post-FTA tariff rate
  - Export value (2024 est.)
  - Growth trajectory (High / Moderate / Low)

## FTAs Covered

| # | Agreement | Partner | Year | Status |
|---|-----------|---------|------|--------|
| 1 | SAPTA | SAARC Members | 1995 | Active |
| 2 | India–Sri Lanka FTA | Sri Lanka | 2000 | Active |
| 3 | India–Thailand EHS | Thailand | 2004 | Active |
| 4 | SAFTA | SAARC Members | 2006 | Active |
| 5 | India–Singapore CECA | Singapore | 2005 | Active |
| 6 | India–ASEAN Goods FTA | ASEAN-10 | 2009 | Active |
| 7 | India–South Korea CEPA | South Korea | 2010 | Active |
| 8 | India–Japan CEPA | Japan | 2011 | Active |
| 9 | India–Malaysia CECA | Malaysia | 2011 | Active |
| 10 | India–UAE CEPA | UAE | 2022 | Active |
| 11 | India–Australia ECTA | Australia | 2022 | Active |
| 12 | India–UK FTA | United Kingdom | 2022 | Pending |
| 13 | India–Canada CETA | Canada | 2023 | Suspended |
| 14 | India–GCC FTA | GCC States | 2024 | Pending |
| 15 | India–EFTA TEPA | EFTA States | 2024 | Pending |

## Data Sources

- Ministry of Commerce & Industry, Government of India (DGFT)
- WTO Regional Trade Agreements Database
- UN Comtrade
- UNCTAD Trade Analysis Portal
- Reserve Bank of India
- Official FTA/CEPA/CECA agreement texts and fact sheets
- Partner government trade portals (METI Japan, DFAT Australia, UAE MoEI, etc.)

> ⚠️ Data is indicative and for analytical/educational purposes. Verify with official government sources for policy decisions.

## Deploy on GitHub Pages

1. Fork or clone this repository
2. Ensure `index.html`, `fta-data.js`, and `app.js` are in the root
3. Go to **Settings → Pages**
4. Set source to `main` branch, `/ (root)`
5. Your tracker will be live at `https://yourusername.github.io/india-fta-tracker/`

## Tech Stack

- **Pure HTML/CSS/JavaScript** — zero build tools, zero dependencies beyond Chart.js
- **Chart.js 4.4.1** (CDN) — for line, bar, and doughnut charts
- **Google Fonts** — DM Serif Display, JetBrains Mono, Instrument Sans
- Deployable as a static site on GitHub Pages, Netlify, or Vercel

## Contributing

Pull requests welcome for:
- Updating trade data with more recent figures
- Adding additional FTAs (IBSA, India-EU negotiations, etc.)
- Improving utilisation rate data with DGFT preference certificate data
- Adding more goods in the top-exports breakdown

## License

MIT
