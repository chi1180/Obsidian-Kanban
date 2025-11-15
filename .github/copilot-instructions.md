# Copilot Instructions for Obsidian Kanban

## このドキュメントについて

- GitHub Copilot や各種 AI ツールが本リポジトリのコンテキストを理解しやすくするためのガイドです。
- 新しい機能を実装する際はここで示す技術選定・設計方針・モジュール構成を前提にしてください。
- 不確かな点がある場合は、リポジトリのファイルを探索し、ユーザーに「こういうことですか?」と確認をするようにしてください。
- **開発の全体像・進捗状況・実装済み機能については `DEVINFO.md` を参照してください。**

## 前提条件

- 回答は必ず日本語でしてください。
- 何か大きい変更を加える場合（既存のコード200行以上書き換える場合。新規に200行以上のコードを追加する場合は問題なし。）、まず何をするのか計画を立てた上で、ユーザーに「このような計画で進めようと思います。」と提案してください。この時、ユーザーから計画の修正を求められた場合は計画を修正して、再提案をしてください。
- **絶対にコードを勝手にコミットしないでください。** コミットはユーザーが行います。変更が完了したら、変更内容を説明するだけにしてください。

## アプリ概要

Obsidian Kanban は、Obsidian.md のノートを元にカンバンボードを生成し、タスク管理を効率化するアプリケーションです。
Notion や Trello のようなカンバンボードの利便性と、Obsidian.md の柔軟なノート管理機能を組み合わせています。

### 主な機能

- **ボード**: タスクカードを列ごとに分類して表示するビュー。
- **カラム**: 通常は「ステータス（例: To Do / Doing / Done）」でグループ化。他のプロパティ（例: 優先度、担当者、日付）でもグループ化可能。
- **カード**: 各タスクやアイテムを表す。
- カラムを追加・削除できる
- カラム名を変更できる
- **カラムの並び替えができる（ドラッグ＆ドロップ）** ✅ 実装済み
  - カラムヘッダーのドラッグハンドル（三本線アイコン）をドラッグ
  - 並び替えた順序は自動的に保存され、次回以降も反映される
  - ビュー設定の `columnOrder` に保存
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
│   │   ├── NewCardButton.tsx  // 新規カード作成ボタン（Notion 風：クリックで即座に「Untitled」カードを作成）
│   │   ├── TagSelector.tsx  // タグ選択ドロップダウン（単一選択、即座に確定）
│   │   ├── UndoToast.tsx  // Undo トーストコンポーネント（削除の取り消し機能）
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
- `createFile()`: 新規ファイルを作成（フロントマター付き、重複回避で自動連番）
- `renameFile()`: ファイル名を変更
- `deleteFile()`: ファイルを削除
- `sanitizeFileName()`: ファイル名をサニタイズ
- `generateFileContent()`: フロントマターを含むファイル内容を生成
- `getUniqueFileName()`: 重複を避けてユニークなファイル名を生成（Untitled → Untitled 2 → Untitled 3...）

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
  - 第3引数 `savedColumnOrder` で保存されたカラム順序を適用
  - 保存された順序がない場合はデフォルト（未分類を最後、アルファベット順）
  - 新しいカラムは保存された順序の後に追加される
- `entryToCard()`: BasesEntry → KanbanCard に変換
- `getColumnValues()`: カラムプロパティの値一覧を取得
- `moveCardInBoardData()`: ボードデータ内でカードを移動

- **View Layer（ビュー層）**

##### `src/views/kanbanBasesView.ts`

