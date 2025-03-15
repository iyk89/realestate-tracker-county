import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('REACT_APP_SUPABASE_URL is not defined in environment variables')
}

if (!supabaseAnonKey) {
  console.error('REACT_APP_SUPABASE_ANON_KEY is not defined in environment variables')
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
) 