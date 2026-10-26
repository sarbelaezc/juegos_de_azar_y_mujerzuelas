# Juegos de reunión

Aplicación web estática para jugar charadas y otros juegos en familia o con amigos. La idea
inicial es jugar desde un solo dispositivo, sin cuentas ni servidor propio.

La interfaz está construida con Angular y Tailwind CSS.

## Requisitos

- Node.js 20.19 o posterior
- npm

## Empezar

Instala las dependencias y levanta el servidor de desarrollo:

```bash
npm install
npm start
```

Abre `http://localhost:4200/`. La aplicación se recarga al guardar cambios.

## Comandos útiles

```bash
npm run build
npm test -- --watch=false
```

La compilación optimizada queda en `dist/juegos-de-reunion/`.

## Desplegar en Netlify

El proyecto incluye `netlify.toml` con el comando de compilación, la carpeta publicada y la
regla necesaria para que las rutas de Angular funcionen al abrirlas o recargarlas directamente.
No requiere backend, funciones ni variables secretas.

Para configurar despliegue automático:

1. Sube el proyecto a GitHub y asegúrate de que `netlify.toml`, `package.json` y
   `package-lock.json` estén incluidos.
2. Entra a [Netlify](https://app.netlify.com/), inicia sesión y elige **Add new project** >
   **Import an existing project**.
3. Conecta GitHub, selecciona este repositorio y deja que Netlify lea los ajustes de
   `netlify.toml`. Si los solicita manualmente, usa:
   - Build command: `npm run build`
   - Publish directory: `dist/juegos-de-reunion/browser`
   - Production branch: `main`
4. Pulsa **Deploy**. Netlify asignará una URL gratuita `*.netlify.app`; los siguientes cambios
   enviados a `main` se publicarán automáticamente.

La aplicación es estática, así que no agregues complementos, funciones, bases de datos ni
servicios de pago. El plan Free de Netlify usa un límite mensual de créditos; las compilaciones
de producción, solicitudes y transferencia consumen créditos. Para mantenerlo gratis, evita
publicar cambios de prueba repetidamente en `main` y revisa el consumo en Netlify. Los límites
y precios pueden cambiar; confirma las condiciones vigentes en su [página de precios](https://www.netlify.com/pricing/).

## Estructura

- `src/app/features/home/`: portada y catálogo de juegos.
- `src/app/features/charadas/`: juego de Charadas y banco de palabras por dificultad.
- `src/app/features/charadas/charades-words.json`: banco de palabras por dificultad.
- `src/app/features/charadas/charades-words.ts`: tipos y acceso tipado al banco.
- `src/app/features/impostor/`: configuración de participantes y juego de Impostor.
- `src/app/features/impostor/impostor-words.json`: banco del juego Impostor, organizado por categorías con varias pistas por palabra.
- `src/app/shared/site-header/`: encabezado compartido entre las pantallas.
- `src/app/app.routes.ts`: rutas con carga diferida para cada pantalla.
- `src/styles.css`: estilos y variables globales.

Impostor se juega pasando un único dispositivo: se elige la cantidad de participantes, se
ingresan y ordenan sus nombres, y cada persona ve su rol en privado. Una persona recibe el rol
de impostor; el resto comparte una palabra secreta.
