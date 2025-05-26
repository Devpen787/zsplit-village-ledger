
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key (bypasses RLS)
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

    const { name, icon, created_by } = await req.json()

    console.log('Creating group with data:', { name, icon, created_by });

    // Validate input
    if (!name || !created_by) {
      return new Response(
        JSON.stringify({ error: 'Name and created_by are required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Verify user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', created_by)
      .single();

    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    // Create the group using service role (bypasses RLS)
    const { data: groupData, error: groupError } = await supabaseAdmin
      .from('groups')
      .insert({
        name: name.trim(),
        icon: icon || '🏠',
        created_by: created_by
      })
      .select()
      .single();

    if (groupError) {
      console.error('Group creation error:', groupError);
      return new Response(
        JSON.stringify({ error: `Failed to create group: ${groupError.message}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log('Group created successfully:', groupData);

    // Add the creator as a member with admin role
    const { error: memberError } = await supabaseAdmin
      .from('group_members')
      .insert({
        group_id: groupData.id,
        user_id: created_by,
        role: 'admin'
      });

    if (memberError) {
      console.error('Member creation error:', memberError);
      // Don't fail the entire operation, just log the error
      console.warn('Failed to add creator as member, but group was created');
    } else {
      console.log('Creator added as admin member successfully');
    }

    return new Response(
      JSON.stringify({ data: groupData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})
