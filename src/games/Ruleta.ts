import { Juego } from "../models/Juego";
import { Jugador } from "../models/Jugador";
import { Menu } from "../utils/Menu";

export class Ruleta extends Juego {
  protected tablero: { [key: number]: string };
  protected apuestaMinima: number;
  protected instrucciones: string;

  constructor() {
    super();
    this.apuestaMinima = 500;
    this.instrucciones = this.leerInstrucciones("instruccionesRuleta.txt");
    this.tablero = {
      1: "rojo",
      2: "negro",
      3: "rojo",
      4: "negro",
      5: "rojo",
      6: "negro",
      7: "rojo",
      8: "negro",
      9: "rojo",
      10: "negro",
      11: "negro",
      12: "rojo",
      13: "negro",
      14: "rojo",
      15: "negro",
      16: "rojo",
      17: "negro",
      18: "rojo",
      19: "rojo",
      20: "negro",
      21: "rojo",
      22: "negro",
      23: "rojo",
      24: "negro",
      25: "rojo",
      26: "negro",
      27: "rojo",
      28: "negro",
      29: "negro",
      30: "rojo",
      31: "negro",
      32: "rojo",
      33: "negro",
      34: "rojo",
      35: "negro",
      36: "rojo",
    };
  }

  async ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }> {
    let juegoActivo: boolean = await this.comprobarSaldo(jugador);

    /*if (juegoActivo==true){
      await this.mostrarInstrucciones();//metodo que muestra las instrucciones del juego
    }*/

    let apuestaTotal: number = 0;
    let ganancia: number = 0;
    let resultado: "victoria" | "derrota" = "derrota";

    while (juegoActivo == true) {
      this.mostrarEncabezado(); //metodo que muestra el encabezado del juego

      console.log("JUGADOR: " + jugador.obtenerNombre());
      console.log("Saldo Inicial: " + jugador.obtenerSaldo());
      console.log("Apuesta Minima: " + this.apuestaMinima + "\n");

      let juegaAlColorOAlNumero = await Menu.elegirOpcion(
        "Apuesta al color o al numero? ",
        [
          { valor: "color", nombre: "Color" },
          { valor: "numero", nombre: "Numero" },
        ]
      );

      let valorApostado = await Menu.pedirNumero(
        "Ingrese el monto que desea apostar ",
        (valor) => {
          if (valor === undefined) {
            return "Debe ingresar un valor";
          }
          if (typeof valor !== "number") {
            return "El valor debe ser un número";
          }
          if (valor > jugador.obtenerSaldo()) {
            return "No tiene suficinte saldo, ingrese un monto menor ";
          }
          if (valor < this.apuestaMinima) {
            return "Debe ingresar un monto mayor a la apuesta minima";
          }
          return true;
        }
      );

      let resul: number = Math.round(Math.random() * 35 + 1);

      let color = this.tablero[resul];

      if (juegaAlColorOAlNumero == "color") {
        let colorIngresado = await Menu.elegirOpcion(
          "seleccione el color al que apuesta",
          [
            { valor: "rojo", nombre: "Rojo" },
            { valor: "negro", nombre: "Negro" },
          ]
        );
        if (color == colorIngresado) {
          jugador.sumarSaldo(valorApostado * 10);
          resultado = "victoria";
          ganancia = ganancia + valorApostado * 10;
        } else {
          jugador.restarSaldo(valorApostado);
          resultado = "derrota";
        }
      } else {
        let valorIngresado = await Menu.pedirNumero(
          "Ingrese el numero al que apuesta ",
          (valor) => {
            if (valor === undefined) {
              return "Debe ingresar un valor";
            }

            if (typeof valor !== "number") {
              return "El valor debe ser un número";
            }

            if (valor <= 0 || valor > 36) {
              return "El valor debe ser mayor que 0 y menor o igual a 36";
            }

            return true;
          }
        );

        if (resul == valorIngresado) {
          jugador.sumarSaldo(valorApostado * 100);
          resultado = "victoria";
          ganancia = ganancia + valorApostado * 100;
        } else {
          jugador.restarSaldo(valorApostado);
          resultado = "derrota";
        }
      }

      apuestaTotal = apuestaTotal + valorApostado;

      //metodo que simula la ruleta girando y muestra el resultado de manera asincronica
      this.ruletaGirando(resultado, jugador, resul, color);

      //metodo que interactua con el usuario para saber si desea jugar de nuevo o salir del juego
      juegoActivo = await this.reiniciarJuego(juegoActivo);

      if (juegoActivo == true) {
        juegoActivo = await this.comprobarSaldo(jugador);
      }
    }

    return { apuestaTotal, resultado, ganancia };
  }

  // private async mostrarResultado(
  //   resultado: "victoria" | "derrota",
  //   jugador: Jugador
  // ) {
  //   console.log("|||||||||||||||||||||||||||||||||||||||||||||||||||||||");
  //   if (resultado === "victoria") {
  //     console.log("🎉 🍾  =======================================  🎉 🍾");
  //     console.log("         🥇 🏆 ¡FELICIDADES! ¡HAS GANADO! 🥇 🏆");
  //     console.log("=======================================================");
  //     console.log(
  //       `💰                 Saldo acumulado: ${jugador.obtenerSaldo()}`
  //     );
  //     console.log("🎲   ¡La suerte estuvo de tu lado!");
  //     console.log("🍾   Disfruta de tu victoria y sigue jugando.");
  //     console.log(
  //       "=======================================================" + "\n"
  //     );
  //   } else {
  //     console.log("💔 ❤️‍🩹  =======================================  💔 ❤️‍🩹");
  //     console.log("          🥲 😔 LO SENTIMOS, HAS PERDIDO 🥲 😔");
  //     console.log("=======================================================");
  //     console.log(`❌    Saldo restante: ${jugador.obtenerSaldo()}`);
  //     console.log("🎲   ¡No te rindas, la próxima vez será mejor!");
  //     console.log("🃏   Inténtalo de nuevo y vence a la casa.");
  //     console.log(
  //       "=======================================================" + "\n"
  //     );
  //   }
  // }

  private async comprobarSaldo(jugador: Jugador) {
    if (jugador.obtenerSaldo() < this.apuestaMinima) {
      this.mostrarEncabezado();

      console.log(
        "                       =================================================================" +
          "\n"
      );
      console.log(
        "                       😔  Su saldo es menor a la apuesta minima requerida para jugar  😔" +
          "\n" +
          "                       🎲  Por favor cargue saldo y vuelva a ingresar al juego. Lo esperamos!!!  🎲" +
          "\n"
      );
      console.log(
        "                       -----------------------------------------------------------------" +
          "\n"
      );
      let resp = await Menu.elegirOpcion("Presione enter para salir: ", [
        { valor: "continuar", nombre: "salir" },
      ]);
      return false;
    } else {
      return true;
    }
  }

  private mostrarEncabezado(): void {
    console.clear();
    console.log(
      "                           =========================================================" +
        "\n"
    );
    console.log(
      "                                   🎡 🎡     Devil's Roullette      🎡 🎡    " +
        "\n"
    );
    console.log(
      "                           ---------------------------------------------------------" +
        "\n"
    );
  }

  private ruletaGirando(
    resultado: "victoria" | "derrota",
    jugador: Jugador,
    resul: number,
    color: string
  ): void {
    setTimeout(
      () =>
        console.log(
          "\n" + "Crupier:....NO VA MAS, ya no se reciben mas apuestas!!!"
        ),
      3000
    );

    setTimeout(async () => {
      for (let i = 0; i < 8; i++) {
        // Se usa este metodo de escritura asi
        // escribe en la misma linea.
        process.stdout.write("\rRuleta girando  🎡");
        // Esperar 250 ms
        await new Promise((resolve) => setTimeout(resolve, 250));

        process.stdout.write("  🎡 ");
        // Esperar 250 ms
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }, 5000);

    setTimeout(() => {
      console.clear();
      console.log(
        "|||||||||||||||||||||||||||||||||||||||||||||||||||||||" + "\n"
      );
      console.log(
        "        Crupier:....HA SALIDO EL " + resul + " " + color + "\n"
      );
      this.mostrarResultado(resultado, jugador, false);
    }, 10000);
  }

  private async esperarOpcion() {
    return new Promise<string>((resolve) => {
      setTimeout(async () => {
        const mje = await Menu.elegirOpcion("Desea volver a jugar?", [
          { valor: "apostar", nombre: "Volver a Jugar" },
          { valor: "no", nombre: "Salir del juego" },
        ]);
        resolve(mje);
      }, 10000);
    });
  }

  private async reiniciarJuego(juegoActivo: boolean): Promise<boolean> {
    // Esperamos a que la promesa se resuelva para obtener el valor de mje
    const mje = await this.esperarOpcion();

    // Evaluamos el valor de mje y actualizamos la variable juegoActivo
    if (mje === "apostar") {
      juegoActivo = true;
    } else {
      juegoActivo = false;
    }

    // Devolvemos el valor de juegoActivo
    return juegoActivo;
  }
}
