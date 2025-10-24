# UNO Delivery - Architecture Guide

## 📁 Project Structure

```
uno-delivery/
├── app/                    # Expo Router pages (file-based routing)
│   └── (main)/            # Main authenticated routes
│       ├── index.jsx      # Home dispatcher
│       ├── feed.jsx       # Social feed page
│       ├── profile.jsx    # Profile page
│       ├── client/        # Client-specific routes
│       ├── business/      # Business-specific routes
│       └── delivery/      # Delivery driver routes
│
├── modules/               # Feature modules (domain-driven)
│   ├── social/           # Social commerce features
│   ├── commerce/         # E-commerce features
│   ├── analytics/        # Analytics & dashboard
│   ├── delivery/         # Delivery driver features
│   └── home/            # Home screens per user type
│
├── core/                 # Core business logic (auth, etc.)
├── shared/              # Shared/reusable code
└── docs/                # Documentation
```

## 🎯 File Naming Conventions

### **CRITICAL: Always follow these patterns**

#### Screens & Views
```
modules/[domain]/[feature]/
├── index.jsx                    # Main screen (ALWAYS named index.jsx)
├── [feature]-detail.jsx         # Detail view (e.g., product-detail.jsx)
├── [feature]-profile.jsx        # Profile view (e.g., business-profile.jsx)
├── [feature]-viewer.jsx         # Full-screen viewer (e.g., video-viewer.jsx)
└── components/                  # Sub-components
    ├── [feature]-card.jsx       # Card component
    ├── [feature]-list.jsx       # List component
    └── [feature]-header.jsx     # Header component
```

**Examples from codebase:**
- ✅ `modules/social/feed/index.jsx` - Main feed screen
- ✅ `modules/social/stories/story-viewer.jsx` - Story viewer modal
- ✅ `modules/commerce/products/product-detail.jsx` - Product detail page
- ✅ `modules/commerce/businesses/business-profile.jsx` - Business profile page
- ❌ `modules/social/favorites/favorites-screen.jsx` - WRONG! Should be index.jsx

#### Hooks
```
modules/[domain]/hooks/
├── use-[resources].js           # Data fetching (plural: use-products.js)
├── use-create-[resource].js     # Create mutation
├── use-update-[resource].js     # Update mutation
├── use-delete-[resource].js     # Delete mutation
└── index.js                     # Export all hooks
```

**Examples:**
- ✅ `use-products.js` - Fetches multiple products
- ✅ `use-create-product.js` - Creates a product
- ✅ `use-stories.js` - Fetches stories
- ❌ `useProducts.js` - WRONG! Use kebab-case, not camelCase

#### Components
```
components/
└── [name]-[type].jsx            # Always kebab-case
```

**Examples:**
- ✅ `product-card.jsx`
- ✅ `story-ring.jsx`
- ✅ `post-card.jsx`
- ❌ `ProductCard.jsx` - WRONG! Use kebab-case
- ❌ `product_card.jsx` - WRONG! Use hyphens, not underscores

## 🎨 Styling Guidelines

### **From CLAUDE.md - ALWAYS FOLLOW:**

1. **Use NativeWind First**
   ```jsx
   // ✅ CORRECT - Use className with Tailwind
   <View className="flex-1 bg-white px-4 py-2">
     <Text className="text-lg font-bold text-gray-900">Title</Text>
   </View>

   // ❌ WRONG - Don't use StyleSheet unless absolutely necessary
   <View style={{ flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 16 }}>
     <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>Title</Text>
   </View>
   ```

2. **Only use StyleSheet when NativeWind won't work:**
   - Complex animations
   - Dynamic computed styles
   - Circular shapes that need exact borderRadius
   - Platform-specific styles that can't be expressed in Tailwind

3. **Forms must use focus manager**
   ```jsx
   import { useFocusManager } from '../../../shared/hooks';

   const { createFieldProps } = useFocusManager();

   <Input {...createFieldProps('email')} />
   ```

## 🏗️ Module Organization

### Domain Structure
Each domain is self-contained:

```
modules/[domain]/
├── [feature-1]/
│   ├── index.jsx              # Main screen
│   ├── components/            # Feature components
│   └── [feature-1]-detail.jsx # Detail view
├── [feature-2]/
│   └── index.jsx
├── hooks/                     # Domain hooks
│   ├── use-[resources].js
│   └── index.js
└── utils/                     # Domain utilities
```

**Example - Social Domain:**
```
modules/social/
├── feed/
│   ├── index.jsx              # FeedScreen
│   └── components/
│       ├── post-card.jsx
│       └── story-ring.jsx
├── stories/
│   └── story-viewer.jsx       # StoryViewer modal
├── videos/
│   ├── video-viewer.jsx       # VideoViewer modal
│   └── video-screen.jsx
├── favorites/
│   └── index.jsx              # FavoritesScreen
└── hooks/
    ├── use-posts.js
    ├── use-stories.js
    ├── use-videos.js
    └── index.js
```

## 🔀 Routing Pattern

**Keep route files minimal - they're just wrappers:**

```jsx
// app/(main)/client/favorites.jsx
import FavoritesScreen from '../../../modules/social/favorites';

export default function FavoritesPage() {
  return <FavoritesScreen />;
}
```

**Logic lives in modules, not in app/:**
- ❌ Don't put business logic in route files
- ✅ Route files only handle routing concerns
- ✅ All UI and logic in modules/

## 📋 Checklist Before Creating New Files

Before creating any new file, verify:

- [ ] Is the file name in **kebab-case**? (my-component.jsx)
- [ ] If it's a main screen, is it named **index.jsx**?
- [ ] If it's a detail/profile/viewer, does it have the right suffix?
- [ ] Am I using **className** (NativeWind) instead of StyleSheet?
- [ ] Are forms using the **focus manager** from shared/hooks?
- [ ] Is the file in the correct **domain module**?
- [ ] Are hooks named with **use-** prefix?
- [ ] Did I export hooks from the domain's **hooks/index.js**?

## 🚫 Common Mistakes to Avoid

1. ❌ **Naming main screens with suffixes**
   - Wrong: `favorites-screen.jsx`
   - Right: `index.jsx`

2. ❌ **Using StyleSheet instead of NativeWind**
   - Wrong: `style={{ fontSize: 18, color: '#000' }}`
   - Right: `className="text-lg text-black"`

3. ❌ **PascalCase for file names**
   - Wrong: `ProductCard.jsx`
   - Right: `product-card.jsx`

4. ❌ **Putting logic in route files**
   - Wrong: Complex components in `app/(main)/client/favorites.jsx`
   - Right: Import from `modules/social/favorites/index.jsx`

5. ❌ **Not using focus manager in forms**
   - Wrong: Manual onFocus/onBlur handling
   - Right: `createFieldProps()` from useFocusManager

## 🔍 How to Verify Patterns

**Before committing, check existing code:**

```bash
# Check naming patterns in a domain
ls modules/social/*/

# Check how existing screens are named
find modules -name "index.jsx"

# Check styling patterns
grep -r "className=" modules/social/feed/ | head -5
```

## 📚 Reference Examples

**Good examples to copy from:**
- `modules/social/feed/index.jsx` - Screen structure
- `modules/social/feed/components/post-card.jsx` - NativeWind usage
- `modules/home/client-home/index.jsx` - Complex screen with modals
- `core/auth/hooks/login/use-login.js` - Hook structure

## 🎯 When in Doubt

**Always check existing code first:**
1. Look for similar features in the codebase
2. Check how it's named and structured
3. Copy the pattern exactly
4. When uncertain, ask before creating

---

**Last Updated:** 2025-10-23
**By:** Architecture Team
