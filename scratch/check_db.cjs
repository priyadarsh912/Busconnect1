const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tsjbfuretxybgndkzihf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzamJmdXJldHh5YmduZGt6aWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDQ2ODksImV4cCI6MjA4ODQ4MDY4OX0.arJa0SqjHwMfdcwq5dbabgWik6lr4Op-nQmxSRB2sb4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    try {
        console.log("Checking Supabase data...");
        
        const { count: routesCount, error: rError } = await supabase
            .from('routes')
            .select('*', { count: 'exact', head: true });
            
        const { count: stopsCount, error: sError } = await supabase
            .from('stops')
            .select('*', { count: 'exact', head: true });
            
        const { data: routeSample, error: rsError } = await supabase
            .from('routes')
            .select('*')
            .limit(5);

        const { data: stopSample, error: ssError } = await supabase
            .from('stops')
            .select('*')
            .limit(5);
            
        console.log("Counts:", JSON.stringify({ routesCount, stopsCount }, null, 2));
        console.log("Route Sample:", JSON.stringify(routeSample, null, 2));
        console.log("Stop Sample:", JSON.stringify(stopSample, null, 2));
        
        if (rError) console.error("Routes error:", rError);
        if (sError) console.error("Stops error:", sError);

    } catch (e) {
        console.error("Script error:", e);
    }
}

checkData();
