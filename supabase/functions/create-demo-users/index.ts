const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const demoUsers = [
      {
        email: 'student@demo.com',
        password: 'student123',
        firstName: 'Demo',
        lastName: 'Student',
        userType: 'student',
        phone: '+91 9876543210'
      },
      {
        email: 'admin@demo.com',
        password: 'admin123',
        firstName: 'Demo',
        lastName: 'Admin',
        userType: 'admin',
        phone: '+91 9876543211'
      },
      {
        email: 'reviewer@demo.com',
        password: 'reviewer123',
        firstName: 'Demo',
        lastName: 'Reviewer',
        userType: 'reviewer',
        phone: '+91 9876543212'
      },
      {
        email: 'donor@demo.com',
        password: 'donor123',
        firstName: 'Demo',
        lastName: 'Donor',
        userType: 'donor',
        phone: '+91 9876543213'
      }
    ];

    const results = [];

    for (const user of demoUsers) {
      try {
        // Create user in Supabase Auth using Admin API
        const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey
          },
          body: JSON.stringify({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
              first_name: user.firstName,
              last_name: user.lastName,
              user_type: user.userType,
              phone: user.phone
            }
          })
        });

        if (!authResponse.ok) {
          const errorText = await authResponse.text();
          console.error(`Failed to create auth user ${user.email}:`, errorText);
          
          // If user already exists, that's okay
          if (errorText.includes('already registered')) {
            console.log(`User ${user.email} already exists in auth`);
          } else {
            throw new Error(`Auth creation failed: ${errorText}`);
          }
        }

        const authUser = authResponse.ok ? await authResponse.json() : null;
        const userId = authUser?.id || user.email; // Fallback for existing users

        // Create or update user profile in users table
        const profileResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'apikey': serviceRoleKey,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: authUser?.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            phone: user.phone,
            user_type: user.userType,
            is_active: true,
            email_verified: true,
            profile_data: {}
          })
        });

        if (!profileResponse.ok) {
          const errorText = await profileResponse.text();
          console.error(`Failed to create profile for ${user.email}:`, errorText);
        }

        results.push({
          email: user.email,
          role: user.userType,
          status: 'created'
        });

      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error);
        results.push({
          email: user.email,
          role: user.userType,
          status: 'error',
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo users setup completed',
        users: results
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error) {
    console.error('Demo users creation error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create demo users'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});