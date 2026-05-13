
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

interface _GlobalComponents {
  ChartLegend: typeof import("../../components/ChartLegend.vue")['default']
  PageAlerts: typeof import("../../components/PageAlerts.vue")['default']
  PageBreakeven: typeof import("../../components/PageBreakeven.vue")['default']
  PageHistory: typeof import("../../components/PageHistory.vue")['default']
  PageMap: typeof import("../../components/PageMap.vue")['default']
  PageOverview: typeof import("../../components/PageOverview.vue")['default']
  PageSettings: typeof import("../../components/PageSettings.vue")['default']
  SubComponentsBreakevenProgress: typeof import("../../components/sub-components/BreakevenProgress.vue")['default']
  SubComponentsEnergyAverages: typeof import("../../components/sub-components/EnergyAverages.vue")['default']
  SubComponentsHistoryChart: typeof import("../../components/sub-components/HistoryChart.vue")['default']
  SubComponentsHourlyChart: typeof import("../../components/sub-components/HourlyChart.vue")['default']
  SubComponentsLocationFilter: typeof import("../../components/sub-components/LocationFilter.vue")['default']
  SubComponentsMetricGrid: typeof import("../../components/sub-components/MetricGrid.vue")['default']
  SubComponentsPeakShaving: typeof import("../../components/sub-components/PeakShaving.vue")['default']
  SubComponentsPeakUsage: typeof import("../../components/sub-components/PeakUsage.vue")['default']
  SubComponentsPhaseGrid: typeof import("../../components/sub-components/PhaseGrid.vue")['default']
  SubComponentsSavingMetricGrid: typeof import("../../components/sub-components/SavingMetricGrid.vue")['default']
  SubComponentsSiteDetail: typeof import("../../components/sub-components/SiteDetail.vue")['default']
  SubComponentsSiteMap: typeof import("../../components/sub-components/SiteMap.vue")['default']
  UiCardWrapper: typeof import("../../components/ui/CardWrapper.vue")['default']
  UiEnergyFilter: typeof import("../../components/ui/EnergyFilter.vue")['default']
  UiPeriodTabs: typeof import("../../components/ui/PeriodTabs.vue")['default']
  UiPhaseCard: typeof import("../../components/ui/PhaseCard.vue")['default']
  UiPhaseSelector: typeof import("../../components/ui/PhaseSelector.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtImg: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page-placeholder")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyChartLegend: LazyComponent<typeof import("../../components/ChartLegend.vue")['default']>
  LazyPageAlerts: LazyComponent<typeof import("../../components/PageAlerts.vue")['default']>
  LazyPageBreakeven: LazyComponent<typeof import("../../components/PageBreakeven.vue")['default']>
  LazyPageHistory: LazyComponent<typeof import("../../components/PageHistory.vue")['default']>
  LazyPageMap: LazyComponent<typeof import("../../components/PageMap.vue")['default']>
  LazyPageOverview: LazyComponent<typeof import("../../components/PageOverview.vue")['default']>
  LazyPageSettings: LazyComponent<typeof import("../../components/PageSettings.vue")['default']>
  LazySubComponentsBreakevenProgress: LazyComponent<typeof import("../../components/sub-components/BreakevenProgress.vue")['default']>
  LazySubComponentsEnergyAverages: LazyComponent<typeof import("../../components/sub-components/EnergyAverages.vue")['default']>
  LazySubComponentsHistoryChart: LazyComponent<typeof import("../../components/sub-components/HistoryChart.vue")['default']>
  LazySubComponentsHourlyChart: LazyComponent<typeof import("../../components/sub-components/HourlyChart.vue")['default']>
  LazySubComponentsLocationFilter: LazyComponent<typeof import("../../components/sub-components/LocationFilter.vue")['default']>
  LazySubComponentsMetricGrid: LazyComponent<typeof import("../../components/sub-components/MetricGrid.vue")['default']>
  LazySubComponentsPeakShaving: LazyComponent<typeof import("../../components/sub-components/PeakShaving.vue")['default']>
  LazySubComponentsPeakUsage: LazyComponent<typeof import("../../components/sub-components/PeakUsage.vue")['default']>
  LazySubComponentsPhaseGrid: LazyComponent<typeof import("../../components/sub-components/PhaseGrid.vue")['default']>
  LazySubComponentsSavingMetricGrid: LazyComponent<typeof import("../../components/sub-components/SavingMetricGrid.vue")['default']>
  LazySubComponentsSiteDetail: LazyComponent<typeof import("../../components/sub-components/SiteDetail.vue")['default']>
  LazySubComponentsSiteMap: LazyComponent<typeof import("../../components/sub-components/SiteMap.vue")['default']>
  LazyUiCardWrapper: LazyComponent<typeof import("../../components/ui/CardWrapper.vue")['default']>
  LazyUiEnergyFilter: LazyComponent<typeof import("../../components/ui/EnergyFilter.vue")['default']>
  LazyUiPeriodTabs: LazyComponent<typeof import("../../components/ui/PeriodTabs.vue")['default']>
  LazyUiPhaseCard: LazyComponent<typeof import("../../components/ui/PhaseCard.vue")['default']>
  LazyUiPhaseSelector: LazyComponent<typeof import("../../components/ui/PhaseSelector.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page-placeholder")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