- `BasesView` クラスを継承した Kanban ビュー
- React コンポーネントのマウント・レンダリング管理
- データ更新時の再レンダリング処理
- `onDataUpdated()`: データ更新時の処理（Bases プラグインから呼ばれる）
- `onClose()`: ビューが閉じられる時の処理（React ルートのクリーンアップ）
- `this.config.get(key)`: Base の config から設定値を取得
- `this.config.getOrder()`: Properties メニューで選択されたプロパティのリストを取得
- `handleCardMove()`: カード移動時の処理
- `handleCardClick()`: カードクリック時の処理
- `handleCardTitleEdit()`: タイトル編集時の処理
- `handleCreateCard()`: 新規カード作成時の処理
- `handlePropertyEdit()`: プロパティ編集時の処理
- `handleCardDelete()`: カード削除時の処理（ファイルをゴミ箱に移動）
- `getNewCardFolderPath()`: 新規カード作成時のフォルダパスを決定（優先順位: ビューフィルター → グローバルフィルター → エントリーから推測 → デフォルト設定）
- `extractFolderFromFilter()`: フィルター情報からフォルダパスを抽出
- `getCommonFolderFromEntries()`: 現在表示中のエントリーから共通フォルダを推測
- `handleColumnReorder()`: カラム並び替え時の処理（順序を config に保存して再レンダリング）
- **カラムプロパティの受け渡し**: `columnProperty` を KanbanBoard に渡してカード上で色表示を実現

#### **UI Layer（React コンポーネント層）**

##### `src/ui/KanbanBoard.tsx`

- カンバンボード全体を表示するメインコンポーネント
- ドラッグ&ドロップ機能（`@hello-pangea/dnd`）
  - **カードのドラッグ**: カラム間でカードを移動
  - **カラムのドラッグ**: カラムの順序を並び替え（horizontal droppable）
  - **`renderClone`**: カードとカラムの両方で使用（ドラッグ時のオフセット問題を解決）
- ツールバーの表示（設定ボタン）
- カラムの一覧表示（各カラムは `Draggable` でラップ）
- 空のボード時のメッセージ表示
- `DragDropContext` でドラッグ&ドロップを管理
- `handleDragEnd` でカードとカラムの両方のドラッグを処理（`type` で判定）
- **全プロパティの収集**: `collectAllProperties(boardData)` で全プロパティのメタデータを取得し、Column に渡す
- **Undo 機能**: カード削除時に遅延実行し、5秒間 Undo 可能
  - `pendingDelete` 状態で削除待ちのカードを保持
  - `hiddenCardIds` 状態で非表示にするカードIDのセットを管理
  - `handleCardDelete`: カードを即座に非表示にし、削除を5秒遅延実行
  - `handleUndo`: カードを再表示し、削除をキャンセル
  - `UndoToast` コンポーネントを表示
- **Props**:
  - `columnProperty`: カラムプロパティ名を Column に伝播
  - `allProperties`: 全プロパティのメタデータを Column に伝播

##### `src/ui/Column.tsx`

- カンバンボードの1つのカラム（列）を表示
- カラムヘッダー：
  - **ドラッグハンドル**（三本線アイコン）: カラムをドラッグして並び替え
  - タイトル
  - カード数（非表示のカードを除外してカウント）
  - 「+」ボタン（クリックで即座に「Untitled」カードを作成）
- カードリスト（Droppable エリア）
- 新規カード作成ボタン：
  - ヘッダー右上の「+」ボタン（クリックで即座に作成）
  - カラム下部の「+ New Card」ボタン（クリックで即座に作成）
- `Droppable` と `Draggable` でドラッグ&ドロップを実装
- `dragHandleProps` を受け取ってドラッグハンドルに適用
- **カード非表示機能**: `hiddenCardIds` に含まれるカードは `display: none` で非表示
- **重要**: ドラッグ中のスタイルを適切に処理してオフセット問題を回避（カラムのドラッグでも `transform` は使用しない）
- **ツールチップの重複問題** ✅ 修正済み
  - カード追加ボタンに `aria-label` と `title` の両方が設定されていたため、ツールチップが2つ表示される問題があった
  - `title` 属性を削除し、`aria-label` のみを使用（Obsidian の慣例に従う）
  - アクセシビリティラベルと視覚的なツールチップの重複を防止
- **Props**:
  - `columnProperty`: カラムプロパティ名を Card に伝播
  - `allProperties`: 全プロパティのメタデータを Card に伝播

##### `src/ui/Card.tsx`

