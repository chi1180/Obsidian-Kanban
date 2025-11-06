# Copilot Instructions for Obsidian Kanban

## このドキュメントについて

- GitHub Copilot や各種 AI ツールが本リポジトリのコンテキストを理解しやすくするためのガイドです。
- 新しい機能を実装する際はここで示す技術選定・設計方針・モジュール構成を前提にしてください。
- 不確かな点がある場合は、リポジトリのファイルを探索し、ユーザーに「こういうことですか?」と確認をするようにしてください。
- **開発の全体像・進捗状況・実装済み機能については `DEVINFO.md` を参照してください。**

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
- **ドラッグ＆ドロップ**: @hello-pangea/dnd
- **API**: Obsidian Plugin API

## プロジェクト構成と役割

本アプリは機能ベースのディレクトリ構成を採用し、クリーンアーキテクチャを意識した設計で関心の分離とスケーラビリティを実現しています。

```
├── LICENSE
├── manifest.json  // Obsidianプラグインのメタデータ
├── package.json
├── package-lock.json
├── README.md
├── rollup.config.js  // ビルド設定
├── src  // ソースコード
│   ├── index.ts  // エントリーポイント（Bases View を登録、設定管理）
│   ├── types  // 型定義
│   │   ├── bases.ts  // Bases View API の型定義
│   │   ├── kanban.ts  // Kanban 固有の型定義（Card, Column など）
│   │   └── settings.ts  // 設定の型定義
│   ├── core  // コアロジック（ビジネスロジック）
│   │   ├── fileOperations.ts  // ファイル操作（作成、リネーム、削除）
│   │   ├── propertyManager.ts  // プロパティの読み書き
│   │   └── cardManager.ts  // カード操作の統括
│   ├── adapters  // データ変換層
│   │   └── basesToKanban.ts  // Bases データ → Kanban データ
│   ├── views  // Bases View 実装
│   │   └── kanbanBasesView.ts  // Kanban Bases View クラス
│   ├── ui  // React コンポーネント
│   │   ├── KanbanBoard.tsx  // ボード全体
│   │   ├── Column.tsx  // カラム（列）
│   │   ├── Card.tsx  // カード
│   │   ├── NewCardButton.tsx  // 新規カード作成ボタン
│   │   └── SettingsPanel.tsx  // 設定パネル
│   └── settings  // 設定管理
│       ├── defaultSettings.ts  // デフォルト設定値
│       └── settingsTab.ts  // PluginSettingTab実装（Obsidian設定タブ）
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

#### **Core Layer（コアロジック層）**

##### `src/core/fileOperations.ts`

- ファイルの作成、リネーム、削除などの基本操作を提供
- `createFile()`: 新規ファイルを作成（フロントマター付き）
- `renameFile()`: ファイル名を変更
- `deleteFile()`: ファイルを削除
- `sanitizeFileName()`: ファイル名をサニタイズ
- `generateFileContent()`: フロントマターを含むファイル内容を生成

##### `src/core/propertyManager.ts`

- ファイルのフロントマター（プロパティ）の読み書きを担当
- `getProperties()`: ファイルのすべてのプロパティを取得
- `updateProperties()`: プロパティを更新
- `getProperty()`: 特定のプロパティ値を取得
- `setProperty()`: 特定のプロパティ値を設定
- `updateFrontmatter()`: ファイル内容のフロントマターを更新
- `generateFrontmatter()`: YAML 形式のフロントマターを生成

##### `src/core/cardManager.ts`

- カード操作の統括クラス
- `FileOperations` と `PropertyManager` を組み合わせて使用
- `createCard()`: 新しいカードを作成
- `updateCard()`: カードのプロパティを更新
- `updateCardTitle()`: カードのタイトルを更新
- `deleteCard()`: カードを削除
- `moveCardToColumn()`: カードを別のカラムに移動（プロパティ値を更新）
- `entryToCard()`: BasesEntry を KanbanCard に変換

#### **Adapter Layer（データ変換層）**

##### `src/adapters/basesToKanban.ts`

- Bases のデータ構造を Kanban の UI データに変換
- `basesToKanbanData()`: BasesEntry[] → KanbanBoardData に変換
- `entryToCard()`: BasesEntry → KanbanCard に変換
- `getColumnValues()`: カラムプロパティの値一覧を取得
- `moveCardInBoardData()`: ボードデータ内でカードを移動

#### **View Layer（ビュー層）**

##### `src/views/kanbanBasesView.ts`

- `BasesView` クラスを継承した Kanban ビュー
- React コンポーネントのマウント・レンダリング管理
- データ更新時の再レンダリング処理
- `onDataUpdated()`: データ更新時の処理（Bases プラグインから呼ばれる）
- `this.config.get(key)`: Base の config から設定値を取得
- `this.config.getOrder()`: Properties メニューで選択されたプロパティのリストを取得
- `handleCardMove()`: カード移動時の処理
- `handleCardClick()`: カードクリック時の処理
- `handleCardTitleEdit()`: タイトル編集時の処理
- `handleCreateCard()`: 新規カード作成時の処理
- `handlePropertyEdit()`: プロパティ編集時の処理

#### **UI Layer（React コンポーネント層）**

##### `src/ui/KanbanBoard.tsx`

- カンバンボード全体を表示するメインコンポーネント
- ドラッグ&ドロップ機能（`@hello-pangea/dnd`）
- ツールバーの表示（設定ボタン）
- カラムの一覧表示
- 空のボード時のメッセージ表示
- `DragDropContext` でドラッグ&ドロップを管理

##### `src/ui/Column.tsx`

- カンバンボードの1つのカラム（列）を表示
- カラムヘッダー（タイトル、カード数）
- カードリスト（Droppable エリア）
- 新規カード作成ボタンの配置
- `Droppable` と `Draggable` でドラッグ&ドロップを実装
- **重要**: ドラッグ中のスタイルを適切に処理してオフセット問題を回避

##### `src/ui/Card.tsx`

- 1枚のカードを表示
- タイトルのインライン編集機能
- プロパティの表示とインライン編集
- カードサイズ対応（small, medium, large）
- コンパクトモード対応
- クリックでファイルを開く

##### `src/ui/NewCardButton.tsx`

- 新規カード作成ボタンとフォーム
- カードタイトル入力
- 作成・キャンセルボタン
- キーボードショートカット対応（Enter, Escape）

##### `src/ui/SettingsPanel.tsx`

- ビュー内設定パネルの Modal コンポーネント
- 各ボード固有の設定をカスタマイズ
- リアルタイム保存（Save/Cancelボタンなし）
- 設定項目：
  - Column Property（グループ化するプロパティ）
  - Card Size（Small / Medium / Large）
  - Enable Drag and Drop
  - Show Card Count
  - Compact Mode

#### **Settings Layer（設定管理層）**

##### `src/settings/settingsTab.ts`

- `PluginSettingTab` を継承した設定タブの実装
- Obsidian の設定画面（Settings > Community plugins > Obsidian better Kanban）に表示
- プラグイン全体のデフォルト設定を管理
- 設定項目：
  - Default card size (Small / Medium / Large)
  - Default new file location（新規ファイル作成場所）
  - Default sort order（ソート順）
  - Enable drag and drop
  - Show card count
  - Compact mode

##### `src/settings/defaultSettings.ts`

- プラグインのデフォルト設定値を定義
- デフォルト値：
  - Default card size: medium
  - Default new file location: /
  - Default sort order: created
  - Enable drag and drop: true
  - Show card count: true
  - Compact mode: false

#### **Types Layer（型定義層）**

##### `src/types/bases.ts`

- Obsidian Bases プラグインの API 型定義
- `BasesView`, `QueryController`, `BasesEntry`, `BasesViewConfig` などのインターフェース
- Bases プラグインの公式型定義が存在しないため、ドキュメントを元に自作

##### `src/types/kanban.ts`

- Kanban 固有の型定義
- `KanbanCard`: カンバンカードのデータ構造
- `KanbanColumn`: カラム（列）のデータ構造
- `KanbanBoardData`: ボード全体のデータ構造
- `CreateCardParams`: カード作成時のパラメータ
- `UpdateCardParams`: カード更新時のパラメータ
- `CardSize`: カードサイズ（small | medium | large）
- `SortOrder`: ソート順（created | updated | title | custom）

##### `src/types/settings.ts`

- 設定関連の型定義
- `KanbanPluginSettings`: プラグイン全体の設定
- `SETTINGS_KEYS`: 設定のキー定数
- `CARD_SIZES`: カードサイズの選択肢
- `SORT_ORDERS`: ソート順の選択肢
- CardSize, SortOrder の再エクスポート

## コーディング規約・ベストプラクティス

### コード編集後に毎回すべきこと

1. **型エラーのチェック**:
   - `npm run lint` を実行して、TypeScript の型エラーがないか確認してください
   - エラーがある場合は必ず修正してください
   - 警告（warning）は許容されますが、エラーは0件にしてください

2. **ドキュメントの更新**:
   - **必須**: プロジェクトに変更を加えたら（ファイルの追加・削除・リネーム、主要な関数の追加・変更など）、このファイル（.github/copilot-instructions.md）の「プロジェクト構成と役割」セクションを必ず更新してください
   - アップデートした内容に関しては、ユーザーに必ず報告してください
   - 軽微な修正（バグ修正、スタイル調整など）の場合はドキュメント更新不要です

### コメント

- **JSDoc**: 複雑な関数には JSDoc コメントを付与
- **TODO コメント**: タスクについてはその箇所に `// TODO ::: [ ] here is to do content` を残す

### ドラッグ&ドロップの実装

- `@hello-pangea/dnd` を使用
- **重要**: `transform` CSS プロパティはドラッグ位置のオフセット問題を引き起こすため、カード要素やその親要素には使用しない
- ドラッグ中のスタイルは `provided.draggableProps.style` を適切に処理する
- ホバー効果には `box-shadow` や `opacity` を使用し、`transform` は避ける

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

### CSS

- **ドラッグ&ドロップでの transform 使用**: カード要素やその親要素に `transform` を使用すると、ドラッグ位置がオフセットする問題が発生する
- **position: fixed/absolute の乱用**: レイアウトが崩れる原因になるため、必要最小限に留める
