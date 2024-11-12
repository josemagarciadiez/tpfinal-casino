console.log("Aca consegui iconitos para el tragamoneda jajaja");
console.log(["🍒", "🍋", "🔔", "⭐", "🍉"]);

export interface IJuego {
  iniciar(): void; // Metodo para iniciar la logica del juego.
  apostar(cantidad: number): void; // Metodo para apostar dentro del juego. Recibe cantidad en numero.
  pagar(): void; // Metodo para cargarle la plata en caso de que el jugador gane.
  salir(): void; // Metodo para terminar el juego. El cliente pierde lo apostado.
  // y no se me ocurre nada por ahora ajajaj
}
