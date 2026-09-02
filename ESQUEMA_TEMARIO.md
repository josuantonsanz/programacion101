# Esquema de temario — inferido del curso "Programación en Python (CS101)"

Base: carpeta `../curso de python/`. La versión estructurada está en
`Sesiones latex/` (12 capítulos, del 4 al 12 son programación pura). La app
**amplía sus bloques para cubrir el curso, no al revés**: si un concepto del
curso necesita un bloque que no existe, se crea el bloque.

## Mapeo curso → capítulos de la app

| App (capítulo) | Curso (LaTeX) | Contenido | Estado |
|---|---|---|---|
| 1. Conceptos básicos | 4 · Conceptos básicos | Variables, tipos, operadores `+ - * /`, `print`/mostrar, concatenación, `input()`/pedir, casting | ✅ |
| 2. Operadores y lógica | 5 · Terminando con lo básico | `len()`, `type()`, `upper`/`lower`, operadores `** // %`, comparación, `and`/`or`/`not` | ✅ |
| 3. Control del flujo | 6 · Control del flujo | `if`/`elif`/`else`, `pass`, `while`, `break`, `continue` | ✅ |
| 4. Cadenas | 7 · Cadenas | Indexación, slicing, métodos (`find`, `replace`, `strip`, `title`…), `in` | ✅ |
| 5. For y listas | 8 · For y listas | `range()`, `for`, listas, métodos, `enumerate`, `in` | ✅ |
| 6. Funciones | 9 · Funciones | `def`, parámetros, `return`, ámbito | ✅ |
| 7. Archivos y excepciones | 10 · Archivos y excepciones | `open`/`with`, lectura/escritura, `try`/`except`, JSON | 🔜 |
| 8. Tuplas y diccionarios | 11 · Tuplas y diccionarios | Tuplas, dicts, `.get`, `.items`, `setdefault` | 🔜 |
| 9. Clases y objetos | 12 · Clases y objetos | `class`, `__init__`, métodos, dunder | 🔜 |
| — Práctica final | Examen final + Gestor de tareas + Tanda de ejercicios | Proyectos que combinan todo | 🔜 |

Los capítulos 1–3 del LaTeX (Introducción, Historia, Intro a Python) son teoría:
no tienen capítulo de bloques, sirven de contexto del curso.

## Bloques nuevos creados (registrados en `js/bloques.js`)

| Bloque | Python | Curso |
|---|---|---|
| `pedir` | `input("mensaje")` — devuelve texto | 4 · input |
| `convertir` | `int()` / `float()` / `str()` (dropdown) | 4 · casting |
| `operacion_extra` | `**`, `//`, `%` (dropdown) | 5 · operadores |
| `romper` | `break` | 6 · break |
| `continuar` | `continue` | 6 · continue |
| `no_hacer_nada` | `pass` | 6 · pass |
| `text_repetir` | `"ja" * 4` | 7 · repetición |
| `text_char` | `palabra[0]`, `palabra[-1]` | 7 · indexación |
| `text_slice` | `palabra[0:3]`, `palabra[3:]` | 7 · slicing |
| `text_transformar` | `upper`/`lower`/`capitalize`/`title`/`strip` | 7 · métodos |
| `text_buscar` | `cadena.find(x)` | 7 · find |
| `text_reemplazar` | `cadena.replace(a, b)` (todas las apariciones) | 7 · replace |
| `text_contiene` | `x in cadena` | 7 · in |
| `text_tiene_mayuscula` | `any(c.isupper() for c in x)` | 7 · contraseña |
| `text_tiene_numero` | `any(c.isdigit() for c in x)` | 7 · contraseña |
| `lista` | `[a, b, c]` (mutator: nº de elementos) | 8 · listas |
| `lista_vacia` | `[]` | 8 · listas |
| `lista_longitud` | `len(x)` | 8 · listas |
| `lista_elemento` | `x[i]` (índices negativos) | 8 · listas |
| `lista_parte` | `x[i:f]` | 8 · listas |
| `lista_anadir` | `x.append(v)` | 8 · métodos |
| `lista_quitar` | `x.pop()` / `x.pop(i)` | 8 · métodos |
| `lista_poner` | `x[i] = v` | 8 · métodos |
| `lista_ordenar` | `x.sort()` | 8 · métodos |
| `lista_invertir` | `x.reverse()` | 8 · métodos |
| `lista_copiar` | `x.copy()` | 8 · copias y referencias |
| `lista_contiene` | `v in x` | 8 · in |
| `rango` | `range(a)` / `range(a, b)` / `range(a, b, c)` | 8 · range |
| `para_cada` | `for x in lista:` | 8 · for |
| `funcion_definir` | `def nombre(a, b):` | 9 · def |
| `funcion_llamar` | `nombre(a, b)` (valor o sentencia) | 9 · llamadas |
| `devolver` | `return x` | 9 · return |
| `math_round` | `round(x)` | 8 · media redondeada |

> Limitación documentada: f-strings y formato de números (`:.2f`, `,`) no se
> pueden expresar con bloques; se documentan en el curso como lectura.