- 1枚のカードを表示
- タイトルのインライン編集機能
- **プロパティの表示とインライン編集** ✅ プロパティタイプごとにカスタムエディタを使用
  - 空のプロパティには「Add {プロパティ名}」プレースホルダーを表示
  - クリックで編集可能（PropertyEditor が自動的に適切なエディタを選択）
  - プロパティタイプごとに専用のエディタを表示：
    - **Checkbox**: チェックボックスを直接表示・編集
    - **Date**: 日付入力フィールド（type="date"）
    - **DateTime**: 日時入力フィールド（type="datetime-local"）
    - **Number**: 数値入力フィールド（type="number"）
    - **Tags**: TagSelector（単一選択、色付きバッジ）
    - **List**: ListEditor（複数選択、色付きバッジ、新規追加可能）
    - **Text**: textarea（複数行テキスト、自動リサイズ）
  - プロパティタイプは値から自動推測（inferPropertyType）
  - **タイトル重複防止**: visibleProperties から "title" と "name" を除外
- カードサイズ対応（small, medium, large）
- コンパクトモード対応
- クリックでファイルを開く
- **カラムプロパティの色表示** ✅ 実装済み
  - 分類用のプロパティ（カラムプロパティ）はカード上でカラムと同じ色で表示
  - Notion 風のデザイン：丸みのある背景、カラーのドット付き
  - `columnProperty` Props で現在のカラムプロパティ名を受け取る
  - プロパティ名が `columnProperty` と一致する場合、`columnColor` を適用
  - CSS 変数でカラムの色を動的に適用（`--property-bg-color`, `--property-text-color`, `--property-dot-color`）
- **編集モード** ✅ 実装済み
  - **Edit ボタン**：Delete ボタンの左隣に配置（ホバー時のみ表示、Lucide の Edit アイコン）
  - **編集モードの起動**：Edit ボタンクリックでカードが編集モードに展開
  - **全プロパティの表示**：Base 内の全プロパティを表示（設定済み・未設定を問わず）
    - 設定済みプロパティを上部に表示（現在の値を表示）
    - 未設定プロパティを下部に表示（「Add {プロパティ名}」プレースホルダー）
  - **プロパティアイコン**：各プロパティにタイプに応じたアイコンを表示（Checkbox, Date, DateTime, Number, Tags, List, Text）
  - **インライン編集**：プロパティをクリックすると既存の PropertyEditor でインライン編集
  - **編集モードの終了**：Done ボタンまたはカード外クリックで通常モードに戻る
  - **データフロー**：
    - `allProperties` prop で全プロパティのメタデータ（PropertyMetadata[]）を受け取る
    - KanbanBoard → Column → Card の順で伝播
    - `editModeProperties()` 関数で設定済み・未設定プロパティを分類してソート
- Props:
  - `columnProperty`: カラムプロパティ名（分類用のプロパティ）
  - `showDeleteConfirmDialog`: 削除確認ダイアログを表示するかどうか（デフォルト: true）
  - `onUpdateSettings`: 設定更新時のコールバック（key: string, value: any）
  - `allProperties`: すべてのプロパティのメタデータ（PropertyMetadata[]）
- **編集・削除ボタン**（ホバー時のみ表示）:
  - **カード削除** ✅ 実装済み
    - カードにホバーすると右上に削除アイコン（ゴミ箱）が表示される
    - クリックで Notion 風のカスタム確認モーダル（DeleteConfirmModal）を表示
    - 確認後、カードが即座に非表示になり、削除を KanbanBoard に通知（遅延実行）
    - ホバー時に赤背景・白アイコンでハイライト
    - 削除ボタンには `aria-label` のみ設定（`title` 属性なし）でツールチップ重複を防止
    - **削除確認ダイアログの設定** ✅ 実装済み
      - プラグイン設定に `showDeleteConfirmDialog` を追加（デフォルト: true）
      - モーダル左下に「Never show again」チェックボックスを表示
      - チェックすると、次回以降は確認ダイアログをスキップして即座に削除（Undo は表示される）
      - 設定タブから再度有効化可能（Settings > Obsidian better Kanban > Show confirmation dialog when deleting cards）
    - **ドラッグ防止機構** ✅ 実装済み
      - 削除ボタンの `onMouseDown` で `preventDefault()` と `stopPropagation()` を呼び出し
      - 削除ボタンに `pointer-events: auto` を設定してドラッグハンドルからの伝播を防止
      - モーダル表示中はカード全体に `kanban-card--modal-open` クラスを追加し `pointer-events: none` で完全にドラッグを無効化
      - モーダルと削除ボタンは `pointer-events: auto` で操作可能に維持

