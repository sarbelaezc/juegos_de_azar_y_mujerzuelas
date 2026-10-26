# Juegos de reunión

Aplicación web estática para jugar charadas e impostor en reuniones con familia o amigos. Los
juegos están pensados para usarse desde un solo dispositivo y no requieren cuentas, backend ni
servidores propios.

## Tecnologías

- Angular 21 y TypeScript.
- Tailwind CSS 4.
- npm y Angular CLI.
- Netlify para el despliegue estático opcional.

## Requisitos

- Node.js 20.19 o posterior (también se admiten Node.js 22.12 o posterior y 24 o posterior).
- npm, incluido con Node.js.
- Git para clonar el repositorio y contribuir.

## Ejecutar en local

Clona el repositorio, entra en su carpeta e instala las versiones exactas guardadas en el lockfile:

```bash
git clone git@github.com:sarbelaezc/juegos_de_azar_y_mujerzuelas.git
cd juegos_de_azar_y_mujerzuelas
npm ci
npm start
```

Abre <http://localhost:4200/>. Angular mantiene el servidor de desarrollo activo y actualiza la
aplicación al guardar cambios. Para detenerlo, usa `Ctrl+C` en la terminal.

## Compilar y ejecutar pruebas

```bash
# Compilación optimizada de producción
npm run build

# Pruebas unitarias una vez, sin modo interactivo
npm test -- --watch=false
```

La compilación de producción se genera en `dist/juegos-de-reunion/browser/`, que es la carpeta
que debe publicarse en el hosting. Las pruebas usan Vitest y se encuentran en `src/app/app.spec.ts`.

Durante el desarrollo también puedes ejecutar:

```bash
# Compilar en modo desarrollo cada vez que cambien los archivos
npm run watch

# Ejecutar las pruebas en modo interactivo
npm test
```

## Estructura del proyecto

```text
.
├── .github/
│   └── copilot-instructions.md       # Convenciones de desarrollo
├── netlify.toml                      # Compilación, publicación y rutas SPA
├── public/                           # Recursos estáticos, como el favicon
└── src/
    ├── app/
    │   ├── app.routes.ts             # Rutas con carga diferida
    │   ├── app.spec.ts               # Pruebas de interfaz y flujos de juego
    │   ├── features/
    │   │   ├── home/                 # Portada y catálogo de juegos
    │   │   ├── charadas/             # Juego y banco por dificultad
    │   │   └── impostor/             # Participantes, reparto, votación y resultados
    │   └── shared/
    │       └── site-header/          # Encabezado compartido
    ├── index.html
    ├── main.ts
    └── styles.css                    # Tailwind y estilos globales
```

Los bancos de palabras están junto a su juego: `src/app/features/charadas/charades-words.json`
y `src/app/features/impostor/impostor-words.json`. El banco de Impostor se organiza por
categorías y cada palabra contiene varias pistas.

Los nombres y el estado de una partida se mantienen en el dispositivo mientras la aplicación
está abierta; no se sincronizan con otros dispositivos ni se guardan en una cuenta o backend.

## Contribuir

1. Crea una rama de funcionalidad desde `develop`, usando un nombre descriptivo:

   ```bash
   git switch develop
   git pull
   git switch -c feature/nombre-del-cambio
   ```

2. Mantén los cambios enfocados y crea commits pequeños con mensajes claros. Se recomienda el
   formato Conventional Commits, por ejemplo `feat: add new game` o `fix: prevent duplicate words`.
3. Antes de abrir una solicitud de cambios, ejecuta y verifica:

   ```bash
   npm test -- --watch=false
   npm run build
   ```

4. Abre una Pull Request de `feature/...` hacia `develop` y describe los cambios y las
   verificaciones realizadas.
5. Las versiones aprobadas se integran de `develop` a `main`. `main` es la rama de producción y
   activa el despliegue de Netlify.

Sigue las convenciones de [`.github/copilot-instructions.md`](.github/copilot-instructions.md).
En particular, diseña mobile-first, comprueba que no haya desbordamiento horizontal y conserva la
accesibilidad y las áreas táctiles cómodas.

## Desplegar en Netlify

El archivo [`netlify.toml`](netlify.toml) configura el comando `npm run build`, la carpeta
`dist/juegos-de-reunion/browser` y la regla de fallback para que las rutas de Angular funcionen
al abrirse o recargarse directamente. La aplicación no necesita backend, funciones, plugins ni
variables secretas.

### Sitio publicado

- [Abrir Juegos de reunión](https://pa-parchar.netlify.app/)
- [Abrir Charadas](https://pa-parchar.netlify.app/charadas)
- [Abrir Impostor](https://pa-parchar.netlify.app/impostor)

Las tres direcciones responden desde Netlify. Después de cada despliegue, comprueba también la
navegación y recarga directa de las rutas en un navegador.

### Configuración inicial

1. Sube el repositorio a GitHub, incluyendo `netlify.toml`, `package.json` y `package-lock.json`.
2. Entra a [Netlify](https://app.netlify.com/) y selecciona **Add new project** >
   **Import an existing project**.
3. Conecta GitHub, autoriza el acceso solicitado y selecciona este repositorio.
4. Configura `main` como rama de producción. Netlify puede leer los ajustes del archivo
   `netlify.toml`; si solicita los valores manualmente, usa:
   - Build command: `npm run build`
   - Publish directory: `dist/juegos-de-reunion/browser`
   - Production branch: `main`
5. Inicia el despliegue. Netlify proporcionará una URL `*.netlify.app`; también se puede
   configurar un dominio propio si se desea.

### Publicaciones posteriores

Integra los cambios aprobados en `main` para que Netlify genere un despliegue de producción.
Los cambios de otras ramas pueden revisarse con Deploy Previews si están habilitados en la
configuración de Netlify.

Netlify ofrece un plan gratuito, sujeto a los límites y condiciones vigentes de la plataforma.
Las compilaciones, solicitudes y transferencia pueden consumir créditos. Para controlar el uso,
evita activar despliegues innecesarios y revisa el consumo desde la cuenta de Netlify. Consulta
la [página de precios de Netlify](https://www.netlify.com/pricing/) para ver los términos
actuales.
