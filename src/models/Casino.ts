// Modelos generícos
import { IJuego } from "./IJuego";
import { Jugador } from "./Jugador";

// Clases utilitarias
import { Menu } from "../utils/Menu";

// Implementaciones de juegos
import { Ruleta } from "../games/Ruleta";
import { Dados } from "../games/Dados";

export class Casino {
  private jugador!: Jugador;
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
      console.log(
        "Nombre : " +
          this.jugador.obtenerNombre() +
          "\n" +
          "Saldo : " +
          this.jugador.obtenerSaldo()
      );
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

    // Creamos opciones a partir del listado de juegos, y agregamos la
    // opcion de salir
    const opciones = [...this.juegos, { valor: "salir", nombre: "Atras" }];

    // ... Menu para mostrar opciones de juego
    const opcionSeleccionada = await Menu.elegirOpcion(
      "Selecciona que juego quieres jugar",
      opciones
    );

    switch (opcionSeleccionada) {
      case "dados":
        this.juego = new Dados();
        break;
      case "ruleta":
        this.juego = new Ruleta();
        break;
      case "salir":
        break;
      default:
        console.log("El juego seleccionado aún no esta disponible 😢");
    }

    if (opcionSeleccionada !== "salir") {
      await this.ejecutarJuego();
    }
  }

  /**
   *
   */
  private async manejarSaldo(): Promise<void> {
    console.clear();
    console.log("==========================================");
    console.log("      🎰 💵 Administrar Saldo 💵 🎰     ");
    console.log("------------------------------------------");
    console.log(
      "Nombre : " +
        this.jugador.obtenerNombre() +
        "\n" +
        "Saldo : " +
        this.jugador.obtenerSaldo()
    );
    console.log("------------------------------------------");

    let opcion = await Menu.elegirOpcion("Que desea Hacer? ", [
      { valor: "saldo", nombre: "Cargar Saldo" },
      { valor: "numero", nombre: "Retirar su saldo" },
      { valor: "salir", nombre: "Salir" },
    ]);

    if (opcion != "salir") {
      if (opcion == "saldo") {
        this.jugador?.sumarSaldo(
          await Menu.pedirNumero(
            "ingrese el monto que desea cargar",
            (valor) => {
              if (valor === undefined) {
                return "Debe ingresar un valor";
              }

              if (typeof valor !== "number") {
                return "El valor debe ser un número";
              }

              if (valor < 100 && valor != 0) {
                return "El valor minimo de recarga es 100";
              }

              return true;
            }
          )
        );
      } else {
        this.jugador?.restarSaldo(
          await Menu.pedirNumero(
            "ingrese el monto que desea retirar",
            (valor) => {
              if (valor === undefined) {
                return "Debe ingresar un valor";
              }

              if (typeof valor !== "number") {
                return "El valor debe ser un número";
              }

              if (valor > this.jugador?.obtenerSaldo()) {
                return "El valor que desea retirar debe ser menor o igual a su saldo";
              }

              if (valor < 0) {
                return "Ingrese un valor mayor a cero y menor a su saldo";
              }

              return true;
            }
          )
        );
      }
    }
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

    const instrucciones = this.juego.obtenerInstrucciones();

    console.clear();
    console.log(instrucciones);

    await Menu.elegirOpcion("Ingresa al juego", [
      {
        valor: "continuar",
        nombre: "Continuar",
      },
    ]);

    const jugada = await this.juego.ejecutar(this.jugador);

    // Logica para escribir jugada en el log.
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
