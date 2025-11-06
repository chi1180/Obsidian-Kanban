# Copilot Instructions for Obsidian Kanban

## このドキュメントについて

- GitHub Copilot や各種 AI ツールが本リポジトリのコンテキストを理解しやすくするためのガイドです。
- 新しい機能を実装する際はここで示す技術選定・設計方針・モジュール構成を前提にしてください。
- 不確かな点がある場合は、リポジトリのファイルを探索し、ユーザーに「こういうことですか?」と確認をするようにしてください。

## 前提条件

- 回答は必ず日本語でしてください。
- 何か大きい変更を加える場合（既存のコード200行以上書き換える場合。新規に200行以上のコードを追加する場合は問題なし。）、まず何をするのか計画を立てた上で、ユーザーに「このような計画で進めようと思います。」と提案してください。この時、ユーザーから計画の修正を求められた場合は計画を修正して、再提案をしてください。

## アプリ概要

Obsidian Kanban は、Obsidian.md のノートを元にカンバンボードを生成し、タスク管理を効率化するアプリケーションです。
Notion や Trello のようなカンバンボードの利便性と、Obsidian.md の柔軟なノート管理機能を組み合わせています。

### 主な機能

- **ボード**: タスクカードを列ごとに分類して表示するビュー。
- **カラム**: 通常は「ステータス（例: To Do / Doing / Done）」でグループ化。他のプロパティ（例: 優先度、担当者、日付）でもグループ化可能。
- **カード**: 各タスクやアイテムを表す。
- カラムを追加・削除できる
- カラム名を変更できる
- カラムの並び替えができる（ドラッグ＆ドロップ）
- 空のカラムに「＋ New」ボタンがある
- カラム単位でフィルタやソートが反映される
- 新しいカードを追加（+ New Card）
- カードのタイトルをインラインで編集
- カードをドラッグして別カラムへ移動
- カードの詳細ページを開いて以下の編集が可能：
  - タイトル
  - 説明
  - 日付（期日など）
  - ステータス（列に対応）
  - タグ（マルチセレクト）
  - 担当者
  - チェックリスト（サブタスク）
  - コメント欄（メモ的）
  - カードを削除
  - 完了済みカードの非表示（または自動グループ化）
- **フィルタ**: 特定のタグ・担当者・日付などで絞り込み
- **ソート**: 作成日や優先度順でカードを並べ替え
- **検索**: タイトル・内容から検索
- **グループ変更**: 表示グループ（例: ステータス → 優先度）を切り替え
- **カード数カウント**: 各カラムの上に件数表示
- **ドラッグ＆ドロップ操作**: （React Beautiful DnDなどで実現）
- インライン編集（クリックで即編集モード）
- シンプルなアニメーション（移動・追加時）
- ダークモード対応（Obsidianテーマと統一）
- スクロール可能なカラム
- 各カードの情報はデータベース的に保存（Notionではプロパティ）Obsidian版ではVault内のMarkdownファイルやJSONで管理可能
- 自動保存（編集時に即保存）
- Undo/Redo（操作履歴）
- カスタムプロパティの追加（ユーザー定義フィールド）
- 期日による自動ハイライト（期限切れなど）
- フィルタや並び替えのプリセット保存
- カラム間でのカード枚数制限（WIP制限）
- テンプレートカード（同じ構成を再利用）

## 技術スタック概要

- **UIコンポーネント**: React
- **API**: Obsidian Plugin API

## プロジェクト構成と役割

本アプリは機能ベースのディレクトリ構成を採用し、関心の分離とスケーラビリティを実現しています。

```
├── LICENSE
├── manifest.json  // Obsidianプラグインのメタデータ
├── package.json
├── package-lock.json
├── README.md
├── rollup.config.js  // ビルド設定
├── src  // ソースコード
│   ├── index.ts  // エントリーポイント（Bases View を登録、設定管理）
│   ├── adapters  // データ変換層
│   │   └── basesDataAdapter.ts  // Bases データと Kanban データの相互変換
│   ├── settings  // 設定管理
│   │   ├── settingsTab.ts  // PluginSettingTab実装（Obsidian設定タブ）
│   │   └── defaultSettings.ts  // デフォルト設定値
│   ├── types  // 型定義
│   │   ├── bases.ts  // Bases View API の型定義
│   │   └── settings.ts  // 設定の型定義
│   ├── ui  // React コンポーネント
│   │   ├── board.tsx  // Kanban ボード全体のコンポーネント
│   │   └── settingsPanel.tsx  // ビュー内設定パネル
│   └── views  // Bases View 実装
│       └── kanbanBasesView.ts  // Kanban Bases View クラス
├── styles.css
├── tsconfig.json
└── yarn.lock
```

