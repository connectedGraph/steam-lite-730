# Steam Lite 730

> A self-contained Chinese steamed/boiled low-oil meal plan — 730 meals across 365 days —
> plus a mobile-first React viewer.

**Live demo:** <https://fit.6767.chat/>

English | [简体中文](README.md)

---

## What is this

A complete, self-contained healthy meal project with two parts:

- **Dataset** — 365 days × 2 meals = 730 Chinese steamed/boiled low-oil recipes, with full
  nutrition data for 77 ingredients, 3,853 ingredient-to-meal mappings, 365 daily nutrition
  summaries, 53 weeks of shopping lists, and 13 dietary guidelines.
- **Viewer** — a Vite + React + TypeScript single-page app with a desktop sidebar and a
  mobile bottom nav. Search and filter recipes, adjust portion weights, draw a random meal,
  and auto-generate a shopping list from the meals you pick.

## Features

- **What to eat today** — draw a random meal (optionally lunch/dinner only), with a rolling
  animation; view the recipe or add it to your menu
- **Recipes** — search all 730 meals, filter by protein category / meal time / calorie cap,
  paginate; open a meal to adjust grams per ingredient with live nutrition recalculation
- **Ingredient atlas** — transparent cutout images and nutrition for 77 ingredients, sortable
  by low-calorie / high-protein; toggle between "per 100 g" and "typical serving"
  (serving = median amount used across the 730 recipes)
- **My menu / shopping list** — add meals to your menu; net amounts are merged and converted
  to purchase weight using dry/cooked ratios. Check off items, copy the list, persisted locally

## Getting started

```bash
git clone https://github.com/connectedGraph/steam-lite-730.git
cd steam-lite-730/react-app
npm install
npm run dev        # dev server → http://127.0.0.1:8731/
npm run build      # static output in dist/, ready to host
```

## Stack

- Vite 6 + React 18 + TypeScript
- Tailwind CSS 4 + lucide-react
- No backend, fully static; menu state in `localStorage`

## Layout

```
.
├── react-app/                 # React viewer
│   ├── src/App.tsx            # state orchestration (draw / filters / menu / modal)
│   ├── src/data/db.ts         # 730 meals + 77 ingredients + shopping aggregation
│   ├── src/pages/             # draw / recipes / atlas / my-menu pages
│   ├── src/components/        # responsive shell, dish card, detail sheet, plate image
│   ├── src/assets/            # 75 transparent ingredient cutouts (320px WebP, bundled)
│   └── public/dishes/         # 730 dish photos (WebP, lazy-loaded)
├── data/                      # JSON export + original Excel
├── database/                  # SQL schema + prebuilt SQLite
├── assets/                    # early cutout assets and composite sheets
└── server.py                  # stdlib-only lightweight viewer (alternative)
```

## Dataset scale

| Item | Count |
| --- | --- |
| Meals | 730 (365 days × lunch & dinner) |
| Ingredients | 77 |
| Ingredient mappings | 3,853 |
| Daily nutrition summaries | 365 |
| Weekly shopping items | 2,104 (53 weeks) |
| Dietary guidelines | 13 |

Sources:

- `data/healthy_meals_730_export.json` — full structured JSON, loadable by any frontend
- `data/365天730道中式蒸煮低油健康餐_可筛选.xlsx` — original filterable Excel
- `database/healthy_meals_730.sqlite` — prebuilt SQLite database
- `database/healthy_meals_730_database.sql` — full schema and data script

## Images

Two kinds of images, both transparent and AI-generated with background removal:

- **Ingredient cutouts** (69): `react-app/src/assets/ingredients/cut_*.png`, bundled by Vite
- **Dish photos** (730, one per meal): `react-app/public/dishes/m<id>.webp`,
  768×768 transparent WebP, lazy-loaded, not in the JS bundle

Generation pipeline: per-meal prompt from real ingredients and grams → `gpt-image-2`
white-background render → `u2net` background removal → WebP q85 (≈1/9 the PNG size).

## Lightweight viewer (alternative)

If you'd rather not run Node:

```bash
python3 server.py --host 127.0.0.1 --port 8730
# → http://127.0.0.1:8730/
```

- `GET /api/data` → serves `data/healthy_meals_730_export.json`
- all other paths are static files

## License

[GNU General Public License v3.0](LICENSE) or later.

```
Steam Lite 730 — 365 days, 730 Chinese steamed/boiled low-oil meals
Copyright (C) 2026 connectedGraph

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
```

## Disclaimer

Nutrition figures are estimates for everyday reference only and are not medical or
dietetic advice. Consult a physician or registered dietitian for specific health needs.
