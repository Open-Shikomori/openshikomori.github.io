import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

function readEnv(name: string) {
  const bunEnv = typeof Bun !== "undefined" ? Bun.env?.[name] : undefined;
  return bunEnv ?? process.env[name];
}

// Supabase Connection
// Read from both Bun.env and process.env so GitHub Actions + Bun stays reliable.
const supabaseUrl = readEnv('VITE_SUPABASE_URL') || readEnv('SUPABASE_URL');
const supabaseKey =
  readEnv('SUPABASE_SERVICE_ROLE_KEY') ||
  readEnv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY') ||
  readEnv('VITE_SUPABASE_ANON_KEY') ||
  readEnv('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing Supabase credentials. Set VITE_SUPABASE_URL (or SUPABASE_URL) and one of SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY, VITE_SUPABASE_ANON_KEY, or SUPABASE_ANON_KEY.",
  );
  console.error(
    JSON.stringify(
      {
        hasViteSupabaseUrl: Boolean(readEnv('VITE_SUPABASE_URL')),
        hasSupabaseUrl: Boolean(readEnv('SUPABASE_URL')),
        hasServiceRoleKey: Boolean(readEnv('SUPABASE_SERVICE_ROLE_KEY')),
        hasPublishableDefaultKey: Boolean(readEnv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY')),
        hasViteAnonKey: Boolean(readEnv('VITE_SUPABASE_ANON_KEY')),
        hasSupabaseAnonKey: Boolean(readEnv('SUPABASE_ANON_KEY')),
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

async function main() {
  console.log("Fetching site data from Supabase...");

  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  try {
    // 1. Fetch Dataset Stats
    const { data: statsData, error: statsError } = await supabase.rpc('get_global_dataset_stats');
    if (statsError) throw statsError;
    
    // Write stats.json
    fs.writeFileSync(
      path.join(DATA_DIR, 'stats.json'),
      JSON.stringify(statsData || {}, null, 2)
    );
    console.log("✅ Saved stats.json");

    // 2. Fetch Goals & Roadmap
    const { data: siteData, error: siteDataError } = await supabase.rpc('get_site_data');
    if (siteDataError) {
      console.warn("Could not fetch site data via RPC (maybe migration is pending?). Using defaults.");
    } else {
      if (siteData?.goals) {
        fs.writeFileSync(
          path.join(DATA_DIR, 'goals.json'),
          JSON.stringify(siteData.goals, null, 2)
        );
        console.log("✅ Saved goals.json");
      }
      
      if (siteData?.roadmap && siteData.roadmap.length > 0) {
        fs.writeFileSync(
          path.join(DATA_DIR, 'roadmap.json'),
          JSON.stringify(siteData.roadmap, null, 2)
        );
        console.log("✅ Saved roadmap.json");
      }
    }

    // 3. Fetch Top Contributors
    const { data: leaderboardData, error: leaderboardError } = await supabase.rpc('get_leaderboard', { limit_count: 30 });
    if (leaderboardError) throw leaderboardError;

    // Map to the User type expected by frontend
    const community = (leaderboardData || []).map((row: any) => ({
      uid: row.user_id,
      profile: {
        displayName: row.display_name,
        avatar: row.avatar,
      },
      contributionCount: {
        recordings: row.recordings_count || 0,
        corrections: row.corrections_count || 0,
      }
    }));

    fs.writeFileSync(
      path.join(DATA_DIR, 'community.json'),
      JSON.stringify(community, null, 2)
    );
    console.log("✅ Saved community.json");

    console.log("Site data fetch complete!");
  } catch (error) {
    console.error("Error fetching site data:", error);
    process.exit(1);
  }
}

main();
