
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

    const { user_id, user_email, user_name, group_id } = await req.json();
    const user_role = 'participant';

    console.log('Request data:', { user_id, user_email, user_name, user_role, group_id })

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

    // First check if user already exists by email (most important check)
    const { data: existingUserByEmail, error: emailCheckError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', user_email.toLowerCase())
      .maybeSingle()

    if (emailCheckError) {
      console.error('Error checking existing user by email:', emailCheckError)
      return new Response(
        JSON.stringify({ error: `Failed to check existing user: ${emailCheckError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let finalUser = null;

    if (existingUserByEmail) {
      console.log('User already exists with this email, using existing user')
      finalUser = existingUserByEmail;
    } else {
      // Check if user already exists by ID
      const { data: existingUserById, error: idCheckError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', user_id)
        .maybeSingle()

      if (idCheckError) {
        console.error('Error checking existing user by ID:', idCheckError)
        return new Response(
          JSON.stringify({ error: `Failed to check existing user: ${idCheckError.message}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (existingUserById) {
        console.log('User already exists with this ID, using existing user')
        finalUser = existingUserById;
      } else {
        // Create new user using the admin client (bypasses RLS)
        const { data: userData, error: insertError } = await supabaseAdmin
          .from('users')
          .upsert({
            id: user_id,
            email: user_email.toLowerCase(),
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
        finalUser = userData;
      }
    }

    // If group_id is provided, add user to the group
    if (group_id && finalUser) {
      console.log('Adding user to group:', { userId: finalUser.id, groupId: group_id });
      
      // Check if user is already a member of the group
      const { data: existingMembership, error: membershipCheckError } = await supabaseAdmin
        .from('group_members')
        .select('id, role')
        .eq('group_id', group_id)
        .eq('user_id', finalUser.id)
        .maybeSingle();

      if (membershipCheckError) {
        console.error('Error checking group membership:', membershipCheckError)
        return new Response(
          JSON.stringify({ error: `Failed to check group membership: ${membershipCheckError.message}` }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (!existingMembership) {
        // Determine the role - if this user is the group creator, make them admin
        const { data: groupData, error: groupError } = await supabaseAdmin
          .from('groups')
          .select('created_by')
          .eq('id', group_id)
          .single();

        let memberRole = 'member';
        if (!groupError && groupData && groupData.created_by === finalUser.id) {
          memberRole = 'admin';
          console.log('User is group creator, assigning admin role');
        }

        // Add user to group using admin client (bypasses RLS)
        const { error: membershipError } = await supabaseAdmin
          .from('group_members')
          .insert({
            group_id: group_id,
            user_id: finalUser.id,
            role: memberRole
          });

        if (membershipError) {
          console.error('Error adding user to group:', membershipError)
          return new Response(
            JSON.stringify({ error: `Failed to add user to group: ${membershipError.message}` }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        console.log('User successfully added to group with role:', memberRole);
      } else {
        console.log('User is already a member of the group with role:', existingMembership.role);
      }
    }

    return new Response(
      JSON.stringify({ data: finalUser }),
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
