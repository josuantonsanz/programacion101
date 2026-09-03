# Aprende a programar con bloques

Entorno gráfico de programación por bloques (Blockly) para la asignatura
**"Introducción a la programación en Python"**. Pensado para alumnos que
empiezan desde cero: construyen programas arrastrando bloques, ven el código
Python generado en tiempo real y ejecutan el resultado en el navegador, **sin
usar IA y sin instalar nada**.

---

## Características

- 🧩 **Bloques en español** (variables, texto, números, listas, lógica, bucles,
  funciones) con bloques propios del taller: `mostrar( )`, `tipo de ( )`,
  `pedir( )`, bloques de cadenas, listas y funciones.
- 📚 **Temario por capítulos**: cada capítulo filtra qué bloques están
  disponibles, para no agobiar con opciones.
- 📘 **Ejemplos montados** que el alumno puede ejecutar y modificar.
- ✏️ **Ejercicios autocorregidos**: el alumno construye su solución y la página
  la compara con el resultado esperado (✅ / ❌).
- 🐍 **Código Python en vivo** junto al espacio de trabajo.
- 🛠️ **Panel del profesor**: exporta el estado del espacio como JSON para crear
  ejercicios nuevos sin programar.
- 🎨 **Dos estilos visuales**: selector en la cabecera entre el diseño sobrio
  con Pico CSS y la estética de pizarra original; la elección se recuerda.
- 📁 **Contenido editable por capítulo en YAML** (`data/curso/*.yaml`): añadir
  o modificar contenido no requiere tocar JavaScript. `data/temario.json` se
  genera automáticamente para conservar la aplicación estática.

---

## Estructura del proyecto

```
bloques-programacion/
├── index.html              → la página (estructura HTML + carga de scripts)
├── css/
│   ├── estilos-pico.css    → diseño sobrio actual (ajustes sobre Pico CSS)
│   └── estilos.css         → diseño anterior de pizarra (conservado como referencia)
├── js/
│   ├── bloques.js          → bloques propios + registro de bloques + toolbox
│   ├── constructores.js    → funciones que montan bloques, asociadas por id
│   └── app.js              → arranque, carga del temario, navegación, ejecución
├── data/
│   ├── curso/*.yaml        → fuente editable, un archivo por capítulo
│   └── temario.json        → temario generado que carga la aplicación
├── tools/
│   └── compilar_contenido.py → compilador YAML → JSON Blockly
├── assets/                 → recursos estáticos (imágenes, iconos, …)
└── README.md               → este documento
```

> 📄 Para entender cómo funciona el código por dentro, lee también
> [architecture.md](architecture.md).

---

## Editar y compilar el contenido (prototipo YAML)

En esta copia experimental, edita los archivos de `data/curso/` y genera el
JSON que consume la app antes de abrir o publicar el sitio:

```powershell
py -m pip install -r requirements.txt   # solo la primera vez
py tools/compilar_contenido.py
```

Hay un YAML por capítulo y el compilador los lee en orden alfabético. Consulta
[PROTOCOLO_CONTENIDO_YAML.md](PROTOCOLO_CONTENIDO_YAML.md) para el DSL completo,
la semilla de ejemplos y ejercicios, y cómo compilar solo uno o varios archivos.
No edites `data/temario.json` directamente.

---

## Requisitos

