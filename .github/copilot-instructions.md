````instructions
# Mindmap Web Application - AI Coding Agent Instructions

## Project Overview
Interactive Canvas-based mindmap application using vanilla JavaScript and HTML5 Canvas API. **Zero-build philosophy**: No npm, webpack, babel, or build tools. Pure ES6+ browser-native code with modular architecture.

**Language**: Bilingual Korean/English UI with i18n support. Default Korean (`lang="ko"`), switchable via language toggle button.

## Architecture & Data Flow

### Module System
Files are loaded via `<script>` tags in `index.html` in **strict dependency order**:
1. `polyfills.js` (early in `<head>`) → adds `roundRect()` for older browsers
2. `config.js` → `i18n.js` → `utils.js` → `canvas.js`
3. Core rendering: `nodes.js` → `connections.js`
4. Features: `events.js` → `ui.js` → `history.js` → `export.js` → `storage.js`
5. Bootstrap: `main.js` (calls `init()`, `initializeLanguage()`, `initializeDarkMode()`, `initializeEvents()`)

**External CDN**: jsPDF loaded in `<head>` for PDF export functionality.

### Global State Pattern
All state lives in `config.js` as module-level variables:
- `nodes[]` and `connections[]` - core data structures (plain objects)
- `history[]` and `historyIndex` - undo/redo stack (max 50 states via `CONFIG.maxHistory`)
- `camera`, `zoom`, `selectedNode`, `selectedNodes[]` - viewport and interaction state
- `isDragging`, `isRightDragging`, `isMiddleDragging`, `isSelecting` - mouse state flags
- `currentNodeStyle` - shared style for new nodes (`color`, `size`, `shape`)
- `currentMindmapId`, `currentMindmapName` - tracks currently loaded file

**Critical**: Functions mutate globals directly. No state management library. Always call `saveState()` **before** mutations to enable undo.


### Canvas Coordinate System
Two coordinate spaces managed by transform functions in `utils.js`:
- **Screen coords**: Raw mouse event coordinates relative to canvas bounding rect
- **World coords**: Actual node positions accounting for camera pan and zoom
- **Transform functions**: `screenToWorld(x, y)` and `worldToScreen(x, y)`
- **Grid snapping**: `snapToGrid` boolean toggles grid alignment; `snapToGridPoint(x, y)` returns nearest grid intersection (20px grid via `CONFIG.gridSize`)

**Critical**: Node positions MUST use world coords. Never use raw `e.clientX/Y` directly.

### Node Structure & Rendering Pipeline
Node object structure:
```javascript
{
    id: string,        // unique identifier
    x: number,         // world coordinates
    y: number,
    title: string,
    content: string,
    width: number,     // calculated by rendering
    height: number,
    color: string,     // background color (#ffffff)
    textColor: string, // text color (#333333 or auto-computed)
    shape: string,     // 'rectangle' | 'circle' | 'diamond'
    link: string,      // optional URL
    link2: string,     // optional second URL
    linkIconBounds: object, // click bounds for link icon
    link2IconBounds: object
}
```

Rendering pipeline in `canvas.js` → `nodes.js`:
1. `drawCanvas()` orchestrates: clear → grid → connections → nodes → selection box
2. `calculateNodeSize()` measures text using Canvas API, returns `{width, height}`
3. Size results cached in `nodeSizeCache` Map with key: `${id}_${title}_${content}_${link}_${shape}`
4. **Invalidation**: Call `invalidateNodeCache(node)` when title/content/link/shape changes
5. Node shapes drawn via Canvas path API: `roundRect()` for rectangles, `arc()` for circles, custom path for diamonds

## Key Conventions

### Multi-Selection System
Desktop interactions:
- **Shift + drag** on empty space: Box selection (sets `isSelecting = true`)
- **Ctrl/Cmd + click** on node: Toggle individual node selection
- **Ctrl + A**: Select all nodes
- **Esc**: Clear selection

Mobile interactions:
- **Two-finger drag** on empty space: Box selection
- **Tap node** in multi-select mode: Toggle selection
- Selection mode button in UI toggles `isMultiSelectMode`

Selected nodes stored in `selectedNodes[]` array. Context menu adapts text (e.g., "Delete 3 nodes").

### Event Handling Pattern
Mouse interactions in `events.js`:
- **Double-click empty canvas**: Create node at world coordinates via `handleDoubleClick()`
- **Double-click node**: Open edit modal via `openEditModal()`
- **Left-drag node**: Move with `isDragging = true` + `dragOffset` calculation
- **Right-drag from node**: Connection line drawing with `isRightDragging` + `connectingFromNode`
- **Middle-drag** (or wheel-click): Pan canvas by updating `camera.x/y`
- **Wheel scroll**: Zoom with `zoom *= CONFIG.zoomFactor` (clamped by `CONFIG.minZoom/maxZoom`)
- **Right-click node**: Show context menu with edit/delete options

