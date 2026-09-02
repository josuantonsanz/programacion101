// =================================================================
// CONSTRUCTORES DE EJEMPLOS / EJERCICIOS
// -----------------------------------------------------------------
// Los datos (títulos, enunciados, resultadoEsperado...) viven en
// data/temario.json. Lo único que no puede ir en un JSON son las
// funciones que MONTAN bloques en el espacio de trabajo; por eso
// viven aquí, asociadas por el "id" de cada ejemplo o ejercicio.
//
// Para añadir un ejemplo nuevo:
//   1. Añádelo en data/temario.json con un id único.
//   2. Añade aquí una función CONSTRUCTORES[id] que monte los bloques
//      (o, si prefieres no programar, monta los bloques a mano en la
//      página, pulsa "Exportar JSON del espacio actual" en el panel
//      del profesor y pega el JSON como "estado" en el temario).
// =================================================================

// -----------------------------------------------------------------
// Helpers para montar bloques programáticamente
// -----------------------------------------------------------------
function crear(tipo) { const b = workspace.newBlock(tipo); b.initSvg(); b.render(); return b; }
function variable(nombre) {
  const mapa = workspace.getVariableMap();
  return mapa.getVariable(nombre) || mapa.createVariable(nombre);
}
function bloqueSet(nombre, valorBlock) {
  const b = crear('variables_set');
  b.getField('VAR').setValue(variable(nombre).getId());
  b.getInput('VALUE').connection.connect(valorBlock.outputConnection);
  return b;
}
function bloqueGet(nombre) {
  const b = crear('variables_get');
  b.getField('VAR').setValue(variable(nombre).getId());
  return b;
}
function bloqueTexto(txt) { const b = crear('text'); b.setFieldValue(txt, 'TEXT'); return b; }
function bloqueNum(n) { const b = crear('math_number'); b.setFieldValue(String(n), 'NUM'); return b; }
function bloqueBool(v) { const b = crear('logic_boolean'); b.setFieldValue(v ? 'TRUE' : 'FALSE', 'BOOL'); return b; }
function bloqueMostrar(valorBlock) { const b = crear('mostrar'); b.getInput('VALOR').connection.connect(valorBlock.outputConnection); return b; }
function bloqueTipoDe(valorBlock) { const b = crear('tipo_de'); b.getInput('VALOR').connection.connect(valorBlock.outputConnection); return b; }
function bloqueComparar(a, op, bBlock) {
  const b = crear('logic_compare'); b.setFieldValue(op, 'OP');
  b.getInput('A').connection.connect(a.outputConnection);
  b.getInput('B').connection.connect(bBlock.outputConnection);
  return b;
}
function bloqueLogica(a, op, bBlock) {
  const b = crear('logic_operation'); b.setFieldValue(op, 'OP');
  b.getInput('A').connection.connect(a.outputConnection);
  b.getInput('B').connection.connect(bBlock.outputConnection);
  return b;
}
function bloqueAritmetica(a, op, bBlock) {
  const b = crear('math_arithmetic'); b.setFieldValue(op, 'OP');
  b.getInput('A').connection.connect(a.outputConnection);
  b.getInput('B').connection.connect(bBlock.outputConnection);
  return b;
}
function bloqueRaiz(numBlock) { const b = crear('math_single'); b.setFieldValue('ROOT', 'OP'); b.getInput('NUM').connection.connect(numBlock.outputConnection); return b; }
function bloqueLongitud(valBlock) { const b = crear('text_length'); b.getInput('VALUE').connection.connect(valBlock.outputConnection); return b; }
function bloqueRepite(nBlock, cuerpoBlock) {
  const b = crear('controls_repeat_ext');
  b.getInput('TIMES').connection.connect(nBlock.outputConnection);
  b.getInput('DO').connection.connect(cuerpoBlock.previousConnection);
  return b;
}
function bloquePedir(mensaje) {
  const b = crear('pedir');
  if (mensaje) b.setFieldValue(mensaje, 'MENSAJE');
  return b;
}
function bloqueConvertir(tipo, valorBlock) {
  const b = crear('convertir');
  b.setFieldValue(tipo, 'TIPO');
  b.getInput('VALOR').connection.connect(valorBlock.outputConnection);
  return b;
}
function bloqueOpExtra(a, op, bBlock) {
  const b = crear('operacion_extra');
  b.setFieldValue(op, 'OP');
  b.getInput('A').connection.connect(a.outputConnection);
  b.getInput('B').connection.connect(bBlock.outputConnection);
  return b;
}
function bloqueNegar(valorBlock) {
  const b = crear('logic_negate');
  b.getInput('BOOL').connection.connect(valorBlock.outputConnection);
  return b;
}
function bloqueUnir(...valorBlocks) {
  const b = crear('text_join');
  b.loadExtraState({ itemCount: valorBlocks.length });
  valorBlocks.forEach((vb, i) => b.getInput('ADD' + i).connection.connect(vb.outputConnection));
  return b;
}
function encadenar(...bloques) {
  for (let i = 0; i < bloques.length - 1; i++) bloques[i].nextConnection.connect(bloques[i + 1].previousConnection);
  return bloques[0];
}

