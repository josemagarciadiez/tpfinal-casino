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

  /**
   * Metodo para escribir una jugada en la base de datos.
   *
   * @param data Objeto con los datos necesarios para guardar la jugada.
   */
  public static escribir(data: {
    fecha: string;
    jugador: string;
    apuesta: number;
    resultado: "victoria" | "derrota";
    juego: string;
  }) {
    // Si no existe el archivo:
    Archivo.check();

    // Convertir data de jugada en formato CSV
    const fila = Archivo.crearFilaCSV(data);

    // Se escribe en la ultima linea disponible
    fs.appendFile(Archivo.archivo, `\n${fila}`, (error) => {
      if (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
      }
    });
  }

  /**
   * Metodo para leer las jugadas registradas en la base de datos.
   *
   * @param filtro Cadena de texto que corresponde al nombre del juego.
   * @returns Arreglo de jugadas registradas en la base de datos.
   */
  public static leer(filtro?: string) {
    // 1. Chequear si existe archivo:
    Archivo.check();
    // 2. Leer archivo.
    const data = fs.readFileSync(Archivo.archivo, "utf-8");
    // 3. Convertir archivo a filas y limpio caracteres
    // inecesarios.
    const filas = data.split("\n").map((fila) => fila.trim());
    // 4. Convertir filas en arreglo de arreglos
    const matriz = filas.map((fila) => fila.split(","));
    // 5. Convertir matriz en arreglo de objetos
    const resultadosConEncabezado = matriz.map((fila) => {
      return {
        fecha: fila[0],
        jugador: fila[1],
        juego: fila[2],
        apuesta: fila[3],
        resultado: fila[4],
      };
    });
    // 6. Elimino encabezado
    const resultadosSinEncabezado = resultadosConEncabezado.slice(1);
    // 7. Chequear si hay filtro
    if (filtro) {
      // 7.a. Filtrar arreglo y devolver copia filtrada.
      return resultadosSinEncabezado.filter((fila) => fila.juego === filtro);
    }
    // 7.b. Si no: Devolver arreglo entero
    return resultadosSinEncabezado;
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
      Archivo.archivo,
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

  private static check() {
    // Si no existe el archivo:
    if (!fs.existsSync(Archivo.archivo)) {
      // se crea
      this.crear();
    }
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
