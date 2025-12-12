# Stellar AIz Corporate Website

Stellar AIz のコーポレートサイトです。GitHub Pages でホスティングされている静的サイトです。

## プロジェクト構造

```
stellar-aiz.github.io/
├── docs/                          # GitHub Pages ルート（公開ファイル）
│   ├── index.html                 # トップページ
│   └── assets/
│       ├── css/
│       │   └── common.css         # カスタムCSS・デザインシステム
│       ├── js/
│       │   ├── tailwind-config.js # Tailwind CSS 設定拡張
│       │   └── scroll-animations.js # スクロールアニメーション
│       ├── icons/                 # ファビコン
│       └── images/
│           └── logo/              # ロゴ画像
├── spec/                          # 仕様書ディレクトリ
│   ├── CORPORATESITE.md           # プロジェクト概要
│   ├── DESIGN_GUIDELINES.md       # デザインガイドライン
│   ├── NAVIGATION.md              # ナビゲーション仕様
│   ├── FOOTER.md                  # フッター仕様
│   ├── RESPONSIVE.md              # レスポンシブデザイン
│   ├── SEO_META.md                # SEO メタデータ
│   ├── URL_STRUCTURE.md           # URL 構造
│   └── pages/                     # 各ページの仕様
│       ├── TOP.md
│       ├── SERVICES.md
│       ├── TRACKRECORD.md
│       ├── ABOUT.md
│       ├── NEWS.md
│       └── INQUIRY.md
├── develop/                       # 開発用リソース
├── CLAUDE.md                      # Claude Code 用ガイドライン
└── README.md                      # このファイル
```

## 技術スタック

- **HTML5** - セマンティックマークアップ
- **Tailwind CSS** (CDN v3.x) - ユーティリティファーストCSS
- **Vanilla JavaScript** - フレームワークなし、Intersection Observer API 使用
- **GitHub Pages** - 静的ホスティング

## ローカル開発

ビルドプロセスは不要です。静的ファイルを直接編集してください。

```bash
# ローカルサーバーを起動
cd docs
python -m http.server 3000

# ブラウザで http://localhost:3000 を開く
```

## デザインシステム

### カラーパレット

| 名前 | 値 | 用途 |
|------|-----|------|
| stellar-primary | `#2563eb` | メインカラー（青） |
| stellar-secondary | `#7c3aed` | セカンダリ（紫） |
| stellar-accent | `#06b6d4` | アクセント（シアン） |
| stellar-dark | `#1a202c` | ダークネイビー |

### カスタムコンポーネント

```html
<!-- ボタン -->
<a class="btn-primary-stellar">Primary</a>
<a class="btn-secondary-stellar">Secondary</a>
<a class="btn-accent-stellar">Accent</a>

<!-- カード -->
<div class="card-stellar">...</div>

<!-- スクロールアニメーション -->
<div class="scroll-fade-in">フェードイン</div>
<div class="scroll-fade-up">下からフェードイン</div>
```

## ページ構成

| ページ | パス | 状態 |
|--------|------|------|
| トップ | `/` | 実装済み |
| サービス | `/services/` | 未実装 |
| 実績 | `/record/` | 未実装 |
| 会社情報 | `/about/` | 未実装 |
| ニュース | `/news/` | 未実装 |
| お問い合わせ | `/inquiry/` | 未実装 |

## デプロイ

`main` ブランチへのプッシュで自動的に GitHub Pages にデプロイされます。

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

## ライセンス

All rights reserved - Stellar AIz
