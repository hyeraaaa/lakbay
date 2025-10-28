export type Report = {
  report_id: number
  reporter_id: number
  reported_entity_type: string
  reported_entity_id: number
  status: string
  priority: string
  description: string | null
  evidence_urls: string[] | null
  created_at: string
  updated_at: string
  user_category?: string | null
  vehicle_category?: string | null
  assigned_admin_id?: number | null
  admin_notes?: string | null
  resolution_notes?: string | null
  resolved_at?: string | null
  resolved_by?: number | null
}

