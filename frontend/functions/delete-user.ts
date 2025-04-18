import { createClient } from '@supabase/supabase-js';

// Define the expected request body type
interface RequestBody {
  user_id: string;
}

// This function will be called when the API is invoked
export default async function handler(req: Request) {
  try {
    // Create a Supabase client with the admin key
    const supabaseUrl = process.env.SUPABASE_URL ?? '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    const { user_id } = await req.json() as RequestBody;
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Delete the user from Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(user_id);
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'User deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}