import z from 'zod';

export const voucherFormSchema = z.object({
  name: z
    .string({ error: 'Nama voucher wajib diisi' })
    .trim()
    .min(3, { message: 'Nama voucher wajib diisi dan minimal 3 huruf' }),
  percentage: z.coerce
    .number({ error: 'Diskon wajib diisi' })
    .min(1, { message: 'Diskon minimal 1%' })
    .max(100, { message: 'Diskon maksimal 100%' }),
});

export type VoucherFormSchema = z.infer<typeof voucherFormSchema>;
