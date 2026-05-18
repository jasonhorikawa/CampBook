import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://kkopekmcqadgrqhcccqd.supabase.co";

const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtrb3Bla21jcWFkZ3JxaGNjY3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjQwNTQsImV4cCI6MjA5NDcwMDA1NH0.xdwB08o6BQvoAUK71tpVBT_pKxzdnGllNgrAGgZesV8";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
