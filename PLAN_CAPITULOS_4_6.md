# Plan: capítulos 4 (Cadenas), 5 (For y listas) y 6 (Funciones)

> ✅ **Estado: COMPLETADO e implementado** (bloques, constructores, temario,
> runtime y docs). Verificado en Chrome headless: 20 ejercicios, 0 fallos,
> 0 errores de ejecución.

Objetivo: mapear las sesiones del curso (`7. Cadenas.tex`, `8. For y listas.tex`,
`9. Funciones.tex`) a la app. Los bloques de cadenas ya existen; los de listas,
bucles `for` y funciones **no existen** → hay que crearlos siguiendo el patrón
`Blockly.Blocks['x']` + `Blockly.Python.forBlock['x']` + `Blockly.JavaScript.forBlock['x']`
(Python se muestra al alumno; JavaScript se ejecuta con `new Function`).

## 1. Bloques nuevos

### Capítulo 4 (2 bloques, categoría Texto)
- `text_tiene_mayuscula` — `any(c.isupper() for c in x)` / `/[A-Z]/.test(x)`
- `text_tiene_numero` — `any(c.isdigit() for c in x)` / `/\d/.test(x)`
- El resto reutiliza: `text_char`, `text_slice`, `text_transformar`, `text_buscar`,
  `text_reemplazar`, `text_contiene`, `text_join`, `text_length`, `text_repetir`,
  `pedir`, `convertir`, `mostrar`.

### Capítulo 5 (categoría Listas + rango/para_cada)
- `lista` — mutator estilo `lists_create_with` (itemCount default 2).
- `lista_vacia` — `[]`
- `lista_longitud` — `len(x)` / `.length`
- `lista_elemento` — `x[i]` / `elementoEn(x, i)` (índice negativo)
- `lista_parte` — `x[i:f]` / `.slice(i, f)` (FIN opcional)
- `lista_anadir` — `x.append(v)` / `x.push(v)` (statement)
- `lista_quitar` — `x.pop()` o `x.pop(i)` (value)
- `lista_poner` — `x[i] = v` (statement)
- `lista_ordenar` — `x.sort()` / `ordenarLista(x)` (comparador numérico)
- `lista_invertir` — `x.reverse()`
- `lista_copiar` — `x.copy()` / `x.slice()`
- `lista_contiene` — `v in x` / `x.includes(v)`
- `rango` — `range(inicio, fin, paso)` (INICIO y PASO opcionales)
- `para_cada` — `for <var> in <seq>:` / `for (var <var> of <seq>)` (categoría Bucles)
- Reutiliza `controls_repeat_ext` (ya existe).

### Capítulo 6 (categoría Funciones)
- `funcion_definir` — `def nombre(a, b):` / `function nombre(a, b) {}` (cuerpo DO, parámetros como texto)
- `funcion_llamar` — doble modo: valor si está conectado a una salida, sentencia si no.
- `devolver` — `return x` (VALOR opcional).

### Ajuste
- Override de `Blockly.JavaScript.forBlock['variables_set']`: si algún ancestro es
  `funcion_definir` → `var x = ...` (local); si no → `x = ...` (global, `finish()` ya declara).

## 2. Registro / toolbox
- `REGISTRO_BLOQUES`: ~18 entradas nuevas.
- `ORDEN_CATEGORIAS` → `['Variables', 'Texto', 'Números', 'Listas', 'Lógica', 'Bucles', 'Funciones', 'Funciones estándar']`.
  Listas=260 (después de Números), Funciones=290 (después de Bucles), `para_cada`→Bucles(120).

## 3. app.js (runtime)
- `formatearValor(valor)`: `null/undefined → 'None'`, `Array → '[a, 'b']'`, booleanos → `True/False`, else `String(valor)`.
- `mostrar` usa `formatearValor`.
- `tipoDeES`: añadir `'lista'` (array) y `'función'` (function).
- Helpers: `elementoEn(lista, pos)`, `rango(inicio, fin, paso)`, `ordenarLista(lista)`.
- Inyección: `new Function('mostrar', 'tipoDeES', 'entrada', 'charEn', 'elementoEn', 'rango', 'ordenarLista', codigoJS)`.

## 4. constructores.js
Helpers nuevos: `bloqueLista`, `bloqueListaVacia`, `bloqueListaLongitud`, `bloqueListaElemento`,
`bloqueListaParte`, `bloqueListaAnadir`, `bloqueListaQuitar`, `bloqueListaPoner`,
`bloqueListaOrdenar`, `bloqueListaInvertir`, `bloqueListaCopiar`, `bloqueListaContiene`,
`bloqueRango`, `bloqueParaCada`, `bloqueDefinir`, `bloqueLlamar`, `bloqueDevolver`,
`bloqueTieneMayuscula`, `bloqueTieneNumero`, `bloqueChar`, `bloqueSlice`, `bloqueTransformar`,
`bloqueBuscar`, `bloqueReemplazar`, `bloqueContieneTexto`, `bloqueSi`, `bloqueRandomInt`.
+ `CONSTRUCTORES` para cada ejemplo/test (lista abajo).

## 5. temario.json — capítulos nuevos

### Capítulo 4 — Cadenas
Ejemplos: `cadenas-indexacion`, `cadenas-slicing`, `cadenas-transformar`,
`cadenas-buscar-reemplazar`, `cadenas-pertenencia`, `cadenas-nueva-cadena`.
Tests: `cadenas-primera-ultima`, `cadenas-email`, `cadenas-censor`, `cadenas-formateador`.

### Capítulo 5 — For y listas
Ejemplos: `bucles-range`, `bucles-repetir`, `listas-crear-acceder`, `listas-metodos`,
`listas-copiar`, `bucles-listas-tareas`, `listas-sorteo`.
Tests: `bucles-contar-5`, `bucles-pares`, `lista-compra`, `notas-analisis`,
`inversor-listas`.

### Capítulo 6 — Funciones
Ejemplos: `funciones-saludar`, `funciones-parametros`, `funciones-return`,
`funciones-ambito`.
Tests: `funciones-validar-edad`, `funciones-calculadora`, `funciones-collatz`,
`funciones-password`.

## 6. Orden de implementación
1. `js/bloques.js` (bloques + generadores + registro + toolbox)
2. `js/app.js` (runtime)
3. `js/constructores.js` (helpers + constructores)
4. `data/temario.json` (capítulos 4-6)
5. Docs: `README.md`, `ESQUEMA_TEMARIO.md`, `architecture.md`
6. Verificación: `node --check`, `JSON.parse`, `py -m http.server`, headless Chrome
   (`verificar.html` temporal: construir → ejecutar JS → comparar con `resultadoEsperado`).
   Comprobar: doble modo de `funcion_llamar`, `getSurroundParent`/`getParent`,
   mutator de `lista` + `loadExtraState`/`render`.
