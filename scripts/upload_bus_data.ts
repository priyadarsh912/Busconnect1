import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SIMPLE ENV PARSER ---
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
}

loadEnv();

// --- CONFIGURATION ---
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('ERROR: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function uploadBusData() {
  console.log('🚍 Starting Bus Data Upload (DD1)...');

  const csvPath = path.resolve(__dirname, '../busconnect_route_DD1.csv');
  if (!fs.existsSync(csvPath)) {
    console.error(`ERROR: CSV file not found at ${csvPath}`);
    return;
  }

  const csvData = fs.readFileSync(csvPath, 'utf8');
  const lines = csvData.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) {
    console.error('ERROR: CSV file is empty');
    return;
  }

  const headers = lines[0].split(',').map(h => h.trim());

  // 1. Ensure Bhubaneswar city exists
  const { data: city, error: cityErr } = await supabase
    .from('cities')
    .upsert({ name: 'Bhubaneswar', state: 'Odisha' }, { onConflict: 'name' })
    .select()
    .single();

  if (cityErr) {
    console.error('❌ Error upserting city:', cityErr);
    return;
  }
  console.log('✅ City "Bhubaneswar" ready');

  // 2. Process Routes
  const routeGroups: Record<string, any[]> = {};
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });

    if (!row.route_number) continue;

    if (!routeGroups[row.route_number]) {
      routeGroups[row.route_number] = [];
    }
    routeGroups[row.route_number].push(row);
  }

  for (const routeNumber in routeGroups) {
    const rows = routeGroups[routeNumber];
    const firstRow = rows[0];

    // Create/Update Route
    const { data: route, error: routeErr } = await supabase
      .from('routes')
      .upsert({
        route_number: firstRow.route_number,
        origin: firstRow.origin,
        destination: firstRow.destination,
        distance_km: 0, 
        price_inr: 25   
      }, { onConflict: 'route_number' })
      .select()
      .single();

    if (routeErr) {
      console.error(`❌ Error upserting route ${routeNumber}:`, routeErr);
      continue;
    }
    console.log(`✅ Route "${routeNumber}" ready`);

    // Process Stops
    for (const row of rows) {
      // Create/Update Stop
      const { data: stop, error: stopErr } = await supabase
        .from('stops')
        .upsert({
          name: row.stop_name,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          city_id: city.id
        }, { onConflict: 'name,city_id' })
        .select()
        .single();

      if (stopErr) {
        console.error(`❌ Error upserting stop ${row.stop_name}:`, stopErr);
        continue;
      }

      // Link Stop to Route
      const { error: linkErr } = await supabase
        .from('route_stops')
        .upsert({
          route_id: route.id,
          stop_id: stop.id,
          stop_sequence: parseInt(row.stop_sequence)
        }, { onConflict: 'route_id,stop_sequence' }); // Match the UNIQUE(route_id, stop_sequence) constraint

      if (linkErr) {
        console.error(`❌ Error linking stop ${row.stop_name} to route ${routeNumber}:`, linkErr);
      }
    }
    console.log(`✅ Linked ${rows.length} stops to route ${routeNumber}`);
  }

  console.log('🎉 Data upload complete!');
}

uploadBusData().catch(console.error);

