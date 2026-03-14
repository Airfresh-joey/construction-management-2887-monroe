-- Construction Management App Schema
-- 2887 S. Monroe St, Denver CO 80210 — Phase 1: Primary Suite Addition

-- Budget Items
CREATE TABLE budget_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  item TEXT NOT NULL,
  estimate NUMERIC(12,2) NOT NULL DEFAULT 0,
  actual NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paid')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Schedule Phases
CREATE TABLE schedule_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tasks TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'complete')),
  requires_inspection BOOLEAN DEFAULT false,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vendors
CREATE TABLE vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trade TEXT NOT NULL,
  company TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  quote NUMERIC(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'needed' CHECK (status IN ('needed', 'prospect', 'contracted', 'active', 'complete')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payments
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payee TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  phase TEXT DEFAULT '',
  method TEXT DEFAULT '',
  lien_waiver BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documents
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'needed' CHECK (status IN ('needed', 'pending', 'complete')),
  file_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Photos
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phase TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT DEFAULT '',
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (open for now — no auth required)
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow all access (owner-builder single user)
CREATE POLICY "Allow all" ON budget_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON schedule_phases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON vendors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON photos FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for documents and photos
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', true);
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-files');
CREATE POLICY "Allow public reads" ON storage.objects FOR SELECT USING (bucket_id = 'project-files');
