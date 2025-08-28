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
        // Check if user already exists in auth
        const { data: existingAuthUser } = await supabaseAdmin.auth.admin.getUserByEmail(user.email);
        
        let authUserId: string;

        if (existingAuthUser.user) {
          authUserId = existingAuthUser.user.id;
          console.log(`Auth user already exists: ${user.email}`);
        } else {
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

          authUserId = authData.user.id;
          console.log(`Created auth user: ${user.email} with ID: ${authUserId}`);
        }

        // Check if user profile already exists
        const { data: existingProfile } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', user.email)
          .single();

        if (existingProfile) {
          console.log(`Profile already exists for: ${user.email}`);
          results.push({ email: user.email, success: true, message: 'User already exists' });
          continue;
        }

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
          results.push({ email: user.email, success: false, error: profileError.message });
          continue;
        }

        console.log(`Created profile for: ${user.email}`);
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Demo users processing completed',
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