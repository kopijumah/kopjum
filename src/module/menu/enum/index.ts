export const ItemType = {
  FOOD: 'FOOD',
  DRINK: 'DRINK',
} as const;

export type ItemType = (typeof ItemType)[keyof typeof ItemType];

export const ItemFoodCategory = {
  MAIN_COURSE: 'MAIN_COURSE',
  SNACK: 'SNACK',
  DESSERT: 'DESSERT',
} as const;

export type ItemFoodCategory =
  (typeof ItemFoodCategory)[keyof typeof ItemFoodCategory];

export const ItemDrinkCategory = {
  COFFEE: 'COFFEE',
  TEA: 'TEA',
  JUICE: 'JUICE',
  SOFT_DRINK: 'SOFT_DRINK',
} as const;

export type ItemDrinkCategory =
  (typeof ItemDrinkCategory)[keyof typeof ItemDrinkCategory];

export const ItemCategory = {
  ...ItemFoodCategory,
  ...ItemDrinkCategory,
} as const;

export type ItemCategory = (typeof ItemCategory)[keyof typeof ItemCategory];
