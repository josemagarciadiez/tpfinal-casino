import { Juego } from "./Juego";
import { Jugador } from "./Jugador";
import { IJuego } from "./IJuego";
import { Menu } from "../utils/Menu";
import { exit, off } from "process";

export class DeluxeCrazyDK extends Juego {
  private apuestaMinima: number;
  private apuestaMaxima: number;
  private simbolos: string[];
  private jugada: string[];
  private valores: Record<string, number> = {
    "🐈": 200,
    "🌹": 1000,
    "🐕": 360,
  };
  private apuesta: number;
  // JOSE: Variable sin usar. Eliminar.
  private contador: number;
  public constructor() {
    super();
    this.apuestaMinima = 100;
    this.apuestaMaxima = 1500;
    this.simbolos = ["🐈", "🐕", "🌹"];
    this.jugada = [];
    this.apuesta = 5; // Inicializa en 5 para evitar conflictos
    this.contador = 0;
  }

  // Métodos
  async ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }> {
    // JOSE: Fijate que este encabezado al pricipio dice undefined
    // en las variables, eso no puede pasar.

    // Opciones del jugador dentro del juego
    this.interfaceTragamonedas();

    // JOSE: Este ciclo while esta medio al cuete. El metodo pedir numero
    // recibe como 2do parametro una funcion de validacion. Fijate que si yo erro
    // muchas veces poner un numero se hace una cola larga de mensajes en la consola, y hay que
    // mantener la UI lo mas limpia posible.

    // Validación inicial de la apuesta
    while (true) {
      // JOSE: Eliminar los : del mensaje (Ya estan en la clase Menu)
      this.apuesta = await Menu.pedirNumero("Ingrese su apuesta: ");
      // Todo eso iria en la funcion validadora
      if (this.apuesta < this.apuestaMinima) {
        console.error(
          `El monto ingresado (${this.apuesta}) es inferior al minimo requerido (${this.apuestaMinima})`
        );
      } else if (this.apuesta > this.apuestaMaxima) {
        console.error(
          `El monto ingresado (${this.apuesta}) es superior al maximo permitido (${this.apuestaMaxima})`
        );
      } else {
        console.log("Monto ingresado exitosamente");
        this.interfaceTragamonedas();
        break;
      }
    }

    // JOSE: ACA ESTAS TIRANDO UN TIRO ANTES DE PREGUNTAR
    // AL JUGADOR QUE QUIERE HACER??

    // JOSE: No se porque el ! al final del metodo.
    const tirada = this.tirada(this.apuesta)!;
    // JOSE: Tenes que pasar jugador como parametro para que se le sume el
    // saldo en caso de ganancia.
    const ganancia = this.calcularGanancia(tirada);

    let resultado: "victoria" | "derrota" = "derrota";
    if (ganancia > 0) {
      resultado = "victoria";
    }

    let opcion = "";
    let opciones = [
      {
        valor: "tirada",
        nombre: "🎰 Probar suerte",
      },
      {
        valor: "apuesta",
        nombre: "🎰 Cambiar apuesta",
      },
      {
        valor: "salir",
        nombre: "🔙 Volver",
      },
    ];

    // JOSE: Esto me parece que lo vamos a tener que borrar
    // porque la clase casino, cada vez que se termine una partida
    // tiene que guardarla en la base de datos. (Pero lo vemos despues)
    while (opcion !== "salir") {
      opcion = await Menu.elegirOpcion(
        "¿Qué quieres hacer a continuación?",
        opciones
      );

      if (opcion === "tirada") {
        this.interfaceTragamonedas(this.apuesta, jugador);
        // JOSE: Pasas this.apuesta a this.tirada, pero this.tirada
        // no hace nada con ese valor.
        console.log(this.tirada(this.apuesta));
        // JOSE: Vos restas saldo solo cuando el jugador
        // elige Probar suerte?
        // EL BUG QUE VOS VES DE QUE RESTA Y SUMA AL REVES
        // ES PORQUE ACTUALIZAS AL REVES LA PANTALLA.
        // ACTUALIZAR AL PRINCIPIO, Y DESP NO ACTUALIZAS HASTA QUE EL USUARIO
        // JUEGUE OTRA VEZ. SI EL USUARIO SE VA NO TIENE NI IDEA DE SI GANO, PERDIO
        // CADA VEZ QUE MODIFIQUES UN VALOR QUE SE MUESTRA EN LA PANTALLA
        // ACTUALIZA LA PANTALLA.
        jugador.restarSaldo(this.apuesta);
        let tirada = this.tirada(this.apuesta);
        this.calcularGanancia(tirada, jugador);
      }

      if (opcion === "apuesta") {
        this.apuesta = await Menu.pedirNumero("Ingrese el nuevo monto: ");
      }

      if (opcion === "salir") {
        return exit(0);
      }

      if (jugador.obtenerSaldo() < 5) {
        console.log("Tu saldo es insuficiente para seguir jugando");
        exit(0);
      }
    }

    return {
      apuestaTotal: this.apuesta,
      resultado: resultado,
      ganancia: ganancia, // Si no hay ganancia, ganancia será undefined
    };
  }

  public simboloRandom() {
    let i = Math.floor(Math.random() * this.simbolos.length);
    return this.simbolos[i];
  }

  // JOSE: Aca este metodo acepta dos parametros,
  // pero adentro del metodo no se usan los parametros.
  public tirada(apuesta?: number, jugador?: Jugador) {
    let i: number;
    this.jugada = [];
    for (i = 0; i < this.simbolos.length; i++) {
      let newSymbol = this.simboloRandom();
      this.jugada.push(newSymbol);
    }
    // JOSE: Si laburas sobre una propiedad de la clase,
    // para que un return? si el valor nuevo ya esta guardado
    // en esa propiedad.
    return this.jugada;
  }

  public contarOcurrencias(tirada: string[]): Record<string, number> {
    const contador: Record<string, number> = {};

    // Iteramos sobre la tirada de izquierda a derecha
    for (let i = 1; i < tirada.length; i++) {
      if (tirada[i] === tirada[i - 1]) {
        contador[tirada[i]] = (contador[tirada[i]] || 0) + 1;
      }
    }
    return contador;
  }

  public contarSimilitudes(tirada: string[]): boolean {
    const contador = this.contarOcurrencias(tirada);

    for (const simbolo in contador) {
      if (contador[simbolo] >= 1) {
        // Al menos 2 símbolos iguales consecutivos
        return true; // Si encontramos símbolos consecutivos iguales, devolvemos true
      }
    }
    return false;
  }

  // JOSE: Aca la variable jugador no puede ser opcional,
  // Si o si vas a tener un jugador jugando al juego.
  public calcularGanancia(tirada: string[], jugador?: Jugador): number {
    let contador = this.contarOcurrencias(tirada);
    let gananciaTotal = 0;
    for (const simbolo in contador) {
      if (contador[simbolo] >= 1) {
        // Verifica que se repita al menos dos veces
        const valorSimbolo = this.valores[simbolo];
        gananciaTotal += valorSimbolo * contador[simbolo];
        jugador?.sumarSaldo(gananciaTotal);
      }
    }
    return gananciaTotal;
  }

  // JOSE: Chequea que los parametros lleguen antes de ponerlos en pantalla
  // Cuando los valores sean undefinded pinta otro simbolo en la pantalla
  private async interfaceTragamonedas(
    apuestaTotal?: number,
    jugador?: Jugador
  ) {
    console.clear();
    console.log("========================================================");
    console.log("                  🎰Deluxe Crazy DK🎰                  ");
    console.log("========================================================");
    console.log(
      ` 💲Apuesta total: ${apuestaTotal}    🤑Saldo: ${jugador?.obtenerSaldo()}`
    );
    console.log("--------------------------------------------------------");
  }
}
