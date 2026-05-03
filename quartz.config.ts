import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Imaginal Blog",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: {
      provider: "plausible",
    },
    locale: "ru-RU",
    baseUrl: "blog.imaginal.dev",
    ignorePatterns: ["private", "templates", ".obsidian"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Lora",
        body: "Lora",
        code: "Space Mono",
      },
      colors: {
        lightMode: {
          light: "#fcfaf2",
          lightgray: "#f2efdf",
          gray: "#bdae93",
          darkgray: "#504945",
          dark: "#3c3836",
          secondary: "#b57614",
          tertiary: "#427b58",
          highlight: "rgba(189, 174, 147, 0.15)",
          textHighlight: "#fabd2f88",
        },
        darkMode: {
          light: "#282828",
          lightgray: "#3c3836",
          gray: "#665c54",
          darkgray: "#ebdbb2",
          dark: "#fbf1c7",
          secondary: "#fabd2f",
          tertiary: "#8ec07c",
          highlight: "rgba(102, 92, 84, 0.15)",
          textHighlight: "#d3869b88",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // Comment out CustomOgImages to speed up build time
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
