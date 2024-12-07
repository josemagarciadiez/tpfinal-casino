import { Tragamonedas } from "../models/Tragamonedas";

export class LuckySpin extends Tragamonedas {
  constructor() {
    super();
    this.nombre = "Lucky Spin 🛼";
    this.instrucciones = this.leerInstrucciones("luckyspin.txt");
    this.apuestaMinima = 100;
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
        `                   [ ${tiro.join(" | ")} ]   😃 \x1b[32m+ $ ${monto}\x1b[0m`
      );
    } else {
      console.log(
        `                   [ ${tiro.join(" | ")} ]   😔 \x1b[31m- $ ${monto}\x1b[0m`
      );
    }
  }

  /**
   *
   * @returns
   */
  protected async simularTiro() {
    const rieles = Array(3).fill(this.simbolos[0]);

    for (let i = 0; i < rieles.length; i++) {
      for (let j = 0; j < 5; j++) {
        rieles[i] =
          this.simbolos[Math.floor(Math.random() * this.simbolos.length)];

        process.stdout.write(`\r                   [ ${rieles.join(" | ")} ] `);

        await new Promise((resolve) => setTimeout(resolve, 150));
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
    // y lo lleno
    for (let i = 0; i < tiro.length; i++) {
      contador[tiro[i]] = (contador[tiro[i]] || 0) + 1;
    }
    // Lo recorro y veo que simbolo se repite 2 o 3 veces.
    // Si un simbolo esta 2 veces no puede estar 3,
    // pero un simbolo que esta 3 veces, esta 2 tambien.
    for (const [simbolo, concurrencia] of Object.entries(contador)) {
      if (concurrencia >= 2) {
        return {
          simbolo,
          concurrencia,
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
      // Si el simbolo se repitio solo 2 veces, pago el 80% del multiplicador
      if (resultado.concurrencia === 2) {
        return Math.floor(apuesta * this.pagos[simbolo] * 0.8);
      } else {
        // Si se repitio 3 veces, pago el multiplicador completo
        return Math.floor(apuesta * this.pagos[simbolo]);
      }
    }
    // 3. Si no, devuelvo 0
    return 0;
  }
}
