# Prototipo aislado: contenido del curso en YAML

> Esta carpeta es una copia experimental de `bloques-programacion`; el
> repositorio original no se modifica. La aplicación sigue cargando solamente
> `data/temario.json` y los JavaScript `app.js` y `bloques.js` permanecen
> idénticos a los del repositorio base.

## Fuente de verdad y compilación

Cada capítulo es un archivo independiente en [`data/curso/`](data/curso/):

```text
data/curso/
├── 01-conceptos-basicos.yaml
├── 02-operadores-y-logica.yaml
├── 03-control-flujo.yaml
├── 04-cadenas.yaml
├── 05-for-listas.yaml
└── 06-funciones.yaml
```

Los YAML son la fuente editable. `data/temario.json` es un artefacto generado:
no debe editarse a mano. Desde la raíz de **este prototipo**:

```powershell
py -m pip install -r requirements.txt   # solo la primera vez
py tools/compilar_contenido.py
py -m http.server 8000
```

El compilador lee todos los `*.yaml` de `data/curso/` en orden alfabético y
escribe `data/temario.json`. También admite una carpeta, uno o varios archivos
y un destino alternativo:

```powershell
py tools/compilar_contenido.py data/curso/04-cadenas.yaml -o data/prueba.json
py tools/compilar_contenido.py data/curso/01-conceptos-basicos.yaml data/curso/02-operadores-y-logica.yaml -o data/parcial.json
```

Cada archivo contiene exactamente una clave `capitulo`; sus campos son los que
ya consumía el temario JSON (`id`, `numero`, `titulo`, `resumen`, `bloques`,
`ejemplos` y `tests`). Los metadatos, enunciados, entradas y resultados
esperados de los seis capítulos existentes están ya convertidos.

```yaml
capitulo:
  id: ejemplo
  numero: 1
  titulo: Un capítulo
  resumen: Descripción breve.
  bloques: [variables_set, variables_get, text, mostrar]
  ejemplos:
    - id: ejemplo-inicial
      titulo: Mi ejemplo
      explicacion: Texto visible para el alumnado.
      programa:
        - asignar: {variable: nombre, valor: {texto: Ana}}
        - mostrar: {variable: nombre}
  tests:
    - id: ejercicio
      titulo: Ejercicio desde cero
      enunciado: Crea un programa.
      explicacion: Una pista.
      resultadoEsperado: [Ana]
```

Un elemento sin `programa` inicia el espacio vacío. Esto se conserva en los
ejercicios que originalmente no tenían semilla. Si contiene `programa`, el
compilador genera su campo `estado` de Blockly, incluidas variables,
conexiones, mutators y coordenadas; `app.js` lo carga de forma nativa.

## DSL de programas

Los escalares YAML son atajos: `12`, `"hola"` y `true` crean respectivamente
número, texto y booleano. También se pueden usar las formas explícitas
`numero`, `texto`, `booleano` y `variable`.

### Instrucciones

| YAML | Bloque Blockly |
|---|---|
| `asignar: {variable, valor}` | asignar variable |
| `mostrar: expresión` | mostrar |
| `si: {condicion, entonces, si_no_si, si_no}` | si / si no si / si no |
| `repetir: {veces, hacer}` | repetir N veces |
| `mientras: {condicion, hacer}` | mientras |
| `para_cada: {variable, en, hacer}` | para cada |
| `anadir: {valor, a}` | añadir a lista |
| `poner: {valor, en, posicion}` | cambiar elemento de lista |
| `ordenar: expresión`, `invertir: expresión` | ordenar / invertir lista |
| `definir_funcion: {nombre, parametros, hacer}` | definir función |
| `llamar: {nombre, argumentos}` | llamada como instrucción |
| `devolver: expresión` | devolver |
| `romper: null`, `continuar: null`, `no_hacer_nada: null` | bloques homónimos |

`si_no_si` es una lista de ramas `{condicion, entonces}`. `si_no` es opcional.
Los parámetros son una lista de nombres y el bloque actual admite como máximo
dos argumentos en cada llamada, igual que el bloque visual existente.

### Expresiones

| YAML | Uso |
|---|---|
| `sumar`, `restar`, `multiplicar`, `dividir` | dos valores: `sumar: [a, b]` |
| `operacion: {operador: POW\|DIV_INT\|MOD, valores: [a, b]}` | potencia, división entera, resto |
| `comparar: {izquierda, operador, derecha}` | `EQ`, `NEQ`, `LT`, `LTE`, `GT`, `GTE` |
| `logica: {izquierda, operador, derecha}`, `no` | `AND`, `OR`, negación |
| `tipo_de`, `raiz`, `redondear`, `longitud`, `longitud_lista` | funciones de un valor |
| `aleatorio: [minimo, maximo]` | entero aleatorio |
| `pedir: mensaje`, `convertir: {a, valor}` | entrada y conversión (`entero`, `decimal`, `texto`) |
| `unir: [partes]`, `repetir_texto: {texto, veces}` | texto |
| `caracter: {texto, posicion}`, `parte_texto: {texto, inicio, fin}` | acceso y corte de texto; `fin` es opcional |
| `transformar: {metodo, texto}` | `mayusculas`, `minusculas`, `capitalizar`, `titulo`, `sin_espacios` |
| `buscar: {texto, buscar}`, `reemplazar: {texto, viejo, nuevo}` | métodos de texto |
| `contiene_texto: {subtexto, en}`, `tiene_mayuscula`, `tiene_numero` | comprobaciones de texto |
| `lista: [valores]`, `lista_vacia: null`, `rango: [a, b, paso]` | listas y rango (1–3 argumentos) |
| `elemento: {lista, posicion}`, `parte_lista: {lista, inicio, fin}` | lectura; `fin` es opcional |
| `quitar: {de, posicion}`, `copiar: {lista}` | quitar (posición opcional) y copiar |
| `contiene_lista: {valor, en}` | pertenencia en lista |
| `llamar: {nombre, argumentos}` | llamada como expresión |

Los nombres de variables, funciones e identificadores no pueden contener
espacios. El compilador valida identificadores repetidos, operadores, aridad y
la estructura de cada YAML; sus errores incluyen la ruta del contenido que se
debe corregir.

## Alcance técnico

El YAML describe **instancias de bloques ya registrados**, no crea bloques
nuevos. Para incorporar una capacidad nueva siguen siendo necesarios cambios
técnicos en `js/bloques.js`: definición visual del bloque, generadores Python y
JavaScript y registro para la toolbox. No se ha sustituido ninguno de esos
componentes por YAML.

`js/constructores.js` permanece en la copia solo como referencia histórica. El
temario generado prioriza `estado`, por lo que todos los ejemplos y semillas
que antes dependían de `CONSTRUCTORES` se cargan ahora desde YAML.
