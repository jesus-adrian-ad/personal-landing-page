# Sitio personal — Adrián Alcocer

**Live:** https://jesus-adrian-ad.github.io/personal-landing-page/

Portafolio de un desarrollador backend. HTML, CSS y JavaScript planos:
sin frameworks, sin dependencias, sin paso de compilación.

## Estructura

```
index.html          Versión en inglés
index-es.html       Versión en español
robots.txt          Indexación
sitemap.xml         Las dos URLs con sus alternativas de idioma
styles/styles.css   Hoja única, en bloques numerados
scripts/main.js     Tema, menú, scroll-spy y revelado
assets/
  docs/             CV en ambos idiomas (PDF)
  icons/tech/       Logos de tecnologías (devicon, MIT)
  images/           Foto del hero e imagen social
```

## Decisiones que conviene conocer antes de tocar nada

**Dos archivos HTML, uno por idioma.** Se eligió sobre un intercambio con
JavaScript para que cada idioma tenga su URL indexable. El precio es real:
comparten el ~78 % de sus líneas, así que **todo cambio de contenido hay que
hacerlo en los dos**. Haz un diff estructural entre ambos antes de cerrar un
cambio.

**El CSS es un solo archivo con bloques numerados.** Cada bloque lleva sus
media queries al final. Los cuatro breakpoints y su razón de ser están
documentados en la cabecera de `styles.css`.

**El JavaScript es progressive enhancement de verdad.** La clase `.reveal`
la añade el script, nunca el HTML: si el JS falla, no se oculta nada. No
inviertas esa relación.

**El script del tema es inline en el `<head>` a propósito.** Tiene que correr
antes del primer pintado o se ve un destello blanco al recargar en oscuro.

**`main.js` va al final de `<body>` sin `defer`,** por la misma razón.

## Desarrollo

No hace falta ninguna herramienta. Abre `index.html` en el navegador, o
levanta un servidor estático para que las rutas absolutas se comporten igual
que en producción:

```bash
python3 -m http.server 8000
```

## Créditos

Logos de tecnologías: [devicon](https://github.com/devicons/devicon) (MIT).
Las marcas pertenecen a sus respectivos titulares.

## Si cambias de dominio

La URL del sitio está escrita en cinco sitios y **las cinco tienen que
coincidir**, o Google y las redes sociales apuntarán a direcciones muertas:

- `canonical` y `og:url` en ambos HTML
- `og:image` en ambos HTML
- Los tres `hreflang` en ambos HTML
- `@id` y `url` del JSON-LD en ambos HTML
- `robots.txt` y `sitemap.xml`

```bash
grep -rl "jesus-adrian-ad.github.io/personal-landing-page" . \
  | xargs sed -i "s|https://jesus-adrian-ad.github.io/personal-landing-page|https://TU-NUEVO-DOMINIO|g"
```

Después, pasa la URL por LinkedIn Post Inspector y Facebook Sharing Debugger
para forzar el refresco de la caché del preview.
