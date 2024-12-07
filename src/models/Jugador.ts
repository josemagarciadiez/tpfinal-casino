export class Jugador {
  private nombre: string;
  private saldo: number;

  constructor(nombre: string, saldoInicial: number) {
    this.nombre = nombre;
    this.saldo = saldoInicial;
  }

  public obtenerNombre() {
    return this.nombre;
  }

  public obtenerSaldo() {
    return this.saldo;
  }

  public sumarSaldo(monto: number) {
    this.saldo += monto;
  }

  public restarSaldo(monto: number) {
    this.saldo -= monto;
  }
}
