import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://entomimic.github.io/",
    title: "antp0p's Blog; or, Insectness'",
    description: "antp0p's tech blog, discussing game development & game design, and more.",
    author: "antp0p",
    profile: "https://github.com/entomimic",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "Etc/UTC",
    dir: "ltr",
    
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: true,
      url: "https://github.com/satnaing/astro-paper/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "github",   url: "https://github.com/entomimic" },
    { name: "bluesky",        url: "https://bsky.app/profile/entomimic.github.io" },
    { name: "bandcamp", url: "https://insectness.bandcamp.com/" },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x",        url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail",     url: "mailto:?subject=See%20this%20post&body=" },
  ],
});