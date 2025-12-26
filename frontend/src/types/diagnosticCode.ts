import { z } from 'zod'

export const diagnosticCodeSchema = z.object({
  id: z.number(),
  code: z.string(),
  description: z.string(),
  category: z.string().nullable(),
  subcategory: z.string().nullable(),
  severity: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const diagnosticCodeCreateSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  is_active: z.boolean().default(true),
})

export const diagnosticCodeListSchema = z.object({
  total: z.number(),
  items: z.array(diagnosticCodeSchema),
  skip: z.number(),
  limit: z.number(),
})

export type DiagnosticCode = z.infer<typeof diagnosticCodeSchema>
export type DiagnosticCodeCreate = z.infer<typeof diagnosticCodeCreateSchema>
export type DiagnosticCodeList = z.infer<typeof diagnosticCodeListSchema>
