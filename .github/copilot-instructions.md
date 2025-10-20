````instructions
# Mindmap Web Application - AI Coding Agent Instructions

## Project Overview
Interactive Canvas-based mindmap application using vanilla JavaScript and HTML5 Canvas API. No frameworks, no build process - pure browser-native code with modular architecture.

**Language**: Bilingual Korean/English UI with i18n support. Default Korean (`lang="ko"`), switchable via language toggle.

## Architecture & Data Flow

### Module System
Files are loaded via `<script>` tags in `index.html` in **dependency order**:
1. `polyfills.js` → `config.js` → `i18n.js` → `utils.js`
2. Core rendering: `canvas.js` → `nodes.js` → `connections.js`
3. Features: `events.js` → `ui.js` → `history.js` → `export.js` → `storage.js`
4. **Cloud & AI**: `supabase-config.js` → `auth.js` → `cloud-storage.js` → `ai-recommendations.js`
5. Bootstrap: `main.js` (calls `init()`, `initializeEvents()`, `initSupabase()`)

### Global State Pattern
All state lives in `config.js` as module-level variables:
- `nodes[]` and `connections[]` - core data structures, nodes now include `aiRecommendations[]`
- `history[]` and `historyIndex` - undo/redo stack (max 50 states)
- `camera`, `zoom`, `selectedNode`, `isDragging`, etc. - viewport and interaction state
- `currentNodeStyle` - shared style for new nodes
- **Cloud state**: `supabase`, `currentUser` - authentication and cloud sync

**Critical**: Functions mutate globals directly. No state management library. Use `saveState()` before mutations to enable undo.

### Canvas Coordinate System
Two coordinate spaces:
- **Screen coords**: Mouse events, UI positioning
- **World coords**: Node positions, connections
- Transform: `screenToWorld(x, y)` and `worldToScreen(x, y)` in `utils.js`
- Grid snapping: `snapToGrid` boolean + `snapToGridPoint()` for node alignment

### Node Rendering Pipeline
1. `drawCanvas()` orchestrates full render: grid → connections → nodes
2. `calculateNodeSize()` measures text with Canvas API, caches result in `nodeSizeCache` Map
3. Node shapes: `rectangle` (default), `circle`, `diamond` - drawn with different Canvas paths
4. **Invalidation**: Call `invalidateNodeCache(node)` when title/content/link changes

## Key Conventions

### Event Handling Pattern
Mouse interactions in `events.js`:
- **Double-click empty canvas**: Create node at world coordinates
- **Left-drag node**: Move with `isDragging` flag + `dragOffset`
- **Right-drag from node**: Draw connection line with `isRightDragging` + `connectingFromNode`
- **Middle-drag**: Pan canvas (update `camera` offset)
- **Wheel**: Zoom (multiply `zoom` by `CONFIG.zoomFactor`)

### Node AI Recommendations System
Each node can have `aiRecommendations[]` array with structure:
```javascript
node.aiRecommendations = [{
    title: string,
    url: string, 
    description: string,
    timestamp: number,
    read: boolean
}];
```
- Tavily API integration in `ai-recommendations.js`
- Domain filtering support via node `searchDomains` property
- Badge notification system (🔔) when recommendations available

### Cloud Storage & Authentication
**Supabase Integration Pattern**:
1. Always check `currentUser` before cloud operations
2. Use `saveToCloud()` instead of `saveMindmap()` for authenticated users
3. RLS (Row Level Security) ensures user data isolation
4. Fallback to localStorage when offline/unauthenticated

### Internationalization (i18n)
Text rendering pattern in `i18n.js`:
```javascript
// Use data-i18n attributes in HTML
<button data-i18n="action.addNode">Add Node</button>
// Or programmatically:
const text = getTranslation('modal.edit.title');
```
Language switching updates all `data-i18n` elements automatically.

### History System
Before any mutation:
```javascript
saveState(); // Deep clone nodes + connections to history[]
// ... modify nodes or connections ...
drawCanvas();
```
Managed in `history.js` with circular buffer (CONFIG.maxHistory = 50).

