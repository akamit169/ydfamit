import { createClient } from 'npm:@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface DemoUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: string;
  phone: string;
  profileData: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const demoUsers: DemoUser[] = [
      {
        email: 'student@demo.com',
        password: 'student123',
        firstName: 'Demo',
        lastName: 'Student',
        userType: 'student',
        phone: '+91 9876543210',
        profileData: {
          course: 'B.Tech Computer Science',
          college: 'Demo University',
          year: '3rd Year',
          cgpa: '8.5',
          category: 'General',
          family_income: '500000'
        }
      },
      {
        email: 'admin@demo.com',
        password: 'admin123',
        firstName: 'Demo',
        lastName: 'Administrator',
        userType: 'admin',
        phone: '+91 9876543211',
        profileData: {
          department: 'Operations',
          role: 'System Administrator',
          permissions: ['all']
        }
      },
      {
        email: 'reviewer@demo.com',
        password: 'reviewer123',
        firstName: 'Demo',
        lastName: 'Reviewer',
        userType: 'reviewer',
        phone: '+91 9876543212',
        profileData: {
          specialization: 'Academic Excellence',
          experience: '5 years',
          institution: 'Demo Review Board'
        }
      },
      {
        email: 'donor@demo.com',
        password: 'donor123',
        firstName: 'Demo',
        lastName: 'Donor',
        userType: 'donor',
        phone: '+91 9876543213',
        profileData: {
          organization: 'Demo Foundation',
          contribution_type: 'Individual',
          interests: ['Education', 'Technology']
        }
      }
    ];

    const results = [];

    for (const user of demoUsers) {
      try {
        // First, try to delete existing user if they exist
        try {
          const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(user.email);
          if (existingUser.user) {
            console.log(`Deleting existing user: ${user.email}`);
            await supabaseAdmin.auth.admin.deleteUser(existingUser.user.id);
            
            // Also delete from users table
            await supabaseAdmin
              .from('users')
              .delete()
              .eq('email', user.email);
          }
        } catch (deleteError) {
          console.log(`No existing user to delete: ${user.email}`);
        }

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            first_name: user.firstName,
            last_name: user.lastName,
            user_type: user.userType
          }
        });

        if (authError) {
          console.error(`Failed to create auth user ${user.email}:`, authError);
          results.push({ email: user.email, success: false, error: authError.message });
          continue;
        }

        if (!authData.user) {
          console.error(`No auth user data returned for ${user.email}`);
          results.push({ email: user.email, success: false, error: 'No user data returned' });
          continue;
        }

        const authUserId = authData.user.id;
        console.log(`Created auth user: ${user.email} with ID: ${authUserId}`);

        // Create user profile in users table
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authUserId,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            phone: user.phone,
            user_type: user.userType,
            is_active: true,
            email_verified: true,
            profile_data: user.profileData
          })
          .select()
          .single();

        if (profileError) {
          console.error(`Failed to create profile for ${user.email}:`, profileError);
          
          // If profile creation fails, delete the auth user to maintain consistency
          try {
            await supabaseAdmin.auth.admin.deleteUser(authUserId);
          } catch (cleanupError) {
            console.error(`Failed to cleanup auth user ${user.email}:`, cleanupError);
          }
          
          results.push({ email: user.email, success: false, error: profileError.message });
          continue;
        }

        console.log(`Created complete user: ${user.email}`);
        results.push({ email: user.email, success: true, message: 'User created successfully' });

      } catch (error) {
        console.error(`Error processing user ${user.email}:`, error);
        results.push({ 
          email: user.email, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return new Response(
      JSON.stringify({ 
        success: successCount > 0, 
        message: `Demo users created: ${successCount}/${totalCount}`,
        results 
      }),
      {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  }
});