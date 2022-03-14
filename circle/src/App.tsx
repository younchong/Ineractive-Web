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
}

class Circle {
  position: Vector;
  radius: number;

  constructor(position: Vector, radius: number) {
    this.position = position;
    this.radius = radius;
  }
}


export class App {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  circles: Array<Circle> = [];
  mousePosition: Vector = new Vector(0, 0);

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 500;
    this.canvas.height = 500;
    document.body.appendChild(this.canvas);

    this.context = this.canvas.getContext("2d");

    this.circles = [
      new Circle(new Vector(100, 100), 50),
      new Circle(new Vector(200, 150), 20),
      new Circle(new Vector(400, 150), 30)
    ]

    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.render();
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

  render() {
    this.circles.forEach(it => {
      this.context.beginPath();
      this.context.arc(it.position.x, it.position.y, it.radius, 0, Math.PI * 2.0);
      this.context.fill();
    })
  }
}
export default App

// 구현해볼 것
// 새로 공 만들어서 부딪히기
