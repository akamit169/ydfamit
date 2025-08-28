import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DemoUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: string;
  phone: string;
}

const DEMO_USERS: DemoUser[] = [
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create admin client using service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Starting demo user creation process...')
    const results = []

    for (const user of DEMO_USERS) {
      try {
        console.log(`Creating user: ${user.email}`)

        // First, try to delete existing user if they exist
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers.users?.find(u => u.email === user.email)
        
        if (existingUser) {
          console.log(`Deleting existing user: ${user.email}`)
          await supabaseAdmin.auth.admin.deleteUser(existingUser.id)
          
          // Also delete from users table
          await supabaseAdmin
            .from('users')
            .delete()
            .eq('id', existingUser.id)
        }

        // Create new auth user
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
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

        if (authError) {
          console.error(`Auth creation error for ${user.email}:`, authError)
          results.push({ email: user.email, success: false, error: authError.message })
          continue
        }

        if (!authUser.user) {
          console.error(`No user returned for ${user.email}`)
          results.push({ email: user.email, success: false, error: 'No user returned' })
          continue
        }

        console.log(`Auth user created for ${user.email}, ID: ${authUser.user.id}`)

        // Create user profile in users table
        const { error: profileError } = await supabaseAdmin
          .from('users')
          .insert({
            id: authUser.user.id,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            phone: user.phone,
            user_type: user.userType,
            is_active: true,
            email_verified: true,
            profile_data: {}
          })

        if (profileError) {
          console.error(`Profile creation error for ${user.email}:`, profileError)
          results.push({ email: user.email, success: false, error: profileError.message })
          continue
        }

        console.log(`Profile created for ${user.email}`)
        results.push({ email: user.email, success: true })

      } catch (error) {
        console.error(`Error creating user ${user.email}:`, error)
        results.push({ 
          email: user.email, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    console.log(`Demo user creation completed: ${successCount} successful, ${failureCount} failed`)

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: `Created ${successCount} demo users successfully${failureCount > 0 ? `, ${failureCount} failed` : ''}`,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('Demo user creation failed:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})