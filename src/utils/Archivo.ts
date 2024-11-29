import * as fs from "fs";

/**
 * Clase utilitaria para centralizar todas las
 * operaciones con la base de datos simulada.
 */
export class Archivo {
  // Se modifica el acceso al contructor a privado
  // con el fin de bloquear cualquier instancia de la clase.
  private constructor() {}

  private static readonly archivo = "src/db/jugadas.txt";

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
    fecha: Date;
    jugador: string;
    apuesta: number;
    resultado: "victoria" | "derrota";
    juego: string;
  }) {
    // Chequear si existe el archivo
    const existe = Archivo.checkFile();
    // Si archivo no existe, se crea
    if (!existe) {
      Archivo.crearDB();
    }

    // Convertir data de jugada en formato CSV
    const fila = Archivo.crearFilaCSV(data);

    // Escribir
    // TODO: Add callback
    fs.appendFile(Archivo.archivo, `\n${fila}`, () => {});
  }

  /**
   * Metodo para chequear si la base de datos ya fue creada.
   * @returns true si el archivo existe, false en caso contrario.
   */
  private static checkFile(): boolean {
    if (fs.existsSync(Archivo.archivo)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Metodo para crear una base de datos vacia.
   */
  private static crearDB() {
    fs.writeFile(Archivo.archivo, "", (error) => {
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
    fecha: Date;
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