### 主要モジュールの役割

#### `src/index.ts`

- プラグインのエントリーポイント
- `registerBasesView()` を使って Kanban ビューを Bases プラグインに登録
- プラグイン設定の読み込み・保存処理
- `PluginSettingTab` の登録
- リボンアイコンは使用せず、Bases のビューとして動作

#### `src/settings/settingsTab.ts`

- `PluginSettingTab` を継承した設定タブの実装
- Obsidianの設定画面（Settings > Community plugins > Obsidian better Kanban）に表示
- プラグイン全体のデフォルト設定を管理
- 新規ボード作成時のデフォルト値として使用
- 設定項目：
  - Default card size (Small / Medium / Large)
  - Max cards per column (0 = unlimited)
  - Enable drag and drop
  - Show card count
  - Compact mode

#### `src/settings/defaultSettings.ts`

- プラグインのデフォルト設定値を定義
- デフォルト値：
  - Card size: Medium
  - Max cards per column: 0 (unlimited)
  - Draggable: true
  - Show card count: true
  - Compact mode: false

#### `src/types/settings.ts`

- 設定関連の型定義
- `KanbanPluginSettings`: プラグイン全体の設定（cardSize, maxCardsPerColumn, draggable, showCardCount, compactMode）
- `KanbanViewSettings`: ビュー固有の設定（上記すべてオプショナル）
- `EffectiveSetting<T>`: 有効な設定値とその取得元を表す型
- `SETTINGS_KEYS`: 設定のキー定数
- `CARD_SIZES`: カードサイズの選択肢（SMALL, MEDIUM, LARGE）

#### `src/types/bases.ts`

- Obsidian Bases プラグインの API 型定義
- `BasesView`, `QueryController`, `BasesEntry`, `BasesViewConfig` などのインターフェース
- Bases プラグインの公式型定義が存在しないため、ドキュメントを元に自作

#### `src/adapters/basesDataAdapter.ts`

- Bases のデータ構造（`BasesData`）を Kanban の UI データ（`BoardData`）に変換
- カードの移動時に Vault のプロパティを更新する処理
- データの双方向変換を担当

#### `src/views/kanbanBasesView.ts`

- `BasesView` を継承した Kanban ビューの実装
- React コンポーネントのマウント・アンマウント管理
- データ更新時の再レンダリング処理
- カード移動時の Bases データ更新処理
- プラグイン設定を React コンポーネントに渡す

#### `src/ui/board.tsx`

- Kanban ボードの React コンポーネント
- ドラッグ&ドロップ機能（`@hello-pangea/dnd`）
- カラム・カードの表示と操作
- 設定パネルの統合

#### `src/ui/settingsPanel.tsx`

- ビュー内設定パネルの React コンポーネント
- 各ボード固有の設定をカスタマイズ
- プラグイン設定とビュー設定の階層的管理
- ビュー設定が未設定の場合はプラグイン設定を使用
- 各設定項目に "Reset" ボタンを配置（個別設定を削除し、プラグイン設定に戻す）
- 視覚的フィードバック：
  - デフォルト使用中は "(using default)" 表示
  - デフォルト使用中は背景色が異なる
- すべての表示テキストは英語

```

## コーディング規約・ベストプラクティス

### コード編集後に毎回すべきこと

このファイル（.github/copilot-instructions.md）の、「プロジェクト構成と役割」の部分について、アップデートが必要な点があればアップデートしてください。
アップデートした内容に関しては、ユーザに伝えといてください。

### コメント

- **JSDoc**: 複雑な関数には JSDoc コメントを付与
- **TODO コメント**: タスクについてはその箇所に \'// TODO ::: [ ] here is to do content\' を残す

## アンチパターン

以下のパターンは避けてください。既存コードで発見した場合は、リファクタリングを提案してください。

### コンポーネント設計

- **巨大コンポーネント**: 1つのコンポーネントが200行を超える場合は分割を検討
- **Prop Drilling**: 深い階層での props バケツリレーは、Context や状態管理ライブラリで解決
- **useEffect の濫用**: データフェッチは React Query、イベントハンドラーで済む処理は useEffect を使わない

### 状態管理

- **過度なグローバル状態**: 真にグローバルな状態のみを Zustand で管理
- **useState の濫用**: 複雑な状態は useReducer で管理
- **直接的な状態変更**: イミュータブルな更新を心がける

### パフォーマンス

- **不要な再レンダリング**: React DevTools Profiler で計測し、必要に応じて最適化
- **過度な最適化**: 実測せずに useMemo/useCallback を多用しない
- **巨大なバンドル**: Code Splitting を活用し、初期ロードを軽量化
```
