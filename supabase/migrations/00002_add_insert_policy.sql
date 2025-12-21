-- Allow public insert access for POC purposes
CREATE POLICY "Allow public insert access" ON demo FOR INSERT WITH CHECK (true);
