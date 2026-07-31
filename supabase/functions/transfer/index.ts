import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate the caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { source_account_id, destination_account_id, amount, idempotency_key } = body;

    // Input validation
    if (!source_account_id || !destination_account_id) {
      return new Response(
        JSON.stringify({ error: "Faltan la cuenta origen y la cuenta destino." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return new Response(
        JSON.stringify({ error: "El monto debe ser un numero mayor a cero." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Service-role client to execute the atomic PL/pgSQL function
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify that the source account belongs to the authenticated user
    const { data: sourceAccount, error: ownershipError } = await serviceClient
      .from("accounts")
      .select("id, status, balance, holder_name")
      .eq("id", source_account_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (ownershipError || !sourceAccount) {
      // Log unauthorized access attempt
      await serviceClient.from("audit_events").insert({
        event_type: "UNAUTHORIZED_TRANSFER_ATTEMPT",
        account_id: source_account_id,
        payload: { source_account_id, initiated_by: user.id },
        severity: "WARNING",
        actor_id: user.id,
      });
      return new Response(
        JSON.stringify({ error: "La cuenta origen no existe o no pertenece al usuario autenticado." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call the atomic PL/pgSQL transfer function
    const { data: transactionId, error: transferError } = await serviceClient.rpc("perform_transfer", {
      p_source_account_id: source_account_id,
      p_destination_account_id: destination_account_id,
      p_amount: numericAmount,
      p_initiated_by: user.id,
      p_idempotency_key: idempotency_key ?? null,
    });

    if (transferError) {
      // Parse the error message from the PL/pgSQL exception
      const msg = transferError.message ?? "";
      let status = 422;
      let userMessage = "La transferencia fallo por un error desconocido.";

      if (msg.includes("INSUFFICIENT_FUNDS")) {
        userMessage = "Fondos insuficientes: el saldo de la cuenta origen no cubre el monto de la transferencia.";
        status = 422;
      } else if (msg.includes("SOURCE_FROZEN")) {
        userMessage = "La cuenta origen esta congelada y no puede enviar transferencias. Contacta al administrador.";
        status = 422;
      } else if (msg.includes("DEST_FROZEN")) {
        userMessage = "La cuenta destino esta congelada y no puede recibir transferencias.";
        status = 422;
      } else if (msg.includes("SOURCE_NOT_FOUND")) {
        userMessage = "La cuenta origen no existe o no pertenece al usuario autenticado.";
        status = 404;
      } else if (msg.includes("DEST_NOT_FOUND")) {
        userMessage = "La cuenta destino no existe. Verifica el numero de cuenta e intenta de nuevo.";
        status = 404;
      } else if (msg.includes("SAME_ACCOUNT")) {
        userMessage = "La cuenta origen y la cuenta destino deben ser diferentes.";
        status = 422;
      } else if (msg.includes("INVALID_AMOUNT")) {
        userMessage = "El monto de la transferencia debe ser mayor a cero.";
        status = 422;
      }

      // Record failed transfer attempt in audit log
      await serviceClient.from("audit_events").insert({
        event_type: "TRANSFER_FAILED",
        account_id: source_account_id,
        payload: {
          source_account_id,
          destination_account_id,
          amount: numericAmount,
          error: msg,
        },
        severity: "WARNING",
        actor_id: user.id,
      });

      return new Response(JSON.stringify({ error: userMessage, detail: msg }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log successful transfer
    await serviceClient.from("audit_events").insert({
      event_type: "TRANSFER_COMPLETED",
      account_id: source_account_id,
      transaction_id: transactionId,
      payload: {
        source_account_id,
        destination_account_id,
        amount: numericAmount,
        transaction_id: transactionId,
      },
      severity: "INFO",
      actor_id: user.id,
    });

    // Fetch updated source balance to return to caller
    const { data: updatedAccount } = await serviceClient
      .from("accounts")
      .select("balance")
      .eq("id", source_account_id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transactionId,
        new_balance: updatedAccount?.balance ?? null,
        message: "Transferencia completada exitosamente.",
      }),
      { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unhandled transfer error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