##### `src/ui/NewCardButton.tsx`

- 新規カード作成ボタン（Notion 風の即座作成）
- クリックすると即座に「Untitled」という名前のカードを作成
- 入力フォームは表示せず、シンプルなボタンのみ
- 作成後、カード上でタイトルをクリックして編集可能
- コンパクトモード対応

##### `src/ui/editors/PropertyEditor.tsx`

- プロパティタイプに応じて適切なエディタを振り分ける統合コンポーネント
- `inferPropertyType()` で値からプロパティタイプを自動推測
- 各プロパティタイプに応じたエディタコンポーネントをレンダリング
- Props:
  - `propertyName`: プロパティ名
  - `value`: 現在の値
  - `onChange`: 値変更時のコールバック
  - `onClose`: 編集完了時のコールバック
  - `availableOptions`: 利用可能な選択肢（Tags/List の場合）
  - `forceType`: 強制的に指定するプロパティタイプ（オプション）

##### `src/ui/editors/CheckboxEditor.tsx`

- チェックボックスプロパティを編集するためのエディタ
- チェックボックスをそのまま表示
- 変更時に即座に確定

##### `src/ui/editors/DateEditor.tsx`

- 日付プロパティを編集するためのエディタ
- `input type="date"` を使用
- Enter キーまたは Blur で確定、Escape でキャンセル
- マウント時に自動フォーカス

##### `src/ui/editors/DateTimeEditor.tsx`

- 日時プロパティを編集するためのエディタ
- `input type="datetime-local"` を使用
- ISO 8601 形式を datetime-local 形式に自動変換
- Enter キーまたは Blur で確定、Escape でキャンセル
- マウント時に自動フォーカス

##### `src/ui/editors/NumberEditor.tsx`

- 数値プロパティを編集するためのエディタ
- `input type="number"` を使用
- Enter キーまたは Blur で確定、Escape でキャンセル
- マウント時に自動フォーカス・選択

##### `src/ui/editors/TextEditor.tsx`

- テキストプロパティを編集するためのエディタ
- `textarea` を使用して複数行テキストに対応
- 自動リサイズ機能（scrollHeight に合わせて高さを調整）
- Enter キーで確定、Shift+Enter で改行、Escape でキャンセル
- マウント時に自動フォーカス・選択

##### `src/ui/editors/ListEditor.tsx`

- リストプロパティを編集するためのエディタ（複数選択可能）
- Tags エディタと似た UI だが、複数選択が可能
- 選択済みの値を色付きバッジで表示（削除ボタン付き）
- 利用可能な選択肢からトグル選択
- 新しい値をテキスト入力で追加可能
- 外側クリックまたは Escape キーで閉じる
- 各値は色付きバッジで表示（色はハッシュから自動生成）

##### `src/ui/TagSelector.tsx`

- タグプロパティを単一選択するドロップダウンコンポーネント
- Notion 風のフラットでクリーンなデザイン
- タグをクリックすると即座に確定して閉じる（変更する動作）
- 選択中のタグにチェックマーク（✓）を表示
- 外側クリックまたは Escape キーで閉じる
- 各タグは色付きバッジで表示（色はハッシュから自動生成）
- 配列プロパティ（tags など）と単一値プロパティ（status など）の両方に対応

##### `src/ui/UndoToast.tsx`