// ---- Helpers de cadenas -----------------------------------------
function bloqueChar(textoBlock, posBlock) {
  const b = crear('text_char');
  b.getInput('TEXTO').connection.connect(textoBlock.outputConnection);
  b.getInput('POS').connection.connect(posBlock.outputConnection);
  return b;
}
function bloqueSlice(textoBlock, inicioBlock, finBlock) {
  const b = crear('text_slice');
  b.getInput('TEXTO').connection.connect(textoBlock.outputConnection);
  b.getInput('INICIO').connection.connect(inicioBlock.outputConnection);
  if (finBlock) b.getInput('FIN').connection.connect(finBlock.outputConnection);
  return b;
}
function bloqueTransformar(metodo, textoBlock) {
  const b = crear('text_transformar');
  b.setFieldValue(metodo, 'METODO');
  b.getInput('TEXTO').connection.connect(textoBlock.outputConnection);
  return b;
}
function bloqueBuscar(textoBlock, buscarBlock) {
  const b = crear('text_buscar');
  b.getInput('TEXTO').connection.connect(textoBlock.outputConnection);
  b.getInput('BUSCAR').connection.connect(buscarBlock.outputConnection);
  return b;
}
function bloqueReemplazar(textoBlock, viejoBlock, nuevoBlock) {
  const b = crear('text_reemplazar');
  b.getInput('TEXTO').connection.connect(textoBlock.outputConnection);
  b.getInput('VIEJO').connection.connect(viejoBlock.outputConnection);
  b.getInput('NUEVO').connection.connect(nuevoBlock.outputConnection);
  return b;
}
function bloqueContieneTexto(subBlock, textoBlock) {
  const b = crear('text_contiene');
  b.getInput('SUB').connection.connect(subBlock.outputConnection);
  b.getInput('TEXTO').connection.connect(textoBlock.outputConnection);
  return b;
}
function bloqueTieneMayuscula(textoBlock) {
  const b = crear('text_tiene_mayuscula');
  b.getInput('TEXTO').connection.connect(textoBlock.outputConnection);
  return b;
}
function bloqueTieneNumero(textoBlock) {
  const b = crear('text_tiene_numero');
  b.getInput('TEXTO').connection.connect(textoBlock.outputConnection);
  return b;
}

