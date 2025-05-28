
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Create user function called')

    // Get the service role key from environment variables
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      console.error('Service role key not configured')
      throw new Error('Service role key not configured')
    }

    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey,
      {
        auth: {
          persistSession: false
        }
      }
    )

    const { user_id, user_email, user_name } = await req.json();
    const user_role = 'participant';

    console.log('Request data:', { user_id, user_email, user_name, user_role });

    console.log('Request data:', { user_id, user_email, user_name, user_role })

    if (!user_id || !user_email) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id and user_email' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user_id)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing user:', checkError)
      return new Response(
        JSON.stringify({ error: `Failed to check existing user: ${checkError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (existingUser) {
      console.log('User already exists, returning existing user')
      return new Response(
        JSON.stringify({ data: existingUser }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use the admin client to insert the user (bypasses RLS)
    const { data: userData, error: insertError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: user_id,
        email: user_email,
        name: user_name,
        role: user_role
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user:', insertError)
      return new Response(
        JSON.stringify({ error: `Failed to create user: ${insertError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('User created successfully:', userData)
    return new Response(
      JSON.stringify({ data: userData }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