Touch events mirror desktop with gesture detection:
- **Long press** (500ms via `longPressTimeout`): Equivalent to right-click for connections
- **Double-tap**: Node creation/editing with 400ms window detection
- **Pinch-to-zoom**: Two-finger zoom via `getTouchDistance()` and `getTouchCenter()`

### Dark Mode System
Theme state managed in `ui.js`:
- `localStorage.getItem('theme')` persistence (values: `'dark'` or `'light'`)
- `document.documentElement.setAttribute('data-theme', theme)` applies CSS variables
- CSS custom properties in `css/style.css`: `--bg-color`, `--text-color`, `--node-bg`, etc.
- Node rendering adapts: dark mode auto-adjusts text color for contrast
- Theme icon toggles: 🌙 (light mode) ↔ ☀️ (dark mode)


### Internationalization (i18n)
Bilingual system in `i18n.js` with Korean (default) and English:
```javascript
// HTML: Use data-i18n attributes
<button data-i18n="action.addNode">Add Node (Random)</button>
// JavaScript: Get translated text
const text = getTranslation('modal.edit.title');
```
- `translations` object has nested keys: `translations.ko['modal.edit.title']` = `'노드 편집'`
- `currentLanguage` stored in localStorage, defaults to `'ko'`
- `updateLanguage()` scans all `[data-i18n]` elements and updates `textContent`
- Language toggle button shows opposite language code: displays "EN" when Korean active
- **Required**: Add BOTH `ko` and `en` entries when adding new UI text

### LocalStorage Persistence  
File management in `storage.js` using browser localStorage:
- **Save pattern**: `saveMindmap()` prompts for name, stores as `mindmap_${id}` with JSON.stringify
- **Load pattern**: `loadMindmap(id)` retrieves, parses JSON, restores to global `nodes[]` and `connections[]`
- **Recent files**: Stored in `mindmap_recent_files` array (max 10 via `MAX_RECENT_FILES`)
- **File metadata**: Each recent file entry has `{id, name, timestamp, favorite: boolean}`
- **Favorites**: Star icon toggle, affects sort order in sidebar (favorites first)
- **Delete**: `deleteMindmap(id)` removes from localStorage and updates recent list

**No cloud sync** - all data client-side only.

### History System
Undo/redo managed in `history.js`:
```javascript
saveState(); // Deep clone nodes + connections to history[]
// ... mutate nodes or connections ...
drawCanvas();
```
- Circular buffer with `CONFIG.maxHistory = 50` limit
- `historyIndex` tracks current position in stack
- `undo()` and `redo()` restore entire state from history array
- **State capture**: Uses `JSON.parse(JSON.stringify(obj))` for deep clone
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y or Ctrl+Shift+Z (redo)

