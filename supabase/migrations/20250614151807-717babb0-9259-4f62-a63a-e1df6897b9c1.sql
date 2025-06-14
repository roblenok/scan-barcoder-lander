
-- Add missing DELETE policy for profiles table
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Create scan_history table for secure storage
CREATE TABLE IF NOT EXISTS public.scan_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on scan_history
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Create policies for scan_history table
CREATE POLICY "Users can view own scan history" ON public.scan_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan history" ON public.scan_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scan history" ON public.scan_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scan history" ON public.scan_history
  FOR DELETE USING (auth.uid() = user_id);
