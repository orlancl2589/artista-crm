export const PLAN_LIMITS = {
  free: {
    maxClients: 15,
    maxEventsPerMonth: 5,
    maxWhatsAppMessages: 30,
    maxAIResponses: 0,
    hasAIAgent: false,
    hasPDFQuotes: false,
    hasSEOAdvanced: false,
    hasCustomDomain: false,
    hasAdsIntegration: false,
    hasAnalytics: false,
    hasBirthdayEngine: false,
  },
  starter: {
    maxClients: 80,
    maxEventsPerMonth: 20,
    maxWhatsAppMessages: 200,
    maxAIResponses: 100,
    hasAIAgent: true,
    hasPDFQuotes: true,
    hasSEOAdvanced: false,
    hasCustomDomain: false,
    hasAdsIntegration: false,
    hasAnalytics: false,
    hasBirthdayEngine: false,
  },
  pro: {
    maxClients: Infinity,
    maxEventsPerMonth: Infinity,
    maxWhatsAppMessages: Infinity,
    maxAIResponses: Infinity,
    hasAIAgent: true,
    hasPDFQuotes: true,
    hasSEOAdvanced: true,
    hasCustomDomain: true,
    hasAdsIntegration: true,
    hasAnalytics: true,
    hasBirthdayEngine: true,
  },
  agency_plan: {
    maxClients: Infinity,
    maxEventsPerMonth: Infinity,
    maxWhatsAppMessages: Infinity,
    maxAIResponses: Infinity,
    hasAIAgent: true,
    hasPDFQuotes: true,
    hasSEOAdvanced: true,
    hasCustomDomain: true,
    hasAdsIntegration: true,
    hasAnalytics: true,
    hasBirthdayEngine: true,
    maxArtists: 15,
    isWhiteLabel: true,
    hasAPIAccess: true,
  },
} as const

export function checkPlanLimit(
  plan: keyof typeof PLAN_LIMITS,
  feature: keyof (typeof PLAN_LIMITS)['pro']
): boolean {
  const limits = PLAN_LIMITS[plan] as Record<string, unknown>
  return Boolean(limits[feature as string])
}
