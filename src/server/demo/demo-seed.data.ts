const MS_DAY = 86_400_000;

/**
 * Demo portfolio anchored to seed time (`asOf`). Each tenant gets one “slot” role so
 * first-day dashboard + campaign drill-downs showcase the whole product—not only
 * “all future” or “all stale” rows.
 *
 * Matrix (intent):
 * – Nova “Summer”: flagship in-flight, improving efficiency (charts + insights)
 * – Nova “Brand Q3”: planned pipeline (timeline not started + empty charts)
 * – Luminary “Glow”: solid mid-flight DTC conversions
 * – Luminary “Retention”: at-risk + weakening series (needs attention narrative)
 * – Stackwise LinkedIn: B2B lead gen plateau / stable spend
 * – Stackwise Search: tighter at-risk runway (near deadline)
 * – Ironclad “New Year”: recently completed arc (portfolio closure)
 * – Ironclad “Summer Shred”: momentum / TikTok scale story
 * – Driftwood “Pinterest”: long awareness runway still early-mid flight
 * – Driftwood “Houzz”: planned runway (pipeline for home vertical)
 */

type MetricTuple = [number, number, number, number]; // impressions, clicks, spend, conversions

/** Last row is newest (anchor day). Useful for narratives in charts & AI context. */
function buildDailyMetricRows(anchor: Date, rows: MetricTuple[]) {
  const len = rows.length;
  if (len === 0) return [];
  return rows.map(([impressions, clicks, spend, conversions], i) => ({
    impressions,
    clicks,
    spend,
    conversions,
    date: new Date(anchor.getTime() - (len - 1 - i) * MS_DAY),
  }));
}

function growingPerformance(days: number): MetricTuple[] {
  return Array.from({ length: days }, (_, i) => {
    const impressions = 38_000 + i * 720;
    const clicks = Math.round(impressions * (0.029 + i * 0.00014));
    const spend = Math.round(410 + i * 11 + ((i % 4) + (i % 3)) * 3);
    const conversions = Math.max(16, Math.round(18 + i * 0.65 + Math.floor(i / 4)));
    return [impressions, clicks, spend, conversions] as MetricTuple;
  });
}

/** Spend holds while CTR and conversions soften — diagnostic at-risk demo story */
function weakeningPerformance(days: number): MetricTuple[] {
  return Array.from({ length: days }, (_, i) => {
    const t = i / Math.max(1, days - 1);
    const impressions = Math.round(24_000 - t * 1_600);
    const ctr = 0.033 - t * 0.008;
    const clicks = Math.round(impressions * Math.max(0.022, ctr));
    const spend = Math.round(248 + Math.sin(i * 0.35) * 8);
    const conversions = Math.max(4, Math.round(17 - t * 10 - (i % 5)));
    return [impressions, clicks, spend, conversions] as MetricTuple;
  });
}

function stableB2B(days: number): MetricTuple[] {
  return Array.from({ length: days }, (_, i) => {
    const impressions = 8_000 + ((i * 337) % 900);
    const clicks = Math.round(impressions * (0.038 + ((i % 5) - 2) * 0.001));
    const spend = Math.round(168 + i * 4 + ((i % 3) - 1) * 6);
    const conversions = Math.max(9, Math.round(11 + ((i % 7) + (i % 4)) * 0.35));
    return [impressions, clicks, spend, conversions] as MetricTuple;
  });
}

function tighteningSearch(days: number): MetricTuple[] {
  return Array.from({ length: days }, (_, i) => {
    const impressions = Math.round(4_950 - i * 55);
    const clicks = Math.round(impressions * (0.049 - i * 0.001));
    const spend = Math.round(122 - i * 2.8);
    const conversions = Math.max(1, Math.round(8 - i * 0.45));
    return [impressions, clicks, spend, Math.floor(conversions)] as MetricTuple;
  });
}

