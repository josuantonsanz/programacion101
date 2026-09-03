# Arquitectura — Aprende a programar con bloques

Documento técnico del proyecto. Para el manual de uso (cómo abrirlo, cómo
añadir contenido), ver [README.md](README.md).

---

## 1. Visión general

Aplicación web **100 % frontend, sin servidor propio**: un único `index.html`
que carga CSS y JavaScript en local y los datos del temario desde
`data/temario.json`. Toda la lógica se ejecuta en el navegador del alumno.

El flujo pedagógico es:

```
Temario (capítulos)
   └─► Capítulo (filtra bloques disponibles)
         ├─► Ejemplo montado  → se construye solo (estado o función)
         └─► Ejercicio (test) → el alumno construye; la app autocorrige
```

Cada capítulo define qué bloques aparecen en la toolbox; cada ejemplo o
ejercicio define (opcionalmente) cómo se monta el espacio de trabajo inicial.

## 2. Tecnologías

| Componente | Tecnología |
|------------|------------|
| Estructura | HTML5 + CSS3 (variables CSS, grid/flex) |
| Lógica | JavaScript (ES2017+) sin frameworks ni bundlers |
| Editor de bloques | [Blockly](https://developers.google.com/blockly) `12.5.1` desde CDN (cdnjs) |
| Datos | JSON estático (`data/temario.json`), cargado con `fetch()` |
| Ejecución | El código de bloques se traduce a JavaScript y se evalúa con `new Function` |

### ¿Por qué fetch + servidor local?

El temario se lee con `fetch('data/temario.json')`. Los navegadores bloquean
`fetch` sobre `file://` (política de origen), por eso la página debe servirse
con un servidor estático (`python -m http.server 8000`). A cambio, el contenido
queda en un JSON puro, editable sin tocar código. `app.js` muestra un aviso
explicativo si la carga falla.

## 3. Estructura de directorios

```
bloques-programacion/
├── index.html            → estructura HTML, enlaces a CSS/JS, scripts de Blockly (CDN)
├── css/
│   ├── estilos-pico.css  → diseño sobrio actual (ajustes sobre Pico CSS, cargado por CDN)
│   └── estilos.css       → diseño de pizarra anterior, conservado como referencia
├── js/
│   ├── bloques.js        → bloques personalizados, registro de bloques, toolbox
│   ├── constructores.js  → helpers de montaje + CONSTRUCTORES (id → función)
│   └── app.js            → carga de datos, estado, navegación, ejecución, verificación
├── data/
│   └── temario.json      → datos puros: capítulos, ejemplos, tests, resultadoEsperado
└── assets/               → recursos estáticos (imágenes, iconos, scripts offline)
```

Orden de carga en `index.html` (importante, hay dependencias):

1. Scripts de Blockly desde CDN (core, bloques, generadores JS y Python, español).
2. `js/bloques.js` — define bloques y la toolbox (usa las APIs de Blockly).
3. `js/constructores.js` — helpers y `CONSTRUCTORES` (usa `workspace` global).
4. `js/app.js` — inyecta Blockly, carga el JSON y arranca (usa todo lo anterior).

## 4. Componentes

### 4.1 `js/bloques.js` — bloques y toolbox

Tres responsabilidades:

1. **Bloques propios del taller**:
   - `mostrar`, `tipo_de` (salida y tipo de un valor);
   - `pedir` (entrada de datos, como `input()`), `convertir` (casting
     `int`/`float`/`str`);
   - `operacion_extra` (potencia, división entera, resto);
   - `romper`, `continuar`, `no_hacer_nada` (`break`, `continue`, `pass`);
   - bloques de cadenas: `text_repetir`, `text_char`, `text_slice`,
     `text_transformar`, `text_buscar`, `text_reemplazar`, `text_contiene`,
     `text_tiene_mayuscula`, `text_tiene_numero`;
   - bloques de listas y bucles `for`: `lista` (con mutator), `lista_vacia`,
     `lista_longitud`, `lista_elemento`, `lista_parte`, `lista_anadir`,
     `lista_quitar`, `lista_poner`, `lista_ordenar`, `lista_invertir`,
     `lista_copiar`, `lista_contiene`, `rango`, `para_cada`;
   - bloques de funciones: `funcion_definir`, `funcion_llamar` (doble modo:
     valor si está conectada a una salida, sentencia si va sola),
     `devolver`.
   Cada uno tiene definición visual (`Blockly.Blocks`), generador Python
   (lo que ve el alumno) y generador JavaScript (lo que se ejecuta).
   `pedir` genera `entrada(...)` en JS; `text_char`/`lista_elemento` generan
   `charEn(...)`/`elementoEn(...)` (índices negativos, como Python);
   `rango` genera `rango(...)` (array; admite paso negativo para
   recorridos descendentes); `lista_ordenar` genera
   `ordenarLista(...)` (comparador numérico/alphabetico).

   **Detalle — ámbito en funciones:** el generador JS estándar de
   `variables_set` declara todas las variables globales (`var x;` al
   principio), lo que rompería el ámbito local de una función. En
   `bloques.js` se sobrescribe: si algún ancestro del bloque (vía
   `getParent()`) es `funcion_definir`, emite `var x = ...;` (local); si no,
   `x = ...;` (global, `finish()` la declara igualmente).

2. **`REGISTRO_BLOQUES`**: mapa `tipo de bloque → {categoria, colour}`. Es la
   única fuente de verdad para saber a qué categoría pertenece cada bloque.

3. **`construirToolbox(listaBloques)`**: genera la toolbox de Blockly a partir
   de la lista de bloques permitidos del capítulo. La categoría *Variables*
   usa la categoría dinámica `VARIABLE` de Blockly (crea variables al vuelo);
   el resto, categorías estáticas con los bloques concretos. La lista de
   categorías (y su orden) está en `ORDEN_CATEGORIAS`.

### 4.2 `js/constructores.js` — montaje programático de bloques

Parte **comportamiento** del temario: el JSON no puede contener funciones.

- **Helpers** (`crear`, `variable`, `bloqueSet`, `bloqueGet`, `bloqueTexto`,
  `bloqueNum`, `bloqueBool`, `bloqueMostrar`, `bloqueTipoDe`,
  `bloqueComparar`, `bloqueLogica`, `bloqueNegar`, `bloqueAritmetica`,
  `bloqueOpExtra`, `bloqueRaiz`, `bloqueLongitud`, `bloqueRepite`,
  `bloquePedir`, `bloqueConvertir`, `bloqueUnir`, `bloqueChar`,
  `bloqueSlice`, `bloqueTransformar`, `bloqueBuscar`, `bloqueReemplazar`,
  `bloqueContieneTexto`, `bloqueTieneMayuscula`, `bloqueTieneNumero`,
  `bloqueLista`, `bloqueListaVacia`, `bloqueListaLongitud`,
  `bloqueListaElemento`, `bloqueListaParte`, `bloqueListaAnadir`,
  `bloqueListaQuitar`, `bloqueListaPoner`, `bloqueListaOrdenar`,
  `bloqueListaInvertir`, `bloqueListaCopiar`, `bloqueListaContiene`,
  `bloqueRango`, `bloqueParaCada`, `bloqueDefinir`, `bloqueLlamar`,
  `bloqueDevolver`, `bloqueSi`, `bloqueRandomInt`, `encadenar`): API
  declarativa de alto nivel para construir bloques y conectarlos (crean
  variables en el mapa de variables de Blockly cuando hace falta).
- **`CONSTRUCTORES`**: mapa `id → función de montaje`. Los `id` coinciden con
  los de `data/temario.json`.

> Convención: los ids usan `kebab-case` con prefijo del capítulo
> (`logica-puede-conducir`, `bucles-cuenta-atras`…).

### 4.3 `data/temario.json` — los datos

Parte **datos** del temario. Esquema:

```jsonc
{
  "capitulos": [
    {
      "id": "string",            // único
      "numero": 1,               // orden en el temario
      "titulo": "string",
      "resumen": "string",
      "bloques": ["tipo_bloque"],// filtro de la toolbox
      "ejemplos": [
        {
          "id": "string",        // clave de CONSTRUCTORES si aplica
          "titulo": "string",
          "explicacion": "string",
          "estado": { }          // opcional: JSON nativo exportado por Blockly
        }
      ],
      "tests": [
        {
          "id": "string",
          "titulo": "string",
          "enunciado": "string",
          "explicacion": "string",        // pista desplegable
          "entradas": ["string"],        // opcional: valores que "escribe" el usuario (bloque pedir)
          "resultadoEsperado": ["string"],// líneas exactas de la consola
          "estado": { }                   // opcional
        }
      ]
    }
  ]
}
```

**Decisión de diseño — datos vs. comportamiento:** el JSON contiene solo datos
serializables. Las funciones de montaje viven en `CONSTRUCTORES` y se
"enganchan" en tiempo de carga: `app.js` hace `ej.construir = CONSTRUCTORES[ej.id]`.
Existe además el campo `estado`: JSON nativo de Blockly (el que exporta el
panel del profesor), que permite crear contenidos montados **sin escribir
JavaScript**. En `seleccionarContenido`, `estado` tiene prioridad sobre
`construir`.

### 4.4 `js/app.js` — aplicación

Es el corazón: estado, navegación y ejecución.

**Funciones de soporte en tiempo de ejecución** (`mostrar`, `tipoDeES`,
`entrada`, `charEn`, `elementoEn`, `rango`, `ordenarLista`,
`escribirEnConsola`): implementan en JS las "funciones estándar" del taller.
`formatearValor` da formato Python a la salida (`None`, `True`/`False`,
listas con comillas simples: `['a', 1]`). `capturaActiva` es un array que,
durante la comprobación de un ejercicio, acumula las líneas mostradas para
compararlas después. `entrada(mensaje)` es el `input()` simulado: en los
tests consume la cola del campo `entradas` del ejercicio (determinista); en
ejecución normal abre un diálogo del navegador.

**Carga de datos** (`cargarTemario`): `fetch` del JSON, guarda en `TEMARIO` y
engancha los constructores por id. Con manejo de error: si el `fetch` falla
(por ejemplo, `file://`), pinta un aviso con las instrucciones del servidor
local y se detiene el arranque.

**Espacio de trabajo** (`Blockly.inject`): toolbox inicial mínima, rejilla con
snap, zoom por rueda, papelera. Se reajusta al redimensionar la ventana.

**Estado de navegación**: tres variables globales forman la máquina de estados
de la UI:

| Variable | Significado |
|----------|-------------|
| `TEMARIO` | Array de capítulos cargado del JSON |
| `capituloActual` | Capítulo seleccionado |
| `contenidoActual` | Ejemplo o ejercicio activo |
| `modoActual` | `'ejemplo'` \| `'test'` |

**Navegación**:
- `renderTemario()` pinta los botones de capítulo.
- `seleccionarCapitulo(id)` pinta ejemplos y tests, y carga el primer ejemplo.
- `seleccionarContenido(tipo, índice)`:
  1. `workspace.updateToolbox(construirToolbox(capituloActual.bloques))` —
     filtra bloques según el capítulo.
  2. `workspace.clear()` y montaje inicial: `estado` (carga con
     `Blockly.serialization.workspaces.load`) o `construir()`.
  3. Pinta la ficha (ejemplo o ejercicio con pista), cambia el botón de
     ejecutar y reinicia consola/veredicto.

**Generación y ejecución**:
- `actualizarCodigo()` regenera el Python con `Blockly.Python.workspaceToCode`
  en cada cambio del workspace (listener `addChangeListener`).
- Al pulsar **Ejecutar**:
  1. Genera Python (para mostrarlo) y JavaScript (para ejecutarlo).
  2. Ejecuta el JS con `new Function('mostrar', 'tipoDeES', 'entrada',
     'charEn', 'elementoEn', 'rango', 'ordenarLista', codigoJS)`
     e inyecta las funciones de soporte. Es un sandbox ligero: no hay acceso al
     DOM ni a variables globales salvo las inyectadas.

**Verificación de ejercicios** (`modoActual === 'test'`): compara
`capturaActiva` con `resultadoEsperado` **línea a línea, en orden y en valor
exacto** (case y espacios incluidos). Si coinciden → veredicto ✅; si no → ❌.

**Panel del profesor**: `Blockly.serialization.workspaces.save(workspace)` y
volcado del JSON a un textarea para copiar.

## 5. Flujo de arranque

```
index.html carga scripts (Blockly CDN → bloques.js → constructores.js → app.js)
        │
        ▼
app.js: Blockly.inject(...)                     ── crea el workspace
        │
        ▼
iniciar(): fetch('data/temario.json')           ── carga datos
        │  └─ error → aviso de servidor local y fin
        ▼
enganchar CONSTRUCTORES por id                  ── datos + comportamiento
        │
        ▼
renderTemario() → seleccionarCapitulo(primero)  ── pinta UI
        │
        ▼
seleccionarContenido('ejemplo', 0)
   ├─ updateToolbox(bloques del capítulo)
   ├─ clear() + estado | construir()           ── monta el ejemplo
   └─ actualizarCodigo()                       ── primer Python visible
```

## 6. Modelo de ejecución (importante)

Los bloques se traducen a **dos** lenguajes:

| Propósito | Lenguaje | API |
|-----------|----------|-----|
| Mostrar al alumno | Python | `Blockly.Python.workspaceToCode` |
| Ejecutar | JavaScript | `Blockly.JavaScript.workspaceToCode` + `new Function` |

Consecuencia: `mostrar( )` y `tipo de ( )` tienen **doble implementación** —
generadores Python y JS en `bloques.js`, más `mostrar`/`tipoDeES` reales en
`app.js`. El Python que ve el alumno es informativo: el que se ejecuta de verdad
es el JavaScript equivalente. Por eso los nombres de las variables internas son
idénticos en ambos generadores (el idioma de las variables de Blockly es
independiente del idioma del código generado).

Casos especiales del puente Python ↔ JavaScript:

- `funcion_llamar` es **doble modo**: el generador comprueba si su salida está
  conectada (`outputConnection.targetConnection`) → si lo está devuelve el
  valor (`total = sumar(3, 4)`), si no emite la llamada como sentencia
  (`saludar()`).
- `lista` usa un **mutator** (`Blockly.icons.MutatorIcon`) como el
  `lists_create_with` de Blockly: `saveExtraState`/`loadExtraState` guardan el
  nº de elementos y `decompose`/`compose`/`saveConnections` lo editan.
- `text_join` en Python genera `''.join([...])`, que falla con números: en los
  constructores los números se envuelven con `convertir('TEXTO', ...)` antes
  de unirlos (genera `str(...)`).
- `mostrar` formatea la salida como Python (`formatearValor`): `true/false` →
  `True/False`, arrays → `['a', 1]`, `null` → `None`.

Limitación asumida: no es un intérprete de Python real. Sirve para los
ejercicios del temario (salida por consola, tipos básicos); no se pueden usar
bibliotecas ni sintaxis avanzada de Python.

## 7. Puntos de extensión

| Quiero… | Dónde toco |
|---------|------------|
| Añadir un capítulo, ejemplo o ejercicio | `data/temario.json` (ver README) |
| Que un contenido salga montado sin programar | Montar bloques → exportar JSON → campo `estado` |
| Montaje programático de bloques | `js/constructores.js` → nueva entrada en `CONSTRUCTORES` |
| Un tipo de bloque nuevo | `js/bloques.js`: bloque + generadores + `REGISTRO_BLOQUES` |
| Cambiar el orden/categorías de la toolbox | `ORDEN_CATEGORIAS` / `REGISTRO_BLOQUES` en `js/bloques.js` |
| Nuevo idioma de código (p. ej. bloques → Java) | Cargar `java_compressed.min.js` y generar con `Blockly.Java` |
| Ejercicios con formato más libre | Ampliar `seleccionarContenido`/verificación en `js/app.js` |

## 8. Limitaciones conocidas

- Requiere servidor local o extensión tipo Live Server (nunca `file://`).
- Requiere conexión a internet (Blockly vía CDN); hay instrucciones para
  trabajar sin red en el README.
- La ejecución es JavaScript, no Python real (ver sección 6).
- La verificación de tests compara salida textual exacta; no evalúa
  eficiencia ni estilo.
- `new Function` ejecuta el código generado por los bloques: es un sandbox
  ligero (sin DOM), suficiente para el aula, no para código arbitrario.
- Versión de Blockly fijada en `12.5.1` (CDN): al actualizar, revisar
  `Blockly.serialization`, `loadExtraState`, `Blockly.icons.MutatorIcon` y
  los generadores. Ojo: en esta versión `math_single` ya no tiene la opción
  `ROUND` (está en el bloque estándar `math_round`), y `variableDB_` está
  minificado: se usa `getVariableName()`.
- Limitaciones didácticas documentadas: f-strings y formato de números
  (`:.2f`) no son expresables con bloques (se usa `unir`); el slicing con
  paso negativo (`[::-1]`) no está en `text_slice`/`lista_parte`; `enumerate`
  se enseña como recorrido por índice con `rango(0, longitud)`; los
  parámetros de `funcion_definir` se escriben como texto (p. ej. `a, b`) y
  se referencian con bloques de variable del mismo nombre.

## 9. Historial

- **v1 (original):** un único archivo `bloques-programacion.html` con CSS y JS
  embebidos y el temario como constante JS (`TEMARIO`).
- **v2 (actual):** desempaquetado en proyecto con carpetas (`css/`, `js/`,
  `data/`, `assets/`). El temario pasa a `data/temario.json`; las funciones de
  montaje a `js/constructores.js` (asociadas por `id`); se añade soporte del
  campo `estado` (JSON nativo de Blockly) para crear contenidos sin programar.
