const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tsjbfuretxybgndkzihf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzamJmdXJldHh5YmduZGt6aWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDQ2ODksImV4cCI6MjA4ODQ4MDY4OX0.arJa0SqjHwMfdcwq5dbabgWik6lr4Op-nQmxSRB2sb4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    try {
        const { count: rsCount } = await supabase
            .from('route_stops')
            .select('*', { count: 'exact', head: true });
            
        console.log("route_stops Count:", rsCount);
        
        const { data: rsSample } = await supabase
            .from('route_stops')
            .select('*, stops(name)')
            .limit(10);
            
        console.log("route_stops Sample:", JSON.stringify(rsSample, null, 2));

    } catch (e) {
        console.error(e);
    }
}

checkData();
