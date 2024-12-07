import { Tragamonedas } from "../models/Tragamonedas";

export class StairwaySpin extends Tragamonedas {
  protected readonly multiplicadores = {
    full: 3,
    diagonal: 1.5,
    columna: 1.3,
    fila: 1.25,
  };

  constructor() {
    super();
    this.nombre = "Destiny Spin 🌀";
    this.instrucciones = this.leerInstrucciones("destinyspin.txt");
    this.apuestaMinima = 50;
  }

  /**
   *
   * @param tiro
   * @param monto
   * @param tipo
   */
  protected resultadoRonda(
    tiro: string[][],
    monto: number,
    tipo: "victoria" | "derrota"
  ): void {
    const fila_0 = tiro[0].flat();
    const fila_1 = tiro[1].flat();
    const fila_2 = tiro[2].flat();

    if (tipo === "victoria") {
      process.stdout.write(
        `\r                   | ${fila_0.join("  | ")}  | \n`
      );
      process.stdout.write(
        `\r                   | ${fila_1.join("  | ")}  |   😃 \x1b[32m+ $ ${monto}\x1b[0m\n`
      );
      process.stdout.write(
        `\r                   | ${fila_2.join("  | ")}  | \n`
      );
    } else {
      process.stdout.write(
        `\r                   | ${fila_0.join("  | ")}  | \n`
      );
      process.stdout.write(
        `\r                   | ${fila_1.join("  | ")}  |   😔 \x1b[31m- $ ${monto}\x1b[0m\n`
      );
      process.stdout.write(
        `\r                   | ${fila_2.join("  | ")}  | \n`
      );
    }
  }

