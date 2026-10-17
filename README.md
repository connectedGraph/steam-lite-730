# 蒸轻食 730 · Steam Lite 730

> 365 天、730 道中式蒸煮低油健康餐的完整数据包 + 桌面 / 移动双端自适应的 React 查看器。

**在线体验：** <https://fit.6767.chat/>

[English](README_EN.md) | 简体中文

---

## 这是什么

一个自包含的健康餐谱项目，包含两部分：

- **数据包**：365 天 × 每天午晚两餐 = 730 道中式蒸煮低油菜谱，含 77 种食材的完整营养数据、
  3,853 条配料配比、365 天每日营养汇总、53 周采购清单与 13 条饮食原则。
- **查看器**：Vite + React + TypeScript 单页应用，桌面端左侧栏 + 移动端底部导航，
  可检索、筛选、按份量调克重、抽签选餐，并按你选定的菜单自动生成采购清单。
  界面采用米色纸感底 + 宋体标题的编辑式设计，支持键盘关闭弹窗与减少动效偏好。

## 功能

- **今天吃什么** — 随机抽一餐（可限定午餐/晚餐），带滚动动效，可直接查看做法或加入菜单
- **菜谱** — 730 道全库检索，按蛋白类别 / 餐次 / 热量上限筛选，分页浏览，
  点开可实时调克重并看营养重算
- **食材图鉴** — 77 种食材的透明切片图与营养数据，支持低卡/高蛋白排序，
  可在「每 100g」与「常见一份」两种基准间切换（一份 = 该食材在 730 道菜谱中的用量中位数）
- **我的菜单 / 采购清单** — 把想吃的菜加进菜单，自动合并净用量、按生熟比折算成买菜重量，
  可勾选、可一键复制，菜单存在浏览器本地

## 在线 / 自部署

```bash
git clone https://github.com/connectedGraph/steam-lite-730.git
cd steam-lite-730/react-app
npm install
npm run dev        # 开发服务器 → http://127.0.0.1:8731/
npm run build      # 构建静态文件到 dist/，可直接托管
```

## 技术栈

- Vite 6 + React 18 + TypeScript
- Tailwind CSS 4 + lucide-react
- 无后端，纯静态；菜单状态存 `localStorage`

## 目录结构

```
.
├── react-app/                 # React 查看器
│   ├── src/App.tsx            # 状态编排（抽签 / 筛选 / 菜单 / 弹窗）
│   ├── src/data/db.ts         # 730 道菜 + 77 种食材 + 采购聚合
│   ├── src/pages/             # 抽餐 / 菜谱 / 图鉴 / 我的菜单 四个页面
│   ├── src/components/        # 双端布局壳、菜品卡、详情抽屉、成品图
│   ├── src/assets/            # 75 张食材透明切片（320px WebP，Vite 打包）
│   └── public/dishes/         # 730 张菜品成品图（WebP，按需加载）
├── data/                      # JSON 导出 + 原始 Excel
├── database/                  # SQL 建表脚本 + 已构建的 SQLite
├── assets/                    # 早期版本的去底素材与合成大图
└── server.py                  # 纯标准库轻量查看器（备选）
```

## 数据规模

| 项目 | 数量 |
| --- | --- |
| 餐食 | 730 道（365 天 × 午晚两餐） |
| 食材 | 77 种 |
| 配料映射 | 3,853 条 |
| 每日营养汇总 | 365 天 |
| 周采购项 | 2,104 条（53 周） |
| 饮食原则 | 13 条 |

数据源文件：

- `data/healthy_meals_730_export.json` — 全量结构化 JSON，直接可被前端加载
- `data/365天730道中式蒸煮低油健康餐_可筛选.xlsx` — 原始可筛选 Excel
- `database/healthy_meals_730.sqlite` — 已构建的 SQLite 数据库
- `database/healthy_meals_730_database.sql` — 完整建表与数据脚本

## 图片素材

项目有两类图片，都是透明 PNG / WebP，均为 AI 生成后去背：

- **食材切片**（69 张）：`react-app/src/assets/ingredients/cut_*.png`，经 Vite 打包进构建产物
- **菜品成品图**（730 张，每道菜一张）：`react-app/public/dishes/m<id>.webp`，
  768×768 透明 WebP，按需加载，不进 JS bundle

生成管线：

1. 按每道菜的真实食材与克数生成提示词
2. `gpt-image-2` 逐张生成纯白底成品图
3. `u2net` 去背（轻量通用模型即可，纯白背景无需重型语义分割模型）
4. Pillow 转 WebP q85（体积约为 PNG 的 1/9，透明与画质保留）

## 轻量查看器（备选）

不想跑 Node 时，可用纯标准库的 Python 版本：

```bash
python3 server.py --host 127.0.0.1 --port 8730
# → http://127.0.0.1:8730/
```

- `GET /api/data` → 返回 `data/healthy_meals_730_export.json`
- 其余路径为静态文件

## 许可证

[GNU General Public License v3.0](LICENSE) 或更高版本。

```
Steam Lite 730 — 365 天 730 道中式蒸煮低油健康餐
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

## 免责声明

本项目营养数据为估算值，仅供日常饮食参考，不构成医疗或营养学建议。
如有特殊健康状况，请咨询专业医师或注册营养师。
