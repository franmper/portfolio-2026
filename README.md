# Francisco Peralta — Portfolio

Astro (static) + Sanity (content) + Vercel (hosting).

## Subir fotos

1. Abrí el Studio (`npm run sanity` en local, o https://phfranmper.sanity.studio — funciona desde el celular).
2. **Categories** → elegí una (o creá una nueva) → arrastrá todas las fotos juntas al campo **Photos**.
   - Arrastrá para reordenar. Alt text y caption son opcionales (click en la foto).
   - EXIF, dimensiones y el placeholder borroso se extraen solos.
3. **Publish**. El sitio se reconstruye solo en ~1 min (ver "Deploy automático").

- **Hero**: Site Settings → Hero photos (hasta 3; la primera es la grande). Cada una apunta a una categoría para el label y el filtro.
- **Projects**: igual que categorías, más nombre, fecha, descripción y portada opcional (si no, usa la primera foto). Cada proyecto tiene su página en `/projects/<slug>`.
- **Orden**: categorías y proyectos se ordenan arrastrando en la lista del Studio.
- **Contacto, redes, tienda, SEO**: Site Settings → Info. Si cargás **Shop URL**, aparecen el link TIENDA en el header y el bloque de cuadros enmarcados; vacío, se ocultan.

## Desarrollo

```bash
npm install
npm run dev        # sitio en http://localhost:4321
npm run sanity     # Studio en http://localhost:3333
npm run build
```

`.env` es opcional; ver `.env.example`. Si el dataset es privado, hace falta `SANITY_API_READ_TOKEN` (local y en Vercel).

## Deploy automático (una sola vez)

El sitio es estático: se genera en cada deploy. Para que publicar en Sanity actualice el sitio:

1. **Vercel** → Project → Settings → Git → **Deploy Hooks** → crear uno (branch `main`) y copiar la URL.
2. **sanity.io/manage** → proyecto `vpea4xzr` → API → **Webhooks** → Create:
   - URL: la del deploy hook
   - Dataset: `production`, Trigger on: Create / Update / Delete
   - Filter: `_type in ["category", "project", "siteSettings"]`
   - HTTP method: `POST`
3. Studio online para subir desde cualquier lado: `npm run sanity:deploy`.
