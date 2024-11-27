import { log } from "console";
import { Juego } from "../models/Juego";
import { Jugador } from "../models/Jugador";

// Clase utilitaria
import { Menu } from "../utils/Menu";

export class Dados extends Juego {
  private readonly apuestaMinima: number = 200;
  private readonly multiplicadorPremio: number = 10;

  constructor() {
    super();
    this.instrucciones = "";
  }

  public async ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }> {
    // PUNTO DE ENTRADA DEL JUEGO
    // Mostrar primera pantalla
    this.interface();

    // TURNO JUGADOR
    // 1. Pedir apuesta
    let apuestaTotal = await this.obtenerApuesta(jugador, true);
    // 2. Chequear si la apuesta es 0, se sale
    if (!apuestaTotal) {
      return {
        apuestaTotal: 0,
        resultado: "derrota",
      };
    }

    this.interface(apuestaTotal);
    // 3. Ejecutar primera mano
    //.... Tirando dadosss
    // Resultado: dado 1 y dado 2
    let dados = await this.lanzarDados();
    // Hacer conteo
    let conteoJugador = (dados[0] + dados[1]) * 2;

    /***** MENU *****/
    // Mostrar partida
    this.interface(apuestaTotal, conteoJugador);

    this.imprimirTiro(dados);

    /***************/

    let opcion: string = "";

    let opciones = [
      {
        valor: "pedir",
        nombre: "1️⃣  [Pedir Carta]",
        desactivada: conteoJugador === 21,
      },
      {
        valor: "plantar",
        nombre: "2️⃣  [Plantarse]",
      },
      {
        valor: "elevar",
        nombre: "3️⃣  [Elevar Apuesta]",
      },
      {
        valor: "salir",
        nombre: "↩️  [Salir del juego]",
      },
    ];

    // Si el conteo del jugador es mayor de 21
    // pierde automaticamente
    if (conteoJugador > 21) {
      return {
        apuestaTotal,
        resultado: "derrota",
        ganancia: 0,
      };
    }

    // Si el conteo del jugador es igual a 21
    // se planta automaticamente.
    if (conteoJugador === 21) {
      opcion === "plantar";
    }

    // Si no, se dan opciones
    while (opcion !== "plantar" && conteoJugador <= 21) {
      opciones[0].desactivada = conteoJugador === 21;

      opcion = await Menu.elegirOpcion(
        "¿Que quieres hacer a continuación?",
        opciones
      );

      if (opcion === "elevar") {
        apuestaTotal += await this.obtenerApuesta(jugador);
        // Actualizar pantalla
        this.interface(apuestaTotal, conteoJugador);
      }

      if (opcion === "pedir") {
        // Actualizar pantalla
        this.interface(apuestaTotal, conteoJugador);
        dados = await this.lanzarDados();
        await this.simularTiro();
        // Actualizar pantalla
        this.interface(apuestaTotal, conteoJugador);
        this.imprimirTiro(dados);
        conteoJugador = await this.actualizarConteo(dados, conteoJugador);
        // Imprimir mensaje de perdida
        if (conteoJugador === 0) {
          this.mostrarResultado("perdida", apuestaTotal);
          return {
            apuestaTotal,
            resultado: "derrota",
            ganancia: 0,
          };
        }
        // Actualizar pantalla
        this.interface(apuestaTotal, conteoJugador);
      }

      if (opcion === "salir") {
        const confirmacion = await Menu.pedirConfirmacion(
          "¿Estás seguro de salir? Perderás todo lo apostado hasta ahora."
        );

        if (confirmacion) {
          return {
            apuestaTotal,
            resultado: "derrota",
            ganancia: 0,
          };
        }
      }
    }

    // Aca llegamos porque opcion fue igual a plantarse

    // TODO: TURNO CASA

    // Actualizar pantalla
    this.interface(apuestaTotal, conteoJugador, undefined, false);

    while (true) {}

    return {
      apuestaTotal: 0,
      resultado: "derrota",
      ganancia: 0,
    };
  }

  /*
   *  Metodo para simular la mano de la Casa.
   *  Devuelve el conteo final de la Casa.
   */
  private turnoCasa() {
    return 0;
  }

  /**
   * Metodo para simular el lanzamiento de los dados
   */
  private async lanzarDados() {
    return [
      Math.floor(Math.random() * 6) + 1,
      Math.floor(Math.random() * 6) + 1,
    ];
  }

  /**
   * Metodo para solicitar monto de apuesta
   * al usuario en la consola.
   * Se pasan todas las validaciones al callback de la clase Menu.
   */
  private async obtenerApuesta(
    jugador: Jugador,
    esPrimeraApuesta = false
  ): Promise<number> {
    let mensaje = esPrimeraApuesta
      ? "¿Cúanto quieres apostar inicialmente?  [0: Para salír]"
      : "¿En cuanto quieres subir la apuesta?   [0: Para volver]";

    const apuesta = await Menu.pedirNumero(mensaje, (entrada) => {
      if (typeof entrada === "number") {
        if (esPrimeraApuesta && entrada !== 0 && entrada < this.apuestaMinima) {
          return `El mínimo para apostar en la primer ronda es de ${this.apuestaMinima} por ronda.`;
        }

        if (entrada > jugador.obtenerSaldo()) {
          return `No cuentas con saldo suficiente para realizar esta apuesta. Tu saldo ${jugador.obtenerSaldo()}`;
        }

        jugador.restarSaldo(entrada);

        return true;
      } else {
        return "Debes ingresar un número válido.";
      }
    });

    return apuesta;
  }

  /**
   * Metodo para imprimir encabezado con
   * estadisticas del juego actual.
   */
  private async interface(
    apuestaTotal?: number,
    conteoJugador?: number,
    conteoCasa?: number,
    turnoJugador = true
  ) {
    console.clear();
    console.log("=======================================================");
    console.log("           🎲 LAS VEGAS'S ROLLER MASTER 🎲            ");
    console.log("=======================================================");
    console.log(
      `💰  Apuesta total: ${apuestaTotal ?? "--"}         👩  Conteo Jugador: ${conteoJugador ?? "--"}`
    );
    console.log("-------------------------------------------------------");
    console.log(
      `🏆  Pozo acumulado: ${apuestaTotal ? apuestaTotal * this.multiplicadorPremio : "--"}       🎰  Conteo Casa: ${conteoCasa ?? "--"}`
    );
    console.log("-------------------------------------------------------");
    console.log(
      `                  ${turnoJugador ? "TU TURNO" : "TURNO DE LA CASA"}`
    );
    console.log("=======================================================");
  }

  /**
   * Metodo para obtener accion del usuario posterior a un tiro
   */
  private async actualizarConteo(dados: number[], conteo: number) {
    // Armo opciones segun conteo inicial.
    // Aquellas opciones que resulten en que el jugador se pase, no se muestran
    let opciones: { valor: string; nombre: string }[] = [];

    if (conteo + dados[0] + dados[1] <= 21) {
      opciones.push({
        valor: "sumar",
        nombre: `Sumar ambos (${dados[0] + dados[1]}) → Total: ${conteo + dados[0] + dados[1]}`,
      });
    }

    // En el caso de que ambos dados seas iguales se muestra una sola opcion

    // Si los dados son distintos, chequear cada opcion por separado
    if (dados[0] !== dados[1]) {
      if (conteo + dados[0] <= 21) {
        opciones.push({
          valor: "dado1",
          nombre: `Sumar solo 🎲 ${dados[0]} → Total: ${conteo + dados[0]}.`,
        });
      }

      if (conteo + dados[1] <= 21) {
        opciones.push({
          valor: "dado2",
          nombre: `Sumar solo 🎲 ${dados[1]} → Total: ${conteo + dados[1]}.`,
        });
      }
    } else {
      // Si no, chequear solo una
      if (conteo + dados[0] <= 21) {
        opciones.push({
          valor: "dado1",
          nombre: `Sumar solo 🎲 ${dados[0]} → Total: ${conteo + dados[0]}.`,
        });
      }
    }

    // Chequeo si alguna opcion paso el filtro, si no aviso que el jugador perdio
    if (opciones.length === 0) {
      return 0;
    }

    const opcion = await Menu.elegirOpcion("¿Que prefieres hacer?", opciones);

    let nuevoConteo = conteo;

    switch (opcion) {
      case "sumar":
        nuevoConteo += dados[0] + dados[1];
        break;
      case "dado1":
        nuevoConteo += dados[0];
        break;
      case "dado2":
        nuevoConteo += dados[1];
        break;
    }

    return nuevoConteo;
  }

  /** Metodo para simular el giro de los dados */
  private async simularTiro() {
    for (let i = 0; i < 8; i++) {
      // Se usa este metodo de escritura asi
      // escribe en la misma linea.
      process.stdout.write("\rLanzando dados 🎲");
      // Esperar 500 ms
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Pintar segundo dado
      process.stdout.write("  🎲 ");
      // Esperar 500 ms
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  /** Metodo para mostrar tiro obtenido */
  private imprimirTiro(dados: number[]) {
    console.log("-------------------------------------------------------");
    console.log(`   Dados lanzados: 🎲  ${dados[0]} y 🎲  ${dados[1]}   `);
    console.log("=======================================================");
  }

  /** Metodo para mostrar resultado del juego */
  private mostrarResultado(
    resultado: "victoria" | "perdida",
    apuestaTotal: number
  ) {
    if (resultado === "victoria") {
      console.log("🎉 🍾  =======================================  🎉 🍾");
      console.log("         🥇 🏆 ¡FELICIDADES! ¡HAS GANADO! 🥇 🏆");
      console.log("=======================================================");
      console.log(
        `💰   Ganancia total: ${apuestaTotal * this.multiplicadorPremio}`
      );
      console.log("🎲   ¡La suerte estuvo de tu lado!");
      console.log("🍾   Disfruta de tu victoria y sigue jugando.");
      console.log("=======================================================");
    } else {
      console.log("💔 ❤️‍🩹  =======================================  💔 ❤️‍🩹");
      console.log("          🥲 😔 ¡FELICIDADES! ¡HAS GANADO! 🥲 😔");
      console.log("=======================================================");
      console.log(
        `💰   Ganancia total: ${apuestaTotal * this.multiplicadorPremio}`
      );
      console.log("🎲   ¡La suerte estuvo de tu lado!");
      console.log("🍾   Disfruta de tu victoria y sigue jugando.");
      console.log("=======================================================");
    }
  }
}