- カード削除時に Undo ボタンを表示するトーストコンポーネント
- 画面下中央に固定表示
- プログレスバーで残り時間を視覚化
- 5秒後に自動的に閉じる（削除を実行）
- Undo ボタンをクリックすると削除をキャンセル
- フェードイン/アウトアニメーション
- `onUndo`: Undo ボタンクリック時のコールバック
- `onClose`: トーストが閉じられた時のコールバック

##### `src/ui/DeleteConfirmModal.tsx`

- カード削除時の確認モーダルコンポーネント（Notion風のデザイン）
- オーバーレイ表示で中央に配置
- ヘッダー：
  - タイトル（"Delete card"）
  - 閉じるボタン（×アイコン）
- コンテンツ：
  - 削除確認メッセージ（カード名を太字で表示）
  - 補足メッセージ（"This will move the file to the trash."）
- アクション：
  - 左下：「Never show again」チェックボックス
  - 右下：Cancel ボタン（グレー、ホバーでライト背景）と Delete ボタン（赤背景、白文字）
- インタラクション：
  - Escape キーでキャンセル
  - オーバーレイクリックでキャンセル
  - フェードイン/スライドアップアニメーション
  - Delete ボタンクリック時、チェックボックスが有効なら `onNeverShowAgain()` を呼び出してから `onConfirm()` を実行
  - **イベント伝播の防止** ✅ 実装済み
    - モーダル全体（`.delete-modal`）のクリックで `e.stopPropagation()` を呼び出し
    - Cancel/Delete ボタンのクリックで `e.stopPropagation()` を呼び出し
    - チェックボックスのクリックで `e.stopPropagation()` を呼び出し
    - カードの `handleCardClick` に `!showDeleteModal` の条件を追加
    - これにより、モーダル操作時にカードがクリックされてファイルが開くバグを防止
- Props：
  - `cardTitle`: 削除するカードのタイトル
  - `onConfirm`: 削除確定時のコールバック
  - `onCancel`: キャンセル時のコールバック
  - `onNeverShowAgain`: 「Never show again」チェック時のコールバック（設定を false に更新）
- **ドラッグとの干渉防止**：
  - モーダル表示中は親カードに `kanban-card--modal-open` クラスが追加される
  - このクラスにより `pointer-events: none` が適用され、カードのドラッグが完全に無効化される
  - モーダル自体は `pointer-events: auto` で操作可能

##### `src/ui/SettingsPanel.tsx`

- ビュー内設定パネルの Modal コンポーネント
- 各ボード固有の設定をカスタマイズ
- リアルタイム保存（Save/Cancelボタンなし）
- 設定項目：
  - Column Property（グループ化するプロパティ）
  - Card Size（Small / Medium / Large）
  - Sort Order（ソート順）
  - Enable Drag and Drop
  - Show Card Count
  - Compact Mode
  - **Column Order（カラム順序の編集）** ✅ ドラッグ&ドロップで並び替え可能
    - カラムのリスト表示（ドラッグハンドル付き）
    - ドラッグ&ドロップで順序変更
    - 各カラムに削除ボタン（順序から除外）
    - 変更は自動保存
  - **Reset Column Order（カラム順序のリセット）** - デフォルトのアルファベット順に戻す
- **Show confirmation dialog when deleting cards（カード削除時の確認ダイアログ表示）** ✅ 実装済み
  - トグルスイッチで有効/無効を切り替え
  - 説明文: "Display a confirmation dialog before deleting a card. You can also disable this from the delete dialog itself."
  - モーダルの「Never show again」で無効化された場合、ここで再度有効化可能
- `renderColumnOrderList()`: カラム順序リストをレンダリング（ネイティブHTML5ドラッグ&ドロップAPI使用）

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
  - Show column colors: true
  - Show delete confirm dialog: true（カード削除時の確認ダイアログを表示）

#### **Utils Layer（ユーティリティ層）**

##### `src/utils/propertyUtils.ts`

- プロパティタイプ推測ユーティリティ
- **`PropertyMetadata` 型**：プロパティのメタデータ
  - `name`: プロパティ名
  - `type`: プロパティタイプ（PropertyType）
  - `options`: 利用可能な選択肢（Tags/List の場合）
