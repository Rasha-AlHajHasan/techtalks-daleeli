import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COUNTRY_LAW_CONTEXT: Record<string, string> = {
  LB: `Lebanese Law Context:
- Code of Obligations and Contracts (1932)
- Lebanese Labor Law Decree No. 17386
- Required: written contract in Arabic, probation max 3 months
- Mandatory: end of service indemnity (1 month per year after 1 year)
- Working hours: max 48hrs/week, overtime at 150% on weekdays, 175% on Sundays
- Annual leave: 15 days after 1 year, 18 days after 5 years
- Termination: notice period required based on seniority
- Social security: NSSF registration mandatory (employer pays 23.5%)
- No minimum wage enforcement currently (economic crisis context)
- Maternity leave: 10 weeks paid
- Missing red flags to check: no NSSF clause, no indemnity clause, no overtime policy`,

  SA: `Saudi Arabian Law Context:
- Saudi Labor Law Royal Decree M/51 (2005, amended 2015)
- Required: contract in Arabic, if dual language Arabic prevails
- Probation: max 180 days
- Working hours: 48hrs/week (40hrs in Ramadan)
- Overtime: 150% of wage
- Annual leave: 21 days (increases to 30 days after 5 years)
- End of service: 0.5 month per year for first 5 years, 1 month per year after
- Termination notice: 60 days for unlimited contracts
- Saudization (Nitaqat): employer must meet Saudi national quotas
- Gratuity is mandatory and must be mentioned
- Iqama (residency permit): employer must sponsor and pay for it
- Flight tickets: employer must provide annual or end of service ticket home
- Accommodation/housing allowance: check if included
- If abroad moving to KSA: verify iqama sponsorship, flight, accommodation clauses
- Missing red flags: no iqama clause, no flight ticket, no housing allowance, no gratuity`,

  AE: `UAE Law Context:
- UAE Labour Law Federal Decree-Law No. 33 of 2021
- All contracts must be limited term (unlimited contracts abolished)
- Required: Offer letter + official MOHRE contract
- Probation: max 6 months, termination during probation needs 14 days notice
- Working hours: 48hrs/week, 36hrs during Ramadan
- Overtime: 125% weekdays, 150% rest days
- Annual leave: 30 days after 1 year
- Public holidays: 11.5 days paid
- End of service gratuity: 21 days per year for first 5 years, 30 days after
- Termination notice: minimum 30 days (up to 90 days)
- Health insurance: mandatory, employer must provide
- Work permit/visa: employer must sponsor and pay for it
- Flight ticket: employer must provide on termination/end of contract
- Non-compete clause: max 2 years, must be reasonable in scope
- If abroad moving to UAE: verify visa sponsorship, health insurance, flight, accommodation
- Missing red flags: no gratuity clause, no health insurance, no visa sponsorship, no flight ticket`,

  EG: `Egyptian Law Context:
- Egyptian Labor Law No. 12 of 2003
- Contract must be in Arabic
- Probation: max 3 months
- Working hours: 48hrs/week, 8hrs/day
- Overtime: 135% weekdays, 170% rest days, 200% public holidays
- Annual leave: 21 days (increases to 30 days after 10 years or over 50 years old)
- Maternity leave: 90 days (3 times maximum over career)
- End of service: 1 month per year
- Social insurance: mandatory registration
- Termination notice: minimum 2 months
- If abroad moving to Egypt: verify work permit, accommodation, transport allowance
- Missing red flags: no social insurance clause, no overtime policy, no leave entitlement`,

  JO: `Jordanian Law Context:
- Jordanian Labor Law No. 8 of 1996 (amended 2008)
- Contract in Arabic required
- Probation: max 3 months
- Working hours: 48hrs/week
- Overtime: 125% on regular days, 150% on rest days
- Annual leave: 14 days (increases to 21 days after 5 years)
- Maternity leave: 10 weeks
- End of service: 1 month per year after 1 year
- Social security: mandatory (employer 14.25%, employee 7.5%)
- Termination notice: 1 month minimum
- If abroad moving to Jordan: verify work permit sponsorship, accommodation
- Missing red flags: no social security clause, no indemnity, no overtime policy`,

  KW: `Kuwaiti Law Context:
- Kuwait Labor Law No. 6 of 2010
- Probation: max 100 days
- Working hours: 48hrs/week (36hrs Ramadan)
- Overtime: 150% regular days, 200% rest days
- Annual leave: 30 days after 1 year
- Maternity leave: 70 days paid
- End of service: 15 days per year first 5 years, 1 month per year after
- Health insurance: mandatory
- Work permit: employer must sponsor
- Flight ticket: employer must provide annually and on termination
- Housing allowance: typically included, check if missing
- If abroad moving to Kuwait: verify residency (iqama), flight, housing, insurance
- Missing red flags: no end of service clause, no flight ticket, no housing allowance`,

  QA: `Qatari Law Context:
- Qatar Labor Law No. 14 of 2004 (amended 2020 - major reforms)
- Kafala system reformed: workers can change jobs without employer permission
- Probation: max 6 months
- Working hours: 48hrs/week, outdoor work banned 10am-3:30pm June-September
- Overtime: 125% regular, 150% rest days
- Annual leave: 30 days after 1 year (3 weeks first year)
- End of service: 3 weeks per year
- Minimum wage: QAR 1,000/month + QAR 500 food + QAR 500 housing if not provided
- Health insurance: mandatory, employer pays
- Work visa: employer sponsors
- Flight ticket: employer must provide on contract end
- Non-compete: check scope and duration
- If abroad moving to Qatar: verify minimum wage compliance, housing, food allowance, flight
- Missing red flags: no end of service, no minimum allowances, no health insurance, no flight`,

  BH: `Bahraini Law Context:
- Bahrain Labour Law for Private Sector (Law No. 36 of 2012)
- Probation: max 3 months (extendable to 6 months by agreement)
- Working hours: 48hrs/week (40hrs Ramadan)
- Overtime: 125% regular, 150% rest days, 200% holidays
- Annual leave: 30 days after 1 year
- Maternity leave: 60 days paid
- End of service: 0.5 month first 3 years, 1 month after (capped at 18 months)
- Social insurance: GOSI registration mandatory
- Work permit: employer must sponsor
- Health insurance: mandatory
- If abroad moving to Bahrain: verify CPR (residency), work permit, health insurance
- Missing red flags: no GOSI clause, no end of service, no health insurance`,

  OM: `Omani Law Context:
- Oman Labour Law Royal Decree 35/2003 (amended 2023)
- Contract in Arabic required
- Probation: max 3 months (extendable once)
- Working hours: 45hrs/week (30hrs Ramadan)
- Overtime: 125% regular, 150% rest days
- Annual leave: 30 days after 1 year
- Maternity leave: 50 days paid
- End of service: 15 days per year first 3 years, 1 month after
- Health insurance: mandatory
- Work visa: employer sponsors (2-year renewable)
- Flight ticket: employer must provide on termination
- Omanization: employers must meet Omani national quotas
- If abroad moving to Oman: verify visa, flight, housing, insurance
- Missing red flags: no end of service, no flight ticket, no health insurance`,

  IQ: `Iraqi Law Context:
- Iraqi Labor Law No. 37 of 2015
- Working hours: 48hrs/week, 8hrs/day
- Overtime: 150% regular, 200% holidays
- Annual leave: 20 days minimum
- End of service: mandatory indemnity
- Social security: mandatory
- Probation: max 3 months
- Work permit required for foreigners
- If abroad moving to Iraq: verify security clauses, hardship allowance, evacuation policy
- Missing red flags: no indemnity clause, no security/evacuation clause for foreigners`,

  FR: `French Law Context:
- French Labour Code (Code du travail)
- CDI (permanent) vs CDD (fixed term) — CDD has strict limits
- Probation: 2 months employees, 3 months supervisors, 4 months executives
- Working hours: 35hrs/week legal (RTT days for extra hours)
- Overtime: 125% first 8hrs, 150% after
- Annual leave: 25 days (5 weeks) mandatory
- Minimum wage: SMIC (check current rate)
- Mutual health insurance: employer must contribute 50% minimum
- Collective agreement (convention collective): must be referenced
- Termination: cause required, notice period based on seniority
- Non-compete: must be compensated (minimum 30% salary)
- If abroad moving to France: verify health coverage (Sécurité Sociale), visa type
- Missing red flags: no convention collective reference, no mutual insurance, uncompensated non-compete`,

  GB: `UK Law Context:
- Employment Rights Act 1996
- Written statement of particulars mandatory from day 1
- Probation: typically 3-6 months (no statutory limit)
- Working hours: max 48hrs/week average (can opt out)
- Overtime: no statutory rate but must not breach minimum wage
- Annual leave: 28 days minimum (including bank holidays)
- National Living Wage: must meet current NLW rate
- Statutory Sick Pay (SSP): employer must provide
- Maternity/Paternity: statutory rights must be mentioned
- Notice period: minimum 1 week per year of service
- Pension: auto-enrolment mandatory
- If abroad moving to UK: verify visa sponsorship (Skilled Worker visa), Certificate of Sponsorship
- Post-Brexit: EU citizens need visa sponsorship now
- Missing red flags: no pension clause, no sick pay, below minimum wage, no notice period`,

  DE: `German Law Context:
- German Civil Code (BGB) + Arbeitszeitgesetz (Working Hours Act)
- Written contract strongly recommended
- Probation: max 6 months
- Working hours: max 48hrs/week, max 10hrs/day
- Overtime: must be compensated (time off or payment)
- Annual leave: minimum 20 days (based on 5-day week), typically 25-30 days
- Minimum wage: Mindestlohn (check current rate)
- Notice period: 4 weeks minimum, increases with seniority
- Social insurance: mandatory (health, pension, unemployment, nursing care)
- Non-compete: must be compensated at 50% of last salary
- Works council rights: if applicable
- If abroad moving to Germany: verify work visa (EU Blue Card or work permit), health insurance
- Missing red flags: no social insurance clause, uncompensated non-compete, below minimum wage`,

  US: `US Law Context:
- Federal: FLSA (Fair Labor Standards Act), FMLA, ADA, Title VII
- State laws vary significantly — must identify which state governs
- At-will employment: either party can terminate (unless contract states otherwise)
- Minimum wage: federal $7.25/hr but states often higher
- Overtime: 150% for hours over 40/week (FLSA exempt vs non-exempt)
- Health insurance: not federally mandated but ACA applies to large employers
- FMLA: 12 weeks unpaid leave (companies with 50+ employees)
- Non-compete: enforceability varies by state (banned in California)
- Arbitration clauses: very common, waives right to sue
- At-will clause: check if it limits your rights
- If abroad moving to US: verify visa type (H1-B, L1, O1), sponsorship, green card possibility
- Missing red flags: forced arbitration, broad non-compete, no health insurance, at-will with no severance`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let contract_upload_id: string | null = null;

  try {
    const body = await req.json();
    contract_upload_id = body.contract_upload_id;
    const contractText: string = body.contract_text ?? ""; // extracted by pdfjs on the frontend

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

    // 2. Validate contract text (extracted by pdfjs on the frontend — no server-side PDF parsing needed)
    if (!contractText || contractText.trim().length < 50) {
      throw new Error(
        "No contract text received. PDF extraction may have failed — ensure the PDF is not scanned/image-only."
      );
    }
    console.log("Received contract text length:", contractText.length);

    // 3. Get country law context
    const lawContext = COUNTRY_LAW_CONTEXT[upload.country_code] ?? "the applicable local law";
    console.log("Analyzing under:", upload.country_code);

    // 4. Call Groq API
    console.log("Calling Groq API...");
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.1,
        max_tokens: 4096,
        messages: [
          {
            role: "system",
            content: `You are an expert legal advisor specializing in employment law. You analyze job contracts and return structured JSON analysis. Always respond with ONLY valid JSON — no markdown, no backticks, no explanation outside the JSON object.`,
          },
          {
            role: "user",
            content: `Analyze the following contract under ${lawContext}

The person reviewing this contract may be:
- Currently abroad and received a job offer from this country
- Planning to relocate to this country for work
- Already in this country reviewing a new contract

Contract text:
"""
${contractText.trim().slice(0, 12000)}
"""

Check for ALL of the following:
1. Are all legally required clauses present?
2. Are salary and benefits compliant with minimum legal requirements?
3. Are working hours and overtime terms legal?
4. Are leave entitlements (annual, sick, maternity) correctly stated?
5. Are end-of-service/gratuity terms correct?
6. If relocating: are visa/work permit, flight tickets, housing, health insurance mentioned?
7. Are there any unfair, illegal, or one-sided clauses?
8. Is the non-compete clause reasonable and legal?
9. Is the termination and notice period legal?
10. What is missing that MUST be negotiated before signing?

Return ONLY this JSON structure:
{
  "summary": "2-3 sentence plain-language summary of what this contract is and who it is for",
  "overall_verdict": "GOOD or FAIR or CONCERNING or RED FLAGS",
  "score": 75,
  "rights_and_obligations": {
    "employee_rights": ["each right clearly stated"],
    "employee_obligations": ["each obligation clearly stated"],
    "employer_obligations": ["each employer commitment"]
  },
  "legal_implications": ["clauses with serious legal consequences if violated"],
  "country_specific_notes": ["specific compliance issues under this country law"],
  "missing_clauses": ["important clauses missing that are legally required or strongly recommended"],
  "risk_flags": ["unfair, illegal, or concerning terms found in the contract"],
  "duties": ["main job duties and responsibilities"],
  "relocation_notes": ["visa, flight, housing, insurance, and relocation terms — or what is missing"],
  "negotiation_tips": ["specific things to negotiate before signing"],
  "recommendation": "Clear recommendation: sign, negotiate first, or avoid — and exactly why"
}`,
          },
        ],
      }),
    });

    console.log("Groq response status:", groqRes.status);

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      throw new Error(`Groq API error (${groqRes.status}): ${errText}`);
    }

    const groqData = await groqRes.json();
    let rawText = groqData.choices?.[0]?.message?.content ?? "";

    if (!rawText) {
      throw new Error(`Empty Groq response. Full response: ${JSON.stringify(groqData)}`);
    }

    // Clean up any accidental markdown backticks
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
        analyzed_by: "ai",
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

    return new Response(JSON.stringify({ result: JSON.stringify(parsed) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Edge function error:", message);

    if (contract_upload_id) {
      await supabase
        .from("contract_uploads")
        .update({
          analysis_status: "failed",
          failure_reason: message,
        })
        .eq("id", contract_upload_id);
    }

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});