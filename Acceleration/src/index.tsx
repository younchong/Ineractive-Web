// q. mac os 에서 화면 전환시 브라우저 더 빨라지는 이유?
// 마우스 속도에 따른 볼의 움직임 개선 필요
const area: number = 2 * Math.PI;
const radius: number = 20;

class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector) {
    return new Vector(this.x + other.x, this.y + other.y);
  }
}

class Entity {
  position: Vector;
  velocity: Vector;

  constructor(position: Vector, velocity: Vector) {
    this.position = position;
    this.velocity = velocity;
  }

  
  update(delta: number) {}
}

class Circle extends Entity {
  //velocity: Vector = new Vector(0, 0); // 여기서 속력 조절

  update(delta: number) {
    this.velocity.x += this.velocity.x * 0.01 * delta; // 그나마 제일 자연스러운 듯 q. 값을 임의로 정하면서 구했는데, 정석은?
    this.velocity.y += 10 * delta; // gravity 
    this.position = this.position.add(this.velocity);

    if (this.position.y >= 300 - radius) {
      this.position.y = 300 - radius;
      this.velocity.y *= -1;
    } else if (this.position.y <= 0 + radius) {
      this.position.y = 0 + radius;
      this.velocity.y *= -1;
    }

    if (this.position.x >= 1000 - radius) {
      this.position.x = 1000 - radius;
      this.velocity.x *= -1;
    } else if (this.position.x <= 0 + radius) {
      this.position.x = 0 + radius;
      this.velocity.x *= -1;
    } 
  }


  render(context: CanvasRenderingContext2D) {
    const randomColor: string[] = ["red", "orange", "yellow", "green", "blue", "navy", "purple"]
    context.beginPath(); // make new path
    context.fillStyle = randomColor[Math.floor(Math.random() * 6)];
    context.arc(this.position.x, this.position.y, radius, 0, area); //make arc (x, y)원점 호를 그리므로 시작 각도와 끝 각도 => 원이니까 PI
    context.fill();
  }
}

export default class App {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;

  circles: Circle[] = [];

  startTime: number;
  delta: number = 0;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1000;
    this.canvas.height = 300;

    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("woop");
    }

    this.circles = [
      // 원 생성 위치, 벡터 => 클릭위치로 변경
    ];

    this.context = context;
    this.startTime = Date.now();
    document.body.append(this.canvas);
    window.requestAnimationFrame(this.render); // 다음 리페인트 진행되기 전 에니메이션 업데이트 하는 함수 호출
  }

  render = () => {
    const currentTime = Date.now();
    this.delta = (currentTime - this.startTime) * 0.001;
    this.startTime = currentTime;
    window.requestAnimationFrame(this.render);

    this.context.fillStyle = "rgba(255, 255, 255, .1)";
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height); // canvas만들기

    for (let i = 0, length = this.circles.length; i < length; i++) {
      const circle = this.circles[i];
      circle.render(this.context);
      circle.update(this.delta);
    }
  }

  add = (x: number, y: number, velocityX: number, velocityY: number) => {
    this.circles.push(new Circle(new Vector(x, y), new Vector(velocityX, velocityY) ));
  }
}
let app: App;
window.addEventListener("load", () => {
  app = new App();
});

let down: number[];
let up: number[];
window.addEventListener("mousedown", (e) => {
  down = [e.x, e.y];
})

window.addEventListener("mouseup", (e) => {
  up = [e.x, e.y];
  const differenceX = (up[0] - down[0]) * 0.01
  const differenceY = (up[1] - down[1]) * 0.01;

  if (e.x >= 0 && e.x <=1000 && e.y >= 0 && e.y <= 300) {
    app.add(down[0], down[1], differenceX, differenceY)
  }
  
})

