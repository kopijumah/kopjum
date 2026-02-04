import z from "zod";
import { PaymentMethod } from "../enum";

export const transactionFormSchema = z.object({
  customer: z
    .string({ error: 'Pelanggan wajib diisi' })
    .trim()
    .min(3, { message: 'Pelanggan wajib diisi dan minimal 3 huruf' }),
  method: z.enum(PaymentMethod, {
    error: 'Tipe pembayaran wajib diisi',
  }),
  items: z.array(
    z.object({
      id: z
        .string({ error: 'Menu wajib diisi' })
        .trim()
        .min(1, { message: 'Pilih menu' }),
      quantity: z.coerce
        .number({ error: 'Kuantitas wajibdiisi' })
        .min(1, {
          message: 'Kuantitas harus lebih besar atau sama dengan 1',
        }),
    }),
  ),
});

export type TransactionFormSchema = z.infer<typeof transactionFormSchema>

