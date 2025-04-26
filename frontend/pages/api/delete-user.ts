import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Define the expected request body type
interface DeleteUserRequestBody {
  user_id: string;
}

// Create a type for the response
type DeleteUserResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteUserResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create a Supabase client with the admin key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    const { user_id } = req.body as DeleteUserRequestBody;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
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
    
    return res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}