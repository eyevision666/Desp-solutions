const fs = require('fs');
const path = require('path');
const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = envFile.split(/\r?\n/).reduce((acc, line) => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    acc[key] = value;
  }
  return acc;
}, {});
const { createClient } = require('@supabase/supabase-js');
const url = env.SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;
const table = env.SUPABASE_ASSESSMENTS_TABLE || 'assessments';
if (!url || !key) {
  console.error('Missing SUPABASE_URL or key');
  process.exit(1);
}
const supabase = createClient(url, key);
(async () => {
  console.log('table:', table, 'url:', url, 'keyLen:', key.length);
  const test1 = await supabase.from(table).select('*').limit(1);
  console.log('select * error:', test1.error);
  console.log('select * data:', test1.data);
  const test2 = await supabase.from(table).select('deviceHours').limit(1);
  console.log('select deviceHours error:', test2.error);
  console.log('select deviceHours data:', test2.data);
  const row = {
    id: `test-${Date.now()}`,
    patient: { fullName: 'Test User' },
    medicalHistory: ['Nill'],
    symptoms: ['Dry Eyes'],
    ocularHistory: ['Uses Spectacles'],
    screenTime: 2,
    devices: ['Mobile'],
    usageTypes: ['Work / Office'],
    eyeImages: { left: null, right: null },
    result: { score: 0, severity: 'Low', level: 0, diagnosis: [], recommendations: [] },
  };
  const insert = await supabase.from(table).insert([row]);
  console.log('insert error:', insert.error);
  console.log('insert data:', insert.data);
})();