### Security: XSS Prevention
**Always** use `escapeHtml()` from `utils.js` when rendering user input to DOM:
```javascript
const escapedName = escapeHtml(file.name); // Converts < to &lt; etc.
container.innerHTML = `<div>${escapedName}</div>`;
```
Required for:
- File names in `renderRecentFiles()` (storage.js)
- Node titles/content in modals
- Any `innerHTML` assignment with user data
- Canvas text is safe (Canvas API doesn't parse HTML)

### Input Validation
Use `validateInput()` from `utils.js` with validation options:
```javascript
const title = validateInput(inputElement.value, {
    minLength: 1,
    maxLength: 100,
    allowSpecialChars: true,
    fieldName: 'Title'  // for error messages
});
// Returns trimmed string or throws ValidationError
```


## Critical Files

### Core Architecture
- **`config.js`** (100 lines): Global state declaration - all variables (`nodes[]`, `camera`, `zoom`, etc.) + `CONFIG` constants
- **`main.js`** (103 lines): Application bootstrap - calls `init()`, creates default 3 welcome nodes, wires up event listeners
- **`canvas.js`**: Core render loop `drawCanvas()` - orchestrates grid/connections/nodes drawing order
- **`nodes.js`** (539 lines): Node sizing with text wrapping, shape drawing (rectangle/circle/diamond), size caching via `nodeSizeCache` Map
- **`events.js`** (861 lines): Mouse/touch state machine - complex multi-select, pinch-zoom, long-press gesture handling

### Data & UI
- **`storage.js`** (319 lines): LocalStorage CRUD - `saveMindmap()`, `loadMindmap()`, recent files list rendering, favorites system
- **`ui.js`** (513 lines): UI controls - `createNewPage()`, `toggleDarkMode()`, context menus, modal management, sidebar collapse
- **`i18n.js`** (432 lines): Translation dictionaries (`ko`/`en` objects), `updateLanguage()` function, default node text per language
- **`connections.js`**: Connection line rendering, hit detection for delete, `getConnectionPoint()` for shape-specific anchoring
- **`utils.js`**: Shared utilities - `screenToWorld()`, `worldToScreen()`, `escapeHtml()`, `validateInput()`, `snapToGridPoint()`

### Features
- **`history.js`**: Undo/redo stack implementation with `saveState()`, `undo()`, `redo()`
- **`export.js`**: PNG/PDF export via temporary canvas, content bounds calculation, jsPDF integration for A4 landscape
- **`polyfills.js`**: `CanvasRenderingContext2D.prototype.roundRect` polyfill for older browsers

## Development Workflow

### Running Locally
```powershell
# Windows PowerShell (user's default shell)
python -m http.server 8000
# Open http://localhost:8000
```
Or open `index.html` directly - file:// protocol supported.

**Zero-Build Philosophy**: No npm, no webpack, no babel. Pure ES6+ that runs in modern browsers.
- Add features by editing `.js` files directly
- Test by refreshing browser (F5)
- Load external libraries via CDN `<script>` tags only
- No package.json, no build step, no transpilation


### Adding Features
1. Add function to appropriate module (e.g., new node shape → `nodes.js`)
2. If needs UI: Add button with `data-i18n` attribute in `index.html`, wire handler via `onclick`
3. Add translations to **both** `ko` and `en` objects in `i18n.js` (bilingual requirement)
4. If mutates state: Wrap in `saveState()` call for undo support
5. Test zoom/pan invariance - all world coords must transform via `screenToWorld()`/`worldToScreen()`
6. Update `index.html` script load order if adding new module with dependencies

### Debugging Canvas
- Check `drawCanvas()` call order - connections drawn before nodes (layering)
- Coordinate bugs? Always use `screenToWorld()` - never raw `e.clientX/Y` for node positions
- Cache issues? Call `invalidateNodeCache(node)` when changing title/content/link/shape
- Performance? Inspect `nodeSizeCache` Map - prevents redundant text measurements
- Use `console.log` in `handleMouseDown()` to debug click detection

## External Dependencies
- **jsPDF** (CDN): PDF export - loaded from `cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`
- **Canvas API polyfill**: `polyfills.js` adds `roundRect()` for older browsers

**No other dependencies** - pure browser APIs (Canvas, localStorage, Fetch).

## Common Gotchas & Pitfalls

### State Mutation Without History
❌ **Wrong**: Directly mutate `nodes[]` or `connections[]`
```javascript
nodes.push(newNode); // Undo won't work!
drawCanvas();
```
✅ **Correct**: Always call `saveState()` first
```javascript
saveState(); // Snapshot current state
nodes.push(newNode);
drawCanvas();
```

### Coordinate Space Confusion
❌ **Wrong**: Use mouse event coordinates directly
```javascript
node.x = e.clientX; // Wrong coordinate space!
```
✅ **Correct**: Transform to world coordinates
```javascript
const rect = canvas.getBoundingClientRect();
const screenX = e.clientX - rect.left;
const screenY = e.clientY - rect.top;
const worldCoords = screenToWorld(screenX, screenY);
node.x = worldCoords.x;
```

### Missing i18n Translation
❌ **Wrong**: Hardcode text in one language
```javascript
button.textContent = 'Save'; // English only!
```
✅ **Correct**: Use `data-i18n` + add both languages
```html
<button data-i18n="file.save">Save</button>
```
```javascript
// In i18n.js translations object
ko: { 'file.save': '저장' },
en: { 'file.save': 'Save' }
```

### Node Cache Invalidation
When changing node properties, **must** invalidate cache:
```javascript
node.title = newTitle;
invalidateNodeCache(node); // Critical! Or text won't resize
drawCanvas();
```

### Module Load Order
Scripts in `index.html` **must** maintain dependency order:
- ❌ Load `nodes.js` before `config.js` → `nodes` array undefined error
- ✅ Load order: `config.js` → `i18n.js` → `utils.js` → `canvas.js` → `nodes.js` → ...

## Common Patterns

### UI Layout Structure
Sidebar sections (top to bottom in `index.html`):
1. **Header** - Language toggle (EN/KO), dark mode (🌙/☀️), sidebar collapse
2. **New Page Button** - Clears canvas with confirmation via `createNewPage()`
3. **Quick Actions** - Add node (random position), undo/redo, fit to screen, toggle grid snap
4. **Controls Section** - Collapsible mouse/touch instructions (desktop vs mobile)
5. **Node Style Section** - Color picker, shape selector (rectangle/circle/diamond)
6. **Export Section** - PNG/PDF export buttons
7. **File Management Section** - Save/Load to localStorage (collapsible)
8. **Recent Items** - Recent files list with star favorites, delete buttons

### Adding Node Shapes  
Example: Adding triangle shape
1. Add `<option value="triangle" data-i18n="style.shape.triangle">삼각형</option>` to `#nodeShape` select in `index.html`
2. Add translations: `'style.shape.triangle': '삼각형'` (ko) and `'Triangle'` (en) in `i18n.js`
3. Implement `case 'triangle':` in `drawNode()` switch statement in `nodes.js` with Canvas path
4. Update `getConnectionPoint()` in `connections.js` for proper edge anchoring geometry

### File Operations
- **Save**: `saveMindmap()` prompts for name, stores JSON as `mindmap_${uuid}` in localStorage
- **Load**: Click recent file → `loadMindmap(id)` parses JSON, overwrites `nodes[]`/`connections[]`, calls `drawCanvas()`
- **Delete**: Trash icon → `deleteMindmap(id)` removes from localStorage + recent files array
- **Favorite**: Star icon → toggles `file.favorite` boolean, affects sort order

### New Page Workflow
`createNewPage()` in `ui.js`:
1. If `nodes.length > 0`: Shows confirm dialog (Korean: "새 페이지를 시작하시겠습니까?")
2. Clears `nodes = []` and `connections = []`
3. Resets `history = []`, `historyIndex = -1`
4. Resets camera `{x: 0, y: 0}` and `zoom = 1`
5. Clears `currentMindmapId` and `currentMindmapName`
6. Calls `drawCanvas()` to show empty grid

### Export Functions
`export.js` creates temporary canvas for export:
1. Calculate bounds: Find `minX/minY/maxX/maxY` from all node positions
2. Create temp canvas sized to content with padding
3. Render nodes/connections to temp canvas (same rendering pipeline)
4. **PNG**: `tempCanvas.toDataURL('image/png')` → create download link with `<a download="mindmap.png">`
5. **PDF**: Use jsPDF library, A4 landscape orientation, scale content to fit page

### UI State Management
- **Modals**: Toggle `style.display = 'flex'` (visible) or `'none'` (hidden)
- **Collapsible sections**: `toggleSection(id)` in `ui.js` toggles `section-collapsed` class
- **Sidebar**: `toggleSidebar()` manages `sidebar-collapsed` class on body
- **Mobile menu**: `toggleMobileSidebar()` shows/hides overlay sidebar on mobile
- **Language**: `toggleLanguage()` switches `currentLanguage`, updates all `[data-i18n]` elements

## Mobile Support
**Fully responsive** with dedicated touch event handling:

### Touch Events (`events.js`)
Gesture detection with state tracking:
- **Pinch zoom**: `getTouchDistance()` compares two-finger spacing, `getTouchCenter()` finds midpoint
- **Long press**: `longPressTimeout` starts on `touchstart`, clears on move/end, triggers at 500ms
- **Double-tap**: Tracks `lastTap` timestamp, creates node if < 400ms between taps
- **Touch drag**: Differentiates node drag vs canvas pan based on what's under finger
- **Two-finger drag**: Box selection when `touches.length === 2` and not pinching

### Responsive UI
CSS breakpoints and mobile adaptations:
- **Breakpoint**: 1024px (`@media (max-width: 1024px)`) switches to mobile layout
- **Sidebar**: Changes from fixed to overlay with slide-in animation
- **Hamburger menu**: Three-line icon (`.mobile-menu-toggle`) appears on mobile
- **Touch targets**: All buttons minimum 44px tap target
- **Viewport meta**: Prevents iOS zoom with proper font sizes (16px on inputs)

## Integration Points

### localStorage Keys
- `mindmap_recent_files`: Array of `{id, name, timestamp, favorite}` objects
- `mindmap_${uuid}`: Each saved mindmap as JSON string `{nodes[], connections[]}`
- `language`: Current UI language ('ko' or 'en')
- `theme`: Current theme ('dark' or 'light')
- `snapToGrid`: Boolean for grid snapping preference

### Event Flow Examples
**Creating a node**:
1. User double-clicks empty canvas → `handleDoubleClick()` in `events.js`
2. Check no node at position → `openEditModal()` with empty fields
3. User fills title/content → form submit → `saveNodeFromModal()`
4. Calls `saveState()` for undo → creates node object → `nodes.push(newNode)`
5. `invalidateNodeCache()` not needed (new node) → `drawCanvas()` renders
6. Modal closes via `closeEditModal()`

**Undo operation**:
1. User presses Ctrl+Z → `handleKeyDown()` in `events.js`
2. Calls `undo()` in `history.js`
3. Decrements `historyIndex`, retrieves previous state from `history[]`
4. Deep clones state into `nodes[]` and `connections[]`
5. `drawCanvas()` reflects previous state
6. `clearNodeCache()` to force recalculation of all nodes
```
