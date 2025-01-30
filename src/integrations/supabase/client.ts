import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wscxbxofzpoxmlcnaidw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzY3hieG9menBveG1sY25haWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNDAwNjcsImV4cCI6MjA1MzYxNjA2N30.7W9tlOronHT3g0HRXqWUlTOiaEIqDH81jifW_yq6scc";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);