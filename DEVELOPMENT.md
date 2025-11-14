# 🛠️ Development Guide

A guide for continuing development on this Shopping List app.

## Current Status ✅

### Completed (Phase 1-5)

- ✅ Backend server with Express + MongoDB
- ✅ User authentication (JWT + refresh tokens)
- ✅ User, List, and Item models
- ✅ All CRUD endpoints for lists and items
- ✅ React app with routing
- ✅ Auth pages (Login, Signup)
- ✅ Lists page (view, create, delete lists)
- ✅ List detail page (view, add, check off, delete items)
- ✅ Theme support (light/dark mode)
- ✅ Responsive mobile-first design

### What Works Right Now

1. Sign up / Login / Logout
2. Create multiple lists
3. Add items to lists
4. Check off items while shopping
5. Delete lists and items
6. Theme toggle (light/dark)
7. Responsive on mobile, tablet, desktop

---

## Next Steps (Phases 6-10)

### Phase 6: Store/Section Grouped View

**Goal**: Add a toggle to view items grouped by store → section

**Files to modify**:

- `frontend/src/pages/ListDetail.js`
  - Add view toggle button (Priority vs Store View)
  - Create `StoreGroupedView` component
- `frontend/src/api/items.js`
  - Already supports `?groupBy=store` query param

**Implementation**:

```javascript
// In ListDetail.js
const [viewMode, setViewMode] = useState("priority"); // or 'grouped'

// Fetch items with grouping
const { items, grouped } = await getItems(listId, { groupBy: "store" });

// Component structure:
<ViewToggle mode={viewMode} onChange={setViewMode} />;
{
  viewMode === "priority" ? (
    <ItemList items={items} />
  ) : (
    <StoreGroupedView grouped={grouped} />
  );
}
```

**Styling tips**:

- Use accordion/collapsible sections for stores
- Indent sections within stores
- Keep same checkbox/delete functionality

---

### Phase 7: Drag-and-Drop Reordering

**Goal**: Let users reorder items by dragging

**Install library**:

```bash
npm install react-beautiful-dnd
# OR
npm install @dnd-kit/core @dnd-kit/sortable
```

**Files to modify**:

- `frontend/src/pages/ListDetail.js`
- Create `frontend/src/components/items/DraggableItem.js`

**Implementation outline**:

```javascript
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const handleDragEnd = (result) => {
  if (!result.destination) return;

  const reordered = Array.from(items);
  const [moved] = reordered.splice(result.source.index, 1);
  reordered.splice(result.destination.index, 0, moved);

  // Update priorities and call backend
  reorderItems(reordered);
};

<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="items">
    {(provided) => (
      <div {...provided.droppableProps} ref={provided.innerRef}>
        {items.map((item, index) => (
          <Draggable key={item._id} draggableId={item._id} index={index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <ItemRow item={item} />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>;
```

**Backend note**: The `POST /api/items/reorder` endpoint is already implemented!

---

### Phase 8: Edit Items

**Goal**: Let users edit items after creation

**Files to modify**:

- `frontend/src/pages/ListDetail.js`
  - Add edit button to item rows
  - Open modal with pre-filled form
  - Use `updateItem()` from `useItems` hook

**Implementation**:

```javascript
const [editingItem, setEditingItem] = useState(null);

const handleEdit = (item) => {
  setEditingItem(item);
  setShowEditModal(true);
};

const handleUpdate = async (e) => {
  e.preventDefault();
  await updateItem(editingItem._id, editingItem);
  setShowEditModal(false);
};

// In item row:
<button onClick={() => handleEdit(item)}>✏️</button>;
```

---

### Phase 9: Polish & UX Improvements

#### A. Loading Skeletons

Replace "Loading..." text with skeleton loaders:

