import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xenhijqquxadvbummbey.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbmhpanFxdXhhZHZidW1tYmV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2Nzk0MDMsImV4cCI6MjA3MTI1NTQwM30.IzjjmMi2c4-WtAxiGCnzocYPauxXLydB-Jf5BCGXJIE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
