import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COUNTRY_LAW_CONTEXT: Record<string, string> = {
  LB: "Lebanese law (Code of Obligations and Contracts, Lebanese Labor Law decree 17386)",
  SA: "Saudi Arabian law (Saudi Labor Law, Royal Decree M/51)",
  AE: "UAE law (UAE Labour Law Federal Decree-Law No. 33 of 2021)",
  EG: "Egyptian law (Egyptian Labor Law No. 12 of 2003)",
  JO: "Jordanian law (Jordanian Labor Law No. 8 of 1996)",
  KW: "Kuwaiti law (Kuwait Labor Law No. 6 of 2010)",
  QA: "Qatari law (Qatar Labor Law No. 14 of 2004)",
  BH: "Bahraini law (Bahrain Labour Law for the Private Sector)",
  OM: "Omani law (Oman Labour Law Royal Decree 35/2003)",
  IQ: "Iraqi law (Iraqi Labor Law No. 37 of 2015)",
  FR: "French law (French Labour Code - Code du travail)",
  GB: "UK law (Employment Rights Act 1996, UK employment legislation)",
  DE: "German law (German Civil Code BGB, Arbeitszeitgesetz)",
  US: "US federal and state employment law (FLSA, FMLA, and applicable state laws)",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let contract_upload_id: string | null = null;

  try {
    const body = await req.json();
    contract_upload_id = body.contract_upload_id;

    if (!contract_upload_id) throw new Error("Missing contract_upload_id");

    // 1. Fetch upload record
    const { data: upload, error: fetchError } = await supabase
      .from("contract_uploads")
      .select("*")
      .eq("id", contract_upload_id)
      .single();

    if (fetchError || !upload) throw new Error(`Upload record not found: ${fetchError?.message}`);

    // Mark as processing
    await supabase
      .from("contract_uploads")
      .update({
        analysis_status: "processing",
        analysis_started_at: new Date().toISOString(),
      })
      .eq("id", contract_upload_id);

    // 2. Download PDF from storage
    console.log("Downloading file from path:", upload.file_path);
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("contract-uploads")
      .download(upload.file_path);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    // Convert to base64 in chunks to avoid stack overflow on large files
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      binary += String.fromCharCode(...uint8Array.subarray(i, i + chunkSize));
    }
    const base64Pdf = btoa(binary);
    console.log("PDF converted to base64, size:", base64Pdf.length);

    // 3. Get country law context
    const lawContext = COUNTRY_LAW_CONTEXT[upload.country_code] ?? "the applicable local law";
    console.log("Analyzing under:", lawContext);

    // 4. Call Gemini API
    console.log("Calling Gemini API...");
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: "application/pdf",
                  data: base64Pdf,
                },
              },
              {
                text: `You are an expert legal advisor specializing in ${lawContext}.

Analyze this contract/job offer thoroughly and respond with ONLY valid JSON (no markdown, no backticks, no explanation outside the JSON).

Return this exact structure:
{
  "summary": "2-3 sentence plain-language summary of what this contract is",
  "overall_verdict": "GOOD or FAIR or CONCERNING or RED FLAGS",
  "score": 75,
  "rights_and_obligations": {
    "employee_rights": ["list each right clearly"],
    "employee_obligations": ["list each obligation"],
    "employer_obligations": ["list employer commitments"]
  },
  "legal_implications": ["list any clauses with legal weight or consequences"],
  "country_specific_notes": ["list compliance issues or protections under this law"],
  "missing_clauses": ["important clauses missing that are required or recommended under this law"],
  "risk_flags": ["any red flags, unfair terms, or concerning language"],
  "duties": ["main job duties and responsibilities mentioned"],
  "recommendation": "Your clear recommendation: should they sign, negotiate, or avoid this contract and why"
}`,
              },
            ],
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    console.log("Gemini response status:", geminiRes.status);

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API error (${geminiRes.status}): ${errText}`);
    }

    const geminiData = await geminiRes.json();
    console.log("Gemini response received");

    let rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!rawText) {
      throw new Error(`Empty Gemini response. Full response: ${JSON.stringify(geminiData)}`);
    }

    // Clean up any markdown backticks if Gemini adds them
    rawText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    console.log("Raw text length:", rawText.length);

    // 5. Parse JSON response
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.log("JSON parse failed, using raw text as summary");
      parsed = { summary: rawText };
    }

    // 6. Save to contract_analysis_results
    console.log("Saving analysis results...");
    const { error: insertError } = await supabase
      .from("contract_analysis_results")
      .insert({
        contract_upload_id,
        summary: parsed.summary ?? "",
        overall_verdict: parsed.overall_verdict ?? "FAIR",
        score: parsed.score ?? null,
        rights_and_obligations: parsed.rights_and_obligations ?? {},
        legal_implications: parsed.legal_implications ?? [],
        country_specific_notes: parsed.country_specific_notes ?? [],
        risk_flags: parsed.risk_flags ?? [],
        missing_clauses: parsed.missing_clauses ?? [],
        duties: parsed.duties ?? [],
        recommendation: parsed.recommendation ?? "",
        raw_ai_result: { raw: rawText, parsed },
       analyzed_by: "gemini-2.0-flash",
      });

    if (insertError) {
      throw new Error(`Failed to save results: ${insertError.message}`);
    }

    // 7. Mark upload as complete
    await supabase
      .from("contract_uploads")
      .update({
        analysis_status: "analyzed",
        analysis_completed_at: new Date().toISOString(),
        analysis_complete_at: new Date().toISOString(),
        extraction_status: "completed",
      })
      .eq("id", contract_upload_id);

    console.log("Analysis complete!");

    return new Response(
      JSON.stringify({ result: JSON.stringify(parsed) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Edge function error:", message);

    // Save failure reason to DB so we can debug
    if (contract_upload_id) {
      await supabase
        .from("contract_uploads")
        .update({
          analysis_status: "failed",
          failure_reason: message,
        })
        .eq("id", contract_upload_id);
    }

    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});