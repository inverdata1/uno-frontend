# Firestore Indexes Setup

## Required Indexes

### 1. Branches Index (for user-types switcher)

**Collection:** `branches`

**Fields:**
- `businessId` (Ascending)
- `createdAt` (Ascending)

**Why needed:** When switching user types, we load all branches for each business owned by the user.

**How to create:**

#### Option A: Use the auto-generated link
When you see this error in the logs:
```
The query requires an index. You can create it here: https://console.firebase.google.com/...
```
Click the link and it will automatically create the index.

#### Option B: Create manually
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `uno-delivery-app`
3. Go to Firestore Database → Indexes
4. Click "Create Index"
5. Configure:
   - Collection ID: `branches`
   - Add field: `businessId` → Ascending
   - Add field: `createdAt` → Ascending
   - Query scope: Collection
6. Click "Create"

The index will take a few minutes to build.

## Architecture: Business Branches

### Default Branch Strategy

**Every business automatically gets a default "Principal" branch when created.**

#### Why?
- Consistent structure across all businesses
- Scales well - single location or multiple locations
- Simpler code - no need to handle "no branches" case

#### Implementation
When a business is created:
1. Create the business document
2. Auto-create a "Principal" branch with:
   - `isMain: true`
   - Same address and phone as business
   - Name: "Principal"

#### For Single-Location Businesses
- Just use the default "Principal" branch
- All operations happen on this branch

#### For Multi-Location Businesses
- Keep the "Principal" branch as the main location
- Add additional branches as needed
- Each branch can have its own address, phone, inventory, etc.

## Current Implementation

See [shared/api/businesses/resource.js](../shared/api/businesses/resource.js) - `post_index` method creates the default branch automatically.
