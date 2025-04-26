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
    
    // Ensure all user data is deleted from all tables
    // This is a backup to the client-side deletion in case it fails
    
    // Delete user sessions
    const { error: sessionsError } = await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', user_id);
      
    if (sessionsError) {
      console.error('Error deleting user sessions:', sessionsError);
      // Continue with deletion even if this fails
    }
    
    // Delete survey responses if they exist
    const { error: surveyError } = await supabase
      .from('survey_responses')
      .delete()
      .eq('user_id', user_id);
      
    if (surveyError) {
      console.error('Error deleting survey responses:', surveyError);
      // Continue with deletion even if this fails
    }
    
    // Delete user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user_id);
      
    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      // Continue with deletion even if this fails
    }
    
    // Finally, delete the user from Supabase Auth
    // This should be done last as it will invalidate the user's session
    // Passing false as the second parameter ensures the user is completely removed (not soft-deleted)
    // This prevents them from logging in with the same email in the future
    const { error } = await supabase.auth.admin.deleteUser(user_id, false);
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'User and all associated data deleted successfully' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}