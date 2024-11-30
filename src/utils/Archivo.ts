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
    fecha: string;
    jugador: string;
    apuesta: number;
    resultado: "victoria" | "derrota";
    juego: string;
  }) {
    // Si no existe el archivo:
    if (!fs.existsSync(`${Archivo.archivo}`)) {
      // se crea
      this.crear();
    }

    // Convertir data de jugada en formato CSV
    const fila = Archivo.crearFilaCSV(data);

    // Se escribe en la ultima linea disponible
    fs.appendFile(`${Archivo.archivo}`, `\n${fila}`, (error) => {
      if (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    });
  }

  /**
   * Metodo para crear una base de datos vacia.
   */
  private static crear() {
    // 1. Chequeo si existe la carpeta,
    if (!fs.existsSync(Archivo.carpeta)) {
      // si no existe, se crea.
      fs.mkdirSync(Archivo.carpeta, { recursive: true });
    }
    // Se crea el archivo vacio.
    fs.writeFile(
      `${Archivo.archivo}`,
      "Fecha,Nombre,Juego,Apuesta,Resultado",
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
