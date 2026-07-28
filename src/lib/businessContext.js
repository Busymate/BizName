import { getDashboardStats } from './dashboardStats';
import { listCustomers, segmentCustomers } from './customers';
import { getSavedItemCounts, listSavedItemsBetween } from './savedItems';
import { getUsageOverview } from './usageStats';
import { supabase } from './supabaseClient';
import tools, { categories } from '../data/tools';
import templates from '../data/templates';
import blogPosts from '../data/blogPosts';
import { RELEASE_HISTORY, APP_NAME, APP_VERSION } from '../config/version';

// Everything the AI Assistant can actually "see" — both the user's own
// business figures AND the site itself (every tool, template, blog
// article, business-tip category, and the latest release notes). This
// is what lets someone ask "what tools do you have for invoices?" or
// "what's new in BizName?" and get a real, grounded answer instead of
// "I don't have access to that."
//
// Still deliberately a compact SUMMARY, not a raw data dump — see the
// per-section comments below for why each list is trimmed the way it
// is. Anything more specific the person can ask about directly, and
// the model can point them to the right page rather than reciting a
// full table from memory.
// Site-wide catalog only (no async calls — pure local data), so any
// page/widget that already has its own business figures (e.g. the
// Dashboard's dashboardStats-based context) can attach this directly
// without paying for a second full getBusinessContext() round-trip.
export function getSiteContext() {
  return {
    app_name: APP_NAME,
    app_version: APP_VERSION,
    tool_categories: categories,
    available_tools: tools.map((t) => ({ name: t.name, slug: t.slug, category: t.category, description: t.description, route: `/${t.slug}` })),
    available_templates: templates.map((t) => ({ name: t.name, category: t.category, uses_tool: t.toolSlug ? `/${t.toolSlug}` : null })),
    recent_blog_posts: blogPosts
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 12)
      .map((p) => ({ title: p.title, category: p.category, excerpt: p.excerpt, route: `/blog/${p.slug}` })),
    whats_new: RELEASE_HISTORY.slice(0, 3).map((r) => ({ version: r.version, name: r.name, date: r.date, notes: r.notes })),
    key_pages: [
      { name: 'Dashboard', route: '/dashboard' },
      { name: 'AI Assistant', route: '/ai-assistant' },
      { name: 'All Tools', route: '/tools' },
      { name: 'Templates', route: '/templates' },
      { name: 'Business Tips', route: '/business-tips' },
      { name: 'Blog', route: '/blog' },
      { name: 'Saved Items', route: '/saved-items' },
      { name: 'Customers', route: '/customers' },
      { name: 'Favorites', route: '/favorites' },
      { name: 'Analytics', route: '/analytics' },
      { name: 'Referrals', route: '/referrals' },
      { name: "What's New", route: '/whats-new' },
      { name: 'Settings', route: '/settings' },
      { name: 'Support', route: '/support' },
    ],
  };
}

export async function getBusinessContext(profile) {
  const [stats, customers, savedCounts, recentInvoices, recentReceipts, profileRow, usageOverview] = await Promise.all([
    getDashboardStats().catch(() => null),
    listCustomers().catch(() => []),
    getSavedItemCounts().catch(() => null),
    listSavedItemsBetween({ type: 'invoice', fromIso: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() }).catch(() => []),
    listSavedItemsBetween({ type: 'receipt', fromIso: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() }).catch(() => []),
    supabase
      .from('profiles')
      .select('referral_code, total_referrals, referral_rewards, plan')
      .eq('id', profile.id)
      .single()
      .then(({ data }) => data)
      .catch(() => null),
    getUsageOverview(profile.id).catch(() => null),
  ]);

  const segments = segmentCustomers(customers);

  return {
    business_owner: profile.full_name || profile.email,
    plan: profile.plan,
    saved_item_counts: savedCounts,
    invoices_last_90_days: recentInvoices
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 15)
      .map((r) => ({
        invoice_number: r.payload?.invoiceNumber || r.name,
        customer: r.payload?.client?.name,
        total: r.payload?.total,
        currency: r.payload?.currency,
        status: r.payload?.status,
        due_date: r.payload?.dueDate,
        created_at: r.created_at,
      })),
    receipts_last_90_days_count: recentReceipts.length,
    receipts_last_90_days_total: recentReceipts.reduce((s, r) => s + Number(r.payload?.total || 0), 0),
    customers: {
      total: segments.total,
      active: segments.active,
      inactive_30d: segments.inactive.length,
      repeat: segments.repeat.length,
      top_by_revenue: segments.topByRevenue.map((c) => ({ name: c.name, total_spent: c.total_spent, orders: c.orders_count })),
      at_churn_risk: segments.atChurnRisk.map((c) => c.name),
    },
    referrals: profileRow
      ? { code: profileRow.referral_code, total_referrals: profileRow.total_referrals, active_bonus: profileRow.referral_rewards }
      : null,
    this_month: stats
      ? {
          invoices: stats.invoices,
          receipts: stats.receipts,
          profit_from_paid_items: stats.profit,
          overdue_invoice_count: stats.overdueInvoices?.length || 0,
        }
      : null,
    this_week_usage: usageOverview
      ? {
          tools_used: usageOverview.tools.count,
          documents_saved: usageOverview.documents.count,
          ai_requests: usageOverview.aiRequests.count,
          estimated_hours_saved: usageOverview.hoursSaved.value,
          most_used_tool: usageOverview.mostUsedToolSlug,
        }
      : null,

    // ---- Site-wide catalog (not the user's data — the app itself) ----
    site: getSiteContext(),
  };
}
