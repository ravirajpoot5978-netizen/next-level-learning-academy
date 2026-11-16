// Shared Supabase client for the static website
(function () {
  if (!window.supabase || !window.NLLA_SUPABASE_URL || !window.NLLA_SUPABASE_PUBLISHABLE_KEY) {
    console.error("Supabase library/config is missing."); return;
  }
  window.nllaSupabase = window.supabase.createClient(
    window.NLLA_SUPABASE_URL, window.NLLA_SUPABASE_PUBLISHABLE_KEY
  );
})();
