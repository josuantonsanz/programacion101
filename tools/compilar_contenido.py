#!/usr/bin/env python3
"""Compila uno o varios capítulos YAML al temario JSON que carga Blockly."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Iterable

try:
    import yaml
except ModuleNotFoundError:
    sys.exit("Falta PyYAML. Instálalo una vez con: py -m pip install -r requirements.txt")


class ErrorDeContenido(ValueError):
    """Error de validación que señala la ruta YAML que debe corregirse."""


NOMBRE = re.compile(r"^[^\s]+$")
OPERADORES_COMPARAR = {"EQ", "NEQ", "LT", "LTE", "GT", "GTE"}
OPERADORES_ARITMETICA = {"sumar": "ADD", "restar": "MINUS", "multiplicar": "MULTIPLY", "dividir": "DIVIDE"}
OPERADORES_LOGICOS = {"AND", "OR"}
OPERADORES_EXTRA = {"POW", "DIV_INT", "MOD"}
METODOS_TEXTO = {"mayusculas": "MAYUS", "minusculas": "MINUS", "capitalizar": "CAPITAL", "titulo": "TITULO", "sin_espacios": "STRIP"}


def fallo(ruta: str, mensaje: str) -> None:
    raise ErrorDeContenido(f"{ruta}: {mensaje}")


def mapa(valor: Any, ruta: str) -> dict[str, Any]:
    if not isinstance(valor, dict):
        fallo(ruta, "debe ser un objeto/mapa")
    return valor


def lista(valor: Any, ruta: str) -> list[Any]:
    if not isinstance(valor, list):
        fallo(ruta, "debe ser una lista")
    return valor


def unico(m: dict[str, Any], ruta: str) -> tuple[str, Any]:
    if len(m) != 1:
        fallo(ruta, "debe tener exactamente una instrucción o expresión")
    return next(iter(m.items()))


def nombre(valor: Any, ruta: str) -> str:
    if not isinstance(valor, str) or not valor or not NOMBRE.fullmatch(valor):
        fallo(ruta, "debe ser un nombre no vacío y sin espacios")
    return valor


def bloque(tipo: str, *, fields: dict[str, Any] | None = None,
           inputs: dict[str, Any] | None = None, extra: dict[str, Any] | None = None) -> dict[str, Any]:
    resultado: dict[str, Any] = {"type": tipo}
    if fields:
        resultado["fields"] = fields
    if inputs:
        resultado["inputs"] = inputs
    if extra:
        resultado["extraState"] = extra
    return resultado


def entrada(valor: dict[str, Any]) -> dict[str, Any]:
    return {"block": valor}


def entrada_opcional(valor: Any, ruta: str, variables: set[str]) -> dict[str, Any] | None:
    return None if valor is None else entrada(convertir_expresion(valor, ruta, variables))


def dos_operandos(valor: Any, ruta: str) -> tuple[Any, Any]:
    valores = lista(valor, ruta)
    if len(valores) != 2:
        fallo(ruta, "necesita exactamente dos valores")
    return valores[0], valores[1]


def expresion_binaria(tipo: str, datos: Any, ruta: str, variables: set[str], nombres: tuple[str, str]) -> dict[str, Any]:
    d = mapa(datos, ruta)
    return bloque(tipo, inputs={
        nombres[0]: entrada(convertir_expresion(d.get("izquierda", d.get("texto", d.get("lista"))), ruta + ".izquierda", variables)),
        nombres[1]: entrada(convertir_expresion(d.get("derecha", d.get("buscar", d.get("posicion"))), ruta + ".derecha", variables)),
    })


def convertir_expresion(valor: Any, ruta: str, variables: set[str]) -> dict[str, Any]:
    """Convierte una expresión declarativa al bloque Blockly correspondiente."""
    if isinstance(valor, bool):
        return bloque("logic_boolean", fields={"BOOL": "TRUE" if valor else "FALSE"})
    if isinstance(valor, (int, float)) and not isinstance(valor, bool):
        return bloque("math_number", fields={"NUM": str(valor)})
    if isinstance(valor, str):
        return bloque("text", fields={"TEXT": valor})

    clave, datos = unico(mapa(valor, ruta), ruta)
    if clave in {"numero", "texto", "booleano"}:
        return convertir_expresion(datos, ruta + "." + clave, variables)
    if clave == "variable":
        n = nombre(datos, ruta + ".variable")
        variables.add(n)
        return bloque("variables_get", fields={"VAR": {"id": id_variable(n)}})
    if clave in OPERADORES_ARITMETICA:
        a, b = dos_operandos(datos, ruta + "." + clave)
        return bloque("math_arithmetic", fields={"OP": OPERADORES_ARITMETICA[clave]}, inputs={
            "A": entrada(convertir_expresion(a, ruta + "." + clave + "[0]", variables)),
            "B": entrada(convertir_expresion(b, ruta + "." + clave + "[1]", variables)),
        })
    if clave == "operacion":
        d = mapa(datos, ruta + ".operacion")
        op = d.get("operador")
        if op not in OPERADORES_EXTRA:
            fallo(ruta + ".operacion.operador", "usa POW, DIV_INT o MOD")
        a, b = dos_operandos(d.get("valores"), ruta + ".operacion.valores")
        return bloque("operacion_extra", fields={"OP": op}, inputs={
            "A": entrada(convertir_expresion(a, ruta + ".operacion.valores[0]", variables)),
            "B": entrada(convertir_expresion(b, ruta + ".operacion.valores[1]", variables)),
        })
    if clave in {"comparar", "logica"}:
        d = mapa(datos, ruta + "." + clave)
        op = d.get("operador")
        permitidos = OPERADORES_COMPARAR if clave == "comparar" else OPERADORES_LOGICOS
        if op not in permitidos:
            fallo(ruta + "." + clave + ".operador", "operador no válido")
        return bloque("logic_compare" if clave == "comparar" else "logic_operation", fields={"OP": op}, inputs={
            "A": entrada(convertir_expresion(d.get("izquierda"), ruta + "." + clave + ".izquierda", variables)),
            "B": entrada(convertir_expresion(d.get("derecha"), ruta + "." + clave + ".derecha", variables)),
        })
    if clave == "no":
        return bloque("logic_negate", inputs={"BOOL": entrada(convertir_expresion(datos, ruta + ".no", variables))})
    if clave == "tipo_de":
        return bloque("tipo_de", inputs={"VALOR": entrada(convertir_expresion(datos, ruta + ".tipo_de", variables))})
    if clave == "raiz":
        return bloque("math_single", fields={"OP": "ROOT"}, inputs={"NUM": entrada(convertir_expresion(datos, ruta + ".raiz", variables))})
    if clave == "redondear":
        return bloque("math_round", fields={"OP": "ROUND"}, inputs={"NUM": entrada(convertir_expresion(datos, ruta + ".redondear", variables))})
    if clave == "aleatorio":
        a, b = dos_operandos(datos, ruta + ".aleatorio")
        return bloque("math_random_int", inputs={"FROM": entrada(convertir_expresion(a, ruta + ".aleatorio[0]", variables)), "TO": entrada(convertir_expresion(b, ruta + ".aleatorio[1]", variables))})
    if clave in {"longitud", "longitud_lista"}:
        return bloque("text_length" if clave == "longitud" else "lista_longitud", inputs={"VALUE" if clave == "longitud" else "LISTA": entrada(convertir_expresion(datos, ruta + "." + clave, variables))})
    if clave == "pedir":
        if not isinstance(datos, str):
            fallo(ruta + ".pedir", "debe ser el mensaje de texto")
        return bloque("pedir", fields={"MENSAJE": datos})
    if clave == "convertir":
        d = mapa(datos, ruta + ".convertir")
        tipos = {"entero": "ENTERO", "decimal": "DECIMAL", "texto": "TEXTO"}
        if d.get("a") not in tipos:
            fallo(ruta + ".convertir.a", "usa entero, decimal o texto")
        return bloque("convertir", fields={"TIPO": tipos[d["a"]]}, inputs={"VALOR": entrada(convertir_expresion(d.get("valor"), ruta + ".convertir.valor", variables))})
    if clave in {"unir", "lista"}:
        partes = lista(datos, ruta + "." + clave)
        return bloque("text_join" if clave == "unir" else "lista", inputs={"ADD" + str(i): entrada(convertir_expresion(x, ruta + f".{clave}[{i}]", variables)) for i, x in enumerate(partes)}, extra={"itemCount": len(partes)})
    if clave == "lista_vacia":
        if datos is not None:
            fallo(ruta + ".lista_vacia", "se escribe como lista_vacia: null")
        return bloque("lista_vacia")
    if clave == "rango":
        argumentos = lista(datos, ruta + ".rango")
        if not 1 <= len(argumentos) <= 3:
            fallo(ruta + ".rango", "necesita uno, dos o tres números")
        return bloque("rango", inputs={n: entrada(convertir_expresion(x, ruta + f".rango[{i}]", variables)) for i, (n, x) in enumerate(zip(("INICIO", "FIN", "PASO"), argumentos))})
    if clave in {"elemento", "parte_lista", "quitar", "copiar", "contiene_lista"}:
        d = mapa(datos, ruta + "." + clave)
        if clave == "elemento":
            return bloque("lista_elemento", inputs={"LISTA": entrada(convertir_expresion(d.get("lista"), ruta + ".elemento.lista", variables)), "POS": entrada(convertir_expresion(d.get("posicion"), ruta + ".elemento.posicion", variables))})
        if clave == "parte_lista":
            inputs = {"LISTA": entrada(convertir_expresion(d.get("lista"), ruta + ".parte_lista.lista", variables)), "INICIO": entrada(convertir_expresion(d.get("inicio"), ruta + ".parte_lista.inicio", variables))}
            fin = entrada_opcional(d.get("fin"), ruta + ".parte_lista.fin", variables)
            if fin: inputs["FIN"] = fin
            return bloque("lista_parte", inputs=inputs)
        if clave == "quitar":
            inputs = {"LISTA": entrada(convertir_expresion(d.get("de"), ruta + ".quitar.de", variables))}
            posicion = entrada_opcional(d.get("posicion"), ruta + ".quitar.posicion", variables)
            if posicion: inputs["POS"] = posicion
            return bloque("lista_quitar", inputs=inputs)
        if clave == "copiar":
            return bloque("lista_copiar", inputs={"LISTA": entrada(convertir_expresion(datos.get("lista"), ruta + ".copiar.lista", variables))})
        return bloque("lista_contiene", inputs={"VALOR": entrada(convertir_expresion(d.get("valor"), ruta + ".contiene_lista.valor", variables)), "LISTA": entrada(convertir_expresion(d.get("en"), ruta + ".contiene_lista.en", variables))})
    if clave in {"caracter", "parte_texto", "transformar", "buscar", "reemplazar", "contiene_texto", "tiene_mayuscula", "tiene_numero", "repetir_texto"}:
        d = mapa(datos, ruta + "." + clave) if clave not in {"tiene_mayuscula", "tiene_numero"} else datos
        if clave == "caracter":
            return bloque("text_char", inputs={"TEXTO": entrada(convertir_expresion(d.get("texto"), ruta + ".caracter.texto", variables)), "POS": entrada(convertir_expresion(d.get("posicion"), ruta + ".caracter.posicion", variables))})
        if clave == "parte_texto":
            inputs = {"TEXTO": entrada(convertir_expresion(d.get("texto"), ruta + ".parte_texto.texto", variables)), "INICIO": entrada(convertir_expresion(d.get("inicio"), ruta + ".parte_texto.inicio", variables))}
            fin = entrada_opcional(d.get("fin"), ruta + ".parte_texto.fin", variables)
            if fin: inputs["FIN"] = fin
            return bloque("text_slice", inputs=inputs)
        if clave == "transformar":
            if d.get("metodo") not in METODOS_TEXTO:
                fallo(ruta + ".transformar.metodo", "usa mayusculas, minusculas, capitalizar, titulo o sin_espacios")
            return bloque("text_transformar", fields={"METODO": METODOS_TEXTO[d["metodo"]]}, inputs={"TEXTO": entrada(convertir_expresion(d.get("texto"), ruta + ".transformar.texto", variables))})
        if clave == "buscar":
            return bloque("text_buscar", inputs={"TEXTO": entrada(convertir_expresion(d.get("texto"), ruta + ".buscar.texto", variables)), "BUSCAR": entrada(convertir_expresion(d.get("buscar"), ruta + ".buscar.buscar", variables))})
        if clave == "reemplazar":
            return bloque("text_reemplazar", inputs={k: entrada(convertir_expresion(d.get(n), ruta + ".reemplazar." + n, variables)) for k, n in (("TEXTO", "texto"), ("VIEJO", "viejo"), ("NUEVO", "nuevo"))})
        if clave == "contiene_texto":
            return bloque("text_contiene", inputs={"SUB": entrada(convertir_expresion(d.get("subtexto"), ruta + ".contiene_texto.subtexto", variables)), "TEXTO": entrada(convertir_expresion(d.get("en"), ruta + ".contiene_texto.en", variables))})
        if clave in {"tiene_mayuscula", "tiene_numero"}:
            return bloque("text_tiene_mayuscula" if clave == "tiene_mayuscula" else "text_tiene_numero", inputs={"TEXTO": entrada(convertir_expresion(datos, ruta + "." + clave, variables))})
        return bloque("text_repetir", inputs={"TEXTO": entrada(convertir_expresion(d.get("texto"), ruta + ".repetir_texto.texto", variables)), "VECES": entrada(convertir_expresion(d.get("veces"), ruta + ".repetir_texto.veces", variables))})
    if clave == "llamar":
        return bloque_llamar(datos, ruta + ".llamar", variables)
    fallo(ruta, "expresión desconocida: " + repr(clave))


def bloque_llamar(datos: Any, ruta: str, variables: set[str]) -> dict[str, Any]:
    d = mapa(datos, ruta)
    n = nombre(d.get("nombre"), ruta + ".nombre")
    argumentos = lista(d.get("argumentos", []), ruta + ".argumentos")
    if len(argumentos) > 2:
        fallo(ruta + ".argumentos", "este bloque admite como máximo dos argumentos")
    return bloque("funcion_llamar", fields={"NOMBRE": n}, inputs={"ARG" + str(i + 1): entrada(convertir_expresion(x, ruta + f".argumentos[{i}]", variables)) for i, x in enumerate(argumentos)})


def encadenar(bloques: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not bloques: return None
    for actual, siguiente in zip(bloques, bloques[1:]): actual["next"] = {"block": siguiente}
    return bloques[0]


def convertir_programa(programa: Any, ruta: str, variables: set[str]) -> list[dict[str, Any]]:
    resultado: list[dict[str, Any]] = []
    for i, instruccion in enumerate(lista(programa, ruta)):
        clave, datos = unico(mapa(instruccion, ruta + f"[{i}]"), ruta + f"[{i}]")
        p = ruta + f"[{i}].{clave}"
        if clave == "asignar":
            d = mapa(datos, p); n = nombre(d.get("variable"), p + ".variable"); variables.add(n)
            resultado.append(bloque("variables_set", fields={"VAR": {"id": id_variable(n)}}, inputs={"VALUE": entrada(convertir_expresion(d.get("valor"), p + ".valor", variables))}))
        elif clave == "mostrar": resultado.append(bloque("mostrar", inputs={"VALOR": entrada(convertir_expresion(datos, p, variables))}))
        elif clave == "si": resultado.append(convertir_si(mapa(datos, p), p, variables))
        elif clave in {"repetir", "mientras", "para_cada"}:
            d = mapa(datos, p); cuerpo = encadenar(convertir_programa(d.get("hacer", []), p + ".hacer", variables))
            if clave == "repetir":
                entradas = {"TIMES": entrada(convertir_expresion(d.get("veces"), p + ".veces", variables))}; tipo = "controls_repeat_ext"; fields = None
            elif clave == "mientras":
                entradas = {"BOOL": entrada(convertir_expresion(d.get("condicion"), p + ".condicion", variables))}; tipo = "controls_whileUntil"; fields = {"MODE": "WHILE"}
            else:
                n = nombre(d.get("variable"), p + ".variable"); variables.add(n); entradas = {"LISTA": entrada(convertir_expresion(d.get("en"), p + ".en", variables))}; tipo = "para_cada"; fields = {"VAR": {"id": id_variable(n)}}
            if cuerpo: entradas["DO"] = entrada(cuerpo)
            resultado.append(bloque(tipo, fields=fields, inputs=entradas))
        elif clave == "anadir":
            d = mapa(datos, p); resultado.append(bloque("lista_anadir", inputs={"VALOR": entrada(convertir_expresion(d.get("valor"), p + ".valor", variables)), "LISTA": entrada(convertir_expresion(d.get("a"), p + ".a", variables))}))
        elif clave == "ordenar": resultado.append(bloque("lista_ordenar", inputs={"LISTA": entrada(convertir_expresion(datos, p, variables))}))
        elif clave == "invertir": resultado.append(bloque("lista_invertir", inputs={"LISTA": entrada(convertir_expresion(datos, p, variables))}))
        elif clave == "poner":
            d = mapa(datos, p); resultado.append(bloque("lista_poner", inputs={"LISTA": entrada(convertir_expresion(d.get("en"), p + ".en", variables)), "POS": entrada(convertir_expresion(d.get("posicion"), p + ".posicion", variables)), "VALOR": entrada(convertir_expresion(d.get("valor"), p + ".valor", variables))}))
        elif clave == "definir_funcion":
            d = mapa(datos, p); n = nombre(d.get("nombre"), p + ".nombre"); parametros = lista(d.get("parametros", []), p + ".parametros")
            parametros = [nombre(x, p + ".parametros") for x in parametros]
            cuerpo = encadenar(convertir_programa(d.get("hacer", []), p + ".hacer", variables))
            entradas = {"DO": entrada(cuerpo)} if cuerpo else {}
            resultado.append(bloque("funcion_definir", fields={"NOMBRE": n, "PARAMS": ", ".join(parametros)}, inputs=entradas))
        elif clave == "devolver":
            inputs = {} if datos is None else {"VALOR": entrada(convertir_expresion(datos, p, variables))}; resultado.append(bloque("devolver", inputs=inputs))
        elif clave == "llamar": resultado.append(bloque_llamar(datos, p, variables))
        elif clave in {"romper", "continuar", "no_hacer_nada"}:
            if datos is not None: fallo(p, "se escribe con null")
            resultado.append(bloque(clave))
        else: fallo(p, "instrucción desconocida")
    return resultado


def convertir_si(d: dict[str, Any], ruta: str, variables: set[str]) -> dict[str, Any]:
    ramas = [(d.get("condicion"), d.get("entonces", []))]
    for i, rama in enumerate(lista(d.get("si_no_si", []), ruta + ".si_no_si")):
        r = mapa(rama, ruta + f".si_no_si[{i}]"); ramas.append((r.get("condicion"), r.get("entonces", [])))
    tiene_sino = "si_no" in d
    entradas: dict[str, Any] = {}
    for i, (condicion, cuerpo) in enumerate(ramas):
        entradas["IF" + str(i)] = entrada(convertir_expresion(condicion, ruta + f".rama[{i}].condicion", variables))
        cadena = encadenar(convertir_programa(cuerpo, ruta + f".rama[{i}].entonces", variables))
        if cadena: entradas["DO" + str(i)] = entrada(cadena)
    if tiene_sino:
        cadena = encadenar(convertir_programa(d["si_no"] or [], ruta + ".si_no", variables))
        if cadena: entradas["ELSE"] = entrada(cadena)
    return bloque("controls_if", inputs=entradas, extra={"elseIfCount": len(ramas) - 1, "hasElse": tiene_sino})


def id_variable(n: str) -> str:
    return "yaml_var_" + re.sub(r"[^A-Za-z0-9_]", "_", n)


def estado_desde_programa(programa: Any, ruta: str) -> dict[str, Any]:
    variables: set[str] = set(); raices = convertir_programa(programa, ruta, variables)
    for i, raiz in enumerate(raices): raiz["x"], raiz["y"] = 24, 24 + i * 110
    return {"blocks": {"languageVersion": 0, "blocks": raices}, "variables": [{"id": id_variable(n), "name": n, "type": ""} for n in sorted(variables)]}


def archivos_origen(origenes: Iterable[Path]) -> list[Path]:
    archivos: list[Path] = []
    for origen in origenes:
        if origen.is_dir(): archivos.extend(sorted(origen.glob("*.yaml")))
        else: archivos.append(origen)
    if not archivos: fallo("origen", "no hay archivos .yaml que compilar")
    return archivos


def compilar(origenes: Path | Iterable[Path]) -> dict[str, Any]:
    if isinstance(origenes, Path): origenes = [origenes]
    capitulos: list[Any] = []
    for origen in archivos_origen(origenes):
        with origen.open(encoding="utf-8") as archivo: datos = yaml.safe_load(archivo)
        raiz = mapa(datos, str(origen))
        if "capitulo" in raiz:
            if set(raiz) - {"capitulo"}: fallo(str(origen), "un archivo por capítulo solo admite la clave capitulo")
            capitulos.append(raiz["capitulo"])
        else: capitulos.extend(lista(raiz.get("capitulos"), str(origen) + ".capitulos"))
    salida: dict[str, Any] = {"capitulos": []}; ids: set[str] = set(); cap_ids: set[str] = set()
    for i, original in enumerate(capitulos):
        ruta_cap = f"capitulos[{i}]"; capitulo = dict(mapa(original, ruta_cap))
        for campo in ("id", "numero", "titulo", "resumen", "bloques"):
            if campo not in capitulo: fallo(ruta_cap, "falta el campo obligatorio " + campo)
        cap_id = nombre(capitulo["id"], ruta_cap + ".id")
        if cap_id in cap_ids: fallo(ruta_cap + ".id", "id de capítulo repetido: " + cap_id)
        cap_ids.add(cap_id)
        for tipo in ("ejemplos", "tests"):
            compilados = []
            for j, original_contenido in enumerate(lista(capitulo.get(tipo, []), ruta_cap + "." + tipo)):
                ruta = ruta_cap + f".{tipo}[{j}]"; contenido = dict(mapa(original_contenido, ruta)); identificador = nombre(contenido.get("id"), ruta + ".id")
                if identificador in ids: fallo(ruta + ".id", "id repetido: " + identificador)
                ids.add(identificador)
                if "programa" in contenido: contenido["estado"] = estado_desde_programa(contenido.pop("programa"), ruta + ".programa")
                compilados.append(contenido)
            capitulo[tipo] = compilados
        salida["capitulos"].append(capitulo)
    return salida


def main() -> None:
    parser = argparse.ArgumentParser(description="Compila capítulos YAML a temario.json para Blockly")
    parser.add_argument("origen", type=Path, nargs="*", default=[Path("data/curso")], help="archivos YAML o carpetas (por defecto data/curso)")
    parser.add_argument("-o", "--destino", type=Path, default=None)
    args = parser.parse_args()
    # Compatibilidad con la primera versión: `compilar origen.yaml salida.json`.
    origenes = args.origen
    destino = args.destino
    if destino is None and len(origenes) == 2 and origenes[1].suffix.lower() == ".json":
        origenes, destino = origenes[:1], origenes[1]
    if destino is None:
        destino = Path("data/temario.json")
    try: resultado = compilar(origenes)
    except (OSError, yaml.YAMLError, ErrorDeContenido) as error: sys.exit("Error al compilar contenido: " + str(error))
    destino.parent.mkdir(parents=True, exist_ok=True)
    destino.write_text(json.dumps(resultado, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: {', '.join(str(x) for x in origenes)} -> {destino} ({len(resultado['capitulos'])} capitulo(s)).")


if __name__ == "__main__": main()