### XSS Prevention
**Always** use `escapeHtml()` from `utils.js` when:
- Rendering user input to DOM (e.g., file names in `storage.js`)
- Displaying node content in modals  
- AI recommendation titles/descriptions
- Canvas text is safe (Canvas API doesn't parse HTML)

### Input Validation
Use `validateInput()` from `utils.js` with options:
```javascript
const title = validateInput(input, {
    minLength: 1,
    maxLength: 100,
    allowSpecialChars: true,
    fieldName: 'Title'
});
```

## Critical Files

### Core Architecture
- **`config.js`**: Global state declaration - check here for variable names + CONFIG constants
- **`main.js`**: Initialization order - calls `initializeLanguage()`, `initSupabase()`, default nodes
- **`canvas.js`**: Core render loop - modify for visual changes, handles AI badge rendering
- **`nodes.js`**: Node sizing + shape drawing - complex text wrapping + AI recommendation badges
- **`events.js`**: Mouse interaction state machine - study for input handling, touch support

### Data Persistence
- **`storage.js`**: LocalStorage persistence - fallback when offline
- **`cloud-storage.js`**: Supabase cloud sync - primary storage for authenticated users, includes `saveToCloud()` and `saveAsToCloud()`
- **`auth.js`**: Email/OAuth authentication (Google, GitHub support)

### UI & Features
- **`ui.js`**: UI controls including `createNewPage()` for clearing canvas and starting fresh
- **`ai-recommendations.js`**: Tavily API integration, domain filtering, 436 lines
- **`i18n.js`**: Translation system - Korean/English support with `action.newPage`, `section.fileManagement`, `file.saveAs` keys
- **`supabase-config.js`**: Database connection + RLS setup, `updateAuthUI()` displays user email when logged in

## Development Workflow

### Running Locally
```powershell
# Windows PowerShell (default shell)
python -m http.server 8000
# Open http://localhost:8000
```
Or open `index.html` directly (file:// protocol supported).

**Note**: No build process required - pure browser-native code with zero dependencies except jsPDF CDN.

### Adding Features
1. Add function to appropriate module (e.g., new node shape → `nodes.js`)
2. If needs UI: Add button with `data-i18n` attribute, wire handler via `onclick`
3. Add translations to both `ko` and `en` objects in `i18n.js`
4. If mutates state: Wrap in `saveState()` call for undo support
5. For cloud features: Check `currentUser` and handle offline fallback
6. Test zoom/pan invariance - all world coords must go through transform

### Debugging Canvas
- Check `drawCanvas()` call order - connections before nodes (layering)
- Use `console.log` in `handleMouseDown()` to debug coordinates
- Cache issues? Call `clearNodeCache()` to force recalculation

## External Dependencies
- **jsPDF**: CDN loaded for PDF export functionality
- **Supabase**: CDN loaded (`@supabase/supabase-js@2`) for authentication + cloud storage
- **Tavily API**: External HTTP API for AI recommendations (requires user API key)
- **Canvas API polyfills**: `polyfills.js` adds `roundRect()` for older browsers

## Environment Setup
### API Keys (Optional Features)
- **Tavily AI**: User provides their own API key via settings modal (`localStorage`)
- **Supabase**: Configured in `supabase-config.js` (public anon key safe to commit)

### Database Schema (Supabase)
Table: `mindmaps` with RLS policies
```sql
CREATE TABLE mindmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Common Patterns

### UI Layout Structure
Sidebar organization (top to bottom):
1. **Header** - Language toggle, sidebar controls
2. **New Page Button** - Clears canvas with confirmation
3. **Quick Actions** - Add node, undo/redo, fit, snap
4. **Controls Section** - Collapsible mouse/touch instructions
5. **Node Style Section** - Color, shape selectors
6. **Export Section** - PNG/PDF export buttons
7. **File Management Section** - Save and Save As buttons (collapsible)
8. **AI Settings Button** - Opens modal for Tavily API configuration
9. **Recent Items** - Cloud mindmap list (when logged in)
10. **Auth Section** - Login button or email display + logout

### Adding Node Shapes  
1. Add option to `<select id="nodeShape">` in `index.html` with `data-i18n` attribute
2. Add translations to `i18n.js` for shape names
3. Implement draw logic in `drawNode()` switch statement (`nodes.js`)
4. Update `getConnectionPoint()` for connection anchoring (`connections.js`)

### File Save Operations
- **Save** (`saveToCloud()`): Prompts for filename, creates new cloud entry
- **Save As** (`saveAsToCloud()`): Always prompts for new filename, creates duplicate
- Both functions require authentication, fallback to prompt if not logged in

### New Page Workflow
`createNewPage()` in `ui.js`:
1. Confirms with user if nodes exist
2. Clears `nodes[]` and `connections[]` arrays
3. Resets `history[]` and camera position
4. Redraws canvas to show empty state

### AI Recommendation Workflow
1. Node editing modal includes optional `searchDomains` input field
2. On save, `refreshNodeAIRecommendations()` called if AI enabled
3. Badge (🔔) appears on nodes with unread recommendations
4. Click badge → `showRecommendationsModal()` → render links with delete buttons

### Cloud vs Local Storage Pattern
```javascript
// Always check authentication first
if (currentUser) {
    await saveToCloud(); // Supabase database
} else {
    saveMindmap(); // localStorage fallback
}
```

### Export Functions
`export.js` creates temporary canvas with content bounds calculation:
1. Find `minX/minY/maxX/maxY` from node positions
2. Render to temp canvas with offset (excludes AI badges from export)
3. PNG: `canvas.toDataURL()` → download link  
4. PDF: Use jsPDF A4 landscape with scaling

### UI State Management
Modal visibility: `style.display = 'flex'` (show) or `'none'` (hide)
Toggle sections: `toggleSection(id)` in `ui.js` manages expand/collapse state
Language switching: `updateLanguage()` scans all `data-i18n` attributes

## Mobile Support
**Fully responsive** with touch support implemented:

### Touch Events (`events.js`)
- **Touch start/move/end**: Full multi-touch handling with gesture detection
- **Pinch-to-zoom**: Two-finger zoom with `getTouchDistance()` and `getTouchCenter()`
- **Long press**: 500ms timeout for context menus (`longPressTimeout`)
- **Double-tap**: 400ms window detection for node creation/editing
- **Touch pan**: Single finger drag for camera movement

### Responsive UI (`css/style.css`, `ui.js`)
- **Breakpoint**: 1024px separates desktop/mobile layouts
- **Mobile sidebar**: Slide-in overlay with hamburger menu (`toggleMobileSidebar()`)
- **Touch targets**: Minimum 44px for all interactive elements
- **Quick Action Bar**: Repositioned for mobile with z-index layering
- **Viewport handling**: Proper iOS zoom prevention with `font-size: 16px` on inputs

### Mobile-Specific Patterns
```javascript
### Mobile-Specific Patterns
```javascript
// Gesture state management
let isPinching = false;
let touches = [];
let longPressTimeout = null;

// Performance optimization
function scheduleRender() {
    if (!renderScheduled) {
        renderScheduled = true;
        requestAnimationFrame(() => {
            drawCanvas();
            renderScheduled = false;
        });
    }
}
```

## Integration Points

### AI Recommendations Flow
1. **Trigger**: Node edit save → `refreshNodeAIRecommendations()` if `AI_CONFIG.enabled`
2. **API Call**: `getAIRecommendations()` → Tavily search with domain filtering
3. **Storage**: Results stored in `node.aiRecommendations[]` array
4. **UI Update**: Badge appears → `drawCanvas()` renders notification icon
5. **User Interaction**: Badge click → modal displays recommendation links

### Authentication State Changes
Supabase auth listener in `supabase-config.js` triggers:
- `SIGNED_IN` → `loadCloudMindmaps()` + show user section
- `SIGNED_OUT` → `clearMindmapList()` + show auth section
- UI updates via `updateAuthUI()` function

### Data Sync Strategy
- **Primary**: Cloud storage (Supabase) for authenticated users
- **Fallback**: localStorage for offline/guest users  
- **Migration**: No automatic sync between local ↔ cloud (by design)
- **Conflict Resolution**: Last-write-wins (no merge conflicts)

````
```
