# HS_Wuco_Web — 無口君 爐石戰場 排組對策站

無口君（Wuco）爐石戰記英雄戰場影片分析的靜態網站。純前端（HTML/CSS/vanilla JS），可直接部署到 GitHub Pages。

## 分頁

| 分頁 | 內容 |
|------|------|
| 排組頁 (Tier List) | 提升素質排組，含 Rank 徽章、核心/搭配卡牌、運作邏輯、Tips、無口君影片連結 |
| 對策頁 (Counter Guide) | 終局對策（遇到大怪 / 辛多雷怎麼辦），對應老鼠防禦姿態、甲蟲法術等 |
| 雙打專區 (Duo) | 2v2 隊友資源傳遞與對策支援（傳送門傳牌、對策分工） |

## 資料來源

內容資料在 `data/builds.json`，由 skill `hs-battlegrounds-analyst` 從無口君影片逐字稿分析後產生
（上游維護檔：`Project_HS_Wuco/Analysis/master_builds.md`）。

## 本機預覽

GitHub Pages / 任意 HTTP 伺服器皆可。請勿用 `file://` 直接開啟（`fetch` 會被瀏覽器擋）。

```bash
python -m http.server 8000
# 開啟 http://localhost:8000/
```

## 部署

GitHub Pages：Settings → Pages → Source = `main` branch / root。
Repo: https://github.com/insanehmt/HS_Wuco_Web

## 版本可用性

排組資料的 `currentVersion` 欄位控制是否預設顯示。使用非當前版本卡牌的排組可設為 `false`，
網站會預設隱藏，使用者可在排組頁右上方勾選顯示。搭配卡（非核心）仍可用者於 Tips 加註說明。
