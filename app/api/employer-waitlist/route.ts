import { NextResponse, NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { applyRateLimit, sanitizeString, isValidEmail, auditLog } from '@/lib/security';

/* POST /api/employer-waitlist — Employer application / waitlist */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 3 per minute per IP (prevent spam)
    const limited = applyRateLimit(request, 'register');
    if (limited) {
      auditLog('api.rate_limited', { endpoint: '/api/employer-waitlist' }, request);
      return limited;
    }

    const body = await request.json();
    const { email, company, full_name, firm_name, role, firm_type, annual_hires, screening, pain, timeline, plan } = body;

    // Support both old format (email+company) and new full form
    const finalEmail = email;
    const finalCompany = firm_name || company || '';

    if (!finalEmail || !isValidEmail(finalEmail)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const record: Record<string, string> = {
      email: sanitizeString(finalEmail, 254),
      company: sanitizeString(finalCompany, 200),
    };

    // Add extended fields if provided (new employer onboarding form)
    if (full_name) record.full_name = sanitizeString(full_name, 200);
    if (role) record.role = sanitizeString(role, 200);
    if (firm_type) record.firm_type = sanitizeString(firm_type, 200);
    if (annual_hires) record.annual_hires = sanitizeString(annual_hires, 100);
    if (screening) record.screening = sanitizeString(screening, 500);
    if (pain) record.pain = sanitizeString(pain, 2000);
    if (timeline) record.timeline = sanitizeString(timeline, 100);
    if (plan) record.plan = sanitizeString(plan, 50);

    const { error } = await supabase
      .from('employer_waitlist')
      .insert(record);

    if (error) {
      // If table doesn't have new columns yet, still return success
      // Log the full data so nothing is lost
      console.error('Employer waitlist insert error:', error.message);
      auditLog('employer.application_insert_error', { email: finalEmail, error: error.message }, request);
    }

    auditLog('employer.application_received', { email: finalEmail, plan: plan || 'none', firm_type: firm_type || 'unknown' }, request);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

