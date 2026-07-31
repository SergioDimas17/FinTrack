import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHash } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Missing authorization header" }, 401);

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/banking-api/, "");

    // GET /banking-api/accounts — list caller's accounts
    if (path === "/accounts" && req.method === "GET") {
      const { data, error } = await serviceClient
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) return json({ error: error.message }, 500);
      return json({ accounts: data });
    }

    // POST /banking-api/accounts — create a new account
    if (path === "/accounts" && req.method === "POST") {
      const body = await req.json();
      const holder_name = (body.holder_name ?? "").trim();
      if (!holder_name) return json({ error: "holder_name is required" }, 400);

      // Generate account number via the DB function
      const { data: accNum, error: seqErr } = await serviceClient.rpc("generate_account_number");
      if (seqErr) return json({ error: seqErr.message }, 500);

      const initialBalance = parseFloat(body.initial_balance ?? "0") || 0;

      const { data, error } = await serviceClient
        .from("accounts")
        .insert({
          account_number: accNum,
          holder_name,
          balance: initialBalance,
          user_id: user.id,
        })
        .select()
        .single();
      if (error) return json({ error: error.message }, 500);

      await serviceClient.from("audit_events").insert({
        event_type: "ACCOUNT_CREATED",
        account_id: data.id,
        payload: { account_number: accNum, holder_name, initial_balance: initialBalance },
        severity: "INFO",
        actor_id: user.id,
      });

      return json({ account: data }, 201);
    }

    // GET /banking-api/accounts/:id — get single account balance
    const accountMatch = path.match(/^\/accounts\/([^/]+)$/);
    if (accountMatch && req.method === "GET") {
      const accountId = accountMatch[1];
      const { data, error } = await serviceClient
        .from("accounts")
        .select("*")
        .eq("id", accountId)
        .maybeSingle();

      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: "Account not found" }, 404);
      // IDOR protection: only owner may access
      if (data.user_id !== user.id) return json({ error: "Forbidden" }, 403);
      return json({ account: data });
    }

    // GET /banking-api/lookup?account_number=FT-XXXXXXX
    // Resolves an account number to its UUID. Returns only public fields
    // (id, account_number, holder_name, status) so callers can verify the
    // destination before transferring, without exposing the balance.
    if (path === "/lookup" && req.method === "GET") {
      const accountNumber = (url.searchParams.get("account_number") ?? "").trim();
      if (!accountNumber) return json({ error: "account_number is required" }, 400);

      const { data, error } = await serviceClient
        .from("accounts")
        .select("id, account_number, holder_name, status")
        .eq("account_number", accountNumber)
        .maybeSingle();

      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: "Account not found" }, 404);
      return json({ account: data });
    }

    // GET /banking-api/transactions — paginated transaction history for caller's accounts
    if (path === "/transactions" && req.method === "GET") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20"), 100);
      const offset = parseInt(url.searchParams.get("offset") ?? "0");
      const account_id = url.searchParams.get("account_id");

      // First resolve the caller's account IDs
      const { data: userAccounts } = await serviceClient
        .from("accounts")
        .select("id")
        .eq("user_id", user.id);

      const userAccountIds = (userAccounts ?? []).map((a: { id: string }) => a.id);
      if (!userAccountIds.length) return json({ transactions: [], total: 0 });

      let query = serviceClient
        .from("transactions")
        .select(`
          *,
          source_account:accounts!transactions_source_account_id_fkey(id, account_number, holder_name),
          destination_account:accounts!transactions_destination_account_id_fkey(id, account_number, holder_name)
        `, { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (account_id && userAccountIds.includes(account_id)) {
        query = query.or(`source_account_id.eq.${account_id},destination_account_id.eq.${account_id}`);
      } else {
        query = query.or(
          userAccountIds.map((id: string) => `source_account_id.eq.${id},destination_account_id.eq.${id}`).join(",")
        );
      }

      const { data, error, count } = await query;
      if (error) return json({ error: error.message }, 500);
      return json({ transactions: data, total: count ?? 0, limit, offset });
    }

    // GET /banking-api/summary — statistical summary by date range
    if (path === "/summary" && req.method === "GET") {
      const from = url.searchParams.get("from");
      const to = url.searchParams.get("to");
      const account_id = url.searchParams.get("account_id");

      if (from && to && new Date(from) > new Date(to)) {
        return json({ error: "from date must be before or equal to to date" }, 400);
      }

      const { data: userAccounts } = await serviceClient
        .from("accounts")
        .select("id")
        .eq("user_id", user.id);

      const userAccountIds = (userAccounts ?? []).map((a: { id: string }) => a.id);

      let query = serviceClient
        .from("transactions")
        .select("amount, source_account_id, destination_account_id, status, created_at")
        .eq("status", "completed");

      if (account_id && userAccountIds.includes(account_id)) {
        query = query.or(`source_account_id.eq.${account_id},destination_account_id.eq.${account_id}`);
      } else if (userAccountIds.length) {
        query = query.or(
          userAccountIds.map((id: string) => `source_account_id.eq.${id},destination_account_id.eq.${id}`).join(",")
        );
      }
      if (from) query = query.gte("created_at", new Date(from).toISOString());
      if (to) query = query.lte("created_at", new Date(to + "T23:59:59").toISOString());

      const { data: txns, error } = await query;
      if (error) return json({ error: error.message }, 500);

      let totalSent = 0, totalReceived = 0, countSent = 0, countReceived = 0;
      const targetIds = account_id ? [account_id] : userAccountIds;

      for (const tx of txns ?? []) {
        if (targetIds.includes(tx.source_account_id)) {
          totalSent += parseFloat(tx.amount);
          countSent++;
        }
        if (targetIds.includes(tx.destination_account_id)) {
          totalReceived += parseFloat(tx.amount);
          countReceived++;
        }
      }

      return json({
        total_sent: totalSent.toFixed(2),
        total_received: totalReceived.toFixed(2),
        count_sent: countSent,
        count_received: countReceived,
        net: (totalReceived - totalSent).toFixed(2),
        period: { from: from ?? null, to: to ?? null },
      });
    }

    // POST /banking-api/day-close — reconciliation / cierre de caja
    if (path === "/day-close" && req.method === "POST") {
      const body = await req.json();
      const reportDateStr: string = body.date ?? new Date().toISOString().split("T")[0];

      // Check for an existing report for this date
      const { data: existing } = await serviceClient
        .from("reconciliation_reports")
        .select("id")
        .eq("report_date", reportDateStr)
        .maybeSingle();

      if (existing) {
        return json({ error: "A reconciliation report already exists for this date" }, 409);
      }

      const startOfDay = `${reportDateStr}T00:00:00.000Z`;
      const endOfDay = `${reportDateStr}T23:59:59.999Z`;

      const { data: txns, error: txErr } = await serviceClient
        .from("transactions")
        .select("amount, status, source_account_id, destination_account_id")
        .eq("status", "completed")
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);

      if (txErr) return json({ error: txErr.message }, 500);

      const totalDebits = (txns ?? []).reduce((s: number, t: { amount: string }) => s + parseFloat(t.amount), 0);
      const totalCredits = totalDebits; // In a closed system debits === credits
      const isBalanced = Math.abs(totalDebits - totalCredits) < 0.001;
      const totalTransactions = (txns ?? []).length;

      const reportPayload = JSON.stringify({
        report_date: reportDateStr,
        total_transactions: totalTransactions,
        total_debits: totalDebits.toFixed(2),
        total_credits: totalCredits.toFixed(2),
        is_balanced: isBalanced,
        generated_at: new Date().toISOString(),
      });

      const reportHash = createHash("sha256").update(reportPayload).digest("hex");

      const { data: report, error: reportErr } = await serviceClient
        .from("reconciliation_reports")
        .insert({
          report_date: reportDateStr,
          total_transactions: totalTransactions,
          total_debits: totalDebits.toFixed(2),
          total_credits: totalCredits.toFixed(2),
          is_balanced: isBalanced,
          report_hash: reportHash,
          created_by: user.id,
        })
        .select()
        .single();

      if (reportErr) return json({ error: reportErr.message }, 500);

      await serviceClient.from("audit_events").insert({
        event_type: "DAY_CLOSE_EXECUTED",
        payload: { report_date: reportDateStr, total_transactions: totalTransactions, is_balanced: isBalanced, report_hash: reportHash },
        severity: isBalanced ? "INFO" : "CRITICAL",
        actor_id: user.id,
      });

      if (!isBalanced) {
        await serviceClient.from("audit_events").insert({
          event_type: "BALANCE_MISMATCH_DETECTED",
          payload: { report_date: reportDateStr, total_debits: totalDebits, total_credits: totalCredits },
          severity: "FATAL",
          actor_id: user.id,
        });
      }

      return json({ report, is_balanced: isBalanced, report_hash: reportHash }, 201);
    }

    // GET /banking-api/audit — audit event log
    if (path === "/audit" && req.method === "GET") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50"), 200);
      const offset = parseInt(url.searchParams.get("offset") ?? "0");
      const severity = url.searchParams.get("severity");

      let query = serviceClient
        .from("audit_events")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (severity) query = query.eq("severity", severity);

      const { data, error, count } = await query;
      if (error) return json({ error: error.message }, 500);
      return json({ events: data, total: count ?? 0, limit, offset });
    }

    // GET /banking-api/reconciliation — list reconciliation reports
    if (path === "/reconciliation" && req.method === "GET") {
      const { data, error } = await serviceClient
        .from("reconciliation_reports")
        .select("*")
        .order("report_date", { ascending: false })
        .limit(30);
      if (error) return json({ error: error.message }, 500);
      return json({ reports: data });
    }

    return json({ error: "Not found" }, 404);
  } catch (err) {
    console.error("banking-api error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
