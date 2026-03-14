export interface BudgetItem {
  id: string;
  category: string;
  item: string;
  estimate: number;
  actual: number;
  status: 'pending' | 'active' | 'paid';
  notes: string;
}

export interface SchedulePhase {
  id: string;
  phase_number: number;
  name: string;
  tasks: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'complete';
  requires_inspection: boolean;
  notes: string;
}

export interface Vendor {
  id: string;
  trade: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  quote: number;
  status: 'needed' | 'prospect' | 'contracted' | 'active' | 'complete';
  notes: string;
}

export interface Payment {
  id: string;
  payee: string;
  amount: number;
  date: string;
  phase: string;
  method: string;
  lien_waiver: boolean;
  status: 'pending' | 'paid';
  notes: string;
}

export interface Document {
  id: string;
  section: string;
  name: string;
  status: 'needed' | 'pending' | 'complete';
  file_url: string;
}

export interface Photo {
  id: string;
  phase: string;
  date: string;
  description: string;
  file_url: string;
}

export interface Note {
  id: string;
  date: string;
  title: string;
  content: string;
  category: 'general' | 'inspection' | 'issue' | 'weather' | 'delivery';
  created_at: string;
}
