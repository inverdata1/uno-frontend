# UNO Delivery - Project Structure

This document defines the standard folder structure and organization rules for the UNO Delivery codebase.

## Table of Contents
- [Overview](#overview)
- [Root Structure](#root-structure)
- [Features Organization](#features-organization)
- [Shared Code Organization](#shared-code-organization)
- [File Naming Conventions](#file-naming-conventions)
- [Import Rules](#import-rules)

---

## Overview

The codebase follows a **feature-based architecture** with clear separation between:
- **Features**: User-type specific functionality (client, business, driver, social)
- **Shared**: Reusable code across all features
- **Auth**: Authentication infrastructure (special case at root level)

**Key Principle**: Features should be independent and communicate through shared interfaces.

---

## Root Structure

```
uno-delivery/
├── app/                    # Expo Router - Application routing
├── auth/                   # Authentication infrastructure (special case)
├── features/               # Feature modules by user type
├── shared/                 # Shared code across all features
├── docs/                   # Documentation
├── assets/                 # Root-level assets (app icon, splash, etc.)
├── package.json
└── app.json
```

### Why Auth is at Root Level?
Auth is **infrastructure**, not a feature. It's used everywhere and doesn't belong to any specific user type. Keep it separate for clarity.

---

## Features Organization

### Standard Feature Structure

Every feature MUST follow this structure:

```
features/{role}/{feature}/
├── index.jsx              # Main screen component (entry point)
├── components/            # Feature-specific UI components
│   ├── component-name.jsx
│   └── another-component.jsx
├── hooks/                 # Feature-specific hooks (optional)
│   ├── index.js          # Re-exports all hooks
│   └── use-feature-data.js
├── services/              # Feature-specific business logic (optional)
│   └── feature-service.js
└── utils/                 # Feature-specific utilities (optional)
    └── helper-functions.js
```

### Rules for Features

1. **Main Component**: Always `index.jsx` - this is the screen entry point
2. **Components Folder**: ALL other UI components go in `components/`
3. **No Standalone Components**: Never have `.jsx` files at feature root (except index.jsx)
4. **Optional Folders**: Only create `hooks/`, `services/`, `utils/` if you actually need them
5. **No Cross-Feature Imports**: Features MUST NOT import from other features

### Examples

#### Good Structure
```
features/client/home/
├── index.jsx
└── components/
    ├── offer-banner.jsx
    ├── product-card.jsx
    └── category-section.jsx
```

#### Bad Structure
```
features/client/home/
├── index.jsx
├── offer-banner.jsx        # ❌ Component not in components/
└── product-card.jsx         # ❌ Component not in components/
```

---

## Shared Code Organization

### Shared Structure

```
shared/
├── api/                   # Firebase/Backend API layer
│   ├── base-firebase-service.js
│   ├── firebase-client.js
│   └── {resource}/        # Resource folders (addresses, posts, etc.)
│       ├── collection.js
│       ├── resource.js
│       └── seeder.js
├── components/            # Shared UI components
│   ├── ui/               # Base UI (Button, Card, Text, etc.)
│   ├── layout/           # Layout components (Header, etc.)
│   ├── forms/            # Form components
│   └── modals/           # Modal/overlay components
├── hooks/                # Shared React Query hooks
│   ├── index.js          # Re-exports ALL hooks
│   ├── query-config.js   # Query configuration constants
│   ├── auth/             # Auth-related hooks
│   ├── data/             # Data fetching hooks
│   ├── ui/               # UI/form hooks
│   └── services/         # Service integration hooks
├── config/               # Configuration files
│   ├── api-client.js
│   ├── theme.js
│   └── user-types.js
├── services/             # Shared services
│   └── media-upload.js
├── stores/               # Global state (Zustand)
│   └── *-store.js
├── utils/                # Utility functions
│   ├── colors.js
│   └── cn.js
├── schemas/              # Validation schemas (Zod)
└── assets/               # Shared assets
```

### Shared Hooks Categorization

**Location**: `shared/hooks/`

Hooks MUST be categorized by purpose:

#### 1. Auth Hooks (`shared/hooks/auth/`)
Hooks related to authentication and user type management.
- `use-user-type.js` - User type switching and context
- Example: `useCurrentUserType()`, `useSwitchUserType()`

#### 2. Data Hooks (`shared/hooks/data/`)
Hooks for fetching and mutating data from API.
- `use-addresses.js` - Address CRUD
- `use-categories.js` - Categories list
- `use-products.js` - Products data
- `use-posts.js` - Posts/feed data
- `use-stories.js` - Stories data
- `use-videos.js` - Videos data
- Example: `useCategories()`, `useProducts()`

#### 3. UI Hooks (`shared/hooks/ui/`)
Hooks for UI interactions and form management.
- `use-focus-manager.js` - Form focus management
- Example: `useFocusManager()`

#### 4. Service Hooks (`shared/hooks/services/`)
Hooks integrating with external services.
- `use-media-upload.js` - Media upload to Firebase Storage
- Example: `useMediaUpload()`

### Shared Components Categorization

#### 1. UI Components (`shared/components/ui/`)
Base, reusable UI primitives.
- `button.jsx`, `card.jsx`, `text.jsx`, `input.jsx`
- NO business logic, pure presentation

#### 2. Layout Components (`shared/components/layout/`)
Layout-specific components used across screens.
- `adaptive-header.jsx`
- `mode-switcher/`

#### 3. Form Components (`shared/components/forms/`)
Reusable form components.
- `address-form.jsx`

#### 4. Modal Components (`shared/components/modals/`)
Overlays, bottom sheets, modals.
- `address-bottom-sheet.jsx`

---

## File Naming Conventions

### General Rules
- **Kebab-case** for all files: `product-card.jsx`, `use-categories.js`
- **PascalCase** for component names: `ProductCard`, `CategorySection`
- **camelCase** for hooks: `useCategories`, `useProducts`

### Component Files
```
component-name.jsx           # React component
```

### Hook Files
```
use-hook-name.js             # Custom hook
```

### Service Files
```
service-name.js              # Service file
```

### Store Files
```
feature-name-store.js        # Zustand store
```

### Utility Files
```
util-name.js                 # Utility functions
```

---

## Import Rules

### Rule 1: No Cross-Feature Imports
Features MUST NOT import from other features.

```javascript
// ❌ BAD - Importing from another feature
import StoryViewer from '../../social/stories/components/story-viewer';

// ✅ GOOD - Use shared component
import StoryViewer from '../../../shared/components/viewers/story-viewer';
```

### Rule 2: Relative Imports (No Aliases)
Since we don't have TypeScript path aliases, use relative imports:

```javascript
// ✅ From feature to shared
import { apiClient } from '../../../shared/config/api-client';
import { useCategories } from '../../../shared/hooks/data/use-categories';

// ✅ Within same feature
import { ProductCard } from './components/product-card';

// ✅ From shared to shared
import { apiClient } from '../config/api-client';
```

### Rule 3: Use Index Files for Clean Exports
Every folder with multiple files should have an `index.js`:

```javascript
// shared/hooks/data/index.js
export * from './use-addresses';
export * from './use-categories';
export * from './use-products';

// Then import like this:
import { useCategories, useProducts } from '../../../shared/hooks/data';
```

### Rule 4: Import Order
Organize imports in this order:

```javascript
// 1. React and external libraries
import React from 'react';
import { View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';

// 2. Shared utilities and config
import { apiClient } from '../../../shared/config/api-client';

// 3. Shared hooks
import { useCategories } from '../../../shared/hooks/data';

// 4. Shared components
import { Button, Card } from '../../../shared/components/ui';

// 5. Local imports
import { ProductCard } from './components/product-card';
```

---

## Feature Templates

### Adding a New Feature Screen

When creating a new feature screen, follow this template:

```
features/{role}/{feature-name}/
├── index.jsx
└── components/
    └── .gitkeep
```

**index.jsx template:**
```javascript
import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../../shared/components/ui';

/**
 * {FeatureName} Screen
 * Description of what this screen does
 */
export default function {FeatureName}Screen() {
  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <ScrollView>
        <View className="p-4">
          <Text variant="heading">{Feature Name}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## Migration Checklist

When refactoring existing code:

- [ ] Move all components to `components/` folder
- [ ] Ensure no standalone component files outside `components/`
- [ ] Update imports to use new structure
- [ ] Delete any old/deprecated files
- [ ] Add index.js for clean exports
- [ ] Document any feature-specific patterns in comments
- [ ] Test that nothing broke

---

## Questions?

If you're unsure where code belongs:
1. Is it used in multiple features? → `shared/`
2. Is it specific to one user type? → `features/{role}/`
3. Is it auth-related? → `auth/`
4. Is it a screen? → `index.jsx`
5. Is it a component? → `components/`
6. Is it fetching data? → Create a hook in `shared/hooks/data/`

When in doubt, ask or check existing patterns in the codebase.
