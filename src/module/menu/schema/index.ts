import z from 'zod';
import { ItemCategory, ItemType } from '../enum';

const itemTypeValues = Object.values(ItemType) as [ItemType, ...ItemType[]];
const itemCategoryValues = Object.values(ItemCategory) as [
  ItemCategory,
  ...ItemCategory[],
];

export const itemFormSchema = z.object({
  name: z
    .string({ error: 'Nama wajib diisi' })
    .trim()
    .min(3, { message: 'Nama wajib diisi dan minimal 3 huruf' }),
  price: z.coerce
    .number({ error: 'Harga wajib diisi' })
    .min(1000, { message: 'Harga minimal Rp 1.000' }),
  type: z.enum(itemTypeValues, {
    error: 'Tipe menu wajib diisi',
  }),
  category: z.enum(itemCategoryValues, {
    error: 'Kategori menu wajib diisi',
  }),
});

export type ItemFormSchema = z.infer<typeof itemFormSchema>;
