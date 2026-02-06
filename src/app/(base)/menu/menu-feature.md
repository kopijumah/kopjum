# Feature: Item (Menu)

This document maps the Item feature end-to-end (page → client components → server actions), so it can be re-implemented in another app.

## Pages
- Menu page: `src/app/(base)/menu/page.tsx`
  - Renders `ItemModule` (client component).

## Client Components
- `src/components/feature/item/item-module.tsx`
  - Responsibilities:
    - Search input with debounce (800ms) and refetch on keyword change.
    - Loads items via `findItems({ name, isActive: true })`.
    - Shows `ItemCard` list and `ItemCreateTrigger`.
    - Determines admin capability via `useSession()` and `Role.ADMIN`.
  - React Query:
    - `queryKey: ['items']`
    - `refetchOnWindowFocus: false`
  - Dependencies:
    - `useSession` (`src/lib/hook/use-session.tsx`)
    - `useDebounce` (`src/lib/hook/use-debounce.tsx`)
    - `Role` enum (`src/lib/enum/role`)

- `src/components/feature/item/item-card.tsx`
  - Displays:
    - Item name, category, price, updated date.
    - Icon based on `ItemType` (Food/Drink).
  - Admin actions:
    - Dropdown menu with Update and Delete (Disable) actions.
    - Opens `ItemUpdateFormDialog` and `ItemDisableFormDialog`.

- `src/components/feature/item/item-cretate-trigger.tsx`
  - Create menu dialog form (AlertDialog).
  - Form fields:
    - `name` (text)
    - `price` (currency input)
    - `type` (select: Food/Drink)
    - `category` (select, dependent on `type`)
  - Mutation:
    - `createItem` server action.
    - On success: `invalidateQueries(['items'])`, reset form, close dialog, success toast.
  - UI states:
    - `isOpen` (dialog open)
    - `isPending` (mutation in-flight)

- `src/components/feature/item/item-update-form-dialog.tsx`
  - Update menu dialog form (AlertDialog).
  - Default values from existing `Item`.
  - Mutation:
    - `updateItem({ id, data })` server action.
    - On success: `invalidateQueries(['items'])`, reset form, close dialog, success toast.
  - Special behavior:
    - Resets `category` when `type` changes.
    - After submit, resets form to submitted values.

- `src/components/feature/item/item-disable-form-dialog.tsx`
  - Delete (disable) confirmation dialog.
  - Mutation:
    - `disableItemById(id)` server action.
    - On success: `invalidateQueries(['items'])`, close dialog, success toast.

## Validation & Enums
- Schema:
  - `src/lib/schema/item/index.ts`
    - `ItemSchemaForm`:
      - `name`: required, min 3 chars
      - `price`: number, >= 1000
      - `type`: `ItemType`
      - `category`: `ItemCategory`

- Enums:
  - `src/lib/enum/item/index.ts`
    - `ItemType`: `FOOD`, `DRINK`
    - `ItemCategory`: full category list (food + drink)
    - `ItemFoodCategory`, `ItemDrinkCategory`: subsets for UI filtering

## Server Actions (Drizzle + Session)
All actions use `verifySession()` and return `Action.build(OpCode, data)` responses.

- `createItem(data)` (`src/lib/action/item/index.ts`)
  - Inserts into `itemsTable` with:
    - `name`, `price` (string), `type`, `category`
    - `createdAt`, `createdBy`, `updatedAt`, `updatedBy`
  - Returns `SUCCESS` or `FAILED`.

- `updateItem({ id, data })`
  - Reads existing item by `id`.
  - If not found: `FAILED`.
  - If price changes:
    - Inserts a new row (new price).
    - Marks old row `isActive = false`.
  - Else:
    - Updates fields in-place (name/type/category/updatedAt/updatedBy).
  - Returns `SUCCESS` or `FAILED`.

- `findItems({ ids, name, isActive })`
  - Builds filters:
    - `ids` → `inArray(itemsTable.id, ids)`
    - `name` → `ilike(itemsTable.name, %name%)`
    - `isActive` → `eq(itemsTable.isActive, true)`
  - Orders by `updatedAt` desc.
  - Returns list of `Item`.

- `disableItemById(id)`
  - Updates `isActive = false` and `updatedAt/updatedBy`.
  - Returns `SUCCESS` or `FAILED`.

## Data Flow Summary
1. `menu/page.tsx` renders `ItemModule`.
2. `ItemModule` fetches items (`findItems`) and renders list + create button.
3. `ItemCard` shows each item; admin can update or disable.
4. Create/Update/Disable dialogs call server actions and invalidate `['items']` query.

## Re-implementation Notes
- Query key `['items']` is shared across list and mutations for cache invalidation.
- `isActive` filter is enforced on list view.
- Update action treats price changes as versioning: new row + disable old row.
