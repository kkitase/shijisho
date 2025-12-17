# Shijisho Generator - 指示書ジェネレーター

テキストベースの修正指示と対象画像から、矢印付きの視覚的な指示書画像を自動生成する Web アプリケーションです。

## 機能

- 📷 画像のドラッグ＆ドロップアップロード
- 📝 テキストベースの修正指示入力
- 🤖 Gemini API による自動座標検出
- 🎯 Canvas での矢印・注釈描画
- 💾 生成画像のダウンロード

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、Gemini API キーを設定してください:

```bash
GEMINI_API_KEY=your_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 使い方

1. **画像をアップロード**: 修正が必要な画像をドラッグ＆ドロップまたはクリックして選択
2. **修正指示を入力**: 修正内容をテキストで入力（改行で区切り）
3. **指示書を生成**: ボタンをクリックして AI が座標を検出し、矢印付き画像を生成
4. **ダウンロード**: 生成された指示書画像をダウンロード

## 技術スタック

- [Next.js 14](https://nextjs.org/) (App Router)
- [Gemini API](https://ai.google.dev/) (画像解析)
- [Canvas API](https://developer.mozilla.org/ja/docs/Web/API/Canvas_API) (矢印描画)
- TypeScript
- CSS Modules
