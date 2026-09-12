import type { AsistenteCrudo } from "./types";

/** Quita acentos y normaliza a minusculas para comparar encabezados. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Detecta el separador mirando la primera linea: Excel en locale espanol exporta
 * con punto y coma en lugar de coma.
 */
function detectarSeparador(texto: string): string {
  const primera = texto.split("\n", 1)[0] ?? "";
  const comas = (primera.match(/,/g) ?? []).length;
  const puntoYComa = (primera.match(/;/g) ?? []).length;
  const tabs = (primera.match(/\t/g) ?? []).length;
  if (puntoYComa > comas && puntoYComa >= tabs) return ";";
  if (tabs > comas && tabs > puntoYComa) return "\t";
  return ",";
}

/**
 * Parser de CSV que soporta comillas dobles, separadores dentro de comillas y
 * CRLF. Quita el BOM que Excel agrega al guardar como CSV UTF-8.
 */
export function parseCsv(textoCrudo: string): string[][] {
  const texto = textoCrudo.replace(/^\uFEFF/, "");
  const separador = detectarSeparador(texto);
  const filas: string[][] = [];
  let fila: string[] = [];
  let campo = "";
  let enComillas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];

    if (enComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          enComillas = false;
        }
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') {
      enComillas = true;
    } else if (c === separador) {
      fila.push(campo);
      campo = "";
    } else if (c === "\n") {
      fila.push(campo);
      filas.push(fila);
      fila = [];
      campo = "";
    } else if (c !== "\r") {
      campo += c;
    }
  }

  if (campo !== "" || fila.length > 0) {
    fila.push(campo);
    filas.push(fila);
  }

  return filas.filter((f) => f.some((celda) => celda.trim() !== ""));
}

/** Nombres de columna aceptados por campo, para tolerar CSV de otras fuentes. */
const ALIAS: Record<keyof AsistenteCrudo, string[]> = {
  nombre: ["nombre", "nombre completo", "asistente", "name", "full name"],
  email: ["email", "correo", "correo electronico", "e-mail"],
  empresa: ["empresa", "compania", "organizacion", "company"],
  cargo: ["cargo", "puesto", "posicion", "titulo", "title", "job title"],
  industria: ["industria", "sector", "vertical"],
  telefono: ["telefono", "tel", "celular", "phone"],
  canal: ["canal_registro", "canal", "origen", "fuente", "source"],
  fechaRegistro: ["fecha_registro", "fecha de registro", "fecha", "date"],
  checkIn: ["check_in", "checkin", "asistio", "asistencia", "attended"],
  interes: ["interes", "tema de interes", "interest", "tema"],
};

const VERDADEROS = new Set(["si", "si.", "s", "yes", "y", "true", "1", "asistio", "presente"]);

export interface ResultadoParseo {
  asistentes: AsistenteCrudo[];
  advertencias: string[];
}

/** Convierte el texto de un CSV en filas normalizadas listas para el motor. */
export function parseAsistentes(texto: string): ResultadoParseo {
  const advertencias: string[] = [];
  const filas = parseCsv(texto);

  if (filas.length === 0) {
    throw new Error("El archivo esta vacio.");
  }

  const encabezados = filas[0].map(normalizar);
  const indices = {} as Record<keyof AsistenteCrudo, number>;

  for (const clave of Object.keys(ALIAS) as (keyof AsistenteCrudo)[]) {
    indices[clave] = encabezados.findIndex((h) => ALIAS[clave].includes(h));
  }

  if (indices.nombre === -1) {
    throw new Error(
      "No se encontro la columna 'nombre'. Columnas detectadas: " + filas[0].join(", "),
    );
  }

  for (const clave of ["empresa", "cargo", "industria"] as const) {
    if (indices[clave] === -1) {
      advertencias.push(
        `No se encontro la columna '${clave}'; la segmentacion sera menos precisa.`,
      );
    }
  }

  if (indices.checkIn === -1) {
    advertencias.push(
      "No se encontro la columna 'check_in'; se asume que todos los registrados asistieron.",
    );
  }

  const valor = (fila: string[], clave: keyof AsistenteCrudo): string => {
    const i = indices[clave];
    return i === -1 ? "" : (fila[i] ?? "").trim();
  };

  const asistentes: AsistenteCrudo[] = [];
  const vistos = new Set<string>();
  let duplicados = 0;

  for (const fila of filas.slice(1)) {
    const nombre = valor(fila, "nombre");
    if (!nombre) continue;

    const email = valor(fila, "email");
    const llave = (email || nombre).toLowerCase();
    if (vistos.has(llave)) {
      duplicados++;
      continue;
    }
    vistos.add(llave);

    const checkInTexto = normalizar(valor(fila, "checkIn"));

    asistentes.push({
      nombre,
      email,
      empresa: valor(fila, "empresa") || "Sin empresa",
      cargo: valor(fila, "cargo") || "Sin cargo",
      industria: valor(fila, "industria") || "Sin industria",
      telefono: valor(fila, "telefono"),
      canal: valor(fila, "canal") || "Sin canal",
      fechaRegistro: valor(fila, "fechaRegistro"),
      checkIn: indices.checkIn === -1 ? true : VERDADEROS.has(checkInTexto),
      interes: valor(fila, "interes") || "Sin tema declarado",
    });
  }

  if (duplicados > 0) {
    advertencias.push(`Se descartaron ${duplicados} registro(s) duplicado(s) por email o nombre.`);
  }

  if (asistentes.length === 0) {
    throw new Error("No se encontro ninguna fila con datos de asistentes.");
  }

  return { asistentes, advertencias };
}
