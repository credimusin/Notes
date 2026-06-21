import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import Footer from "./quartz/components/Footer"

componentRegistry.setOptionOverrides("recent-notes", {
  limit: 4,
  filter: (f) =>
    f.slug !== "index" &&
    (f.slug ? !f.slug.endsWith("/index") : true) &&
    f.dates &&
    (f.dates.modified ?? f.dates.created ?? new Date(0)) >
      new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout({
  defaults: {
    footer: Footer({
      links: {
        GitHub: "https://github.com/credimusin",
        X: "https://x.com/credimusin",
      },
    }),
  },
})
