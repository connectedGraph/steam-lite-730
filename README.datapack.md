# 365天730道中式蒸煮低油健康餐 — 数据库与素材完整包
# 365-Day / 730 Chinese Steamed & Boiled Low-Oil Healthy Meals Package

## 目录结构 (Directory Structure)

- `database/healthy_meals_730_database.sql` — 完整 SQL 建表与数据脚本（包含 6 张核心表：730 道餐食、57 种食材、2,520 条餐食配料映射、365 天每日营养汇总、52 周采购清单及 8 条饮食原则）。
- `database/healthy_meals_730.sqlite` — 已构建完成的 SQLite3 数据库文件，可直接连接查询。
- `data/healthy_meals_730_export.json` — 全量结构化 JSON 导出文件，便于前端/小程序/Web App 直接加载。
- `data/365天730道中式蒸煮低油健康餐_可筛选.xlsx` — 原始可筛选 Excel 数据工作簿。
- `assets/plates/` — 6 张去底透明通道菜品摆盘 PNG 素材（对应 `meals.plate_asset_png` 字段）：
  - `plate_beef.png`, `plate_poultry.png`, `plate_pork.png`, `plate_fish.png`, `plate_seafood.png`, `plate_tofu_egg.png`
- `assets/ingredients/` — 17 张去底透明通道食材切片 PNG 素材（对应 `ingredients.asset_png` 字段）：
  - `cut_beef.png`, `cut_bell_pepper.png`, `cut_bokchoy.png`, `cut_broccoli.png`, `cut_chicken.png`, `cut_cod.png`, `cut_corn.png`, `cut_cucumber.png`, `cut_mushroom.png`, `cut_purple_yam.png`, `cut_quinoa.png`, `cut_salmon.png`, `cut_scallop.png`, `cut_shiitake.png`, `cut_shrimp.png`, `cut_tofu.png`, `cut_tomato.png`
- `assets/studio_sheets/` — 8 张高清原始摄影合成大图（JPG）。
