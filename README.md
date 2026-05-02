# Batch Rename Pro

> A zero-AI, fully offline layer renaming tool for Figma power users.

Rename dozens of layers in seconds using four powerful modes — Pattern, Find & Replace, Sequence, and Structure — with a live preview of every change before anything is applied.

![Batch Rename Pro icon](./icon.svg)

---

## Table of Contents

- [Installation](#installation)
- [How to Compile](#how-to-compile)
- [How to Use](#how-to-use)
- [Tab Reference](#tab-reference)
  - [Pattern Mode](#1-pattern-mode)
  - [Find & Replace Mode](#2-find--replace-mode)
  - [Sequence Mode](#3-sequence-mode)
  - [Structure Mode](#4-structure-mode)
- [Live Preview](#live-preview)
- [Apply & Safety Rules](#apply--safety-rules)
- [Author](#author)

---

## Installation

1. Clone or download this repository.
2. Install dependencies and compile (see below).
3. Open **Figma Desktop**.
4. Go to **Menu → Plugins → Development → Import plugin from manifest…**
5. Select `manifest.json` from this folder.
6. The plugin appears under **Plugins → Development → Batch Rename Pro**.

---

## How to Compile

The plugin backend is written in TypeScript. You must compile it to `code.js` before Figma can run it.

```bash
# Install dev dependencies
npm install

# Compile once
npm run build

# Watch mode — recompiles on every save
npm run watch
```

> Figma loads `code.js`, not `code.ts`. Always rebuild after editing the backend.

---

## How to Use

1. Select one or more layers in Figma (frames, groups, rectangles, text — any mix).
2. Open the plugin. The header shows how many layers are selected.
3. Pick a rename mode from the tab bar.
4. Fill in the fields. The **Preview** table updates live as you type.
5. Review the Before / After columns — blue = will change, amber = duplicate warning.
6. Click **Apply Rename** when satisfied.
7. The status bar at the bottom confirms how many layers were renamed.

---

## Tab Reference

### 1. Pattern Mode

Type a freeform pattern string using **tokens** that get substituted per layer.

| Token | Replaced with |
|-------|--------------|
| `{n}` | Auto-incrementing number starting at 1 |
| `{nn}` | Zero-padded number (01, 02, 03…) |
| `{name}` | The layer's original name |
| `{type}` | Figma node type in lowercase (`frame`, `text`, `rectangle`…) |
| `{parent}` | The direct parent layer's name |
| `{i}` | Zero-based index of the layer in the selection |

**Examples**

| Pattern | Layer | Result |
|---------|-------|--------|
| `btn/{type}/{nn}` | Rectangle (1st) | `btn/rectangle/01` |
| `btn/{type}/{nn}` | Text (2nd) | `btn/text/02` |
| `icon-{name}-{n}` | Star | `icon-Star-1` |
| `{parent}/{type}` | Text inside "Card" | `Card/text` |
| `item-{i}` | Any layer (3rd) | `item-2` |

---

### 2. Find & Replace Mode

Finds text inside existing layer names and replaces it — similar to a text editor's Find & Replace.

**Fields**

| Field | Description |
|-------|-------------|
| Find | Text or regex pattern to search for |
| Replace with | What to substitute in its place (leave blank to delete matches) |
| Use regular expression | Treat the Find field as a JavaScript regex |
| Case sensitive | Toggle case-sensitive matching |

**Examples — plain text**

| Find | Replace | Before | After |
|------|---------|--------|-------|
| `Button` | `btn` | `Button/Primary` | `btn/Primary` |
| ` copy` | _(blank)_ | `Rectangle copy` | `Rectangle` |

**Examples — regex**

| Find (regex) | Replace | Before | After |
|-------------|---------|--------|-------|
| `\d+` | `#` | `Card 12` | `Card #` |
| `^(frame)` | `section` | `frame-hero` | `section-hero` |
| `\s+` | `-` | `My Layer` | `My-Layer` |

> If the regex is invalid, a red **"Invalid regular expression"** message appears inline and no preview is shown.  
> If no layers match, the preview shows a **"No layers match"** warning.

---

### 3. Sequence Mode

Renames all selected layers with a sequential number, with full control over format.

**Fields**

| Field | Description |
|-------|-------------|
| Prefix | Text placed before the number |
| Suffix | Text placed after the number |
| Separator | Character between prefix and number: `-` `/` `_` space, or none |
| Start number | The number the sequence begins at (default: 1) |
| Pad zeros | Pads numbers to a consistent width (1 → 01, 10 → 10) |

**Examples**

| Prefix | Sep | Start | Pad | Result (3 layers) |
|--------|-----|-------|-----|-------------------|
| `card` | `-` | 1 | off | `card-1`, `card-2`, `card-3` |
| `card` | `-` | 3 | on | `card-03`, `card-04`, `card-05` |
| `slide` | `/` | 10 | off | `slide/10`, `slide/11`, `slide/12` |
| _(blank)_ | `-` | 1 | on | `01`, `02`, `03` |
| `hero` | _(none)_ | 1 | off | `hero1`, `hero2`, `hero3` |

---

### 4. Structure Mode

Renames selected layers to reflect their position in the Figma layer hierarchy. Useful for enforcing naming conventions in large design systems.

**Fields**

| Field | Description |
|-------|-------------|
| Max depth | How many ancestor levels to include in the path (1–4) |

**Naming logic**

- **Frames, Components, Component Sets** — keep their existing name unchanged.
- **All other layers** — renamed to `{parent}/{type}` (or deeper if max depth > 1).

**Examples (depth 2)**

```
Frame "Hero"              → Hero            (unchanged)
  ├─ Rectangle            → Hero/rectangle
  ├─ Text "Headline"      → Hero/text
  └─ Group "CTA"          → Hero/group
       └─ Rectangle       → Hero/rectangle
```

**Examples (depth 1)**

```
Frame "Card"              → Card            (unchanged)
  └─ Text "Label"         → text            (parent excluded)
```

---

## Live Preview

The preview table updates on **every keystroke** — no round trips to Figma.

| Row colour | Meaning |
|------------|---------|
| White | Name unchanged |
| **Blue** | Name will change |
| **Amber** | Resulting name is a duplicate of another layer in the batch |
| Greyed italic | Layer will be skipped (empty result) |

Hover any row to see the full name in a tooltip (useful when names are truncated).

---

## Apply & Safety Rules

- **Locked layers** are automatically skipped and counted separately in the result summary.
- **Empty results** are skipped — the Apply button stays disabled if no valid names exist.
- **Duplicate names** within the batch are automatically de-duplicated with a `-1`, `-2`… suffix applied server-side after you click Apply.
- **>50% identical names warning** — if more than half the renamed layers would share the same name, a confirmation dialog appears before anything is applied.

---

## Author

Built by **Emmanuel Asaber** — [emmanuelasaber@gmail.com](mailto:emmanuelasaber@gmail.com)

Part of a suite of Figma productivity plugins for design-system power users.
