
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

    const { 
      title, 
      amount, 
      currency, 
      date, 
      leftover_notes, 
      paid_by, 
      group_id,
      created_by 
    } = await req.json()

    console.log('Creating expense with data:', { 
      title, 
      amount, 
      currency, 
      date, 
      leftover_notes, 
      paid_by, 
      group_id,
      created_by 
    });

    // Validate input
    if (!title || !amount || !paid_by || !created_by) {
      return new Response(
        JSON.stringify({ error: 'Title, amount, paid_by, and created_by are required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Verify user exists and is a member of the group (if group_id provided)
    if (group_id) {
      const { data: membership, error: membershipError } = await supabaseAdmin
        .from('group_members')
        .select('id')
        .eq('group_id', group_id)
        .eq('user_id', created_by)
        .single();

      if (membershipError || !membership) {
        console.error('User is not a member of this group:', membershipError);
        return new Response(
          JSON.stringify({ error: 'User is not a member of this group' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403 
          }
        );
      }
    }

    // Create the expense
    const { data: expenseData, error: expenseError } = await supabaseAdmin
      .from('expenses')
      .insert({
        title: title.trim(),
        amount: parseFloat(amount),
        currency: currency || 'CHF',
        date: date || new Date().toISOString(),
        leftover_notes: leftover_notes || null,
        paid_by: paid_by,
        group_id: group_id || null
      })
      .select()
      .single();

    if (expenseError) {
      console.error('Expense creation error:', expenseError);
      return new Response(
        JSON.stringify({ error: `Failed to create expense: ${expenseError.message}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    console.log('Expense created successfully:', expenseData);

    return new Response(
      JSON.stringify({ data: expenseData }),
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
