# Obsidian better Kanban

A powerful Kanban board plugin for [Obsidian](https://obsidian.md/) that works as a **Bases Plugin View**. Inspired by Notion's Database Board View, this plugin transforms your Markdown files into a visual Kanban board for better task management.

![Obsidian better Kanban](https://img.shields.io/badge/Obsidian-Plugin-purple)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🎯 **Bases Plugin Integration**: Works seamlessly as a Bases View
- 📝 **Markdown-Based**: Each card is a Markdown file in your vault
- 🎨 **Notion-Style UI**: Clean and intuitive interface inspired by Notion's Board View
- 🔄 **Drag & Drop**: Move cards between columns by dragging
- ✏️ **Inline Editing**: Edit card titles directly on the board
- ➕ **Quick Card Creation**: Add new cards with a single click
- ⚙️ **Flexible Configuration**: Customize column property, card size, and more
- 🎭 **Property Display**: Choose which properties to display on cards
- 📊 **Card Count**: See how many cards are in each column
- 🌓 **Dark Mode Support**: Follows Obsidian's theme

## 📚 Documentation

- **[DEVINFO.md](DEVINFO.md)**: 開発情報・実装済み機能・今後の予定
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)**: 技術仕様・アーキテクチャ・コーディング規約

## 📋 Prerequisites

- **Obsidian** v1.10.0 or higher
- **Bases Plugin** (required)

## 🚀 Installation

### From Community Plugins (Coming Soon)

1. Open Obsidian Settings
2. Navigate to Community Plugins
3. Search for "Obsidian better Kanban"
4. Click Install, then Enable

### Manual Installation

1. Download the latest release from [GitHub Releases](#)
2. Extract the files to your vault's plugins folder: `<vault>/.obsidian/plugins/obsidian-better-kanban/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

### Development Installation

```bash
# Clone the repository
git clone https://github.com/chi1180/ObsidianKanban.git
cd ObsidianKanban

# Install dependencies
npm install

# Build the plugin
npm run build

# For development with auto-rebuild
npm run dev

# Copy to your vault (optional)
# Set OUTDIR environment variable to your vault's plugin folder
export OUTDIR="/path/to/your/vault/.obsidian/plugins/obsidian-better-kanban"
npm run build
```

## 📖 Usage

### Creating a Kanban Board

1. **Install and enable Bases Plugin**
2. **Create a Bases database** or use an existing one
3. **Add the Kanban Board View**:
   - Click "Add View" in your Bases database
   - Select "Kanban Board" from the view types
4. **Configure your board**:
   - Set the column property (e.g., "status", "priority")
   - Choose which properties to display on cards

### Column Property

The column property determines how cards are grouped. For example:

**Frontmatter example:**

```yaml
---
status: todo
priority: high
tags: [project-a, urgent]
due: 2024-12-31
---
```

If you set `status` as the column property, cards will be grouped by their status value (todo, doing, done, etc.).

### Creating Cards

1. Click the **"+ New Card"** button at the bottom of any column
2. Enter a card title
3. Press Enter or click "Add Card"

The new card will be created with:

- Title as the filename
- Column property set to the column's value
- Default location specified in plugin settings

### Moving Cards

Simply **drag and drop** cards between columns. The card's column property will be automatically updated in the file's frontmatter.

### Editing Cards

- **Click on a card title** to edit it inline
- **Click on a card** to open the file in Obsidian

## ⚙️ Settings

### Plugin Settings (Global)

Access via Settings → Community Plugins → Obsidian better Kanban

- **Default Card Size**: Small, Medium, or Large
- **Default New File Location**: Where new cards are created
- **Default Sort Order**: How cards are sorted within columns
- **Enable Drag and Drop**: Allow moving cards between columns
- **Show Card Count**: Display number of cards in each column
- **Compact Mode**: Use compact layout for cards

### Board Settings (Per-View)

Click the settings icon (⚙️) in the board toolbar

- **Column Property**: Property to group cards by (required)
- **Visible Properties**: Which properties to display on cards
- **Card Size**: Override plugin default
- **Sort Order**: Override plugin default
- **Enable Drag and Drop**: Override plugin default
- **Show Card Count**: Override plugin default
- **Compact Mode**: Override plugin default

Settings with "(using default)" inherit from plugin settings. Click "Reset" to revert to plugin defaults.

## 🏗️ Project Structure

```
src/
├── index.ts                      # Plugin entry point
├── types/                        # Type definitions
│   ├── bases.ts                 # Bases API types
│   ├── kanban.ts                # Kanban data types
│   └── settings.ts              # Settings types
├── core/                        # Core business logic
│   ├── fileOperations.ts       # File CRUD operations
│   ├── propertyManager.ts      # Property read/write
│   └── cardManager.ts          # Card management
├── adapters/                    # Data transformation
│   └── basesToKanban.ts        # Bases → Kanban adapter
├── views/                       # Bases View implementation
│   └── kanbanBasesView.ts      # Kanban Bases View class
├── ui/                          # React components
│   ├── KanbanBoard.tsx         # Board container
│   ├── Column.tsx              # Column component
│   ├── Card.tsx                # Card component
│   ├── NewCardButton.tsx       # New card button
│   └── SettingsPanel.tsx       # Settings panel
└── settings/                    # Settings management
    ├── defaultSettings.ts
    └── settingsTab.ts
```

## 🔧 Development

### Build Commands

```bash
# Install dependencies
npm install

# Development build with watch mode
npm run dev

# Production build
npm run build

# Lint code
npm run lint

# Run tests (coming soon)
npm run test
```

### Tech Stack

- **Language**: TypeScript
- **UI Framework**: React 18
- **Drag & Drop**: @hello-pangea/dnd
- **Icons**: Lucide React
- **Build Tool**: Rollup
- **Code Quality**: ESLint, Prettier

### Architecture

The plugin follows a clean architecture pattern:

1. **Core Layer**: Business logic (file operations, property management)
2. **Adapter Layer**: Data transformation (Bases ↔ Kanban)
3. **View Layer**: Bases View implementation
4. **UI Layer**: React components
5. **Settings Layer**: Configuration management

### Data Flow

```
Bases Plugin (filtered files)
    ↓
basesToKanban Adapter (transform data)
    ↓
KanbanBoard React Component (render)
    ↓
User Interaction (drag, edit, create)
    ↓
cardManager (update files)
    ↓
Vault (save changes)
    ↓
Bases Plugin (notify update)
    ↓
Re-render
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Notion](https://www.notion.so/)'s Database Board View
- Built for [Obsidian](https://obsidian.md/)
- Uses [Bases Plugin](https://github.com/kkpan11/obsidian-bases) as a foundation

## 📬 Contact

**Author**: Chihiro Watanabe
**GitHub**: [@chi1180](https://github.com/chi1180/)

## 🐛 Issues & Feature Requests

If you encounter any issues or have feature requests, please file them in the [GitHub Issues](https://github.com/chi1180/ObsidianKanban/issues) section.

---

Made with ❤️ for the Obsidian community

## Release

```bash
git tag -a [version] -m "[version]"
git push origin [version]
```