function completedArc(days: number): MetricTuple[] {
  return Array.from({ length: days }, (_, i) => {
    const phase = i < days * 0.35 ? i / Math.max(1, days * 0.35) : 1 - (i - days * 0.35) / Math.max(1, days * 0.65) * 0.25;
    const impressions = Math.round(31_000 + phase * 9_800 + Math.sin(i * 0.4) * 400);
    const clicks = Math.round(impressions * (0.029 + phase * 0.005));
    const spend = Math.round(455 + phase * 180 + ((i % 4) + (i % 3)) * 5);
    const conversions = Math.max(38, Math.round(40 + phase * 35 - (days - i) * 0.15));
    return [impressions, clicks, spend, conversions] as MetricTuple;
  });
}

/** Short-form scale: sharper mid-campaign acceleration */
function momentumSocial(days: number): MetricTuple[] {
  return Array.from({ length: days }, (_, i) => {
    const ramp = Math.min(1, i / 14);
    const impressions = Math.round(52_000 + ramp * 18_000 + i * 420);
    const clicks = Math.round(impressions * (0.029 + ramp * 0.007));
    const spend = Math.round(698 + ramp * 220 + i * 7);
    const conversions = Math.max(31, Math.round(33 + ramp * 24 + Math.floor(i / 3)));
    return [impressions, clicks, spend, conversions] as MetricTuple;
  });
}

/** Awareness-heavy: lighter conversions, smoother reach swell */
function awarenessSwell(days: number): MetricTuple[] {
  return Array.from({ length: days }, (_, i) => {
    const impressions = 27_800 + i * 540 + ((i % 6) + (i % 4)) * 60;
    const clicks = Math.round(impressions * (0.029 + Math.floor(i / 9) * 0.003));
    const spend = Math.round(328 + i * 13);
    const conversions = Math.round(10 + Math.floor(i / 5));
    return [impressions, clicks, spend, conversions] as MetricTuple;
  });
}