- Un navegador moderno (Chrome, Edge, Firefox, Safari).
- **Conexión a internet** en el aula: Blockly y la base visual Pico CSS se
  cargan desde CDN. Si quieres usarlo sin red, ver [Sin conexión a internet](#sin-conexión-a-internet).

---

## ⚠️ Cómo ejecutarlo (importante)

La página carga `data/temario.json` con `fetch()`, así que **no funciona**
abriendo `index.html` con doble clic (protocolo `file://`): el navegador
bloquea la carga de archivos JSON locales.

1. Abre una terminal en la carpeta del proyecto:

   ```
   python -m http.server 8000
   ```

   Si `python` no funciona en tu equipo (a veces el comando apunta al alias de
   la Microsoft Store), prueba con:

   ```
   py -m http.server 8000
   ```

2. Abre en el navegador: **http://localhost:8000**

> También vale cualquier servidor estático: la extensión *Live Server* de
> VS Code, `npx serve`, etc.

---

## Cómo se usa en clase

1. En **Temario** se elige un capítulo (Variables, Lógica, Bucles…).
2. El capítulo ofrece **Ejemplos montados** (📘) y **Ejercicios** (✏️).
3. En el **Espacio de trabajo** se arrastran bloques desde la toolbox.
4. **▶ Ejecutar** muestra el resultado en la consola y el código Python.
   En los ejercicios, el botón pasa a **✔ Ejecutar y comprobar** y muestra el
   veredicto ✅ o ❌ comparando la salida con el resultado esperado.
5. **↺ Reiniciar ejercicio** vuelve a montar el ejercicio desde cero;
   **🧹 Vaciar espacio** limpia el lienzo.

---

## Panel del profesor

Abajo del todo está el panel **🛠️ Panel del profesor**, con el botón
**📋 Exportar JSON del espacio actual**: copia el estado nativo de Blockly
(posición y conexión de todos los bloques) en formato JSON.

En este prototipo el JSON exportado es solo una herramienta de diagnóstico:
la fuente editable es YAML en `data/curso/`. El compilador genera el campo
`estado` de Blockly sin tener que pegar este JSON manualmente.

---

## Referencia técnica: JSON generado

> **No edites esta sección como procedimiento de autoría en el prototipo.**
> El formato JSON siguiente es el artefacto que genera el compilador. Para
> crear capítulos, ejemplos, semillas y ejercicios usa
> [PROTOCOLO_CONTENIDO_YAML.md](PROTOCOLO_CONTENIDO_YAML.md) y los archivos de
> `data/curso/`.

### Forma equivalente en JSON

El compilador produce un objeto `capitulos` de esta forma:

```json
{
  "id": "listas",
  "numero": 4,
  "titulo": "Listas",
  "resumen": "Agrupar varios valores en una lista y recorrerla.",
  "bloques": ["variables_set", "variables_get", "math_number", "text", "mostrar"],
  "ejemplos": [],
  "tests": []
}
```

| Campo      | Qué es |
|------------|--------|
| `id`       | Identificador único (sin espacios). Se usa para asociar funciones de construcción. |
| `numero`   | Orden en el temario. |
| `titulo`   | Nombre del capítulo. |
| `resumen`  | Texto que aparece bajo el título. |
| `bloques`  | Tipos de bloque permitidos en este capítulo (ver lista abajo). |
| `ejemplos` | Array de ejemplos. |
| `tests`    | Array de ejercicios. |

### 2. Nuevo ejemplo o ejercicio

Cada elemento necesita un `id` único. Ejemplo:

```json
{
  "id": "listas-primer-ejemplo",
  "titulo": "Mi primera lista",
  "explicacion": "Creamos una lista y mostramos su longitud."
}
```

Los ejercicios (`tests`) además llevan `enunciado`, `explicacion` (pista) y
`resultadoEsperado` (array de líneas que debe mostrar la consola):

```json
{
  "id": "listas-ejercicio",
  "titulo": "Tu lista favorita",
  "enunciado": "Crea una lista con tus tres colores favoritos y muestra su longitud.",
  "explicacion": "Usa el bloque de longitud de texto sobre la variable de la lista.",
  "resultadoEsperado": ["3"]
}
```

Si el ejercicio usa el bloque **pedir** (entrada de datos), puedes indicar
qué valores escribirá el usuario con el campo opcional `entradas` (los consume
en orden; así la corrección es determinista y no abre diálogos):

```json
{
  "id": "suma-de-dos-numeros",
  "titulo": "Suma de dos números",
  "enunciado": "Pide dos números al usuario con pedir, conviértelos a número entero y muestra su suma.",
  "entradas": ["7", "5"],
  "resultadoEsperado": ["12"]
}
```

Para que el contenido salga **ya montado** tienes dos opciones:

- **Opción A — sin programar (recomendada):** monta los bloques a mano en la
  página, pulsa **📋 Exportar JSON del espacio actual** y pega el JSON como
  campo `"estado"` del ejemplo/ejercicio.
- **Opción B — con JavaScript:** añade en `js/constructores.js` una función
  asociada al mismo id:

  ```js
  'listas-primer-ejemplo': () => {
    const s1 = bloqueSet('colores', bloqueTexto('azul, verde, rojo'));
    const m1 = bloqueMostrar(bloqueLongitud(bloqueGet('colores')));
    encadenar(s1, m1).moveBy(24, 24);
  },
  ```

  En ese archivo tienes helpers listos: `bloqueSet`, `bloqueGet`,
  `bloqueNum`, `bloqueTexto`, `bloqueMostrar`, `bloqueTipoDe`,
  `bloqueComparar`, `bloqueLogica`, `bloqueBool`, `bloqueNegar`,
  `bloqueAritmetica`,
  `bloqueOpExtra`, `bloqueRaiz`, `bloqueLongitud`, `bloqueRepite`,
  `bloquePedir`, `bloqueConvertir`, `bloqueUnir`, `bloqueChar`,
  `bloqueSlice`, `bloqueTransformar`, `bloqueBuscar`, `bloqueReemplazar`,
  `bloqueContieneTexto`, `bloqueTieneMayuscula`, `bloqueTieneNumero`,
  `bloqueLista`, `bloqueListaVacia`, `bloqueListaLongitud`,
  `bloqueListaElemento`, `bloqueListaParte`, `bloqueListaAnadir`,
  `bloqueListaQuitar`, `bloqueListaPoner`, `bloqueListaOrdenar`,
  `bloqueListaInvertir`, `bloqueListaCopiar`, `bloqueListaContiene`,
  `bloqueRango`, `bloqueParaCada`, `bloqueDefinir`, `bloqueLlamar`,
  `bloqueDevolver`, `bloqueSi`, `bloqueRandomInt`, `encadenar`…

> Si un contenido no lleva `estado` ni constructor, el alumno parte de un
> espacio vacío (ejercicio desde cero).

### 3. Nuevo tipo de bloque

Los tipos de bloque permitidos en `bloques` de cada capítulo son los del
registro de `js/bloques.js` (`REGISTRO_BLOQUES`):

`variables_set`, `variables_get`, `text`, `text_join`, `text_repetir`,
`text_char`, `text_slice`, `text_transformar`, `text_buscar`,
`text_reemplazar`, `text_contiene`, `text_tiene_mayuscula`,
`text_tiene_numero`, `text_length`, `math_number`, `math_arithmetic`,
`math_single`, `math_round`, `math_random_int`, `operacion_extra`,
`controls_if`, `logic_compare`, `logic_operation`, `logic_negate`,
`logic_boolean`, `controls_whileUntil`, `controls_repeat_ext`, `para_cada`,
`rango`, `lista`, `lista_vacia`, `lista_longitud`, `lista_elemento`,
`lista_parte`, `lista_anadir`, `lista_quitar`, `lista_poner`,
`lista_ordenar`, `lista_invertir`, `lista_copiar`, `lista_contiene`,
`funcion_definir`, `funcion_llamar`, `devolver`, `romper`, `continuar`,
`no_hacer_nada`, `pedir`, `convertir`, `mostrar`, `tipo_de`.

El temario actual (capítulos 1–6: Conceptos básicos, Operadores y lógica,
Control del flujo, Cadenas, For y listas y Funciones) está alineado con el
curso `../curso de python/`; el mapeo completo curso → app está en
[ESQUEMA_TEMARIO.md](ESQUEMA_TEMARIO.md).

Para añadir un tipo nuevo: defínelo como bloque de Blockly en `js/bloques.js`
(también sus generadores de Python y JavaScript), regístralo en
`REGISTRO_BLOQUES` con su categoría y color, y añade la categoría a
`ORDEN_CATEGORIAS` si es nueva.

---

## Sin conexión a internet

Blockly se carga desde el CDN de cdnjs y Pico CSS desde jsDelivr. Para usarlo
sin red:

1. Descarga estos cinco archivos desde cdnjs (versión `12.5.1`):
   `blockly_compressed.min.js`, `blocks_compressed.min.js`,
   `javascript_compressed.min.js`, `python_compressed.min.js`,
   `msg/es.min.js`.
2. Descarga también `pico.min.css` de Pico CSS (versión `2.1.1`).
3. Guarda los archivos en `assets/` (puedes crear `assets/css/` para
   `pico.min.css`).
4. En `index.html`, sustituye las etiquetas del CDN por rutas locales: por
   ejemplo, `href="assets/css/pico.min.css"` y
   `src="assets/blockly_compressed.min.js"`, etc.

---

## Solución de problemas

| Problema | Causa y solución |
|----------|------------------|
| La página no muestra el temario y sale un aviso "No se pudo cargar data/temario.json" | Abriste el archivo con doble clic. Ejecuta `python -m http.server 8000` (o `py -m …`) y entra por http://localhost:8000. |
| `python` no se reconoce al ejecutar el comando | En Windows a veces el alias de la Microsoft Store intercepta el comando. Usa `py -m http.server 8000` o instala Python desde python.org. |
| Los bloques no cargan / la página se queda en blanco | Sin conexión a internet (CDN). Ver [Sin conexión a internet](#sin-conexión-a-internet). |
| Un ejemplo sale vacío | El contenido no tiene `estado` ni constructor asociado. Revisa que el `id` del JSON exista en `CONSTRUCTORES` (js/constructores.js) o que el `estado` esté bien pegado. |
| El ejercicio dice ❌ pero creo que está bien | El veredicto compara la consola línea a línea y en orden con `resultadoEsperado` (incluidos espacios y mayúsculas). |

---

## Notas

- El HTML original de una sola pieza (`bloques-programacion.html`, en la
  carpeta superior) se conserva intacto como referencia; puedes borrarlo cuando
  verifiques la versión con estructura de proyecto.
- Proyecto educativo: los ejercicios se ejecutan en el navegador con
  JavaScript, no con un intérprete de Python real (ver `architecture.md`).
