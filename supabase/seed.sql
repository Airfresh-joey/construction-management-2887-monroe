-- Seed Data for 2887 S. Monroe St Construction Management
-- Phase 1: Primary Suite Addition

-- Budget Items
INSERT INTO budget_items (category, item, estimate, actual, status, notes) VALUES
  ('Architecture & Permits', 'Hackett drawings + permits', 18000, 14000, 'paid', 'Hackett Architecture — plans complete'),
  ('Site Prep & Demo', 'Demo + site prep', 8000, 0, 'pending', ''),
  ('Foundation', 'Slab extension / footings', 18000, 0, 'pending', ''),
  ('Framing', 'Addition framing', 22000, 0, 'pending', ''),
  ('Roofing', 'Hip roof extension', 23000, 0, 'pending', ''),
  ('MEP', 'HVAC extension', 10000, 0, 'pending', ''),
  ('MEP', 'Electrical rough-in', 9000, 0, 'pending', ''),
  ('MEP', 'Plumbing rough-in', 9000, 0, 'pending', ''),
  ('Insulation', 'R-30 walls R-60 attic', 7000, 0, 'pending', ''),
  ('Drywall', 'Hang tape mud texture', 12000, 0, 'pending', ''),
  ('Primary Bath', 'Tile fixtures vanity shower', 75000, 0, 'pending', ''),
  ('Primary Closet', 'Framing + shelving', 17000, 0, 'pending', ''),
  ('Flooring', 'Hardwood throughout', 14000, 0, 'pending', ''),
  ('Paint & Finish', 'Interior paint + trim', 9000, 0, 'pending', ''),
  ('Windows & Doors', 'Per schedule', 18000, 0, 'pending', ''),
  ('Exterior', 'Siding + finish', 12000, 0, 'pending', ''),
  ('Contingency', '10-15% reserve', 31000, 0, 'pending', '');

-- Schedule Phases
INSERT INTO schedule_phases (phase_number, name, tasks, start_date, end_date, status, requires_inspection, notes) VALUES
  (1, 'Pre-construction', 'Permits, plans finalization, vendor selection', '2026-04-01', '2026-04-21', 'pending', false, ''),
  (2, 'Demo & Site Prep', 'Interior demo, site grading, tree protection', '2026-04-22', '2026-04-28', 'pending', false, ''),
  (3, 'Foundation', 'Footings, slab pour, waterproofing', '2026-04-29', '2026-05-12', 'pending', true, ''),
  (4, 'Framing', 'Walls, headers, roof structure, sheathing', '2026-05-13', '2026-05-26', 'pending', true, ''),
  (5, 'Roof', 'Hip roof extension, flashing, underlayment', '2026-05-27', '2026-06-09', 'pending', false, ''),
  (6, 'MEP Rough-in', 'HVAC ductwork, electrical wiring, plumbing rough', '2026-06-10', '2026-07-07', 'pending', true, ''),
  (7, 'Insulation', 'R-30 walls, R-60 attic, vapor barrier', '2026-07-08', '2026-07-14', 'pending', true, ''),
  (8, 'Drywall', 'Hang, tape, mud, texture', '2026-07-15', '2026-08-04', 'pending', false, ''),
  (9, 'Finishes', 'Tile, flooring, paint, trim, cabinets, fixtures', '2026-08-05', '2026-09-15', 'pending', false, ''),
  (10, 'MEP Finish', 'Fixture trim-out, HVAC commissioning, final connections', '2026-09-16', '2026-09-29', 'pending', false, ''),
  (11, 'Final & Punch', 'Final inspection, punch list, cleaning, closeout', '2026-09-30', '2026-10-13', 'pending', true, '');

-- Vendors
INSERT INTO vendors (trade, company, contact, phone, email, quote, status, notes) VALUES
  ('Architect', 'Hackett Architecture', '', '', '', 14000, 'contracted', 'Plans complete, paid in full'),
  ('Owner Rep', 'Carter Construction Consulting', '', '', '', 0, 'prospect', 'Evaluating for owners rep role'),
  ('Demo', '', '', '', '', 0, 'needed', ''),
  ('Foundation', '', '', '', '', 0, 'needed', ''),
  ('Framing', '', '', '', '', 0, 'needed', ''),
  ('Roofing', '', '', '', '', 0, 'needed', ''),
  ('HVAC', '', '', '', '', 0, 'needed', ''),
  ('Electrical', '', '', '', '', 0, 'needed', ''),
  ('Plumbing', '', '', '', '', 0, 'needed', ''),
  ('Insulation', '', '', '', '', 0, 'needed', ''),
  ('Drywall', '', '', '', '', 0, 'needed', ''),
  ('Tile', '', '', '', '', 0, 'needed', ''),
  ('Flooring', '', '', '', '', 0, 'needed', ''),
  ('Paint', '', '', '', '', 0, 'needed', ''),
  ('Cabinets', '', '', '', '', 0, 'needed', ''),
  ('Windows/Doors', '', '', '', '', 0, 'needed', '');

-- Payments
INSERT INTO payments (payee, amount, date, phase, method, lien_waiver, status, notes) VALUES
  ('Hackett Architecture', 14000, '2026-02-15', 'Pre-construction', 'Check', true, 'paid', 'Architectural plans — paid in full');

-- Documents
INSERT INTO documents (section, name, status, file_url) VALUES
  ('Permits & Legal', 'Building Permit Application', 'needed', ''),
  ('Permits & Legal', 'Zoning Approval', 'needed', ''),
  ('Permits & Legal', 'HOA Approval (if applicable)', 'needed', ''),
  ('Permits & Legal', 'Architectural Plans (stamped)', 'complete', ''),
  ('Permits & Legal', 'Structural Engineering Report', 'needed', ''),
  ('Sub Contracts', 'Demo Contract', 'needed', ''),
  ('Sub Contracts', 'Foundation Contract', 'needed', ''),
  ('Sub Contracts', 'Framing Contract', 'needed', ''),
  ('Sub Contracts', 'Roofing Contract', 'needed', ''),
  ('Sub Contracts', 'MEP Contracts (HVAC/Elec/Plumb)', 'needed', ''),
  ('Sub Contracts', 'Drywall Contract', 'needed', ''),
  ('Sub Contracts', 'Finish Trades Contracts', 'needed', ''),
  ('Insurance', 'Builders Risk Policy', 'needed', ''),
  ('Insurance', 'General Liability Certificate', 'needed', ''),
  ('Insurance', 'Workers Comp Certificates (subs)', 'needed', ''),
  ('Inspections', 'Foundation Inspection', 'needed', ''),
  ('Inspections', 'Framing Inspection', 'needed', ''),
  ('Inspections', 'MEP Rough-in Inspection', 'needed', ''),
  ('Inspections', 'Insulation Inspection', 'needed', ''),
  ('Inspections', 'Final Inspection', 'needed', ''),
  ('Financials', 'Construction Loan Agreement', 'needed', ''),
  ('Financials', 'Draw Schedule', 'needed', ''),
  ('Financials', 'Lien Waivers File', 'needed', '');