## Capítulos 1–3: ejemplos y ejercicios (algunos, no todos)

Cada elemento indica su origen en el curso LaTeX.

### 1 · Conceptos básicos (`conceptos-basicos`)

**Ejemplos:** `variables-crear-tipos` (4 · variables y tipos) ·
`operadores-aritmeticos` (4 · operadores, a=10 b=5) ·
`entrada-y-casting` (4 · input + int()).

**Ejercicios:** `variables-ficha-personal` (4 · tipos) ·
`suma-de-dos-numeros` (4 · casting; entradas simuladas).

### 2 · Operadores y lógica (`operadores-y-logica`)

**Ejemplos:** `variables-funciones-estandar` (5 · len/type) ·
`operadores-avanzados` (5 · `**`, `//`, `%`) ·
`logica-comparar-numeros` (5 · comparación) ·
`operadores-logicos` (5 · and/or/not: concierto, dormir, llueve).

**Ejercicios:** `longitud-de-frase` (5 · len("Hola mundo") → 10).

### 3 · Control del flujo (`control-flujo`)

**Ejemplos:** `logica-condicional` (4 · if/else) ·
`clasificar-nota` (6 · if/elif/else, nota 7.5) ·
`bucles-contar` (6 · while) · `bucles-despegue` (6 · cuenta atrás).

**Ejercicios:** `logica-puede-conducir` (5 · edad ≥ 18) ·
`mayor-de-edad` (6 · pedir + if, entradas simuladas) ·
`bucles-cuenta-atras` (6 · while) · `solo-impares` (6 · continue).

### 4 · Cadenas (`cadenas`)

**Ejemplos:** `cadenas-indexacion` (7 · índices: P, H, N) ·
`cadenas-slicing` (7 · rebanadas PYT, THO, HON) ·
`cadenas-transformar` (7 · upper/capitalize/title/strip) ·
`cadenas-buscar-reemplazar` (7 · find(@)=6 y replace) ·
`cadenas-pertenencia` (7 · in: zorro/gato) ·
`cadenas-nueva-cadena` (7 · inmutabilidad: "j" + "osu" → "josu").

**Ejercicios:** `cadenas-primera-ultima` (7 · char 0 y -1) ·
`cadenas-email` (7 · find + slicing: usuario y dominio) ·
`cadenas-censor` (7 · replace → `[CENSURADO]`) ·
`cadenas-formateador` (7 · strip + title + unir).

> El ejemplo de contraseña de la sesión 7 (mayúsculas + números) se resuelve
> con `text_tiene_mayuscula`/`text_tiene_numero` y se retoma en el capítulo 6
> (`funciones-password`). El palíndromo (necesita `[::-1]`) queda como lectura:
> el bloque `text_slice` no cubre pasos negativos.

### 5 · For y listas (`for-listas`)

**Ejemplos:** `bucles-range` (8 · range(3), range(1,6), range(0,11,2)) ·
`bucles-repetir` (8 · repetir N veces) · `listas-crear-acceder` (8 · crear,
acceder, longitud) · `listas-metodos` (8 · append/sort/pop) ·
`listas-copiar` (8 · referencia vs. copy()) · `bucles-listas-tareas` (8 ·
recorrer directo y por índice) · `listas-sorteo` (8 · aleatorio).

**Ejercicios:** `bucles-contar-5` (8 · range(1,6)) · `bucles-pares` (8 ·
range(0,11,2)) · `lista-compra` (8 · while + pedir + append + sort; salida
corregida: 3, Leche, Manzanas, Pan) · `notas-analisis` (8 · aprobados,
suspensos, suma, media con round) · `inversor-listas` (8 · range con paso
negativo + append).

> `enumerate` se explica en el curso como lectura; en la app se enseña a
> recorrer por índice con `rango(0, longitud)` (equivalente para los ejercicios).

### 6 · Funciones (`funciones`)

**Ejemplos:** `funciones-saludar` (9 · def y llamadas) ·
`funciones-parametros` (9 · parámetros: saludarA(nombre)) ·
`funciones-return` (9 · return y None) · `funciones-ambito` (9 · variables
locales vs. globales: huevos).

**Ejercicios:** `funciones-validar-edad` (9 · return booleano + if) ·
`funciones-calculadora` (9 · cuatro funciones y pedir) ·
`funciones-collatz` (9 · recursión aparente con while + return) ·
`funciones-password` (9 · combinar funciones con and).

> Los parámetros se escriben como texto en el bloque (p. ej. `a, b`); dentro
> del cuerpo se usan bloques de variable con el mismo nombre.

## Cómo simula la app el `input()` del curso

- **Ejecución normal** (ejemplos): `pedir` abre un diálogo del navegador
  (equivalente a escribir en la terminal).
- **Ejercicios autocorregidos**: cada test puede llevar `entradas: ["7", "5"]`
  en `data/temario.json`; la app consume esos valores en orden, así la
  corrección es determinista. El prompt (`› valor`) sí se escribe en la
  consola visual, pero no entra en el buffer de comparación: el veredicto
  solo compara las líneas de `mostrar` con `resultadoEsperado`.