function buildDemoClients(asOf: Date) {
  const daysAgo = (n: number) => new Date(asOf.getTime() - n * MS_DAY);
  const daysFromNow = (n: number) => new Date(asOf.getTime() + n * MS_DAY);

  return [
    {
      name: "Sarah Mitchell",
      company: "NovaBrew Co.",
      industry: "Food & Beverage",
      email: "sarah@novabrewco.com",
      phone: "+1 415 555 0192",
      website: "https://novabrewco.com",
      notes: "Scaling DTC coffee brand. Focused on subscription growth.",
      status: "active",
      campaigns: [
        {
          /** Hero · flagship in-flight */
          name: "Summer Subscription Push",
          description:
            "Drive new subscription sign-ups through Meta and Google ahead of Q3.",
          platform: "Meta Ads",
          status: "active",
          goal: "conversions",
          startDate: daysAgo(22),
          endDate: daysFromNow(36),
          deadline: daysFromNow(36),
          metrics: buildDailyMetricRows(asOf, growingPerformance(21)),
        },
        {
          /** Planned · upper-funnel teaser */
          name: "Brand Awareness Q3",
          description: "Top-of-funnel awareness campaign targeting coffee enthusiasts 25-44.",
          platform: "TikTok Ads",
          status: "planned",
          goal: "brand_awareness",
          startDate: daysFromNow(9),
          endDate: daysFromNow(71),
          deadline: daysFromNow(71),
          metrics: [],
        },
      ],
    },
    {
      name: "James Okafor",
      company: "Luminary Skin",
      industry: "Beauty & Wellness",
      email: "james@luminaryskin.co",
      phone: "+1 310 555 0847",
      website: "https://luminaryskin.co",
      notes: "Premium skincare brand entering US market. High AOV, needs trust-building content.",
      status: "active",
      campaigns: [
        {
          name: "Glow Up Launch Campaign",
          description: "Product launch campaign for new vitamin C serum line.",
          platform: "Instagram Ads",
          status: "active",
          goal: "conversions",
          startDate: daysAgo(18),
          endDate: daysFromNow(26),
          deadline: daysFromNow(26),
          metrics: buildDailyMetricRows(asOf, growingPerformance(21)),
        },
        {
          /** At-risk · retention window tightening */
          name: "Retention Email x Paid Retargeting",
          description:
            "Re-engage past buyers with retargeting ads and matched email sequences.",
          platform: "Google Ads",
          status: "at_risk",
          goal: "retention",
          startDate: daysAgo(38),
          endDate: daysFromNow(5),
          deadline: daysFromNow(5),
          metrics: buildDailyMetricRows(asOf, weakeningPerformance(21)),
        },
      ],
    },
    {
      name: "Priya Nambiar",
      company: "Stackwise HQ",
      industry: "B2B SaaS",
      email: "priya@stackwise.io",
      phone: "+1 512 555 0334",
      website: "https://stackwise.io",
      notes: "Series A startup. CAC reduction is priority. Sales cycle is 45-60 days.",
      status: "active",
      campaigns: [
        {
          name: "LinkedIn Lead Gen — Q3",
          description:
            "Target VP Engineering and CTO personas on LinkedIn with demo booking CTAs.",
          platform: "LinkedIn Ads",
          status: "active",
          goal: "lead_generation",
          startDate: daysAgo(26),
          endDate: daysFromNow(48),
          deadline: daysFromNow(48),
          metrics: buildDailyMetricRows(asOf, stableB2B(21)),
        },
        {
          name: "Google Search — Brand + Competitor",
          description: "Capture high-intent searches including competitor brand terms.",
          platform: "Google Ads",
          status: "at_risk",
          goal: "lead_generation",
          startDate: daysAgo(44),
          endDate: daysFromNow(4),
          deadline: daysFromNow(4),
          metrics: buildDailyMetricRows(asOf, tighteningSearch(21)),
        },
      ],
    },
    {
      name: "Marcus Webb",
      company: "Ironclad Fitness",
      industry: "Health & Fitness",
      email: "marcus@ironclad.fit",
      phone: "+1 646 555 0721",
      website: "https://ironclad.fit",
      notes: "Online coaching platform. Targeting gym-goers looking to train at home.",
      status: "active",
      campaigns: [
        {
          /** Completed · proves historical performance + archive story */
          name: "New Year New You — Retargeting",
          description: "Retarget website visitors who viewed pricing but did not convert.",
          platform: "Meta Ads",
          status: "completed",
          goal: "conversions",
          startDate: daysAgo(58),
          endDate: daysAgo(11),
          deadline: daysAgo(11),
          metrics: buildDailyMetricRows(asOf, completedArc(21)),
        },
        {
          name: "Summer Shred Challenge",
          description:
            "8-week challenge campaign driving app downloads and program sign-ups.",
          platform: "TikTok Ads",
          status: "active",
          goal: "conversions",
          startDate: daysAgo(15),
          endDate: daysFromNow(39),
          deadline: daysFromNow(39),
          metrics: buildDailyMetricRows(asOf, momentumSocial(21)),
        },
      ],
    },
    {
      name: "Elena Voss",
      company: "Driftwood Interiors",
      industry: "Home & Lifestyle",
      email: "elena@driftwoodinteriors.com",
      phone: "+1 503 555 0268",
      website: "https://driftwoodinteriors.com",
      notes:
        "Boutique interior design studio. High-ticket services, long sales cycle.",
      status: "active",
      campaigns: [
        {
          name: "Pinterest + Google Discovery",
          description:
            "Inspiration-led discovery campaign targeting homeowners planning renovations.",
          platform: "Google Ads",
          status: "active",
          goal: "brand_awareness",
          startDate: daysAgo(17),
          endDate: daysFromNow(45),
          deadline: daysFromNow(45),
          metrics: buildDailyMetricRows(asOf, awarenessSwell(21)),
        },
        {
          /** Planned · partner listing launch */
          name: "Houzz Sponsored Listings",
          description: "Paid placement on Houzz to capture high-intent renovation leads.",
          platform: "Meta Ads",
          status: "planned",
          goal: "lead_generation",
          startDate: daysFromNow(11),
          endDate: daysFromNow(72),
          deadline: daysFromNow(72),
          metrics: [],
        },
      ],
    },
  ];
}

export function createDemoClients(asOf: Date = new Date()) {
  return buildDemoClients(asOf);
}
