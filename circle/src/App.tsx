import './App.css'
class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  distance(other: Vector) {
    return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2));
  }

  add(other: Vector) {
    return new Vector(this.x + other.x, this.y + other.y);
  }
}

class Circle {
  position: Vector;
  radius: number;
  velocity: Vector;

  constructor(position: Vector, radius: number, velocity: Vector)  {
    this.position = position;
    this.radius = radius;
    this.velocity = velocity;
  }

  update(delta: number) {
    if (!this.velocity.x && !this.velocity.y) return;
    this.velocity.x += 1 * delta;
    this.velocity.y += 1 * delta;
    this.position = this.position.add(this.velocity);
    if (this.position.y >= 500 - this.radius) {
      this.position.y = 500 - this.radius;
      this.velocity.y *= -1;
    } else if (this.position.y <= 0 + this.radius) {
      this.position.y = 0 + this.radius;
      this.velocity.y *= -1;
    }

    if (this.position.x >= 500 - this.radius) {
      this.position.x = 500 - this.radius;
      this.velocity.x *= -1;
    } else if (this.position.x <= 0 + this.radius) {
      this.position.x = 0 + this.radius;
      this.velocity.x *= -1;
    }

  }

  render(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.fillStyle = "rgb(0, 0, 0, 1)";
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    context.fill();
  }
}


export class App {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  startTime: number;
  delta: number = 0;

  circles: Array<Circle> = [];

  mousePosition: Vector = new Vector(0, 0);

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 500;
    this.canvas.height = 500;

    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("no context");
    }
    this.context = context;

    this.startTime = Date.now()
    this.circles = [
      new Circle(new Vector(100, 400), 50, new Vector(0, 0)),
      new Circle(new Vector(200, 150), 20, new Vector(0, 0)),
      new Circle(new Vector(400, 150), 30, new Vector(0, 0))
    ]

    document.body.appendChild(this.canvas);
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("click", this.onMouseClick);
    window.requestAnimationFrame(this.render)
  }

  onMouseMove = (e: MouseEvent) => {
    this.mousePosition = new Vector(e.clientX, e.clientY);

    for (let i = 0; i < this.circles.length; i++) {
      const circle = this.circles[i];
      const distance = this.mousePosition.distance(circle.position);
      if (distance <= circle.radius) {
        this.canvas.style.cursor = "pointer";
        break;
      } else {
        this.canvas.style.cursor = "default";
      }
    }
  }

  onMouseClick = (e: MouseEvent) => {
    this.mousePosition = new Vector(e.clientX, e.clientY);
    this.circles.push(new Circle(new Vector(e.clientX, e.clientY), 25, new Vector(5, 5)));
    this.render();
  }

  render = () => {
    const currentTime = Date.now();
    this.delta = (currentTime - this.startTime) * 0.001;
    this.startTime = currentTime;
    window.requestAnimationFrame(this.render);

    this.context.fillStyle = "rgba(255, 255, 255, 0.1)";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.circles.forEach(circle => {
      circle.render(this.context);
      circle.update(this.delta)
    })
    this.circles.forEach((movingCircle, i) => {
      if (movingCircle.velocity.x && movingCircle.velocity.y) {
        this.circles.forEach((circle, idx) => {
          if (i !== idx) {
            const distance = movingCircle.position.distance(circle.position);
            if (distance <= circle.radius + movingCircle.radius) {
              movingCircle.velocity.x *= -1;
              movingCircle.velocity.y *= -1;
              movingCircle.update(this.delta);
            }
          }
        })
      }
    }) //
  }
}
export default App
