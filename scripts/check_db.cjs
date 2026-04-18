const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
  console.log('Checking DB...');
  
  const { data: cities, error: citiesError } = await supabase.from('cities').select('*');
  if (citiesError) console.error('Cities Error:', citiesError);
  else console.log('Cities:', cities);

  const { data: routes, error: routesError } = await supabase.from('routes').select('*');
  if (routesError) console.error('Routes Error:', routesError);
  else console.log('Routes:', JSON.stringify(routes, null, 2));

  const { data: stops, error: stopsError } = await supabase.from('stops').select('*');
  if (stopsError) console.error('Stops Error:', stopsError);
  else console.log('Stops Count:', stops?.length);
}

checkDB();
