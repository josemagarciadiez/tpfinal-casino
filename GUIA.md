# Guía para Implementar un nuevo juego

## Índice

1. [Comentarios sobre la clase abstracta `Juego`](#cometarios-sobre-la-clase-abstracta-juego)

   - [Propiedades comunes](#propiedades-comunes)
   - [Métodos de la interfaz `IJuego`](#metodos-de-la-interfaz-juego)

2. [Pasos para implementar un nuevo juego](#pasos-para-implementar-un-nuevo-juego)

   - [Crear nueva clase que extienda `Juego`](#crear-nueva-clase-que-extienda-juego)
   - [Implementar métodos de la interfaz `IJuego`](#implementar-métodos-de-la-interfaz-ijuego)

3. [Validación y Pruebas](#validación-y-pruebas)

   - [Testear el juego con la clase `Casino`](#testear-el-juego-con-la-clase-casino)

## Comentarios sobre la clase abstracta `Juego`

La clase abstracta `Juego` define la estructura básica y los atributos comunes que deben tener todos los juegos en el casino. Cualquier juego nuevo debe extender esta clase y proporcionar su propia lógica para la implementación de los métodos.

### Propiedades comunes

Para una correcta integración, cada juego debe inicializar las siguientes propiedades en su constructor:

- `instrucciones`: Debe contener un mensaje con las instrucciones de juego. Este mensaje será mostrado en pantalla al usuario por la clase Casino.
- `cantidadRondas`: Número total de rondas que durara el juego una vez que se ejecute.
- `apuestaMinima`: Monto mínimo requerido para apostar.
- `premioAcumulado`: Monto acumulado durante las rondas (su uso es opcional y depende de la implementación de cada juego)

### Métodos de la interfaz `IJuego`

La interfaz `IJuego` estipula que cada juego debe implementar dos métodos obligatorios:

```ts
export interface IJuego {
  iniciar(): {
    instrucciones: string;
    rondas: number;
    apuestaMinima: number;
    accionesIniciales?: {
      nombre: string;
      mensaje: string;
      tipo: "texto" | "numero" | "lista";
      opciones?: { valor: string; mensaje: string }[];
    }[];
  };

  ejecutarRonda(
    apuesta: number,
    accionElegida?: { nombre: string; valor: string | number }
  ): {
    resultado: "victoria" | "derrota" | "proceso";
    ganancia: number;
    informacion?: string;
    acciones?: {
      nombre: string;
      mensaje: string;
      tipo: "texto" | "numero" | "lista";
      opciones?: { valor: string; mensaje: string }[];
    }[];
  };
}
```

#### Método `iniciar`

El método `iniciar` será utilizado por la clase `Casino` para obtener los datos necesarios para poder manejar el juego que se este ejecutando.

Este método no acepta ningun parámetro y devuelve un objeto del siguiente tipo:

```ts
{
    instrucciones: string;
    rondas: number;
    apuestaMinima: number;
    accionesIniciales?: {
      nombre: string;
      mensaje: string;
      tipo: "texto" | "numero" | "lista";
      opciones?: { valor: string; mensaje: string }[];
    }[];
  }
```

Estas propiedades coinciden con las propiedades declaradas en la clase abstracta `Juego`, a excepción de la variable `accionesIniciales`, la cual actua como una variable para que cada juego, de ser necesario, comunique a la clase `Casino` que es necesario que el usuario seleccione alguna de dichas acciones para la correcta ejecución del juego.

**Nota:** La clase abstracta `Juego` contiene una implementación básica del método `iniciar` devolviendo las propiedades comunes para todas las clases.

##### Objeto `accionesIniciales`

El objeto `accionesIniciales` es una estructura opcional que describe las acciones iniciales que el jugador puede realizar al comenzar el juego. Este objeto es clave para configurar correctamente la interacción entre el usuario y el menú de opciones del casino.

##### Estructura del objeto `accionesIniciales`

`accionesIniciales` es un array de objetos, donde cada objeto tiene las siguientes propiedades:

- `nombre` (string): Un identificador único para la acción. Este valor será usado internamente para referirse a la acción seleccionada por el usuario.

- `mensaje` (string): El texto que se mostrará en el menú al jugador, indicando lo que representa la acción.

- `tipo` ("texto" | "numero" | "lista"): Indica el tipo de dato que se espera que el jugador proporcione al seleccionar esta acción:

  - "texto": El jugador deberá ingresar un texto.
  - "numero": El jugador deberá ingresar un valor numérico.
  - "lista": El jugador deberá seleccionar una opción de una lista predefinida.

- `opciones` (Array): (Opcional) Solo utilizado si el tipo es "lista". Es un array de objetos donde cada opción incluye:

  - `valor` (string): Identificador único de la opción seleccionada.
  - `mensaje` (string): Texto descriptivo de la opción que se mostrará al jugador en el menú.

#### Método `ejecutarRonda`

El método `ejecutarRonda` es utilizado por la clase `Casino` para ejecutar una ronda del juego seleccionado. Este método se ajusta a las configuraciones y reglas proporcionadas previamente por el juego, ya sea desde el método `iniciar` (propiedad `accionesIniciales`) o como resultado de rondas anteriores (propiedad `acciones`).

##### Parámetros

El método recibe los siguientes parámetros:

- `apuesta`: corresponde al saldo que el usuario apostará en la mano a ejecutar.

- `accionElegida` (Opcional): Es un objeto que representa la acción seleccionada por el usuario antes de ejecutar la ronda. Este objeto se deriva de:

  - La lista inicial proporcionada por el juego en la propiedad `accionesIniciales` del método `iniciar`, si es la primera ronda.
  - La lista de acciones proporcionada por el juego en la propiedad `acciones` al finalizar la ronda previa, si aplica.

  El objeto tiene la siguiente estructura:

  ```ts
  {
    nombre: string; // Identificador único de la acción seleccionada.
    valor: string | number; // Valor asociado a la acción elegida.
  }
  ```

##### Retorno del método

El método devuelve un objeto con la siguiente estructura:

```ts
{
  resultado: "victoria" | "derrota" | "proceso";
  ganancia: number;
  informacion?: string;
  acciones?: {
    nombre: string;
    mensaje: string;
    tipo: "texto" | "numero" | "lista";
    opciones?: { valor: string; mensaje: string }[];
  }[];
}
```

##### Propiedades de la respuesta

Las propiedades de la respuesta del método `ejecutarRonda` son:

- `resultado`: Indica el estado del juego. El cual tiene 3 (tres) posibles valores.

  - `"victoria"`: indica a `Casino` que el juego terminó, y el usuario resultó victorioso en la apuesta.
  - `"derrota"`: indica a `Casino` que el juego terminó, y el usuario resultó perdedor en la apuesta.
  - `"proceso"`: indica a `Casino` que el juego aún no terminó y que es necesario que el usuario tome otra acción según lo informado en `acciones` o se ejecute la siguiente ronda sin ser necesario una acción especifica (en este caso juego no informa nada en la variable `acciones`)

- `ganancia`: Este valor indica a `Casino` que monto ganó el usuario, para que este sume dicho valor al balance del mismo. Esta variable solo es chequeada en caso de que `resultado` sea igual a `"victoria"`, en los demás casos se ignorará.
- `información` (Opcional): Propiedad opcional para que juego muestre un mensaje al usuario (a través de `Casino`), previo a indicarle las acciones a seguir. Es una variable que se utilizá para darle contexto al usuario sobre el resultado provisorio del juego entre rondas, con el fin de que tome una decisión informada.
- `acciones` (Opcional): Array opcional de objetos para que el juego informe a `Casino` que acciones tiene disponible el usuario entre rondas. Cada objeto describe una accion de la siguiente manera:

```ts
{
  nombre: string;       // Identificador único de la acción.
  mensaje: string;      // Texto que se mostrará al usuario.
  tipo: "texto" | "numero" | "lista"; // Tipo de dato esperado para la acción.
  opciones?: {          // Opciones disponibles si el tipo es "lista".
    valor: string;      // Identificador único de la opción.
    mensaje: string;    // Texto descriptivo de la opción.
  }[];
}
```

**\*Notas importantes:**

1. En el caso de que un juego informe un set de acciones al comienzo (propiedad `accionesIniciales`) pero no informe nuevas `acciones` al finalizar cada mano, siempre recibirá una opcion disponible en `accionesIniciales`, ya que `Casino`, luego de cada ronda, mostrará ese listado de opciones al usuario.

2. En el caso de que un juego no informe un set de acciones al comienzo (propiedad `accionesIniciales`) pero informe nuevas `acciones` al finalizar cada mano, solo recibirá la accion en la ronda siguiente a la que haya informado dicho set de acciones.

3. En el caso de que `Casino` no reciba un set de acciones al comienzo (propiedad `accionesIniciales`) ni uevas `acciones` al finalizar cada mano, solo le requerirá al usuario que ingrese una nueva apuesta (dinero) y enviará ese valor al método `ejecutarRonda`

## Pasos para implementar un nuevo juego

Para implementar correctamente un nuevo juego hay que cumplir los siguientes pasos:

### 1. Crear nueva clase que extienda `Juego`

Crea un nuevo archivo para la clase de juego en la carpeta src/games. Por ejemplo, para un juego de "Ruleta", crea un archivo Ruleta.ts.

```ts
import { Juego } from "./models/Juego";

export class Ruleta extends Juego {
  private accionesIniciales: {
    nombre: string;
    mensaje: string;
    tipo: "texto" | "numero" | "lista";
    opciones?: {
      valor: string;
      mensaje: string;
    }[];
  };
  constructor() {
    this.instrucciones = "Apuesta en rojo o negro, o elige un número.";
    this.cantidadRondas = 1;
    this.apuestaMinima = 50;
    this.premioAcumulado = 0;
    this.accionesIniciales = [
      {
        nombre: "color",
        mensaje: "Aportar a un color",
        tipo: "lista",
        opciones: [
          { valor: "rojo", mensaje: "Apostar al rojo" },
          { valor: "negro", mensaje: "Apostar al negro" },
        ],
      },
      {
        nombre: "pleno",
        mensaje: "Apostar pleno",
        tipo: "numero",
      },
    ];
  }
}
```

### 2. Implementar métodos de la interfaz `IJuego`

- Metodo `iniciar`:

Este método devuelve la configuración inicial del juego, como las instrucciones, el número de rondas, la apuesta mínima y las acciones iniciales (si aplica).

```ts
iniciar() {
  return {
    instrucciones: this.instrucciones,
    rondas: this.cantidadRondas,
    apuestaMinima: this.apuestaMinima,
    accionesIniciales: this.accionesIniciales
  };
}
```

- Metodo `ejecutarRonda`:

Este método ejecuta una ronda del juego y debe devolver:

1. resultado: Puede ser "victoria", "derrota" o "proceso".
2. ganancia: La cantidad ganada por el jugador (o 0 en cualquier otro resultado distinto a "victoria").
3. informacion (opcional): Información adicional sobre el resultado de la ronda.
4. acciones (opcional): Nuevas acciones disponibles tras la ronda.

```ts
ejecutarRonda(apuesta: number, accionElegida?: { nombre: string; valor: string | number }) {
  // const numeroGanador = //.. lógica para determinar
  let ganancia = 0;
  let resultado = "proceso"

   if(accionElegida && accionElegida.nombre === "color") {
    if(accionElegida.valor === "rojo" && numeroGanador === "rojo") {
      return {
        resultado: "victoria",
        ganancia: apuesta * 2,
        informacion: `El número ganandor es ${numeroGanando}. ¡Felicidades, has ganado!`
      }
    }
    //.. demas lógica
   }

   if(accionElegida && accionElegida.nombre === "pleno") {
    if(accioneElegida.valor === numeroGanador) {
      return {
        resultado: "victoria",
        ganancia: apuesta * 2,
        informacion: `El número ganandor es ${numeroGanando}. ¡Felicidades, acertado un pleno!`
      }
    }
    //.. demas lógica
   }

}
```

**Nota:** Las validaciones de si el usuario cuenta con saldo para apostar, como también la validación de si la apuesta del usuario (dinero) es igual o mayor a la `apuestaMinima` del juego serán realizadas por `Casino`.

## Validación y Pruebas

### Testear el juego con la clase `Casino`

POR IMPLEMENTARSE PROXIMAMENTE.
