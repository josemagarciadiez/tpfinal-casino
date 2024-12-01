// Modelos generícos
import { IJuego } from "./IJuego";
import { Jugador } from "./Jugador";

// Clases utilitarias
import { Menu } from "../utils/Menu";

// Implementaciones de juegos
import { Dados } from "../games/Dados";
import { Archivo } from "../utils/Archivo";

export class Casino {
  private jugador: Jugador | undefined;
  private juego: IJuego | undefined;
  private readonly juegos: { valor: string; nombre: string }[];

  constructor() {
    this.juegos = [
      { valor: "dados", nombre: "Las Vegas's Roller Master 🎲" },
      { valor: "ruleta", nombre: "Devil's Roullette 🎡" },
    ];
  }

  /**
   * Método público para inicializar el sistema.
   */
  public async iniciar() {
    console.clear();
    console.log("==========================================");
    console.log("     🎰 🎲 Bienvenido a Casino 🎲 🎰    ");
    console.log("------------------------------------------");

    await this.crearJugador();

    await this.menuPrincipal();
  }

  /**
   *
   */
  private async crearJugador(): Promise<void> {
    //.. Menu para crear jugador
    const preguntas = [
      {
        nombre: "nombre",
        mensaje: "¿Cuál es tu nombre?",
        tipo: "texto" as const,
        validacion: (entrada: string | number | null) => {
          if (typeof entrada === "string") {
            if (entrada.length > 0) {
              return true;
            } else {
              return "No puedes tener un nombre vacío.";
            }
          } else {
            return "Debes ingresar un nombre válido.";
          }
        },
      },
      {
        nombre: "saldo",
        mensaje: "¿Con cúanto saldo quieres comenzar? (Mínimo  100)",
        tipo: "numero" as const,
        validacion: (entrada: string | number | null) => {
          if (typeof entrada === "number") {
            if (entrada < 100) {
              return "Debes comenzar con un saldo mínimo de 100 monedas.";
            }
            return true;
          } else {
            return "Debes ingresar un número válido.";
          }
        },
      },
    ];

    const respuestas = await Menu.listaPreguntas(preguntas);

    const jugador = new Jugador(respuestas.nombre, respuestas.saldo);

    this.jugador = jugador;
  }

  /**
   *
   */
  private async menuPrincipal() {
    const opciones = [
      { valor: "juegos", nombre: "Ver juegos 🕹️" },
      { valor: "saldo", nombre: "Administrar saldo 💵" },
      { valor: "salir", nombre: "Salir 🚪" },
    ];

    while (true) {
      console.clear();
      console.log("==========================================");
      console.log("       🎰 🎲 Menú Principal 🎲 🎰       ");
      console.log("------------------------------------------");

      const opcion = await Menu.elegirOpcion("Selecciona una opción", opciones);

      if (opcion === "salir") {
        process.exit(0);
      }

      if (opcion === "juegos") {
        await this.elegirJuego();
      } else {
        await this.manejarSaldo();
      }
    }
  }

  /**
   *
   */
  private async elegirJuego(): Promise<void> {
    console.clear();
    console.log("==========================================");
    console.log("       🎰 🕹️  LISTADO JUEGOS 🕹️  🎰      ");
    console.log("------------------------------------------");

    // ... Menu para mostrar opciones de juego
    const opcionSeleccionada = await Menu.elegirOpcion(
      "Selecciona que juego quieres jugar",
      this.juegos
    );

    switch (opcionSeleccionada) {
      case "dados":
        this.juego = new Dados();
        break;
      default:
        console.log("El juego seleccionado aún no esta disponible 😢");
    }

    await this.ejecutarJuego();
  }

  private async manejarSaldo(): Promise<void> {
    console.clear();
    console.log("==========================================");
    console.log("      🎰 💵 Administrar Saldo 💵 🎰     ");
    console.log("------------------------------------------");
  }

  private async ejecutarJuego(): Promise<void> {
    // ... Método donde Casino cede el control a el
    // juego que este seleccionado.
    if (!this.jugador) {
      throw new Error("Se debe crear un jugador.");
    }

    if (!this.juego) {
      throw new Error("Se debe seleccionar un juego.");
    }

    // Muestra las instrucciones
    // Ejecuta el juego y espera el resultado.
    const jugada = await this.juego.ejecutar(this.jugador);
    // Muestra resultado
    const opcion = await this.juego.mostrarResultado(
      jugada.apuestaTotal,
      jugada.resultado,
      this.jugador,
      this.juego.obtenerApuestaMinima(),
      jugada.apuestaTotal === 0,
      jugada.ganancia ?? undefined
    );

    // Guarda la partida
    const partida = {
      fecha: new Date().toDateString(),
      jugador: this.jugador.obtenerNombre(),
      apuesta: jugada.apuestaTotal,
      resultado: jugada.resultado,
      juego: this.juego.obtenerNombre(),
    };

    // y chequea si tiene que reiniciar el juego.
    if (opcion === "jugar") {
      await this.ejecutarJuego();
    }
  }

  private async registrarJugada({
    juego,
    apuestaTotal,
    resultado,
    nombreJugador,
  }: {
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
    juego: string;
    nombreJugador: string;
  }): Promise<void> {
    // ... Lógica para guardar una jugada en el diario de jugadas
    const jugada = {
      fecha: new Date().toDateString(),
      juego,
      apuesta: apuestaTotal,
      resultado,
      jugador: nombreJugador,
    };
  }
}