// ---- Helpers de listas y bucles for ------------------------------
function bloqueLista(...valorBlocks) {
  const b = crear('lista');
  b.loadExtraState({ itemCount: valorBlocks.length });
  valorBlocks.forEach((vb, i) => b.getInput('ADD' + i).connection.connect(vb.outputConnection));
  return b;
}
function bloqueListaVacia() { return crear('lista_vacia'); }
function bloqueListaLongitud(listaBlock) {
  const b = crear('lista_longitud');
  b.getInput('LISTA').connection.connect(listaBlock.outputConnection);
  return b;
}
function bloqueListaElemento(listaBlock, posBlock) {
  const b = crear('lista_elemento');
  b.getInput('LISTA').connection.connect(listaBlock.outputConnection);
  b.getInput('POS').connection.connect(posBlock.outputConnection);
  return b;
}
function bloqueListaParte(listaBlock, inicioBlock, finBlock) {
  const b = crear('lista_parte');
  b.getInput('LISTA').connection.connect(listaBlock.outputConnection);
  b.getInput('INICIO').connection.connect(inicioBlock.outputConnection);
  if (finBlock) b.getInput('FIN').connection.connect(finBlock.outputConnection);
  return b;
}
function bloqueListaAnadir(listaBlock, valorBlock) {
  const b = crear('lista_anadir');
  b.getInput('LISTA').connection.connect(listaBlock.outputConnection);
  b.getInput('VALOR').connection.connect(valorBlock.outputConnection);
  return b;
}
function bloqueListaQuitar(listaBlock, posBlock) {
  const b = crear('lista_quitar');
  b.getInput('LISTA').connection.connect(listaBlock.outputConnection);
  if (posBlock) b.getInput('POS').connection.connect(posBlock.outputConnection);
  return b;
}
function bloqueListaPoner(listaBlock, posBlock, valorBlock) {
  const b = crear('lista_poner');
  b.getInput('LISTA').connection.connect(listaBlock.outputConnection);
  b.getInput('POS').connection.connect(posBlock.outputConnection);
  b.getInput('VALOR').connection.connect(valorBlock.outputConnection);
  return b;
}
function bloqueListaOrdenar(listaBlock) {
  const b = crear('lista_ordenar');
  b.getInput('LISTA').connection.connect(listaBlock.outputConnection);
  return b;
}
function bloqueListaInvertir(listaBlock) {
  const b = crear('lista_invertir');
  b.getInput('LISTA').connection.connect(listaBlock.outputConnection);
  return b;
}
function bloqueListaCopiar(listaBlock) {
  const b = crear('lista_copiar');
  b.getInput('LISTA').connection.connect(listaBlock.outputConnection);
  return b;
}
function bloqueListaContiene(valorBlock, listaBlock) {
  const b = crear('lista_contiene');
  b.getInput('VALOR').connection.connect(valorBlock.outputConnection);
  b.getInput('LISTA').connection.connect(listaBlock.outputConnection);
  return b;
}
function bloqueRango(inicioBlock, finBlock, pasoBlock) {
  const b = crear('rango');
  if (finBlock) {
    b.getInput('INICIO').connection.connect(inicioBlock.outputConnection);
    b.getInput('FIN').connection.connect(finBlock.outputConnection);
    if (pasoBlock) b.getInput('PASO').connection.connect(pasoBlock.outputConnection);
  } else if (inicioBlock) {
    b.getInput('INICIO').connection.connect(inicioBlock.outputConnection);
  }
  return b;
}
function bloqueParaCada(nombreVar, listaBlock, cuerpoBlock) {
  const b = crear('para_cada');
  b.getField('VAR').setValue(variable(nombreVar).getId());
  b.getInput('LISTA').connection.connect(listaBlock.outputConnection);
  b.getInput('DO').connection.connect(cuerpoBlock.previousConnection);
  return b;
}

// ---- Helpers de funciones ---------------------------------------
function bloqueDefinir(nombre, params, cuerpoBlock) {
  const b = crear('funcion_definir');
  b.setFieldValue(nombre, 'NOMBRE');
  if (params) b.setFieldValue(params, 'PARAMS');
  if (cuerpoBlock) b.getInput('DO').connection.connect(cuerpoBlock.previousConnection);
  return b;
}
function bloqueLlamar(nombre, arg1Block, arg2Block) {
  const b = crear('funcion_llamar');
  b.setFieldValue(nombre, 'NOMBRE');
  if (arg1Block) b.getInput('ARG1').connection.connect(arg1Block.outputConnection);
  if (arg2Block) b.getInput('ARG2').connection.connect(arg2Block.outputConnection);
  return b;
}
function bloqueDevolver(valorBlock) {
  const b = crear('devolver');
  if (valorBlock) b.getInput('VALOR').connection.connect(valorBlock.outputConnection);
  return b;
}
function bloqueSi(condBlock, cuerpoBlocks, elseBlocks) {
  const b = crear('controls_if');
  b.loadExtraState({ elseIfCount: 0, hasElse: !!elseBlocks });
  b.getInput('IF0').connection.connect(condBlock.outputConnection);
  const cuerpo = encadenar(...cuerpoBlocks);
  b.getInput('DO0').connection.connect(cuerpo.previousConnection);
  if (elseBlocks) {
    const alt = encadenar(...elseBlocks);
    b.getInput('ELSE').connection.connect(alt.previousConnection);
  }
  return b;
}
function bloqueRandomInt(minBlock, maxBlock) {
  const b = crear('math_random_int');
  b.getInput('FROM').connection.connect(minBlock.outputConnection);
  b.getInput('TO').connection.connect(maxBlock.outputConnection);
  return b;
}

