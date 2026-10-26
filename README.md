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

### Comportamiento que se debe conservar en el catálogo

- Cada juego disponible en el proyecto debe tener su propia tarjeta en el home y un enlace a su
  propia pantalla; no agrupar juegos distintos en una misma tarjeta.
- Cada juego debe tener una sección independiente en este README que describa su comportamiento
  esperado y las reglas que deben preservarse. Actualiza esa sección al añadir un juego o cambiar
  intencionalmente su funcionalidad.
- Cada tarjeta de juego completa debe ser un enlace accesible a su juego, no solo el texto de
  acción dentro de la tarjeta. Evita anidar enlaces u otros controles interactivos en ella.
- Las tarjetas muestran información breve y útil, como el número de participantes, y tienen un
  indicador visible de que se puede entrar al juego.

### Comportamiento que se debe conservar en Charadas

- Debe haber tres dificultades seleccionables: fácil, intermedio y difícil. Cada una usa su
  propio banco de palabras.
- Las palabras se seleccionan al azar sin repetirse durante una partida, hasta agotar el banco
  de la dificultad elegida. El tamaño mostrado debe corresponder al banco real.
- La tarjeta debe revelar la palabra solo mientras se mantiene presionada. Al soltarla,
  cancelar la pulsación o finalizar la interacción con teclado, la palabra vuelve a ocultarse.
  Debe seguir funcionando con puntero y con teclado.
- El botón **Siguiente palabra** solo se habilita después de revelar la palabra actual al menos
  una vez. Después puede ocultarse al soltarla y avanzar sin mostrarla de nuevo; no debe
  introducir repeticiones. Al agotarse el banco, se informa que la partida terminó.
- **Jugar de nuevo** mezcla y reinicia el banco completo de la dificultad actual; **Cambiar
  dificultad** permite volver a elegir el nivel y comenzar una nueva partida.
- Los bancos de `charades-words.json` deben contener palabras únicas dentro de cada dificultad.
  Al añadir o modificar estas reglas, actualizar las pruebas de `src/app/app.spec.ts`, que
  cubren el revelado, la cancelación, el uso de teclado, la ausencia de repeticiones y el reinicio.

### Comportamiento que se debe conservar en Impostor

- La configuración debe solicitar primero la cantidad de participantes —de 3 a 12— y anunciar
  cuántos impostores habrá: uno con 3 a 6 jugadores y dos con 7 a 12.
- El mínimo de 3 permite jugar con un impostor y dos participantes restantes. El máximo de 12
  es un límite de diseño para mantener manejable una partida en un solo dispositivo.
- Antes de repartir roles, todos los participantes deben tener un nombre no vacío y único
  (ignorando mayúsculas, minúsculas y espacios adicionales). Se deben poder editar, ordenar,
  agregar o eliminar participantes, respetando el mínimo y máximo.
- Cada ronda asigna al azar una palabra del banco categorizado, los impostores y una pista para
  cada impostor. El banco de `impostor-words.json` debe mantener palabras únicas y al menos dos
  pistas no vacías por palabra.
- Los roles se revisan en privado pasando un mismo dispositivo, de uno en uno. La tarjeta revela
  el rol mientras se mantiene presionada y lo oculta al soltarla o cancelar la interacción; debe
  funcionar con puntero y teclado. Los jugadores normales reciben la palabra secreta y cada
  impostor recibe su pista, sin revelar la palabra.
- Durante el reparto debe quedar visible quién está revisando y el orden se puede modificar. Si
  se elimina a un participante durante la ronda, se deben invalidar los roles y repartirlos de
  nuevo antes de continuar.
- Tras el reparto, el grupo puede debatir y pasar a una votación pública por participante.
  Deben permitirse entre cero y tantos votos por persona como jugadores haya, el total no puede
  superar el número de participantes y no se puede finalizar una votación vacía.
- Los resultados deben resaltar quién era realmente impostor, contemplar empates y permitir
  revelar la palabra y su categoría. La solución no debe mostrarse durante la revisión privada.
- Al cambiar estas reglas, actualizar las pruebas en `src/app/app.spec.ts` para cubrir límites
  de participantes, nombres duplicados, asignación de roles, pista, privacidad y ocultamiento,
  reordenamiento, eliminación, suma y resta de votos, empates y resultados con uno o dos impostores.

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