```javascript
// Create Skeleton.js component
const Skeleton = ({ width, height, rounded }) => (
  <div
    className="skeleton"
    style={{ width, height, borderRadius: rounded ? '50%' : '8px' }}
  />
);

// In CSS:
.skeleton {
  background: linear-gradient(90deg, var(--bg-secondary) 0%, var(--bg-tertiary) 50%, var(--bg-secondary) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

#### B. Toast Notifications

Already implemented with `react-hot-toast`! You can customize:

```javascript
// In any component:
toast.success("✓ Item added!", { duration: 2000 });
toast.error("❌ Failed to delete", { duration: 3000 });
toast.loading("Saving..."); // Can update later with toast.dismiss(id)
```

#### C. Animations

Add subtle animations:

```css
/* Page transitions */
.fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide up */
.slide-up {
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

#### D. Swipe Gestures (Mobile)

Install library:

```bash
npm install react-swipeable
```

```javascript
import { useSwipeable } from "react-swipeable";

const handlers = useSwipeable({
  onSwipedLeft: () => handleDelete(item._id),
  onSwipedRight: () => handleEdit(item),
});

<div {...handlers} className="item-row">
  {/* item content */}
</div>;
```

---

### Phase 10: Advanced Features (Optional)

#### A. Search & Filter

```javascript
const [searchQuery, setSearchQuery] = useState("");
const [filterSection, setFilterSection] = useState("all");

const filteredItems = items.filter((item) => {
  const matchesSearch = item.name
    .toLowerCase()
    .includes(searchQuery.toLowerCase());
  const matchesSection =
    filterSection === "all" || item.section === filterSection;
  return matchesSearch && matchesSection;
});
```

#### B. List Templates

```javascript
// Add to Lists.js
const templates = [
  { name: 'Weekly Groceries', items: ['Milk', 'Bread', 'Eggs', 'Butter'] },
  { name: 'Costco Run', store: 'Costco', items: [...] },
];

const createFromTemplate = async (template) => {
  const list = await addList(template);
  // Add all items
  for (const itemName of template.items) {
    await addItem(list._id, { name: itemName });
  }
};
```

#### C. Share Lists (Multi-user)

**Backend changes**:

- Add `POST /api/lists/:id/share` endpoint
- Accept email, add to `sharedWith` array
- Check permissions in item routes

**Frontend changes**:

- Add "Share" button in list detail header
- Modal to enter email and select role (editor/viewer)
- Show list of shared users

---

## File Organization Tips

### When to create new components:

**Create a new component when**:

- Code is reused in multiple places
- A piece of UI has complex logic
- File is getting too long (> 300 lines)

**Example components to extract**:

```
components/
├── common/
│   ├── Button.js         # Reusable button with variants
│   ├── Input.js          # Styled input component
│   ├── Modal.js          # Reusable modal wrapper
│   ├── Skeleton.js       # Loading skeleton
│   └── EmptyState.js     # Empty state with icon/text
├── lists/
│   ├── ListCard.js       # Single list card (extract from Lists.js)
│   ├── ListForm.js       # Create/edit list form
│   └── ListHeader.js     # List detail header
├── items/
│   ├── ItemRow.js        # Single item row
│   ├── ItemForm.js       # Add/edit item form
│   ├── ItemList.js       # List of items
│   ├── StoreGroupedView.js  # Grouped view
│   └── DraggableItem.js  # Draggable item wrapper
└── layout/
    ├── Header.js         # App header
    └── Layout.js         # Page wrapper
```

---

## Coding Patterns

### Custom Hook Pattern

When fetching data, create a custom hook:

```javascript
// hooks/useList.js
export const useList = (listId) => {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchList = async () => {
      const data = await listsAPI.getList(listId);
      setList(data.list);
      setLoading(false);
    };
    fetchList();
  }, [listId]);

  return { list, loading };
};
```

### API Error Handling

Wrap API calls in try-catch:

```javascript
try {
  const result = await someAPI.call();
  toast.success("Success!");
  return { success: true, data: result };
} catch (error) {
  const message = error.response?.data?.message || "Something went wrong";
  toast.error(message);
  return { success: false, error: message };
}
```

---

## Testing Checklist

Before considering a feature "done":

- [ ] Works on mobile (Chrome DevTools mobile view)
- [ ] Works on desktop
- [ ] Loading states shown
- [ ] Errors handled gracefully
- [ ] Success feedback shown (toast)
- [ ] No console errors
- [ ] Optimistic updates feel instant
- [ ] Network failures don't break UI
- [ ] Dark mode looks good
- [ ] Accessibility: can tab through with keyboard

---

## Deployment Checklist

When ready to deploy:

### Backend

1. Set NODE_ENV=production in hosting platform
2. Use strong, random JWT secrets
3. Whitelist production frontend URL in CORS
4. Set secure: true for cookies
5. Add rate limiting to auth endpoints
6. Enable MongoDB Atlas IP whitelist (or allow all)

### Frontend

1. Update REACT_APP_API_URL to production backend
2. Build: `npm run build`
3. Deploy `build/` folder to Netlify/Vercel
4. Test auth flow in production
5. Verify cookies work cross-origin

### Recommended Hosting

- **Backend**: Render, Railway, Heroku
- **Database**: MongoDB Atlas (free tier)
- **Frontend**: Netlify, Vercel (free tier)

---

## Git Workflow

```bash
# Feature branches
git checkout -b feature/drag-and-drop
# Make changes
git add .
git commit -m "feat: add drag-and-drop item reordering"
git push origin feature/drag-and-drop
# Merge to main when tested
```

### Commit message conventions:

- `feat:` new feature
- `fix:` bug fix
- `style:` UI/styling changes
- `refactor:` code restructure
- `docs:` documentation
- `chore:` maintenance

---

## Useful Commands

### Backend

```bash
npm run dev          # Start with nodemon
npm start            # Start without nodemon
```

### Frontend

```bash
npm start            # Development server
npm run build        # Production build
npm test             # Run tests
```

### Both

```bash
npm install          # Install dependencies
npm audit fix        # Fix security vulnerabilities
```

---

## Common Issues & Solutions

### "Cannot find module"

```bash
npm install
# or delete node_modules and reinstall:
rm -rf node_modules package-lock.json
npm install
```

### Backend not connecting to MongoDB

- Check `.env` file exists and has MONGO_URI
- Verify MongoDB Atlas cluster is running
- Check network access in Atlas (whitelist IP)

### CORS errors

- Make sure backend CORS allows frontend URL
- Check cookies withCredentials is true in axios

### Token expired immediately

- Check system time is correct
- Verify JWT_EXPIRE is set correctly
- Ensure refresh token logic works

---

## Resources

### Documentation

- [React Docs](https://react.dev)
- [Express Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Mongoose Docs](https://mongoosejs.com)

### Libraries Used

- [Axios](https://axios-http.com)
- [React Router](https://reactrouter.com)
- [React Hot Toast](https://react-hot-toast.com)
- [JWT](https://jwt.io)

---

## Need Help?

1. Check console for errors (F12 in browser)
2. Check backend logs in terminal
3. Review similar features in existing code
4. Read error messages carefully (they usually explain the issue!)

---

**Happy coding! 🚀**
