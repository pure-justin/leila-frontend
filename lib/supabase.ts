import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Contractor {
  id: string
  email: string
  first_name: string
  last_name: string
  business_name: string
  phone: string
  services: string[]
  hourly_rate: number
  rating: number
  completed_jobs: number
  created_at: string
  status: 'pending' | 'active' | 'inactive'
}

export interface Booking {
  id: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  service: string
  date: string
  time: string
  address: string
  notes?: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  contractor_id?: string
  created_at: string
}

export interface Job {
  id: string
  booking_id: string
  contractor_id: string
  status: 'pending' | 'accepted' | 'declined' | 'completed'
  price: number
  created_at: string
}