- **`collectAllProperties()`**: ボードデータから全プロパティのメタデータを収集
  - 全カードのプロパティをスキャンしてユニークなプロパティ名を抽出
  - 各プロパティのタイプをサンプル値から推測
  - Tags/List タイプの場合、すべての利用可能な値を収集して options に格納
  - プロパティ名でアルファベット順にソート
  - 戻り値：`PropertyMetadata[]`
- `inferPropertyType()`: 値とプロパティ名からプロパティタイプを推測
  - boolean → Checkbox
  - number → Number
  - 配列 → Tags（プロパティ名に "tag" が含まれる場合）または List
  - 日付文字列（YYYY-MM-DD） → Date
  - 日時文字列（ISO 8601） → DateTime
  - 数値文字列 → Number
  - その他 → Text
- `formatPropertyValue()`: プロパティ値を表示用に整形
  - Checkbox → "✓" または空
  - Date/DateTime → 日付文字列
  - Tags/List → カンマ区切り文字列
  - Number → 数値文字列
  - Text → 文字列
- `parsePropertyValue()`: 編集された値を実際のプロパティ値に変換
  - Checkbox → boolean
  - Number → number（NaN の場合は null）
  - Date/DateTime → 日付文字列
  - Tags/List → カンマ区切りで配列に分割
  - Text → 文字列

#### **Types Layer（型定義層）**

##### `src/types/bases.ts`

- Obsidian Bases プラグインの API 型定義
- `BasesView`, `QueryController`, `BasesEntry`, `BasesViewConfig` などのインターフェース
- `FilterCondition`: フィルター情報の型定義（フォルダフィルターなど）
- Bases プラグインの公式型定義が存在しないため、ドキュメントを元に自作
- **注意**: Obsidian パッケージに `BasesView` が定義されているため、実際には Obsidian の型を使用し、不足部分は `any` でキャスト

##### `src/types/kanban.ts`

- Kanban 固有の型定義
- `KanbanCard`: カンバンカードのデータ構造
- `KanbanColumn`: カラム（列）のデータ構造
- `KanbanBoardData`: ボード全体のデータ構造
  - `columnOrder`: カラムの並び順（カラムIDの配列）を含む
- `CreateCardParams`: カード作成時のパラメータ
- `UpdateCardParams`: カード更新時のパラメータ
- `CardSize`: カードサイズ（small | medium | large）
- `SortOrder`: ソート順（created | updated | title | custom）
- **`PropertyType`**: プロパティタイプの enum ✅ 新規追加
  - `Text`: テキストプロパティ
  - `Number`: 数値プロパティ
  - `Checkbox`: チェックボックスプロパティ
  - `Date`: 日付プロパティ
  - `DateTime`: 日時プロパティ
  - `Tags`: タグプロパティ（単一選択）
  - `List`: リストプロパティ（複数選択）
- **`PropertyMetadata`**: プロパティメタデータ ✅ 新規追加
  - `name`: プロパティ名
  - `type`: プロパティタイプ
  - `options`: 利用可能な選択肢（Tags/List の場合）

##### `src/types/settings.ts`

- 設定関連の型定義
- `KanbanPluginSettings`: プラグイン全体の設定
- `SETTINGS_KEYS`: 設定のキー定数
- `CARD_SIZES`: カードサイズの選択肢
- `SORT_ORDERS`: ソート順の選択肢
- CardSize, SortOrder の再エクスポート

## コーディング規約・ベストプラクティス

### コード編集後に毎回すべきこと

1. **Lint チェック（必須）**:
   - **コードを変更したら必ず `npm run lint` を実行してください**
   - ESLint のエラーがある場合は必ず修正してください
   - 警告（warning）は許容されますが、エラーは0件にしてください
   - 未使用の変数は削除するか、プレフィックス `_` を付けてください（例: `_snapshot`）

2. **型エラーのチェック**:
   - diagnostics を確認して、型エラーがないか確認してください
   - 型エラーが見つかった場合、修正してください

