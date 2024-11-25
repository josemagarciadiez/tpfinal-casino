# CASINO <nombre> - Trabajo Final Programación

## Menu de navegación (propuesta #1)

![Propuesta Menu navegación](./src/assets/MenuCasino.jpg)

## Estructura general del Sistema

El sistema de **Casino** sigue el **Patrón Strategy**, lo que permite implementar fácilmente nuevos juegos sin modificar la lógica central del sistema.

### Componentes Principales

1. **Casino**: Clase principal que administra la interacción del jugador con el sistema.
2. **IJuego**: Interfaz que define el protocolo que todos los juegos deben implementar.
3. **Juego**: Clase abstracta base para los juegos, implementa la interfaz `IJuego`.
4. **Jugador**: Clase que almacena información del jugador, como nombre y saldo.
5. **Menu**: Clase utilitaria para manejar la interacción con el usuario en la consola.

---

## Flujo del Sistema

1. **Inicio del Sistema**:
   - El sistema da la bienvenida al jugador y le solicita que cree un perfil (nombre y saldo inicial).
2. **Menú Principal**:
   - El jugador elige entre:
     - Ver y jugar juegos.
     - Administrar su saldo.
     - Salir del sistema.
3. **Selección de Juego**:

   - El sistema muestra los juegos disponibles.
   - Una vez seleccionado, transfiere el control al juego elegido.

4. **Ejecución del Juego**:
   - El juego interactúa con el jugador y devuelve los resultados (ganancias o pérdidas).
   - El sistema registra la jugada.

---

## Clases Clave

### Casino

- Administra el flujo general del sistema.
- Registra las jugadas realizadas.
- Maneja el menú principal y la selección de juegos.
- Maneja la creación de un usuario y la administración de su saldo.

### IJuego

- Define los métodos que cada juego debe implementar:
  - `obtenerInstrucciones()`: Devuelve las reglas del juego.
  - `ejecutar(jugador: Jugador)`: Lógica principal del juego. Devuelve un resumen de la jugada.

### Juego

- Clase abstracta que provee una implementación base para los juegos.

### Jugador

- Almacena la información del jugador, como:
  - Nombre.
  - Saldo disponible.
- Métodos para sumar o restar saldo.

---

## Protocolo de Comunicación para los Juegos

Todos los juegos deben implementar la interfaz `IJuego`. Esto asegura que el **Casino** pueda interactuar con ellos de manera uniforme.

**Métodos Obligatorios:**

1. `obtenerInstrucciones()`: Describe las reglas del juego.
2. `ejecutar(jugador: Jugador)`: Lógica del juego, recibe al jugador y devuelve un objeto con:
   - `apuestaTotal`: Monto total apostado.
   - `resultado`: `"victoria"` o `"derrota"`.
   - `ganancia`: (Opcional) Monto ganado.

---

## Tutorial: Implementar un Nuevo Juego

Sigue estos pasos para agregar un nuevo juego al sistema.

### Paso 1: Crear la Clase del Juego

1. Crea un archivo en la carpeta `games` con el nombre de tu juego (e.g., `Tragamonedas.ts`).
2. Haz que tu clase extienda `Juego` y sobrescriba los métodos necesarios.

```typescript
import { Juego } from "../Juego";
import { Jugador } from "../Jugador";

export class Tragamonedas extends Juego {
  constructor() {
    super();
    this.instrucciones =
      "Instrucciones del juego a implementar, en el formato que uno desee. Esta cadena se mostrara tal cual al usuario.";
  }

  async ejecutar(jugador: Jugador): Promise<{
    apuestaTotal: number;
    resultado: "victoria" | "derrota";
    ganancia?: number;
  }> {
    // 1. Solicitar la apuesta
    // 2. Verificar saldo
    // 3. Restar la apuesta del saldo
    // 4. Generar resultado de la partida
    // 5. Devolver resumen de la partida
    return {
        apustaTotal: 100,
        resultado: "victoria"
        ganancia: 200
    }
  }
}
```

### Paso 2: Registrar el Juego en Casino

1. Abre el archivo `Casino.ts`.
2. Agrega el nuevo juego a la lista de juegos disponibles dentro del constructor.

```typescript
import { Tragamonedas } from "../games/Tragamonedas";

constructor() {
  this.juegos = [
    { valor: "dados", nombre: "Las Vegas's Roller Master 🎲" },
    { valor: "ruleta", nombre: "Devil's Roullette 🎡" },
    { valor: "tragamonedas", nombre: "Lucky Slots 🎰" }, // Nuevo juego
  ];
}
```

3. Modifica el método `elegirJuego` para instanciar el nuevo juego:

```ts
private async elegirJuego(): Promise<void> {
  console.clear();
  console.log("==========================================");
  console.log("       🎰 🕹️  LISTADO JUEGOS 🕹️  🎰      ");
  console.log("------------------------------------------");

  const opcionSeleccionada = await Menu.elegirOpcion(
    "Selecciona que juego quieres jugar",
    this.juegos
  );

  switch (opcionSeleccionada) {
    case "dados":
      this.juego = new Dados();
      break;
    case "tragamonedas":
      this.juego = new Tragamonedas();
      break;
    default:
      console.log("El juego seleccionado aún no está disponible 😢");
  }

  await this.ejecutarJuego();
}
```

### Paso 3: Probar el Juego

1. Ejecuta el sistema desde la consola:

```bash
npm run dev
```

2. Seleccionar el nuevo juego en el menú principal.
3. Realiza las pruebas necesarias.
