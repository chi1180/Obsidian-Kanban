# Obsidian Kanban View

A modern, drag-and-drop Kanban board plugin for [Obsidian](https://obsidian.md/), designed for productivity, project management, and seamless integration with your markdown notes.

## Features

- **Kanban Board View:** Visualize your tasks and notes as cards in columns.
- **Drag-and-Drop:** Move cards and columns intuitively using mouse or touch.
- **Customizable Card Size:** Choose between small, medium, or large cards.
- **Column Colors:** Optionally color columns for better organization.
- **Persistent Layout:** Board state and column order are saved automatically.
- **React-based UI:** Fast, interactive, and extensible interface.
- **Settings Panel:** Configure plugin and board options directly in Obsidian.
- **Markdown Integration:** Cards are linked to your markdown files, with properties synced via frontmatter.

## Installation

1. **Download or Clone:**
   Download this repository and place it in your Obsidian plugins folder.

2. **Install Dependencies:**
   Run `npm install` in the project directory.

3. **Build the Plugin:**
   Run `npm run build` to generate the production files.

4. **Enable in Obsidian:**
   Open Obsidian, go to Settings → Community Plugins, and enable "Kanban view".

## Usage

- Open the Kanban view from the "Bases" menu in Obsidian.
- Add, move, and edit cards and columns as needed.
- Card properties are synced with your markdown files' frontmatter.
- Customize card size and column color in the plugin settings.

## Development

- **Tech Stack:**
  - TypeScript, React, @dnd-kit for drag-and-drop, Obsidian API.
- **Scripts:**
  - `npm run dev` – Lint, build, and copy files for development.
  - `npm run build` – Production build.
  - `npm run watch` – Watch for changes and rebuild.
  - `npm run lint` – Lint TypeScript and JavaScript files.

---

**Author:** Chihiro Watanabe
[GitHub](https://github.com/chi1180/)
