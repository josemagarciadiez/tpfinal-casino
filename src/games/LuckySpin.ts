import { Tragamonedas } from "../models/Tragamonedas";

export class LuckySpin extends Tragamonedas {
  private readonly comodin = "🤡";
  constructor() {
    super();
    this.nombre = "Lucky Spin 🛼";
    this.instrucciones = this.leerInstrucciones("luckyspin.txt");
    this.apuestaMinima = 100;
  }

  private simbolosConComodin() {
    let simbolos = [];
    for (const simbolo of this.simbolos) {
      simbolos.push(simbolo);
    }

    simbolos.push(this.comodin);

    return simbolos;
  }
  /**
   *
   * @param tiro
   * @param monto
   * @param tipo
   */
  protected resultadoRonda(
    tiro: string[],
    monto: number,
    tipo: "victoria" | "derrota"
  ): void {
    if (tipo === "victoria") {
      console.log(
        `                | ${tiro.join(" | ")} |   😃 \x1b[32m+ $ ${monto}\x1b[0m`
      );
    } else {
      console.log(
        `                | ${tiro.join(" | ")} |   😔 \x1b[31m- $ ${monto}\x1b[0m`
      );
    }
  }

  /**
   *
   * @returns
   */
  protected async simularTiro() {
    const simbolos = this.simbolosConComodin();
    const rieles = Array(5).fill(simbolos[0]);

    for (let i = 0; i < rieles.length; i++) {
      for (let j = 0; j < 15; j++) {
        rieles[i] = simbolos[Math.floor(Math.random() * simbolos.length)];

        process.stdout.write(`\r                | ${rieles.join(" | ")} | `);

        await new Promise((resolve) => setTimeout(resolve, 75));
      }
    }
    return rieles;
  }

  /**
   *
   * @param tiro
   * @returns
   */
  protected contarCoincidencias(tiro: string[]): {
    simbolo: string;
    concurrencia: number;
  } | null {
    // Creo un contador
    const contador: Record<string, number> = {};
    // y una variable para contar los comodines
    let comodines = 0;
    // y las llenamos
    for (let i = 0; i < tiro.length; i++) {
      if (tiro[i] === this.comodin) {
        comodines++;
      } else {
        contador[tiro[i]] = (contador[tiro[i]] || 0) + 1;
      }
    }
    // Lo recorro y veo que simbolo se repite 4 o 5 veces.
    // Si un simbolo esta 4 veces no puede estar 5,
    // pero un simbolo que esta 5 veces, esta 4 tambien.
    for (const [simbolo, concurrencia] of Object.entries(contador)) {
      const total = concurrencia + comodines;
      if (total >= 4) {
        return {
          simbolo,
          concurrencia: total,
        };
      }
    }

    return null;
  }

  /**
   *
   */
  protected calcularGanancias(tiro: string[], apuesta: number): number {
    // 1. Obtendo el calculo de ocurrencias
    const resultado = this.contarCoincidencias(tiro);
    // 2. Chequeo si hubo alguna coincidencia
    if (resultado) {
      const simbolo = resultado.simbolo as (typeof this.simbolos)[number];
      // Si el simbolo se repitio 4 veces, pago el 80% del multiplicador
      if (resultado.concurrencia === 4) {
        return Math.floor(apuesta * this.pagos[simbolo] * 0.8);
      } else {
        // Si se repitio 5 veces, pago el multiplicador completo
        return Math.floor(apuesta * this.pagos[simbolo]);
      }
    }
    // 3. Si no, devuelvo 0
    return 0;
  }
}