  /**
   *
   * @returns
   */
  protected async simularTiro() {
    // 1. Generamos matriz de 3x3 con el simbolo 0
    const matriz = Array.from({ length: 3 }, () =>
      Array(3).fill(this.simbolos[0])
    );

    // 2. Guardamos la posición inicial del cursor
    process.stdout.write("\x1B[s"); // <- ANSI: Guarda la posición actual del cursor.

    // 3. Ocultamos el cursor
    process.stdout.write("\x1B[?25l");

    // 4. Giramos la matriz
    for (let giro = 0; giro < 18; giro++) {
      for (let fila = 0; fila < 3; fila++) {
        for (let columna = 0; columna < 3; columna++) {
          matriz[fila][columna] =
            this.simbolos[Math.floor(Math.random() * this.simbolos.length)];
        }
      }

      const fila_0 = matriz[0].flat();
      const fila_1 = matriz[1].flat();
      const fila_2 = matriz[2].flat();

      // Restauramos la posición del cursor para sobrescribir la matriz
      process.stdout.write("\x1B[u"); // <- ANSI:Restaura la posición guardada del cursor.
      process.stdout.write("\x1B[0J"); // <- ANSI:Limpia desde la posición del cursor hasta el final.

      process.stdout.write(
        `\r                   | ${fila_0.join("  | ")}  | \n`
      );
      process.stdout.write(
        `\r                   | ${fila_1.join("  | ")}  | \n`
      );
      process.stdout.write(
        `\r                   | ${fila_2.join("  | ")}  | \n`
      );

      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    //5. Mostramos el cursor
    process.stdout.write("\x1B[?25h");

    //6. Retornamos matriz generada
    return matriz;
  }

  /**
   *
   * @param tiro
   * @returns
   */
  protected contarCoincidencias(tiro: string[][]):
    | {
        simbolo: string;
        lugar: "columna" | "fila" | "diagonal";
        concurrencia: number;
      }[]
    | { simbolo: string; lugar: "full" }
    | null {
    // 1. Chequeo si la matriz esta completa por un solo simbolo (full)
    // 1.a. "Achato" la matriz asi tengo un array de todos los simbolos
    const matriz = tiro.flat();
    // 1.b. Creo un Set para eliminar repetidos
    const set = new Set(matriz);
    // 1.c. Chequeo si el Set tiene size 1 (todos los simbolos iguales)
    if (set.size === 1) {
      return {
        simbolo: matriz[0],
        lugar: "full",
      };
    }
    // 2. Creo variable para ir guardando los resultados
    const resultado: {
      simbolo: string;
      lugar: "columna" | "fila" | "diagonal";
    }[] = [];

    // 3. Recorremos fila x fila
    for (let f = 0; f < tiro.length; f++) {
      // 3.a. Guardamos fila en variable auxiliar
      const fila = tiro[f];
      // 3.b. Creamos un Set para eliminar repetidos
      const set = new Set(fila);
      // 3.c. Si el Set tiene size 1
      if (set.size === 1) {
        resultado.push({ simbolo: fila[0], lugar: "fila" });
      }
    }

    // 4. Recorremos columna x columna
    for (let c = 0; c < tiro[0].length; c++) {
      // 4.a. Guardamos columna en variable auxiliar
      const columna = [tiro[0][c], tiro[1][c], tiro[2][c]];
      // 4.b. Creamos un Set para eliminar repetidos
      const set = new Set(columna);
      // 4.c. Si el Set tiene size 1
      if (set.size === 1) {
        resultado.push({ simbolo: columna[0], lugar: "columna" });
      }
    }

    // 5. Obtenemos primera diagonal
    const diagonal_1 = [tiro[0][0], tiro[1][1], tiro[2][2]];
    // 5.a. Creamos un Set para eliminar repetidos
    const set_diagonal_1 = new Set(diagonal_1);
    // 5.b. Si el Set tiene size 1
    if (set_diagonal_1.size === 1) {
      resultado.push({ simbolo: diagonal_1[0], lugar: "diagonal" });
    }

    // 6. Obtenemos primera diagonal
    const diagonal_2 = [tiro[0][2], tiro[1][1], tiro[2][0]];
    // 6.a. Creamos un Set para eliminar repetidos
    const set_diagonal_2 = new Set(diagonal_2);
    // 6.b. Si el Set tiene size 1
    if (set_diagonal_2.size === 1) {
      resultado.push({ simbolo: diagonal_2[0], lugar: "diagonal" });
    }

    // 7. En caso de que no haya coincidencia se devuelve null
    if (resultado.length === 0) {
      return null;
    }

    // 8. Reduzco el resultado x si un simbolo completa
    // mas de una fila o columna, o diagonal
    const acumulado = resultado.reduce(
      (acumulador, elemento) => {
        // 8.a. Buscar si ya existe un resultado con el mismo símbolo y lugar
        const existente = acumulador.find(
          (item) =>
            item.simbolo === elemento.simbolo && item.lugar === elemento.lugar
        );
        // 8.b. Si ya habia un resultado igual
        if (existente) {
          // aumento la concurrencia
          existente.concurrencia += 1;
        } else {
          // si no, lo agrego como primera ocurrencia
          acumulador.push({
            simbolo: elemento.simbolo,
            lugar: elemento.lugar,
            concurrencia: 1,
          });
        }
        // 9. Devuelvo el resultado acumulado
        return acumulador;
      },
      [] as {
        simbolo: string;
        lugar: "columna" | "fila" | "diagonal";
        concurrencia: number;
      }[]
    );

    return acumulado;
  }

  /**
   *
   * @param tiro
   * @param apuesta
   */
  protected calcularGanancias(tiro: string[][], apuesta: number): number {
    // 1. Declaro una variable para acumular la ganancia
    let ganancia = 0;
    // 2. Obtendo el calculo de ocurrencias
    const resultado = this.contarCoincidencias(tiro);
    // 3. Chequeo si hubo alguna coincidencia
    if (resultado) {
      // 3.a. Chequeo si se obtuvo un full
      if (!Array.isArray(resultado)) {
        const simbolo = resultado.simbolo as (typeof this.simbolos)[number];
        const lugar = resultado.lugar;
        ganancia = Math.floor(
          apuesta * this.pagos[simbolo] * this.multiplicadores[lugar]
        );
      } else {
        // 3.b. Si no, recorro cada resultado y acumulo la ganancia
        resultado.forEach((elemento) => {
          const simbolo = elemento.simbolo as (typeof this.simbolos)[number];
          const lugar = elemento.lugar;
          const concurrencia = elemento.concurrencia;
          ganancia += Math.floor(
            apuesta *
              this.pagos[simbolo] *
              this.multiplicadores[lugar] *
              concurrencia
          );
        });
      }
    }
    // 4. Si no, devuelvo 0
    return ganancia;
  }
}