// -----------------------------------------------------------------
// Funciones de construcción por id (ver data/temario.json)
// -----------------------------------------------------------------
const CONSTRUCTORES = {

  // ---- Capítulo 1: Conceptos básicos ----------------------------
  'variables-crear-tipos': () => {
    const s1 = bloqueSet('nombre', bloqueTexto('Ana'));
    const s2 = bloqueSet('edad', bloqueNum(12));
    const s3 = bloqueSet('esEstudiante', bloqueBool(true));
    const m1 = bloqueMostrar(bloqueGet('nombre'));
    const m2 = bloqueMostrar(bloqueTipoDe(bloqueGet('nombre')));
    const m3 = bloqueMostrar(bloqueGet('edad'));
    const m4 = bloqueMostrar(bloqueTipoDe(bloqueGet('edad')));
    const m5 = bloqueMostrar(bloqueGet('esEstudiante'));
    const m6 = bloqueMostrar(bloqueTipoDe(bloqueGet('esEstudiante')));
    encadenar(s1, s2, s3, m1, m2, m3, m4, m5, m6).moveBy(24, 24);
  },

  // ---- Capítulo 2: Operadores y lógica ---------------------------
  'variables-funciones-estandar': () => {
    const s1 = bloqueSet('numero', bloqueNum(16));
    const m1 = bloqueMostrar(bloqueTexto('Raíz cuadrada de 16:'));
    const m2 = bloqueMostrar(bloqueRaiz(bloqueGet('numero')));
    const s2 = bloqueSet('palabra', bloqueTexto('Programación'));
    const m3 = bloqueMostrar(bloqueTexto('Longitud de "Programación":'));
    const m4 = bloqueMostrar(bloqueLongitud(bloqueGet('palabra')));
    encadenar(s1, m1, m2, s2, m3, m4).moveBy(24, 24);
  },

  'logica-comparar-numeros': () => {
    const s1 = bloqueSet('a', bloqueNum(7));
    const s2 = bloqueSet('b', bloqueNum(3));
    const m1 = bloqueMostrar(bloqueComparar(bloqueGet('a'), 'GT', bloqueGet('b')));
    const m2 = bloqueMostrar(bloqueComparar(bloqueGet('a'), 'EQ', bloqueGet('b')));
    encadenar(s1, s2, m1, m2).moveBy(24, 24);
  },

  'operadores-logicos': () => {
    const s1 = bloqueSet('edad', bloqueNum(25));
    const s2 = bloqueSet('tieneEntrada', bloqueBool(true));
    const s3 = bloqueSet('puedePasar', bloqueLogica(bloqueComparar(bloqueGet('edad'), 'GTE', bloqueNum(18)), 'AND', bloqueGet('tieneEntrada')));
    const m1 = bloqueMostrar(bloqueGet('puedePasar'));
    const s4 = bloqueSet('esFinDeSemana', bloqueBool(true));
    const s5 = bloqueSet('estaDeVacaciones', bloqueBool(false));
    const s6 = bloqueSet('puedeDormir', bloqueLogica(bloqueGet('esFinDeSemana'), 'OR', bloqueGet('estaDeVacaciones')));
    const m2 = bloqueMostrar(bloqueGet('puedeDormir'));
    const s7 = bloqueSet('llueve', bloqueBool(false));
    const m3 = bloqueMostrar(bloqueNegar(bloqueGet('llueve')));
    encadenar(s1, s2, s3, m1, s4, s5, s6, m2, s7, m3).moveBy(24, 24);
  },

  'clasificar-nota': () => {
    const s1 = bloqueSet('nota', bloqueNum(7.5));
    const ifBlock = crear('controls_if');
    ifBlock.loadExtraState({ elseIfCount: 2, hasElse: true });
    const c1 = bloqueComparar(bloqueGet('nota'), 'GTE', bloqueNum(9));
    ifBlock.getInput('IF0').connection.connect(c1.outputConnection);
    ifBlock.getInput('DO0').connection.connect(bloqueMostrar(bloqueTexto('¡Sobresaliente!')).previousConnection);
    const c2 = bloqueComparar(bloqueGet('nota'), 'GTE', bloqueNum(7));
    ifBlock.getInput('IF1').connection.connect(c2.outputConnection);
    ifBlock.getInput('DO1').connection.connect(bloqueMostrar(bloqueTexto('Notable.')).previousConnection);
    const c3 = bloqueComparar(bloqueGet('nota'), 'GTE', bloqueNum(5));
    ifBlock.getInput('IF2').connection.connect(c3.outputConnection);
    ifBlock.getInput('DO2').connection.connect(bloqueMostrar(bloqueTexto('Aprobado.')).previousConnection);
    ifBlock.getInput('ELSE').connection.connect(bloqueMostrar(bloqueTexto('Suspendido.')).previousConnection);
    encadenar(s1, ifBlock).moveBy(24, 24);
  },

  // ---- Capítulo 3: Control del flujo ----------------------------
  'logica-condicional': () => {
    const s1 = bloqueSet('edad', bloqueNum(15));
    const ifBlock = crear('controls_if');
    ifBlock.loadExtraState({ elseIfCount: 0, hasElse: true });
    const cond = bloqueComparar(bloqueGet('edad'), 'GTE', bloqueNum(18));
    ifBlock.getInput('IF0').connection.connect(cond.outputConnection);
    const doMayor = bloqueMostrar(bloqueTexto('Eres mayor de edad'));
    const doMenor = bloqueMostrar(bloqueTexto('Todavía eres menor de edad'));
    ifBlock.getInput('DO0').connection.connect(doMayor.previousConnection);
    ifBlock.getInput('ELSE').connection.connect(doMenor.previousConnection);
    encadenar(s1, ifBlock).moveBy(24, 24);
  },

  'logica-puede-conducir': () => {
    bloqueSet('edad', bloqueNum(16)).moveBy(24, 24);
  },

  // ---- Capítulo 3: Control del flujo ----------------------------
  'bucles-contar': () => {
    const s1 = bloqueSet('contador', bloqueNum(1));
    const whileBlock = crear('controls_whileUntil');
    const cond = bloqueComparar(bloqueGet('contador'), 'LTE', bloqueNum(5));
    whileBlock.getInput('BOOL').connection.connect(cond.outputConnection);
    const m1 = bloqueMostrar(bloqueGet('contador'));
    const s2 = bloqueSet('contador', bloqueAritmetica(bloqueGet('contador'), 'ADD', bloqueNum(1)));
    const cuerpo = encadenar(m1, s2);
    whileBlock.getInput('DO').connection.connect(cuerpo.previousConnection);
    encadenar(s1, whileBlock).moveBy(24, 24);
  },

  // ---- Capítulo 3: Control del flujo ----------------------------
  // 'bucles-repetir' ya no se usa en el temario: el bloque controls_repeat_ext
  // encaja mejor en el futuro capítulo "For y listas". Se conserva por si acaso.
  'bucles-repetir': () => {
    const cuerpo = bloqueMostrar(bloqueTexto('¡Hola!'));
    bloqueRepite(bloqueNum(3), cuerpo).moveBy(24, 24);
  },

  'bucles-cuenta-atras': () => {
    bloqueSet('contador', bloqueNum(5)).moveBy(24, 24);
  },

  // ---- Capítulo 1: Conceptos básicos ----------------------------
  'operadores-aritmeticos': () => {
    const s1 = bloqueSet('a', bloqueNum(10));
    const s2 = bloqueSet('b', bloqueNum(5));
    const m1 = bloqueMostrar(bloqueAritmetica(bloqueGet('a'), 'ADD', bloqueGet('b')));
    const m2 = bloqueMostrar(bloqueAritmetica(bloqueGet('a'), 'MINUS', bloqueGet('b')));
    const m3 = bloqueMostrar(bloqueAritmetica(bloqueGet('a'), 'MULTIPLY', bloqueGet('b')));
    const m4 = bloqueMostrar(bloqueAritmetica(bloqueGet('a'), 'DIVIDE', bloqueGet('b')));
    encadenar(s1, s2, m1, m2, m3, m4).moveBy(24, 24);
  },

  'entrada-y-casting': () => {
    const s1 = bloqueSet('dato', bloquePedir('Escribe un número: '));
    const s2 = bloqueSet('numero', bloqueConvertir('ENTERO', bloqueGet('dato')));
    const m1 = bloqueMostrar(bloqueGet('numero'));
    const m2 = bloqueMostrar(bloqueTipoDe(bloqueGet('numero')));
    encadenar(s1, s2, m1, m2).moveBy(24, 24);
  },

  // ---- Capítulo 2: Operadores y lógica ---------------------------
  'operadores-avanzados': () => {
    const m1 = bloqueMostrar(bloqueOpExtra(bloqueNum(3), 'POW', bloqueNum(2)));
    const m2 = bloqueMostrar(bloqueOpExtra(bloqueNum(7), 'DIV_INT', bloqueNum(2)));
    const m3 = bloqueMostrar(bloqueOpExtra(bloqueNum(7), 'MOD', bloqueNum(2)));
    encadenar(m1, m2, m3).moveBy(24, 24);
  },

  // ---- Capítulo 3: Control del flujo -----------------------------
  'bucles-despegue': () => {
    const s1 = bloqueSet('contador', bloqueNum(5));
    const whileBlock = crear('controls_whileUntil');
    const cond = bloqueComparar(bloqueGet('contador'), 'GT', bloqueNum(0));
    whileBlock.getInput('BOOL').connection.connect(cond.outputConnection);
    const m1 = bloqueMostrar(bloqueGet('contador'));
    const s2 = bloqueSet('contador', bloqueAritmetica(bloqueGet('contador'), 'MINUS', bloqueNum(1)));
    const cuerpo = encadenar(m1, s2);
    whileBlock.getInput('DO').connection.connect(cuerpo.previousConnection);
    const m2 = bloqueMostrar(bloqueTexto('¡Despegue!'));
    encadenar(s1, whileBlock, m2).moveBy(24, 24);
  },

  // ---- Capítulo 4: Cadenas ---------------------------------------
  'cadenas-indexacion': () => {
    const s1 = bloqueSet('palabra', bloqueTexto('PYTHON'));
    const m1 = bloqueMostrar(bloqueChar(bloqueGet('palabra'), bloqueNum(0)));
    const m2 = bloqueMostrar(bloqueChar(bloqueGet('palabra'), bloqueNum(3)));
    const m3 = bloqueMostrar(bloqueChar(bloqueGet('palabra'), bloqueNum(-1)));
    encadenar(s1, m1, m2, m3).moveBy(24, 24);
  },

  'cadenas-slicing': () => {
    const s1 = bloqueSet('palabra', bloqueTexto('PYTHON'));
    const m1 = bloqueMostrar(bloqueSlice(bloqueGet('palabra'), bloqueNum(0), bloqueNum(3)));
    const m2 = bloqueMostrar(bloqueSlice(bloqueGet('palabra'), bloqueNum(2), bloqueNum(5)));
    const m3 = bloqueMostrar(bloqueSlice(bloqueGet('palabra'), bloqueNum(3)));
    encadenar(s1, m1, m2, m3).moveBy(24, 24);
  },

  'cadenas-transformar': () => {
    const s1 = bloqueSet('nombre', bloqueTexto('josu'));
    const m1 = bloqueMostrar(bloqueTransformar('MAYUS', bloqueGet('nombre')));
    const m2 = bloqueMostrar(bloqueTransformar('CAPITAL', bloqueGet('nombre')));
    const s2 = bloqueSet('titulo', bloqueTexto('aprendiendo a programar'));
    const m3 = bloqueMostrar(bloqueTransformar('TITULO', bloqueGet('titulo')));
    const s3 = bloqueSet('espaciado', bloqueTexto('  josu  '));
    const m4 = bloqueMostrar(bloqueTransformar('STRIP', bloqueGet('espaciado')));
    encadenar(s1, m1, m2, s2, m3, s3, m4).moveBy(24, 24);
  },

  'cadenas-buscar-reemplazar': () => {
    const s1 = bloqueSet('email', bloqueTexto('correo@dominio.com'));
    const m1 = bloqueMostrar(bloqueBuscar(bloqueGet('email'), bloqueTexto('@')));
    const s2 = bloqueSet('frase', bloqueTexto('Python es aburrido'));
    const m2 = bloqueMostrar(bloqueReemplazar(bloqueGet('frase'), bloqueTexto('aburrido'), bloqueTexto('divertido')));
    encadenar(s1, m1, s2, m2).moveBy(24, 24);
  },

  'cadenas-pertenencia': () => {
    const s1 = bloqueSet('frase', bloqueTexto('El zorro salta'));
    const m1 = bloqueMostrar(bloqueContieneTexto(bloqueTexto('zorro'), bloqueGet('frase')));
    const m2 = bloqueMostrar(bloqueContieneTexto(bloqueTexto('gato'), bloqueGet('frase')));
    encadenar(s1, m1, m2).moveBy(24, 24);
  },

  'cadenas-nueva-cadena': () => {
    const s1 = bloqueSet('nombre', bloqueTexto('josue'));
    const s2 = bloqueSet('apodo', bloqueUnir(bloqueChar(bloqueGet('nombre'), bloqueNum(0)), bloqueSlice(bloqueGet('nombre'), bloqueNum(1), bloqueNum(4))));
    const m1 = bloqueMostrar(bloqueGet('apodo'));
    const m2 = bloqueMostrar(bloqueGet('nombre'));
    encadenar(s1, s2, m1, m2).moveBy(24, 24);
  },

  // ---- Capítulo 5: For y listas ----------------------------------
  'bucles-range': () => {
    const c1 = bloqueParaCada('i', bloqueRango(bloqueNum(3)), bloqueMostrar(bloqueGet('i')));
    const c2 = bloqueParaCada('i', bloqueRango(bloqueNum(1), bloqueNum(6)), bloqueMostrar(bloqueGet('i')));
    const c3 = bloqueParaCada('i', bloqueRango(bloqueNum(0), bloqueNum(11), bloqueNum(2)), bloqueMostrar(bloqueGet('i')));
    encadenar(c1, c2, c3).moveBy(24, 24);
  },

  'listas-crear-acceder': () => {
    const s1 = bloqueSet('frutas', bloqueLista(bloqueTexto('manzana'), bloqueTexto('pera'), bloqueTexto('uva')));
    const m1 = bloqueMostrar(bloqueGet('frutas'));
    const m2 = bloqueMostrar(bloqueListaElemento(bloqueGet('frutas'), bloqueNum(0)));
    const m3 = bloqueMostrar(bloqueListaElemento(bloqueGet('frutas'), bloqueNum(-1)));
    const m4 = bloqueMostrar(bloqueListaLongitud(bloqueGet('frutas')));
    encadenar(s1, m1, m2, m3, m4).moveBy(24, 24);
  },

  'listas-metodos': () => {
    const s1 = bloqueSet('compras', bloqueLista(bloqueTexto('Leche'), bloqueTexto('Pan')));
    const m1 = bloqueMostrar(bloqueGet('compras'));
    const a1 = bloqueListaAnadir(bloqueGet('compras'), bloqueTexto('Manzanas'));
    const m2 = bloqueMostrar(bloqueGet('compras'));
    const o1 = bloqueListaOrdenar(bloqueGet('compras'));
    const m3 = bloqueMostrar(bloqueGet('compras'));
    const m4 = bloqueMostrar(bloqueListaQuitar(bloqueGet('compras'), null));
    const m5 = bloqueMostrar(bloqueGet('compras'));
    encadenar(s1, m1, a1, m2, o1, m3, m4, m5).moveBy(24, 24);
  },

  'listas-copiar': () => {
    const s1 = bloqueSet('listaOriginal', bloqueLista(bloqueTexto('A'), bloqueTexto('B'), bloqueTexto('C')));
    const s2 = bloqueSet('listaMal', bloqueGet('listaOriginal'));
    const p1 = bloqueListaPoner(bloqueGet('listaMal'), bloqueNum(0), bloqueTexto('Z'));
    const m1 = bloqueMostrar(bloqueGet('listaOriginal'));
    const s3 = bloqueSet('listaBien', bloqueListaCopiar(bloqueGet('listaOriginal')));
    const p2 = bloqueListaPoner(bloqueGet('listaBien'), bloqueNum(0), bloqueTexto('Q'));
    const m2 = bloqueMostrar(bloqueGet('listaOriginal'));
    const m3 = bloqueMostrar(bloqueGet('listaBien'));
    encadenar(s1, s2, p1, m1, s3, p2, m2, m3).moveBy(24, 24);
  },

  'bucles-listas-tareas': () => {
    const s1 = bloqueSet('tareas', bloqueLista(bloqueTexto('estudiar'), bloqueTexto('dormir'), bloqueTexto('comer')));
    const c1 = bloqueParaCada('tarea', bloqueGet('tareas'), bloqueMostrar(bloqueUnir(bloqueTexto('- '), bloqueGet('tarea'))));
    const c2 = bloqueParaCada('i', bloqueRango(bloqueNum(0), bloqueListaLongitud(bloqueGet('tareas'))),
      bloqueMostrar(bloqueUnir(bloqueConvertir('TEXTO', bloqueAritmetica(bloqueGet('i'), 'ADD', bloqueNum(1))), bloqueTexto('º puesto: '), bloqueListaElemento(bloqueGet('tareas'), bloqueGet('i')))));
    encadenar(s1, c1, c2).moveBy(24, 24);
  },

  'listas-sorteo': () => {
    const s1 = bloqueSet('participantes', bloqueLista(bloqueTexto('Ana'), bloqueTexto('Luis'), bloqueTexto('Marta'), bloqueTexto('Pedro')));
    const s2 = bloqueSet('ganador', bloqueListaElemento(bloqueGet('participantes'), bloqueRandomInt(bloqueNum(0), bloqueAritmetica(bloqueListaLongitud(bloqueGet('participantes')), 'MINUS', bloqueNum(1)))));
    const m1 = bloqueMostrar(bloqueUnir(bloqueTexto('El ganador es: '), bloqueGet('ganador')));
    encadenar(s1, s2, m1).moveBy(24, 24);
  },

  // ---- Capítulo 6: Funciones -------------------------------------
  'funciones-saludar': () => {
    const def = bloqueDefinir('saludar', '', bloqueMostrar(bloqueTexto('¡Hola! Me llamo Python.')));
    const m1 = bloqueMostrar(bloqueTexto('Vamos a saludar:'));
    const l1 = bloqueLlamar('saludar');
    const l2 = bloqueLlamar('saludar');
    const m2 = bloqueMostrar(bloqueTexto('¡Fin del programa!'));
    encadenar(def, m1, l1, l2, m2).moveBy(24, 24);
  },

  'funciones-parametros': () => {
    const def = bloqueDefinir('saludarA', 'nombre', bloqueMostrar(bloqueUnir(bloqueTexto('¡Hola, '), bloqueGet('nombre'), bloqueTexto('!'))));
    const l1 = bloqueLlamar('saludarA', bloqueTexto('Ana'));
    const l2 = bloqueLlamar('saludarA', bloqueTexto('Marcos'));
    encadenar(def, l1, l2).moveBy(24, 24);
  },

  'funciones-return': () => {
    const def1 = bloqueDefinir('sumar', 'a, b', encadenar(
      bloqueSet('resultado', bloqueAritmetica(bloqueGet('a'), 'ADD', bloqueGet('b'))),
      bloqueDevolver(bloqueGet('resultado'))
    ));
    const d1 = bloqueSet('total', bloqueLlamar('sumar', bloqueNum(3), bloqueNum(4)));
    const m1 = bloqueMostrar(bloqueGet('total'));
    const d2 = bloqueSet('doble', bloqueAritmetica(bloqueLlamar('sumar', bloqueNum(5), bloqueNum(2)), 'MULTIPLY', bloqueNum(2)));
    const m2 = bloqueMostrar(bloqueGet('doble'));
    const def2 = bloqueDefinir('funcionVacia', '', null);
    const m3 = bloqueMostrar(bloqueLlamar('funcionVacia'));
    encadenar(def1, d1, m1, d2, m2, def2, m3).moveBy(24, 24);
  },

  'funciones-ambito': () => {
    const s1 = bloqueSet('huevos', bloqueNum(12));
    const def = bloqueDefinir('cocinar', '', encadenar(
      bloqueSet('huevos', bloqueNum(2)),
      bloqueMostrar(bloqueUnir(bloqueTexto('En la cocina: '), bloqueGet('huevos')))
    ));
    const l1 = bloqueLlamar('cocinar');
    const m1 = bloqueMostrar(bloqueUnir(bloqueTexto('En el programa principal: '), bloqueGet('huevos')));
    encadenar(s1, def, l1, m1).moveBy(24, 24);
  },

  // ---- Semillas de ejercicios (el resto lo construye el alumno) ---
  'notas-analisis': () => {
    bloqueSet('notas', bloqueLista(bloqueNum(4), bloqueNum(8), bloqueNum(7), bloqueNum(9), bloqueNum(3), bloqueNum(6), bloqueNum(5), bloqueNum(10), bloqueNum(2))).moveBy(24, 24);
  },

  'inversor-listas': () => {
    const s1 = bloqueSet('miLista', bloqueLista(bloqueNum(1), bloqueNum(2), bloqueNum(3), bloqueTexto('a'), bloqueTexto('b'), bloqueTexto('c')));
    const s2 = bloqueSet('listaInvertida', bloqueListaVacia());
    encadenar(s1, s2).moveBy(24, 24);
  },

  'funciones-collatz': () => {
    bloqueSet('numero', bloqueNum(6)).moveBy(24, 24);
  },

  'funciones-password': () => {
    const d1 = bloqueDefinir('verificarLongitud', 'pwd', bloqueDevolver(bloqueComparar(bloqueLongitud(bloqueGet('pwd')), 'GTE', bloqueNum(8))));
    const d2 = bloqueDefinir('verificarMayuscula', 'pwd', bloqueDevolver(bloqueTieneMayuscula(bloqueGet('pwd'))));
    const d3 = bloqueDefinir('verificarNumero', 'pwd', bloqueDevolver(bloqueTieneNumero(bloqueGet('pwd'))));
    encadenar(d1, d2, d3).moveBy(24, 24);
  }
};
