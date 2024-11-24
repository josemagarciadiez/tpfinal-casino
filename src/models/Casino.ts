// Modelos generícos
import { IJuego } from "./IJuego";
import { Jugador } from "./Jugador";

// Clases utilitarias
import { Menu } from "../utils/Menu";

// Implementaciones de juegos
import { Dados } from "../games/Dados";

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
      },
      {
        nombre: "saldo",
        mensaje: "¿Con cúanto saldo quieres comenzar?",
        tipo: "numero" as const,
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
    console.clear();
    console.log("==========================================");
    console.log("       🎰 🎲 Menú Principal 🎲 🎰       ");
    console.log("------------------------------------------");

    const opciones = [
      { valor: "juegos", nombre: "Ver juegos 🕹️" },
      { valor: "saldo", nombre: "Administrar saldo 💵" },
      { valor: "salir", nombre: "Salir 🚪" },
    ];

    const opcion = await Menu.elegirOpcion("Selecciona una opción", opciones);

    if (opcion === "salir") {
      return;
    }

    if (opcion === "juegos") {
      await this.elegirJuego();
    } else {
      await this.manejarSaldo();
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

    // ... demás lógica
  }

  private async manejarSaldo(): Promise<void> {
    console.clear();
    console.log("==========================================");
    console.log("      🎰 💵 Administrar Saldo 💵 🎰     ");
    console.log("------------------------------------------");
  }

  private ejecutarJuego(): void {
    // ... Método donde Casino cede el control a el
    // juego que este seleccionado.

    return;
  }

  private async registrarJugada({
    juego,
    apuestaTotal,
    resultado,
    nombreJugador,
  }: {
    juego: string;
    apuestaTotal: number;
    resultado: "victoria" | "perdida";
    nombreJugador: string;
    ganancia?: number;
  }): Promise<void> {
    // ... Lógica para guardar una jugada en el diario de jugadas
    const jugada = {
      id: "generarId unico",
      fecha: new Date().toDateString(),
      juego,
      apuestaTotal,
      resultado,
      nombreJugador,
    };
  }

  // ... lógica para guardar en archivo txt con formato csv.
}
