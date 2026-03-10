import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ihftyeltdjzmpptcichq.supabase.co'
const supabaseKey = 'sb_publishable_PfS3ODBFl_MJxqdImr2Ngw_7YDuYllc'

export const supabase = createClient(supabaseUrl, supabaseKey)
