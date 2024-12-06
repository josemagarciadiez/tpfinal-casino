import { Juego } from "../models/Juego";
import { Jugador } from "../models/Jugador";

// Clase utilitaria
import { Menu } from "../utils/Menu";

export class Dados extends Juego {
  private readonly apuestaMinima: number = 150;
  private readonly multiplicadorPremio: number = 7;

  constructor() {
    super();
    this.nombre = "Las Vegas's Roller Master 🎲";
    this.instrucciones = this.leerInstrucciones("dados.txt");
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
    let dados = this.lanzarDados();
    // Hacer conteo
    let conteoJugador = (dados[0] + dados[1]) * 2;

    /***** MENU *****/
    // Mostrar partida

    await this.simularTiro();
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
      this.interface(apuestaTotal, conteoJugador);
      await this.mostrarResultado("derrota", jugador, false, apuestaTotal);
      return {
        apuestaTotal,
        resultado: "derrota",
        ganancia: 0,
      };
    }

    // Si el conteo del jugador es igual a 21
    // se planta automaticamente.
    if (conteoJugador === 21) {
      opcion = "plantar";
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
        dados = this.lanzarDados();
        await this.simularTiro();
        // Actualizar pantalla
        this.interface(apuestaTotal, conteoJugador);
        this.imprimirTiro(dados);
        conteoJugador = await this.actualizarConteo(dados, conteoJugador);
        // Imprimir mensaje de perdida
        if (conteoJugador === 0) {
          this.interface(apuestaTotal, conteoJugador);
          await this.mostrarResultado("derrota", jugador, false, apuestaTotal);
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
          this.interface(apuestaTotal, conteoJugador);
          await this.mostrarResultado(
            "derrota",
            jugador,
            false,
            apuestaTotal,
            true
          );
          return {
            apuestaTotal,
            resultado: "derrota",
            ganancia: 0,
          };
        }
      }
    }

    /************************ TURNO DE LA CASA  *********************/

    dados = this.lanzarDados();
    // Hacer conteo
    let conteoCasa = (dados[0] + dados[1]) * 2;

    // Mostrar partida
    this.interface(apuestaTotal, conteoJugador, undefined, false);
    await this.simularTiro();
    this.interface(apuestaTotal, conteoJugador, conteoCasa, false);
    this.imprimirTiro(dados);
    /***************/

    // Si el conteo en la primer mano es menor a 17,
    // pide hasta que saque 17 o mas
    while (conteoCasa < 17 && conteoCasa !== conteoJugador) {
      // pide carta y chequea
      dados = this.lanzarDados();

      // LOGICA DE ELECCION
      const opcion = this.seleccionarOpcion(dados, conteoCasa, conteoJugador);

      conteoCasa += opcion.valor;
      // Logica de interfaces
      console.log("La Casa pide otra carta...");
      // Pausa
      await this.simularTiro();
      this.interface(apuestaTotal, conteoJugador, conteoCasa, false);
      this.imprimirTiro(dados);
      console.log(opcion.mensaje);
    }

    // Una vez que se sale del bucle con un conteo
    // mayor o igual a 17, se hacen todas los chequeos.

    // Si la casa se pasa, jugador gana
    if (conteoCasa > 21) {
      this.interface(apuestaTotal, conteoJugador, conteoCasa, false);
      await this.mostrarResultado("victoria", jugador, false, apuestaTotal);
      jugador.sumarSaldo(apuestaTotal * this.multiplicadorPremio);
      return {
        resultado: "victoria",
        apuestaTotal,
        ganancia: apuestaTotal * this.multiplicadorPremio,
      };
    }

    // Si conteo Casa es mayor, o hay empate, la casa gana
    if (conteoCasa >= conteoJugador) {
      this.interface(apuestaTotal, conteoJugador, conteoCasa, false);
      await this.mostrarResultado("derrota", jugador, false, apuestaTotal);
      return {
        resultado: "derrota",
        apuestaTotal,
      };
    }

    this.interface(apuestaTotal, conteoJugador, conteoCasa, false);
    await this.mostrarResultado("victoria", jugador, false, apuestaTotal);

    // Se le paga al jugador
    jugador.sumarSaldo(apuestaTotal * this.multiplicadorPremio);

    return {
      apuestaTotal: apuestaTotal,
      resultado: "victoria",
      ganancia: apuestaTotal * this.multiplicadorPremio,
    };
  }

  /*
   *  Metodo para que la Casa seleccione la
   *  mejor opcion para su tiro
   */
  private seleccionarOpcion(
    dados: number[],
    conteoCasa: number,
    conteoJugador: number
  ) {
    const opciones = [
      {
        valor: dados[0] + dados[1],
        mensaje: `La Casa decide sumar ambos (${dados[0] + dados[1]}) → Total: ${conteoCasa + dados[0] + dados[1]}`,
      },
      {
        valor: dados[0],
        mensaje: `La Casa decide sumar solo 🎲 ${dados[0]} → Total: ${conteoCasa + dados[0]}.`,
      },
      {
        valor: dados[1],
        mensaje: `La Casa decide sumar solo 🎲 ${dados[1]} → Total: ${conteoCasa + dados[1]}.`,
      },
    ];

    // Filtrar las opciones validas:
    const opcionesElegibles = opciones.filter((opcion) => {
      const nuevoConteo = conteoCasa + opcion.valor;
      if (nuevoConteo <= 21 && nuevoConteo >= conteoJugador) {
        return true;
      }
      return false;
    });

    // Si hay opciones elegibles, elegir la de mayor valor
    if (opcionesElegibles.length > 0) {
      return opcionesElegibles.reduce((mejorOpcion, opcion) =>
        opcion.valor > mejorOpcion.valor ? opcion : mejorOpcion
      );
    }

    // En el caso de que no haya opciones elegibles
    // se busca la segunda mejor opcion para la casa
    const opcionesParciales = opciones.map((opcion) => {
      // Por cada requisito cumplido, se suma 1 punto
      let puntaje = 0;

      // Evaluar requisitos
      if (conteoCasa + opcion.valor <= 21) {
        puntaje++;
      }

      if (conteoCasa + opcion.valor >= conteoJugador) {
        puntaje++;
      }

      return { ...opcion, puntaje };
    });

    // Busco la opcion con mayor puntaje y la devuelvo
    return opcionesParciales.reduce((mejorOpcion, opcion) => {
      if (opcion.puntaje > mejorOpcion.puntaje) {
        return opcion;
      } else if (
        opcion.puntaje === mejorOpcion.puntaje &&
        opcion.valor > mejorOpcion.valor
      ) {
        return opcion;
      }
      return mejorOpcion;
    });
  }

  /**
   * Metodo para simular el lanzamiento de los dados
   */
  private lanzarDados() {
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
      // Esperar 250 ms
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Pintar segundo dado
      process.stdout.write("  🎲 ");
      // Esperar 250 ms
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
  protected async mostrarResultado(
    resultado: "victoria" | "derrota",
    jugador: Jugador,
    limpiar: boolean = true,
    apuestaTotal?: number,
    salir: boolean = false
  ) {
    console.log("|||||||||||||||||||||||||||||||||||||||||||||||||||||||");
    if (resultado === "victoria") {
      console.log("🎉 🍾  =======================================  🎉 🍾");
      console.log("         🥇 🏆 ¡FELICIDADES! ¡HAS GANADO! 🥇 🏆");
      console.log("=======================================================");
      console.log(
        `💰   Ganancia total: ${apuestaTotal! * this.multiplicadorPremio}`
      );
      console.log("🎲   ¡La suerte estuvo de tu lado!");
      console.log("🍾   Disfruta de tu victoria y sigue jugando.");
      console.log("=======================================================");
    } else {
      console.log("💔 ❤️‍🩹  =======================================  💔 ❤️‍🩹");
      console.log("          🥲 😔 LO SENTIMOS, HAS PERDIDO 🥲 😔");
      console.log("=======================================================");
      console.log(`❌   Pérdida total: ${apuestaTotal!}`);
      console.log("🎲   ¡No te rindas, la próxima vez será mejor!");
      console.log("🃏   Inténtalo de nuevo y vence a la casa.");
      console.log("=======================================================");
    }

    const opciones = [
      {
        valor: "jugar",
        nombre: "🔁  Volver a jugar",
        desactivada: jugador.obtenerSaldo() < this.apuestaMinima,
      },
      {
        valor: "salir",
        nombre: "↩️   Salir",
      },
    ];

    // Si el usuario eligio salir, se muestra mensaje
    // y se redirige automaticamente.
    if (salir) {
      // Conteo para volver al menu
      for (let i = 5; i > 0; i--) {
        if (i === 1) {
          process.stdout.write(
            `\r🔄  Seras redirigido al menu principal en ${i} segundo..`
          );
        } else {
          process.stdout.write(
            `\r🔄  Seras redirigido al menu principal en ${i} segundos..`
          );
        }
        // Esperar 1 s
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } else {
      // Si no, se muestran las opciones
      const opcion = await Menu.elegirOpcion(
        "¿Que quieres hacer a continuación?",
        opciones
      );

      if (opcion === "jugar") {
        // TODO: Agregar aqui la escritura de la partida en base de datos.
        await this.ejecutar(jugador);
      }
    }
  }
}
