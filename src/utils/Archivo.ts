import * as fs from "fs";

/**
 * Clase utilitaria para centralizar todas las
 * operaciones con la base de datos simulada.
 */
export class Archivo {
  // Se modifica el acceso al contructor a privado
  // con el fin de bloquear cualquier instancia de la clase.
  private constructor() {}

  private static readonly carpeta = "src/db";
  private static readonly archivo = "jugadas.txt";

  // Metodos necesarios.
  // Chequear si archivo existe (privado)
  // NO: Crear nuevo archivo, y escribir datos.
  // SI: Agregar datos en el mismo archivo.
  // Leer todo el contenido del archivo.
  // Filtrar contenido del archivo.

  /**
   *
   * @param data Objeto con los datos necesarios para guardar la jugada.
   */
  public static async escribir(data: {
    fecha: string;
    jugador: string;
    apuesta: number;
    resultado: "victoria" | "derrota";
    juego: string;
  }) {
    // Chequear si existe el archivo
    const existe = Archivo.check();
    // Si archivo no existe, se crea
    if (!existe) {
      Archivo.crear();
    }

    // Convertir data de jugada en formato CSV
    const fila = Archivo.crearFilaCSV(data);

    // Escribir
    fs.appendFile(
      `${Archivo.carpeta}/${Archivo.archivo}`,
      `\n${fila}`,
      (error) => {
        if (error) {
          if (error instanceof Error) {
            throw new Error(error.message);
          }
        }
      }
    );
  }

  /**
   * Metodo para chequear si la base de datos ya fue creada.
   * @returns true si el archivo existe, false en caso contrario.
   */
  private static check(): boolean {
    if (fs.existsSync(`${Archivo.carpeta}/${Archivo.archivo}`)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Metodo para crear una base de datos vacia.
   */
  private static crear() {
    // Si no existe la carpeta
    if (!fs.existsSync(Archivo.carpeta)) {
      // se crea.
      fs.mkdirSync(Archivo.carpeta, { recursive: true });
    }

    fs.writeFile(`${Archivo.carpeta}/${Archivo.archivo}`, "", (error) => {
      if (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    });
  }

  /**
   * Metodo utilitario para convertir un objeto
   * en una cadena de texto separada por comas (csv)
   */
  private static crearFilaCSV(data: {
    fecha: string;
    jugador: string;
    apuesta: number;
    resultado: "victoria" | "derrota";
    juego: string;
  }) {
    const columnas = [
      "fecha",
      "jugador",
      "juego",
      "apuesta",
      "resultado",
    ] as const;

    return columnas.map((columna) => data[columna] ?? "").join(",");
  }
}