3. **ドキュメントの更新**:
   - **必須**: プロジェクトに変更を加えたら（ファイルの追加・削除・リネーム、主要な関数の追加・変更など）、このファイル（.github/copilot-instructions.md）の「プロジェクト構成と役割」セクションを必ず更新してください
   - アップデートした内容に関しては、ユーザーに必ず報告してください
   - 軽微な修正（バグ修正、スタイル調整など）の場合はドキュメント更新不要です

### コメント

- **JSDoc**: 複雑な関数には JSDoc コメントを付与
- **TODO コメント**: タスクについてはその箇所に `// TODO ::: [ ] here is to do content` を残す

### HTML 属性のベストプラクティス

- **ツールチップの重複を避ける**:
  - ボタンなどのインタラクティブ要素には `aria-label` のみを使用（Obsidian の慣例）
  - `aria-label` と `title` 属性を同時に使用しない（ツールチップが2つ表示される）
  - 情報表示用の `title` 属性（例: カードタイトルやプロパティ名）は問題なし
  - 例: `<button aria-label="新しいカードを追加">+</button>` ✅
  - 例: `<button aria-label="追加" title="追加">+</button>` ❌（重複）

### ドラッグ&ドロップの実装

#### **ボード上のドラッグ&ドロップ（`@hello-pangea/dnd` 使用）**

- **カードのドラッグ**: カラム間でカードを移動
  - 各カードを `Draggable` でラップ
  - カラムを `Droppable` (vertical) でラップ
  - **`renderClone`** を使用してドラッグ中のクローンをレンダリング（オフセット問題を回避）
- **カラムのドラッグ**: カラムの順序を並び替え
  - カラムリスト全体を `Droppable` (horizontal) でラップ
  - 各カラムを `Draggable` でラップ
  - ドラッグハンドル（三本線アイコン）を `dragHandleProps` で制御
  - `type="column"` で識別
  - **`renderClone`** を使用してドラッグ中のクローンをレンダリング（カードと同じ仕組み）
- **重要なオフセット問題の回避策**:
  - **`renderClone` を使用する**（最も重要！）- 複雑なレイアウトによるオフセット問題を根本的に解決
  - `transform` CSS プロパティは使用しない（ドラッグ位置がずれる）
  - `gap` プロパティも使用しない（オフセットの原因）→ `margin` を使用
  - `provided.draggableProps.style` を明示的に適用
- ドラッグ中のスタイルは `provided.draggableProps.style` を適切に処理する
- ホバー効果には `box-shadow` や `opacity` を使用し、`transform` は避ける

#### **設定パネル内のドラッグ&ドロップ（ネイティブHTML5 API使用）**

- カラム順序リストの並び替えに使用
- `draggable="true"` 属性を設定
- `dragstart`, `dragend`, `dragover`, `dragleave`, `drop` イベントを処理
- リアルタイムで `config.columnOrder` に保存

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

- **ドラッグ&ドロップでの transform 使用**: カード要素やその親要素に `transform` を使用すると、ドラッグ位置がオフセットする問題が発生する（カラムのドラッグでも同様に使用しない）
- **ドラッグ&ドロップでの gap 使用**: `gap` プロパティもオフセット問題を引き起こすため、flexbox の子要素に `margin` を使用する（最後の要素は `margin: 0`）
- **position: fixed/absolute の乱用**: レイアウトが崩れる原因になるため、必要最小限に留める
- **カラムとカードのドラッグの混同**: `type` プロパティで明確に区別する（`type="column"` と デフォルト）
- **カラムプロパティの色表示** ✅ 実装済み
  - `.kanban-card__property-value--column`: カラムプロパティ専用のスタイルクラス
  - CSS 変数で動的に色を適用: `--property-bg-color`, `--property-text-color`, `--property-dot-color`
  - Notion 風のデザイン: 丸みのある背景（`border-radius: 12px`）、カラードット付き
  - `.kanban-card__property-dot`: 6px の円形ドット、`background-color: var(--property-dot-color)`
