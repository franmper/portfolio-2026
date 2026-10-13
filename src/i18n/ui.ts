export type Lang = "es" | "en";
export const languages: Lang[] = ["es", "en"];
export const defaultLang: Lang = "es";

export const ui = {
  es: {
    locale: "es_AR",
    all: "Todos",
    projects: "Proyectos",
    press: "Prensa",
    publishedIn: "Publicado en",
    viewAll: "Ver todas",
    viewMore: "Ver más trabajos",
    noPhotos: "Todavía no hay fotos",
    openPhoto: "Abrir foto",
    photo: "foto",
    photos: "fotografías",
    contact: "Contacto",
    shop: "Tienda",
    email: "Email",
    allProjects: "← Todos los proyectos",
    menu: "Menú",
    closeMenu: "Cerrar menú",
    homeTitle: "Fotógrafo de automovilismo",
    photoGallery: "Galería de fotos",
    jobTitle: "Fotógrafo",
    photosFrom: "Fotos de",
    events: "eventos",
    categoryTitle: (name: string) => `Fotografía de ${name}`,
    by: "por",
    of: "de",
    shopCta: {
      eyebrow: "CUADROS ENMARCADOS",
      title: "Llevá una foto a tu pared",
      text: "Impresiones de alta calidad con marco, listas para colgar. Varios tamaños disponibles.",
      button: "VER TIENDA",
    },
    lightbox: {
      Previous: "Anterior",
      Next: "Siguiente",
      Close: "Cerrar",
      Loading: "Cargando…",
      "Photo gallery": "Galería de fotos",
    },
  },
  en: {
    locale: "en_US",
    all: "All",
    projects: "Projects",
    press: "Press",
    publishedIn: "Published in",
    viewAll: "View all",
    viewMore: "View more work",
    noPhotos: "No photos yet",
    openPhoto: "Open photo",
    photo: "photo",
    photos: "photographs",
    contact: "Contact",
    shop: "Shop",
    email: "Email",
    allProjects: "← All projects",
    menu: "Menu",
    closeMenu: "Close menu",
    homeTitle: "Motorsport photographer",
    photoGallery: "Photo gallery",
    jobTitle: "Photographer",
    photosFrom: "Photos from",
    events: "events",
    categoryTitle: (name: string) => `${name} photography`,
    by: "by",
    of: "of",
    shopCta: {
      eyebrow: "FRAMED PRINTS",
      title: "Bring a photo to your wall",
      text: "High-quality framed prints, ready to hang. Several sizes available.",
      button: "VISIT SHOP",
    },
    lightbox: {},
  },
} as const;

export const t = (lang: Lang) => ui[lang];

/** "/" or "/en/" */
export const homePath = (lang: Lang) => (lang === defaultLang ? "/" : `/${lang}/`);

/** Path of a page in the given language. `path` has no language prefix and no leading slash. */
export const pathFor = (lang: Lang, path = "") => (lang === defaultLang ? `/${path}` : `/${lang}/${path}`);

export const otherLang = (lang: Lang): Lang => (lang === "es" ? "en" : "es");
