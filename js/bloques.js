// =================================================================
// BLOQUES PERSONALIZADOS Y CONFIGURACIÓN DE LA TOOLBOX
// =================================================================

// -----------------------------------------------------------------
// 1. Bloques propios del taller ("funciones estándar")
// -----------------------------------------------------------------
Blockly.Blocks['mostrar'] = {
  init: function() {
    this.appendValueInput('VALOR').setCheck(null).appendField('mostrar');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Función estándar de salida: muestra un valor en la consola.');
  }
};
Blockly.Python.forBlock['mostrar'] = function(block) {
  var valor = Blockly.Python.valueToCode(block, 'VALOR', Blockly.Python.ORDER_NONE) || 'None';
  return 'mostrar(' + valor + ')\n';
};
Blockly.JavaScript.forBlock['mostrar'] = function(block) {
  var valor = Blockly.JavaScript.valueToCode(block, 'VALOR', Blockly.JavaScript.ORDER_NONE) || "''";
  return 'mostrar(' + valor + ');\n';
};

Blockly.Blocks['tipo_de'] = {
  init: function() {
    this.appendValueInput('VALOR').setCheck(null).appendField('tipo de');
    this.setInputsInline(true);
    this.setOutput(true, 'String');
    this.setColour(290);
    this.setTooltip('Función estándar: devuelve el tipo de dato de un valor.');
  }
};
Blockly.Python.forBlock['tipo_de'] = function(block) {
  var valor = Blockly.Python.valueToCode(block, 'VALOR', Blockly.Python.ORDER_NONE) || 'None';
  return ['tipo_de(' + valor + ')', Blockly.Python.ORDER_FUNCTION_CALL];
};
Blockly.JavaScript.forBlock['tipo_de'] = function(block) {
  var valor = Blockly.JavaScript.valueToCode(block, 'VALOR', Blockly.JavaScript.ORDER_NONE) || "''";
  return ['tipoDeES(' + valor + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// ---- pedir (entrada de datos, como input()) ----------------------
Blockly.Blocks['pedir'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('pedir')
        .appendField(new Blockly.FieldTextInput(''), 'MENSAJE');
    this.setOutput(true, 'String');
    this.setColour(290);
    this.setTooltip('Pide un dato al usuario (como input()) y lo devuelve SIEMPRE como texto.');
  }
};
Blockly.Python.forBlock['pedir'] = function(block) {
  var mensaje = block.getFieldValue('MENSAJE') || '';
  return ['input(' + Blockly.Python.quote_(mensaje) + ')', Blockly.Python.ORDER_FUNCTION_CALL];
};
Blockly.JavaScript.forBlock['pedir'] = function(block) {
  var mensaje = block.getFieldValue('MENSAJE') || '';
  return ['entrada(' + JSON.stringify(mensaje) + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// ---- convertir (casting: int() / float() / str()) ----------------
Blockly.Blocks['convertir'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('convertir')
        .appendField(new Blockly.FieldDropdown([
          ['a número entero', 'ENTERO'],
          ['a número decimal', 'DECIMAL'],
          ['a texto', 'TEXTO']
        ]), 'TIPO');
    this.appendValueInput('VALOR');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(290);
    this.setTooltip('Convierte un valor a otro tipo de dato (como int(), float() o str()).');
  }
};
Blockly.Python.forBlock['convertir'] = function(block) {
  var valor = Blockly.Python.valueToCode(block, 'VALOR', Blockly.Python.ORDER_NONE) || '0';
  var fn = { ENTERO: 'int', DECIMAL: 'float', TEXTO: 'str' }[block.getFieldValue('TIPO')];
  return [fn + '(' + valor + ')', Blockly.Python.ORDER_FUNCTION_CALL];
};
Blockly.JavaScript.forBlock['convertir'] = function(block) {
  var valor = Blockly.JavaScript.valueToCode(block, 'VALOR', Blockly.JavaScript.ORDER_NONE) || '0';
  var tipo = block.getFieldValue('TIPO');
  var code = { ENTERO: 'parseInt(' + valor + ', 10)', DECIMAL: 'Number(' + valor + ')', TEXTO: 'String(' + valor + ')' }[tipo];
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// ---- operacion_extra (potencia **, división entera //, resto %) --
Blockly.Blocks['operacion_extra'] = {
  init: function() {
    this.appendValueInput('A').setCheck('Number');
    this.appendDummyInput().appendField(new Blockly.FieldDropdown([
      ['potencia (**)', 'POW'],
      ['división entera (//)', 'DIV_INT'],
      ['resto (%)', 'MOD']
    ]), 'OP');
    this.appendValueInput('B').setCheck('Number');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(230);
    this.setTooltip('Operaciones aritméticas avanzadas: potencia, división entera y resto.');
  }
};
Blockly.Python.forBlock['operacion_extra'] = function(block) {
  var a = Blockly.Python.valueToCode(block, 'A', Blockly.Python.ORDER_MULTIPLICATIVE) || '0';
  var b = Blockly.Python.valueToCode(block, 'B', Blockly.Python.ORDER_MULTIPLICATIVE) || '0';
  var op = { POW: ' ** ', DIV_INT: ' // ', MOD: ' % ' }[block.getFieldValue('OP')];
  return ['(' + a + op + b + ')', Blockly.Python.ORDER_ADDITIVE];
};
Blockly.JavaScript.forBlock['operacion_extra'] = function(block) {
  var a = Blockly.JavaScript.valueToCode(block, 'A', Blockly.JavaScript.ORDER_NONE) || '0';
  var b = Blockly.JavaScript.valueToCode(block, 'B', Blockly.JavaScript.ORDER_NONE) || '0';
  var op = block.getFieldValue('OP');
  var code = op === 'POW' ? 'Math.pow(' + a + ', ' + b + ')' :
             op === 'DIV_INT' ? 'Math.floor(' + a + ' / ' + b + ')' :
             '(' + a + ' % ' + b + ')';
  return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// ---- romper (break), continuar (continue), no_hacer_nada (pass) --
Blockly.Blocks['romper'] = {
  init: function() {
    this.appendDummyInput().appendField('romper el bucle');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('break: sale del bucle inmediatamente.');
  }
};
Blockly.Python.forBlock['romper'] = function() { return 'break\n'; };
Blockly.JavaScript.forBlock['romper'] = function() { return 'break;\n'; };

Blockly.Blocks['continuar'] = {
  init: function() {
    this.appendDummyInput().appendField('continuar');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('continue: salta a la siguiente vuelta del bucle, ignorando lo que queda.');
  }
};
Blockly.Python.forBlock['continuar'] = function() { return 'continue\n'; };
Blockly.JavaScript.forBlock['continuar'] = function() { return 'continue;\n'; };

Blockly.Blocks['no_hacer_nada'] = {
  init: function() {
    this.appendDummyInput().appendField('no hacer nada (pass)');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('pass: no hace nada; sirve para dejar un bloque vacío sin error.');
  }
};
Blockly.Python.forBlock['no_hacer_nada'] = function() { return 'pass\n'; };
Blockly.JavaScript.forBlock['no_hacer_nada'] = function() { return ';\n'; };

// ---- Bloques de cadenas -------------------------------------------
// text_repetir: "ja" * 4
Blockly.Blocks['text_repetir'] = {
  init: function() {
    this.appendDummyInput().appendField('repetir');
    this.appendValueInput('TEXTO');
    this.appendValueInput('VECES').setCheck('Number').appendField('veces');
    this.setInputsInline(true);
    this.setOutput(true, 'String');
    this.setColour(160);
    this.setTooltip('Repite un texto un número de veces (como "ja" * 4).');
  }
};
Blockly.Python.forBlock['text_repetir'] = function(block) {
  var t = Blockly.Python.valueToCode(block, 'TEXTO', Blockly.Python.ORDER_MULTIPLICATIVE) || "''";
  var n = Blockly.Python.valueToCode(block, 'VECES', Blockly.Python.ORDER_MULTIPLICATIVE) || '0';
  return ['(' + t + ' * ' + n + ')', Blockly.Python.ORDER_ADDITIVE];
};
Blockly.JavaScript.forBlock['text_repetir'] = function(block) {
  var t = Blockly.JavaScript.valueToCode(block, 'TEXTO', Blockly.JavaScript.ORDER_FUNCTION_CALL) || "''";
  var n = Blockly.JavaScript.valueToCode(block, 'VECES', Blockly.JavaScript.ORDER_NONE) || '0';
  return [t + '.repeat(' + n + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// text_char: palabra[0], palabra[-1]
Blockly.Blocks['text_char'] = {
  init: function() {
    this.appendDummyInput().appendField('carácter');
    this.appendValueInput('POS').setCheck('Number').appendField('de');
    this.appendValueInput('TEXTO');
    this.setInputsInline(true);
    this.setOutput(true, 'String');
    this.setColour(160);
    this.setTooltip('Devuelve el carácter que está en una posición (la primera es 0; -1 es el último).');
  }
};
Blockly.Python.forBlock['text_char'] = function(block) {
  var t = Blockly.Python.valueToCode(block, 'TEXTO', Blockly.Python.ORDER_MEMBER) || "''";
  var p = Blockly.Python.valueToCode(block, 'POS', Blockly.Python.ORDER_MEMBER) || '0';
  return [t + '[' + p + ']', Blockly.Python.ORDER_MEMBER];
};
Blockly.JavaScript.forBlock['text_char'] = function(block) {
  var t = Blockly.JavaScript.valueToCode(block, 'TEXTO', Blockly.JavaScript.ORDER_MEMBER) || "''";
  var p = Blockly.JavaScript.valueToCode(block, 'POS', Blockly.JavaScript.ORDER_NONE) || '0';
  return ['charEn(' + t + ', ' + p + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// text_slice: palabra[0:3], palabra[3:]
Blockly.Blocks['text_slice'] = {
  init: function() {
    this.appendDummyInput().appendField('parte de');
    this.appendValueInput('TEXTO');
    this.appendValueInput('INICIO').setCheck('Number').appendField('desde');
    this.appendValueInput('FIN').setCheck('Number').appendField('hasta');
    this.setInputsInline(true);
    this.setOutput(true, 'String');
    this.setColour(160);
    this.setTooltip('Extrae una parte de un texto, desde una posición hasta otra (la final NO se incluye).');
  }
};
Blockly.Python.forBlock['text_slice'] = function(block) {
  var t = Blockly.Python.valueToCode(block, 'TEXTO', Blockly.Python.ORDER_MEMBER) || "''";
  var i = Blockly.Python.valueToCode(block, 'INICIO', Blockly.Python.ORDER_MEMBER) || '0';
  var f = Blockly.Python.valueToCode(block, 'FIN', Blockly.Python.ORDER_MEMBER);
  return [t + '[' + i + ':' + (f || '') + ']', Blockly.Python.ORDER_MEMBER];
};
Blockly.JavaScript.forBlock['text_slice'] = function(block) {
  var t = Blockly.JavaScript.valueToCode(block, 'TEXTO', Blockly.JavaScript.ORDER_MEMBER) || "''";
  var i = Blockly.JavaScript.valueToCode(block, 'INICIO', Blockly.JavaScript.ORDER_NONE) || '0';
  var f = Blockly.JavaScript.valueToCode(block, 'FIN', Blockly.JavaScript.ORDER_NONE);
  return [t + '.slice(' + i + ', ' + (f || 'undefined') + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// text_transformar: upper / lower / capitalize / title / strip
Blockly.Blocks['text_transformar'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('texto')
        .appendField(new Blockly.FieldDropdown([
          ['en mayúsculas', 'MAYUS'],
          ['en minúsculas', 'MINUS'],
          ['con la primera letra en mayúscula', 'CAPITAL'],
          ['en formato título', 'TITULO'],
          ['sin espacios alrededor', 'STRIP']
        ]), 'METODO');
    this.appendValueInput('TEXTO');
    this.setInputsInline(true);
    this.setOutput(true, 'String');
    this.setColour(160);
    this.setTooltip('Aplica un método de cadena: upper(), lower(), capitalize(), title() o strip().');
  }
};
Blockly.Python.forBlock['text_transformar'] = function(block) {
  var t = Blockly.Python.valueToCode(block, 'TEXTO', Blockly.Python.ORDER_MEMBER) || "''";
  var m = { MAYUS: 'upper', MINUS: 'lower', CAPITAL: 'capitalize', TITULO: 'title', STRIP: 'strip' }[block.getFieldValue('METODO')];
  return [t + '.' + m + '()', Blockly.Python.ORDER_MEMBER];
};
Blockly.JavaScript.forBlock['text_transformar'] = function(block) {
  var t = Blockly.JavaScript.valueToCode(block, 'TEXTO', Blockly.JavaScript.ORDER_MEMBER) || "''";
  var m = block.getFieldValue('METODO');
  var code = m === 'MAYUS' ? t + '.toUpperCase()' :
             m === 'MINUS' ? t + '.toLowerCase()' :
             m === 'CAPITAL' ? t + '.charAt(0).toUpperCase() + ' + t + '.slice(1).toLowerCase()' :
             m === 'TITULO' ? t + '.split(" ").map(function(p){return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();}).join(" ")' :
             t + '.trim()';
  return [code, Blockly.JavaScript.ORDER_ADDITION];
};

// text_buscar: cadena.find(x)
Blockly.Blocks['text_buscar'] = {
  init: function() {
    this.appendDummyInput().appendField('posición de');
    this.appendValueInput('BUSCAR');
    this.appendValueInput('TEXTO').appendField('en');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(160);
    this.setTooltip('Devuelve la posición de la primera aparición de un texto, o -1 si no está.');
  }
};
Blockly.Python.forBlock['text_buscar'] = function(block) {
  var t = Blockly.Python.valueToCode(block, 'TEXTO', Blockly.Python.ORDER_MEMBER) || "''";
  var b = Blockly.Python.valueToCode(block, 'BUSCAR', Blockly.Python.ORDER_NONE) || "''";
  return [t + '.find(' + b + ')', Blockly.Python.ORDER_MEMBER];
};
Blockly.JavaScript.forBlock['text_buscar'] = function(block) {
  var t = Blockly.JavaScript.valueToCode(block, 'TEXTO', Blockly.JavaScript.ORDER_MEMBER) || "''";
  var b = Blockly.JavaScript.valueToCode(block, 'BUSCAR', Blockly.JavaScript.ORDER_NONE) || "''";
  return [t + '.indexOf(' + b + ')', Blockly.JavaScript.ORDER_MEMBER];
};

// text_reemplazar: cadena.replace(viejo, nuevo) — todas las apariciones
Blockly.Blocks['text_reemplazar'] = {
  init: function() {
    this.appendDummyInput().appendField('reemplazar');
    this.appendValueInput('TEXTO');
    this.appendValueInput('VIEJO').appendField('por');
    this.appendValueInput('NUEVO').appendField('con');
    this.setInputsInline(true);
    this.setOutput(true, 'String');
    this.setColour(160);
    this.setTooltip('Reemplaza todas las apariciones de un texto por otro (como replace()).');
  }
};
Blockly.Python.forBlock['text_reemplazar'] = function(block) {
  var t = Blockly.Python.valueToCode(block, 'TEXTO', Blockly.Python.ORDER_MEMBER) || "''";
  var v = Blockly.Python.valueToCode(block, 'VIEJO', Blockly.Python.ORDER_NONE) || "''";
  var n = Blockly.Python.valueToCode(block, 'NUEVO', Blockly.Python.ORDER_NONE) || "''";
  return [t + '.replace(' + v + ', ' + n + ')', Blockly.Python.ORDER_MEMBER];
};
Blockly.JavaScript.forBlock['text_reemplazar'] = function(block) {
  var t = Blockly.JavaScript.valueToCode(block, 'TEXTO', Blockly.JavaScript.ORDER_MEMBER) || "''";
  var v = Blockly.JavaScript.valueToCode(block, 'VIEJO', Blockly.JavaScript.ORDER_NONE) || "''";
  var n = Blockly.JavaScript.valueToCode(block, 'NUEVO', Blockly.JavaScript.ORDER_NONE) || "''";
  return [t + '.split(' + v + ').join(' + n + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// text_contiene: x in cadena
Blockly.Blocks['text_contiene'] = {
  init: function() {
    this.appendDummyInput().appendField('contiene');
    this.appendValueInput('SUB');
    this.appendValueInput('TEXTO').appendField('en');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setColour(160);
    this.setTooltip('Comprueba si un texto está dentro de otro (como el operador in).');
  }
};
Blockly.Python.forBlock['text_contiene'] = function(block) {
  var t = Blockly.Python.valueToCode(block, 'TEXTO', Blockly.Python.ORDER_MEMBER) || "''";
  var s = Blockly.Python.valueToCode(block, 'SUB', Blockly.Python.ORDER_MEMBER) || "''";
  return [s + ' in ' + t, Blockly.Python.ORDER_COMPARISON];
};
Blockly.JavaScript.forBlock['text_contiene'] = function(block) {
  var t = Blockly.JavaScript.valueToCode(block, 'TEXTO', Blockly.JavaScript.ORDER_MEMBER) || "''";
  var s = Blockly.JavaScript.valueToCode(block, 'SUB', Blockly.JavaScript.ORDER_NONE) || "''";
  return [t + '.includes(' + s + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// text_tiene_mayuscula: any(c.isupper() for c in x)
Blockly.Blocks['text_tiene_mayuscula'] = {
  init: function() {
    this.appendDummyInput().appendField('tiene mayúsculas');
    this.appendValueInput('TEXTO');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setColour(160);
    this.setTooltip('Comprueba si el texto contiene al menos una letra mayúscula.');
  }
};
Blockly.Python.forBlock['text_tiene_mayuscula'] = function(block) {
  var t = Blockly.Python.valueToCode(block, 'TEXTO', Blockly.Python.ORDER_NONE) || "''";
  return ['any(c.isupper() for c in ' + t + ')', Blockly.Python.ORDER_FUNCTION_CALL];
};
Blockly.JavaScript.forBlock['text_tiene_mayuscula'] = function(block) {
  var t = Blockly.JavaScript.valueToCode(block, 'TEXTO', Blockly.JavaScript.ORDER_NONE) || "''";
  return ['/[A-Z]/.test(' + t + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// text_tiene_numero: any(c.isdigit() for c in x)
Blockly.Blocks['text_tiene_numero'] = {
  init: function() {
    this.appendDummyInput().appendField('tiene números');
    this.appendValueInput('TEXTO');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setColour(160);
    this.setTooltip('Comprueba si el texto contiene al menos un número (dígito).');
  }
};
Blockly.Python.forBlock['text_tiene_numero'] = function(block) {
  var t = Blockly.Python.valueToCode(block, 'TEXTO', Blockly.Python.ORDER_NONE) || "''";
  return ['any(c.isdigit() for c in ' + t + ')', Blockly.Python.ORDER_FUNCTION_CALL];
};
Blockly.JavaScript.forBlock['text_tiene_numero'] = function(block) {
  var t = Blockly.JavaScript.valueToCode(block, 'TEXTO', Blockly.JavaScript.ORDER_NONE) || "''";
  return ['/\\d/.test(' + t + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// -----------------------------------------------------------------
// 1b. Bloques de listas (capítulo "For y listas")
// -----------------------------------------------------------------
// lista: [a, b, c] con mutator (como lists_create_with)
Blockly.Blocks['lista'] = {
  init: function() {
    this.itemCount_ = 2;
    this.updateShape_();
    this.setOutput(true, 'Array');
    this.setMutator(new Blockly.icons.MutatorIcon(['lista_item'], this));
    this.setColour(260);
    this.setTooltip('Crea una lista con los valores que quieras (usa el engranaje para añadir o quitar huecos).');
  },
  updateShape_: function() {
    if (this.itemCount_ && this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
      this.appendDummyInput('EMPTY').appendField('lista vacía');
    }
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput('ADD' + i)) {
        this.appendValueInput('ADD' + i).appendField(i === 0 ? 'lista' : ',');
      }
    }
    // Quitar los inputs que sobren (por si el número de huecos baja).
    while (this.getInput('ADD' + this.itemCount_)) {
      this.removeInput('ADD' + this.itemCount_);
    }
  },
  saveExtraState: function() {
    return { itemCount: this.itemCount_ };
  },
  loadExtraState: function(state) {
    this.itemCount_ = state.itemCount || 2;
    this.updateShape_();
  },
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('lista_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.itemCount_; i++) {
      var itemBlock = workspace.newBlock('lista_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    var itemBlock = containerBlock.getInput('STACK').connection.targetBlock();
    var connections = [];
    while (itemBlock) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    for (var i = 0; i < this.itemCount_; i++) {
      this.removeInput('ADD' + i);
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    for (var i = 0; i < this.itemCount_; i++) {
      if (connections[i]) this.getInput('ADD' + i).connection.connect(connections[i]);
    }
  },
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInput('STACK').connection.targetBlock();
    var i = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
  }
};
Blockly.Python.forBlock['lista'] = function(block) {
  var code = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    code[i] = Blockly.Python.valueToCode(block, 'ADD' + i, Blockly.Python.ORDER_NONE) || 'None';
  }
  return ['[' + code.join(', ') + ']', Blockly.Python.ORDER_ATOMIC];
};
Blockly.JavaScript.forBlock['lista'] = function(block) {
  var code = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    code[i] = Blockly.JavaScript.valueToCode(block, 'ADD' + i, Blockly.JavaScript.ORDER_NONE) || 'null';
  }
  return ['[' + code.join(', ') + ']', Blockly.JavaScript.ORDER_ATOMIC];
};

// Bloques auxiliares del mutator de lista (no salen en la toolbox)
Blockly.Blocks['lista_container'] = {
  init: function() {
    this.appendDummyInput().appendField('lista');
    this.appendStatementInput('STACK');
    this.setColour(260);
  }
};
Blockly.Blocks['lista_item'] = {
  init: function() {
    this.appendDummyInput();
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(260);
  }
};

// lista_vacia: []
Blockly.Blocks['lista_vacia'] = {
  init: function() {
    this.appendDummyInput().appendField('lista vacía');
    this.setOutput(true, 'Array');
    this.setColour(260);
    this.setTooltip('Una lista sin ningún elemento: [].');
  }
};
Blockly.Python.forBlock['lista_vacia'] = function() { return ['[]', Blockly.Python.ORDER_ATOMIC]; };
Blockly.JavaScript.forBlock['lista_vacia'] = function() { return ['[]', Blockly.JavaScript.ORDER_ATOMIC]; };

// lista_longitud: len(x)
Blockly.Blocks['lista_longitud'] = {
  init: function() {
    this.appendDummyInput().appendField('longitud de');
    this.appendValueInput('LISTA').setCheck('Array');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(260);
    this.setTooltip('Cuántos elementos tiene la lista (como len()).');
  }
};
Blockly.Python.forBlock['lista_longitud'] = function(block) {
  var x = Blockly.Python.valueToCode(block, 'LISTA', Blockly.Python.ORDER_MEMBER) || '[]';
  return ['len(' + x + ')', Blockly.Python.ORDER_FUNCTION_CALL];
};
Blockly.JavaScript.forBlock['lista_longitud'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'LISTA', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  return [x + '.length', Blockly.JavaScript.ORDER_MEMBER];
};

// lista_elemento: x[i] (admite índices negativos)
Blockly.Blocks['lista_elemento'] = {
  init: function() {
    this.appendDummyInput().appendField('elemento');
    this.appendValueInput('POS').setCheck('Number').appendField('de');
    this.appendValueInput('LISTA').setCheck('Array');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip('Devuelve el elemento de la posición indicada (la primera es 0; -1 es el último).');
  }
};
Blockly.Python.forBlock['lista_elemento'] = function(block) {
  var x = Blockly.Python.valueToCode(block, 'LISTA', Blockly.Python.ORDER_MEMBER) || '[]';
  var p = Blockly.Python.valueToCode(block, 'POS', Blockly.Python.ORDER_MEMBER) || '0';
  return [x + '[' + p + ']', Blockly.Python.ORDER_MEMBER];
};
Blockly.JavaScript.forBlock['lista_elemento'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'LISTA', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  var p = Blockly.JavaScript.valueToCode(block, 'POS', Blockly.JavaScript.ORDER_NONE) || '0';
  return ['elementoEn(' + x + ', ' + p + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// lista_parte: x[i:f] (FIN opcional)
Blockly.Blocks['lista_parte'] = {
  init: function() {
    this.appendDummyInput().appendField('parte de');
    this.appendValueInput('LISTA').setCheck('Array');
    this.appendValueInput('INICIO').setCheck('Number').appendField('desde');
    this.appendValueInput('FIN').setCheck('Number').appendField('hasta');
    this.setInputsInline(true);
    this.setOutput(true, 'Array');
    this.setColour(260);
    this.setTooltip('Extrae una parte de la lista, desde una posición hasta otra (la final NO se incluye).');
  }
};
Blockly.Python.forBlock['lista_parte'] = function(block) {
  var x = Blockly.Python.valueToCode(block, 'LISTA', Blockly.Python.ORDER_MEMBER) || '[]';
  var i = Blockly.Python.valueToCode(block, 'INICIO', Blockly.Python.ORDER_MEMBER) || '0';
  var f = Blockly.Python.valueToCode(block, 'FIN', Blockly.Python.ORDER_MEMBER);
  return [x + '[' + i + ':' + (f || '') + ']', Blockly.Python.ORDER_MEMBER];
};
Blockly.JavaScript.forBlock['lista_parte'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'LISTA', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  var i = Blockly.JavaScript.valueToCode(block, 'INICIO', Blockly.JavaScript.ORDER_NONE) || '0';
  var f = Blockly.JavaScript.valueToCode(block, 'FIN', Blockly.JavaScript.ORDER_NONE);
  return [x + '.slice(' + i + ', ' + (f || 'undefined') + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// lista_anadir: x.append(v)
Blockly.Blocks['lista_anadir'] = {
  init: function() {
    this.appendValueInput('VALOR').appendField('añadir');
    this.appendValueInput('LISTA').setCheck('Array').appendField('a');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('Añade un valor al final de la lista (como append()).');
  }
};
Blockly.Python.forBlock['lista_anadir'] = function(block) {
  var x = Blockly.Python.valueToCode(block, 'LISTA', Blockly.Python.ORDER_MEMBER) || '[]';
  var v = Blockly.Python.valueToCode(block, 'VALOR', Blockly.Python.ORDER_NONE) || 'None';
  return x + '.append(' + v + ')\n';
};
Blockly.JavaScript.forBlock['lista_anadir'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'LISTA', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  var v = Blockly.JavaScript.valueToCode(block, 'VALOR', Blockly.JavaScript.ORDER_NONE) || 'null';
  return x + '.push(' + v + ');\n';
};

// lista_quitar: x.pop() o x.pop(pos)
Blockly.Blocks['lista_quitar'] = {
  init: function() {
    this.appendDummyInput().appendField('quitar elemento');
    this.appendValueInput('POS').setCheck('Number').appendField('de');
    this.appendValueInput('LISTA').setCheck('Array');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(260);
    this.setTooltip('Quita un elemento de la lista (el último si no indicas posición) y lo devuelve.');
  }
};
Blockly.Python.forBlock['lista_quitar'] = function(block) {
  var x = Blockly.Python.valueToCode(block, 'LISTA', Blockly.Python.ORDER_MEMBER) || '[]';
  var p = Blockly.Python.valueToCode(block, 'POS', Blockly.Python.ORDER_NONE);
  return [x + '.pop(' + (p || '') + ')', Blockly.Python.ORDER_MEMBER];
};
Blockly.JavaScript.forBlock['lista_quitar'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'LISTA', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  var p = Blockly.JavaScript.valueToCode(block, 'POS', Blockly.JavaScript.ORDER_NONE);
  return [p ? x + '.splice(' + p + ', 1)[0]' : x + '.pop()', Blockly.JavaScript.ORDER_MEMBER];
};

// lista_poner: x[i] = v
Blockly.Blocks['lista_poner'] = {
  init: function() {
    this.appendDummyInput().appendField('poner en');
    this.appendValueInput('LISTA').setCheck('Array');
    this.appendValueInput('POS').setCheck('Number').appendField('la posición');
    this.appendValueInput('VALOR').appendField('el valor');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('Cambia el valor de una posición concreta de la lista.');
  }
};
Blockly.Python.forBlock['lista_poner'] = function(block) {
  var x = Blockly.Python.valueToCode(block, 'LISTA', Blockly.Python.ORDER_MEMBER) || '[]';
  var p = Blockly.Python.valueToCode(block, 'POS', Blockly.Python.ORDER_NONE) || '0';
  var v = Blockly.Python.valueToCode(block, 'VALOR', Blockly.Python.ORDER_NONE) || 'None';
  return x + '[' + p + '] = ' + v + '\n';
};
Blockly.JavaScript.forBlock['lista_poner'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'LISTA', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  var p = Blockly.JavaScript.valueToCode(block, 'POS', Blockly.JavaScript.ORDER_NONE) || '0';
  var v = Blockly.JavaScript.valueToCode(block, 'VALOR', Blockly.JavaScript.ORDER_NONE) || 'null';
  return x + '[' + p + '] = ' + v + ';\n';
};

// lista_ordenar: x.sort()
Blockly.Blocks['lista_ordenar'] = {
  init: function() {
    this.appendDummyInput().appendField('ordenar');
    this.appendValueInput('LISTA').setCheck('Array');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('Ordena la lista de menor a mayor (números) o alfabéticamente (textos).');
  }
};
Blockly.Python.forBlock['lista_ordenar'] = function(block) {
  var x = Blockly.Python.valueToCode(block, 'LISTA', Blockly.Python.ORDER_MEMBER) || '[]';
  return x + '.sort()\n';
};
Blockly.JavaScript.forBlock['lista_ordenar'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'LISTA', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  return 'ordenarLista(' + x + ');\n';
};

// lista_invertir: x.reverse()
Blockly.Blocks['lista_invertir'] = {
  init: function() {
    this.appendDummyInput().appendField('invertir');
    this.appendValueInput('LISTA').setCheck('Array');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip('Da la vuelta a la lista (el último pasa a ser el primero).');
  }
};
Blockly.Python.forBlock['lista_invertir'] = function(block) {
  var x = Blockly.Python.valueToCode(block, 'LISTA', Blockly.Python.ORDER_MEMBER) || '[]';
  return x + '.reverse()\n';
};
Blockly.JavaScript.forBlock['lista_invertir'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'LISTA', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  return x + '.reverse();\n';
};

// lista_copiar: x.copy()
Blockly.Blocks['lista_copiar'] = {
  init: function() {
    this.appendDummyInput().appendField('copia de');
    this.appendValueInput('LISTA').setCheck('Array');
    this.setInputsInline(true);
    this.setOutput(true, 'Array');
    this.setColour(260);
    this.setTooltip('Crea una copia independiente de la lista (como copy()).');
  }
};
Blockly.Python.forBlock['lista_copiar'] = function(block) {
  var x = Blockly.Python.valueToCode(block, 'LISTA', Blockly.Python.ORDER_MEMBER) || '[]';
  return [x + '.copy()', Blockly.Python.ORDER_MEMBER];
};
Blockly.JavaScript.forBlock['lista_copiar'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'LISTA', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  return [x + '.slice()', Blockly.JavaScript.ORDER_MEMBER];
};

// lista_contiene: v in x
Blockly.Blocks['lista_contiene'] = {
  init: function() {
    this.appendDummyInput().appendField('contiene');
    this.appendValueInput('VALOR');
    this.appendValueInput('LISTA').setCheck('Array').appendField('en');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setColour(260);
    this.setTooltip('Comprueba si un valor está dentro de la lista (operador in).');
  }
};
Blockly.Python.forBlock['lista_contiene'] = function(block) {
  var x = Blockly.Python.valueToCode(block, 'LISTA', Blockly.Python.ORDER_MEMBER) || '[]';
  var v = Blockly.Python.valueToCode(block, 'VALOR', Blockly.Python.ORDER_MEMBER) || 'None';
  return [v + ' in ' + x, Blockly.Python.ORDER_COMPARISON];
};
Blockly.JavaScript.forBlock['lista_contiene'] = function(block) {
  var x = Blockly.JavaScript.valueToCode(block, 'LISTA', Blockly.JavaScript.ORDER_MEMBER) || '[]';
  var v = Blockly.JavaScript.valueToCode(block, 'VALOR', Blockly.JavaScript.ORDER_NONE) || 'null';
  return [x + '.includes(' + v + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// rango: range(a), range(a, b), range(a, b, c)
Blockly.Blocks['rango'] = {
  init: function() {
    this.appendDummyInput().appendField('rango');
    this.appendValueInput('INICIO').setCheck('Number');
    this.appendValueInput('FIN').setCheck('Number').appendField('hasta');
    this.appendValueInput('PASO').setCheck('Number').appendField('de paso');
    this.setInputsInline(true);
    this.setOutput(true, 'Array');
    this.setColour(260);
    this.setTooltip('Como range(): rango(5) da 0,1,2,3,4; rango(1, 6) da 1..5; rango(0, 11, 2) da los pares.');
  }
};
Blockly.Python.forBlock['rango'] = function(block) {
  var i = Blockly.Python.valueToCode(block, 'INICIO', Blockly.Python.ORDER_NONE);
  var f = Blockly.Python.valueToCode(block, 'FIN', Blockly.Python.ORDER_NONE);
  var p = Blockly.Python.valueToCode(block, 'PASO', Blockly.Python.ORDER_NONE);
  var args = [];
  if (f) { args.push(i || '0', f); if (p) args.push(p); }
  else { args.push(i || '0'); }
  return ['range(' + args.join(', ') + ')', Blockly.Python.ORDER_FUNCTION_CALL];
};
Blockly.JavaScript.forBlock['rango'] = function(block) {
  var i = Blockly.JavaScript.valueToCode(block, 'INICIO', Blockly.JavaScript.ORDER_NONE);
  var f = Blockly.JavaScript.valueToCode(block, 'FIN', Blockly.JavaScript.ORDER_NONE);
  var p = Blockly.JavaScript.valueToCode(block, 'PASO', Blockly.JavaScript.ORDER_NONE);
  var args = [];
  if (f) { args.push(i || '0', f); if (p) args.push(p); }
  else { args.push(i || '0'); }
  return ['rango(' + args.join(', ') + ')', Blockly.JavaScript.ORDER_FUNCTION_CALL];
};

// para_cada: for x in lista:
Blockly.Blocks['para_cada'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('para cada')
        .appendField(new Blockly.FieldVariable(null), 'VAR')
        .appendField('en');
    this.appendValueInput('LISTA').setCheck('Array').setAlign(Blockly.ALIGN_RIGHT);
    this.appendStatementInput('DO').appendField('hacer');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(120);
    this.setTooltip('Repite para cada elemento de una lista o rango (como for ... in ...).');
  }
};
Blockly.Python.forBlock['para_cada'] = function(block) {
  var variable = Blockly.Python.getVariableName(block.getFieldValue('VAR'));
  var lista = Blockly.Python.valueToCode(block, 'LISTA', Blockly.Python.ORDER_NONE) || '[]';
  var branch = Blockly.Python.statementToCode(block, 'DO');
  branch = Blockly.Python.addLoopTrap(branch, block);
  if (!branch) branch = Blockly.Python.PASS;
  return 'for ' + variable + ' in ' + lista + ':\n' + branch;
};
Blockly.JavaScript.forBlock['para_cada'] = function(block) {
  var variable = Blockly.JavaScript.getVariableName(block.getFieldValue('VAR'));
  var lista = Blockly.JavaScript.valueToCode(block, 'LISTA', Blockly.JavaScript.ORDER_NONE) || '[]';
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  return 'for (var ' + variable + ' of ' + lista + ') {\n' + branch + '}\n';
};

// -----------------------------------------------------------------
// 1c. Bloques de funciones (capítulo "Funciones")
// -----------------------------------------------------------------
// funcion_definir: def nombre(a, b): ...
Blockly.Blocks['funcion_definir'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('definir función')
        .appendField(new Blockly.FieldTextInput('miFuncion'), 'NOMBRE')
        .appendField('(')
        .appendField(new Blockly.FieldTextInput(''), 'PARAMS')
        .appendField(')');
    this.appendStatementInput('DO').appendField('hacer');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Define una función. Los parámetros se escriben separados por comas (p. ej. a, b).');
  }
};
Blockly.Python.forBlock['funcion_definir'] = function(block) {
  var nombre = block.getFieldValue('NOMBRE') || 'miFuncion';
  var params = (block.getFieldValue('PARAMS') || '').replace(/\s+/g, '');
  var branch = Blockly.Python.statementToCode(block, 'DO');
  if (!branch) branch = Blockly.Python.PASS;
  return 'def ' + nombre + '(' + params + '):\n' + branch;
};
Blockly.JavaScript.forBlock['funcion_definir'] = function(block) {
  var nombre = block.getFieldValue('NOMBRE') || 'miFuncion';
  var params = (block.getFieldValue('PARAMS') || '').replace(/\s+/g, '');
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  if (!branch) branch = '  ;\n';
  return 'function ' + nombre + '(' + params + ') {\n' + branch + '}\n';
};

// funcion_llamar: nombre(a, b) — como valor si va conectada, como orden si va sola
Blockly.Blocks['funcion_llamar'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('llamar')
        .appendField(new Blockly.FieldTextInput('miFuncion'), 'NOMBRE')
        .appendField('(');
    this.appendValueInput('ARG1').setCheck(null);
    this.appendDummyInput().appendField(',');
    this.appendValueInput('ARG2').setCheck(null);
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Llama a una función. Conectada a otro bloque devuelve su valor; suelta, ejecuta la llamada.');
  }
};
Blockly.Python.forBlock['funcion_llamar'] = function(block) {
  var nombre = block.getFieldValue('NOMBRE') || 'miFuncion';
  var args = [];
  var a1 = Blockly.Python.valueToCode(block, 'ARG1', Blockly.Python.ORDER_NONE);
  var a2 = Blockly.Python.valueToCode(block, 'ARG2', Blockly.Python.ORDER_NONE);
  if (a1) args.push(a1);
  if (a2) args.push(a2);
  var code = nombre + '(' + args.join(', ') + ')';
  if (block.outputConnection && block.outputConnection.targetConnection) {
    return [code, Blockly.Python.ORDER_FUNCTION_CALL];
  }
  return code + '\n';
};
Blockly.JavaScript.forBlock['funcion_llamar'] = function(block) {
  var nombre = block.getFieldValue('NOMBRE') || 'miFuncion';
  var args = [];
  var a1 = Blockly.JavaScript.valueToCode(block, 'ARG1', Blockly.JavaScript.ORDER_NONE);
  var a2 = Blockly.JavaScript.valueToCode(block, 'ARG2', Blockly.JavaScript.ORDER_NONE);
  if (a1) args.push(a1);
  if (a2) args.push(a2);
  var code = nombre + '(' + args.join(', ') + ')';
  if (block.outputConnection && block.outputConnection.targetConnection) {
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
  return code + ';\n';
};

// devolver: return x
Blockly.Blocks['devolver'] = {
  init: function() {
    this.appendDummyInput().appendField('devolver');
    this.appendValueInput('VALOR').setCheck(null);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(290);
    this.setTooltip('Devuelve un valor desde la función (como return).');
  }
};
Blockly.Python.forBlock['devolver'] = function(block) {
  var v = Blockly.Python.valueToCode(block, 'VALOR', Blockly.Python.ORDER_NONE);
  return 'return ' + (v || '') + '\n';
};
Blockly.JavaScript.forBlock['devolver'] = function(block) {
  var v = Blockly.JavaScript.valueToCode(block, 'VALOR', Blockly.JavaScript.ORDER_NONE);
  return 'return ' + (v || '') + ';\n';
};

// ---- variables_set en JavaScript --------------------------------
// El generador estándar de Blockly declara TODAS las variables como
// globales (var x; al principio), lo que rompería el ámbito de las
// funciones (una variable local con el mismo nombre pisaría la global).
// Aquí: dentro de una función emitimos 'var x = ...;' (local); fuera,
// 'x = ...;' (global, y finish() ya la declara).
Blockly.JavaScript.forBlock['variables_set'] = function(block) {
  var variable = Blockly.JavaScript.getVariableName(block.getFieldValue('VAR'));
  var value = Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  var actual = block;
  var enFuncion = false;
  while (actual) {
    if (actual.type === 'funcion_definir') { enFuncion = true; break; }
    actual = actual.getParent();
  }
  return (enFuncion ? 'var ' : '') + variable + ' = ' + value + ';\n';
};

// -----------------------------------------------------------------
// 2. Registro maestro de bloques (categoría + color de cada bloque)
// -----------------------------------------------------------------
const REGISTRO_BLOQUES = {
  variables_set:      { categoria: 'Variables' },
  variables_get:       { categoria: 'Variables' },
  text:                { categoria: 'Texto', colour: '160' },
  text_join:           { categoria: 'Texto', colour: '160' },
  text_length:         { categoria: 'Texto', colour: '160' },
  math_number:         { categoria: 'Números', colour: '230' },
  math_arithmetic:     { categoria: 'Números', colour: '230' },
  math_single:         { categoria: 'Números', colour: '230' },
  math_round:          { categoria: 'Números', colour: '230' },
  math_random_int:     { categoria: 'Números', colour: '230' },
  controls_if:         { categoria: 'Lógica', colour: '210' },
  logic_compare:       { categoria: 'Lógica', colour: '210' },
  logic_operation:     { categoria: 'Lógica', colour: '210' },
  logic_negate:        { categoria: 'Lógica', colour: '210' },
  logic_boolean:       { categoria: 'Lógica', colour: '210' },
  controls_whileUntil: { categoria: 'Bucles', colour: '120' },
  controls_repeat_ext: { categoria: 'Bucles', colour: '120' },
  romper:              { categoria: 'Bucles', colour: '120' },
  continuar:           { categoria: 'Bucles', colour: '120' },
  no_hacer_nada:       { categoria: 'Bucles', colour: '120' },
  text_repetir:        { categoria: 'Texto', colour: '160' },
  text_char:           { categoria: 'Texto', colour: '160' },
  text_slice:          { categoria: 'Texto', colour: '160' },
  text_transformar:    { categoria: 'Texto', colour: '160' },
  text_buscar:         { categoria: 'Texto', colour: '160' },
  text_reemplazar:     { categoria: 'Texto', colour: '160' },
  text_contiene:       { categoria: 'Texto', colour: '160' },
  operacion_extra:     { categoria: 'Números', colour: '230' },
  text_tiene_mayuscula: { categoria: 'Texto', colour: '160' },
  text_tiene_numero:   { categoria: 'Texto', colour: '160' },
  lista:               { categoria: 'Listas', colour: '260' },
  lista_vacia:         { categoria: 'Listas', colour: '260' },
  lista_longitud:      { categoria: 'Listas', colour: '260' },
  lista_elemento:      { categoria: 'Listas', colour: '260' },
  lista_parte:         { categoria: 'Listas', colour: '260' },
  lista_anadir:        { categoria: 'Listas', colour: '260' },
  lista_quitar:        { categoria: 'Listas', colour: '260' },
  lista_poner:         { categoria: 'Listas', colour: '260' },
  lista_ordenar:       { categoria: 'Listas', colour: '260' },
  lista_invertir:      { categoria: 'Listas', colour: '260' },
  lista_copiar:        { categoria: 'Listas', colour: '260' },
  lista_contiene:      { categoria: 'Listas', colour: '260' },
  rango:               { categoria: 'Listas', colour: '260' },
  para_cada:           { categoria: 'Bucles', colour: '120' },
  funcion_definir:     { categoria: 'Funciones', colour: '290' },
  funcion_llamar:      { categoria: 'Funciones', colour: '290' },
  devolver:            { categoria: 'Funciones', colour: '290' },
  pedir:               { categoria: 'Funciones estándar', colour: '290' },
  convertir:           { categoria: 'Funciones estándar', colour: '290' },
  mostrar:             { categoria: 'Funciones estándar', colour: '290' },
  tipo_de:             { categoria: 'Funciones estándar', colour: '290' }
};
const ORDEN_CATEGORIAS = ['Variables', 'Texto', 'Números', 'Listas', 'Lógica', 'Bucles', 'Funciones', 'Funciones estándar'];

function construirToolbox(listaBloques) {
  const contents = [];
  ORDEN_CATEGORIAS.forEach(cat => {
    if (cat === 'Variables') {
      if (listaBloques.includes('variables_set') || listaBloques.includes('variables_get')) {
        contents.push({ kind: 'category', name: 'Variables', categorystyle: 'variable_category', custom: 'VARIABLE' });
      }
      return;
    }
    const bloquesDeCategoria = listaBloques.filter(b => REGISTRO_BLOQUES[b] && REGISTRO_BLOQUES[b].categoria === cat);
    if (bloquesDeCategoria.length) {
      contents.push({
        kind: 'category', name: cat, colour: REGISTRO_BLOQUES[bloquesDeCategoria[0]].colour,
        contents: bloquesDeCategoria.map(b => ({ kind: 'block', type: b }))
      });
    }
  });
  return { kind: 'categoryToolbox', contents: contents };
}
