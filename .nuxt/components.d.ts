
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T


export const ChartLegend: typeof import("../components/ChartLegend.vue")['default']
export const PageAlerts: typeof import("../components/PageAlerts.vue")['default']
export const PageBreakeven: typeof import("../components/PageBreakeven.vue")['default']
export const PageHistory: typeof import("../components/PageHistory.vue")['default']
export const PageMap: typeof import("../components/PageMap.vue")['default']
export const PageOverview: typeof import("../components/PageOverview.vue")['default']
export const PageSettings: typeof import("../components/PageSettings.vue")['default']
export const SubComponentsBreakevenProgress: typeof import("../components/sub-components/BreakevenProgress.vue")['default']
export const SubComponentsEnergyAverages: typeof import("../components/sub-components/EnergyAverages.vue")['default']
export const SubComponentsHistoryChart: typeof import("../components/sub-components/HistoryChart.vue")['default']
export const SubComponentsHourlyChart: typeof import("../components/sub-components/HourlyChart.vue")['default']
export const SubComponentsLocationFilter: typeof import("../components/sub-components/LocationFilter.vue")['default']
export const SubComponentsMetricGrid: typeof import("../components/sub-components/MetricGrid.vue")['default']
export const SubComponentsPeakShaving: typeof import("../components/sub-components/PeakShaving.vue")['default']
export const SubComponentsPeakUsage: typeof import("../components/sub-components/PeakUsage.vue")['default']
export const SubComponentsPhaseGrid: typeof import("../components/sub-components/PhaseGrid.vue")['default']
export const SubComponentsSavingMetricGrid: typeof import("../components/sub-components/SavingMetricGrid.vue")['default']
export const SubComponentsSiteDetail: typeof import("../components/sub-components/SiteDetail.vue")['default']
export const SubComponentsSiteMap: typeof import("../components/sub-components/SiteMap.vue")['default']
export const UiCardWrapper: typeof import("../components/ui/CardWrapper.vue")['default']
export const UiEnergyFilter: typeof import("../components/ui/EnergyFilter.vue")['default']
export const UiPeriodTabs: typeof import("../components/ui/PeriodTabs.vue")['default']
export const UiPhaseCard: typeof import("../components/ui/PhaseCard.vue")['default']
export const UiPhaseSelector: typeof import("../components/ui/PhaseSelector.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page-placeholder")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyChartLegend: LazyComponent<typeof import("../components/ChartLegend.vue")['default']>
export const LazyPageAlerts: LazyComponent<typeof import("../components/PageAlerts.vue")['default']>
export const LazyPageBreakeven: LazyComponent<typeof import("../components/PageBreakeven.vue")['default']>
export const LazyPageHistory: LazyComponent<typeof import("../components/PageHistory.vue")['default']>
export const LazyPageMap: LazyComponent<typeof import("../components/PageMap.vue")['default']>
export const LazyPageOverview: LazyComponent<typeof import("../components/PageOverview.vue")['default']>
export const LazyPageSettings: LazyComponent<typeof import("../components/PageSettings.vue")['default']>
export const LazySubComponentsBreakevenProgress: LazyComponent<typeof import("../components/sub-components/BreakevenProgress.vue")['default']>
export const LazySubComponentsEnergyAverages: LazyComponent<typeof import("../components/sub-components/EnergyAverages.vue")['default']>
export const LazySubComponentsHistoryChart: LazyComponent<typeof import("../components/sub-components/HistoryChart.vue")['default']>
export const LazySubComponentsHourlyChart: LazyComponent<typeof import("../components/sub-components/HourlyChart.vue")['default']>
export const LazySubComponentsLocationFilter: LazyComponent<typeof import("../components/sub-components/LocationFilter.vue")['default']>
export const LazySubComponentsMetricGrid: LazyComponent<typeof import("../components/sub-components/MetricGrid.vue")['default']>
export const LazySubComponentsPeakShaving: LazyComponent<typeof import("../components/sub-components/PeakShaving.vue")['default']>
export const LazySubComponentsPeakUsage: LazyComponent<typeof import("../components/sub-components/PeakUsage.vue")['default']>
export const LazySubComponentsPhaseGrid: LazyComponent<typeof import("../components/sub-components/PhaseGrid.vue")['default']>
export const LazySubComponentsSavingMetricGrid: LazyComponent<typeof import("../components/sub-components/SavingMetricGrid.vue")['default']>
export const LazySubComponentsSiteDetail: LazyComponent<typeof import("../components/sub-components/SiteDetail.vue")['default']>
export const LazySubComponentsSiteMap: LazyComponent<typeof import("../components/sub-components/SiteMap.vue")['default']>
export const LazyUiCardWrapper: LazyComponent<typeof import("../components/ui/CardWrapper.vue")['default']>
export const LazyUiEnergyFilter: LazyComponent<typeof import("../components/ui/EnergyFilter.vue")['default']>
export const LazyUiPeriodTabs: LazyComponent<typeof import("../components/ui/PeriodTabs.vue")['default']>
export const LazyUiPhaseCard: LazyComponent<typeof import("../components/ui/PhaseCard.vue")['default']>
export const LazyUiPhaseSelector: LazyComponent<typeof import("../components/ui/PhaseSelector.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page-placeholder")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
