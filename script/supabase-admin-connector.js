// Set up connection to Supabase
document.addEventListener('DOMContentLoaded', function() {
  console.log("Admin connector script running...");

  // Direct connection with hardcoded credentials - more reliable
  const supabaseUrl = window.appConfig.supabaseUrl;
  const supabaseKey = window.appConfig.supabaseKey;
  
  // Use hardcoded credentials, which we know work
  if (supabaseUrl.includes('nrgxggpmipbvecjshvxf')) {
    console.log("Initializing Supabase with project credentials");
    window.adminSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    
    // Load data
    loadVisitors(window.adminSupabase);
    loadGameScores(window.adminSupabase);
  } else {
    // Try to extract credentials from main config
    console.log("Attempting to extract credentials from config file");
    loadSupabaseConfig();
  }
});

// Function to extract credentials from config file as fallback
async function loadSupabaseConfig() {
  try {
    const response = await fetch('../script/supabase-config.js');
    const text = await response.text();
    
    // Extract the URL and key using regex
    const urlMatch = text.match(/supabaseUrl\s*=\s*['"]([^'"]+)['"]/);
    const keyMatch = text.match(/supabaseKey\s*=\s*['"]([^'"]+)['"]/);
    
    if (urlMatch && urlMatch[1] && keyMatch && keyMatch[1]) {
      // Initialize Supabase with the extracted credentials
      const supabaseUrl = urlMatch[1];
      const supabaseKey = keyMatch[1];
      
      console.log("Supabase credentials loaded from config");
      
      // Initialize Supabase client with these credentials
      window.adminSupabase = window.supabase.createClient(supabaseUrl, supabaseKey);
      
      // Call the data loading functions
      loadVisitors(window.adminSupabase);
      loadGameScores(window.adminSupabase);
      
      return true;
    } else {
      throw new Error("Could not extract Supabase credentials from config file");
    }
  } catch (error) {
    console.error("Error loading Supabase config:", error);
    
    // Fallback - prompt for credentials
    const url = prompt("Enter your Supabase URL", "https://nrgxggpmipbvecjshvxf.supabase.co");
    const key = prompt("Enter your Supabase anon key", "");
    
    if (url && key) {
      window.adminSupabase = window.supabase.createClient(url, key);
      
      loadVisitors(window.adminSupabase);
      loadGameScores(window.adminSupabase);
      
      return true;
    }
    
    return false;
  }
}