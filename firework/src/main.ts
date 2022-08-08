// UTIL
const PI: number = Math.PI;
const TWO_PI: number = Math.PI * 2;

const Util = {};

Util.timeStamp = function(): number {
  return window.performance.now();
};
Util.random = function(min, max) {
  return min + Math.random() * (max - min);
};
Util.map = function(a, b, c, d, e) {
  return (a - b) / (c - b) * (e - d) + d;
};
Util.lerp = function(value1, value2, amount) {
  return value1 + (value2 - value1) * amount;
};
Util.clamp = function(value, min, max) {
  return Math.max(min, Math.min(max, value));
};
// Vector
class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  reset() {
    this.x = 0;
    this.y = 0;
  }
  fromAngle(angle: number): Vector {
    const x = Math.cos(angle);
    const y = Math.sin(angle);

    return new Vector(x, y);
  }
  add(vector: Vector) {
    this.x += vector.x;
    this.y += vector.y;
  }
  sub(vector: Vector) {
    this.x -= vector.x;
    this.y -= vector.y;
  }
  mult(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
  }
  div(scalar: number) {
    this.x /= scalar;
    this.y /= scalar;
  }
  dot(vector: Vector): number {
    return vector.x * this.x + vector.y * this.y;
  }
  limit(limit_value: number) {
    if (this.mag() > limit_value) this.setMag(limit_value);
  }
  mag(): number {
    return Math.hypot(this.x, this.y);
  }
  setMag(new_mag: number) {
    if (this.mag() > 0) {
      this.normalize();
    } else {
      this.x = 1;
      this.y = 0;
    }
    this.mult(new_mag);
  }
  normalize() {
    const mag: number = this.mag();

    if (mag > 0) {
      this.x /= mag;
      this.y /= mag;
    }
  }
  heading(): number {
    return Math.atan2(this.y, this.x);
  }
  setHeading(angle: number) {
    let mag = this.mag();
    this.x = Math.cos(angle) * mag;
    this.y = Math.sin(angle) * mag;
  }
  dist(vector: Vector): number {
    return new Vector(this.x - vector.x, this.y - vector.y).mag();
  }
  angle(vector: Vector): number {
    return Math.atan2(vector.y - this.y, vector.x - this.x);
  }
  copy(): Vector {
    return new Vector(this.x, this.y);
  }
}

// Init canvas
const canvas: HTMLCanvasElement = document.createElement("canvas");
const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");
let H: number = (canvas.height = window.innerHeight);
let W: number = (canvas.width = window.innerWidth);

document.body.appendChild(canvas);

// Mouse
let mouse = {
  x: W/2,
  y: H/2
};
canvas.onmousemove = function(event: MouseEvent) {
  mouse.x = event.clientX - canvas.offsetLeft;
  mouse.y = event.clientY - canvas.offsetTop;
};
document.body.onresize = function(){
  H = (canvas.height = window.innerHeight);
  W = (canvas.width = window.innerWidth);
}
// Let's go
class Arrow {
  position: Vector;
  velocity: Vector;
  acceleration: Vector;
  target: {x: number, y: number};
  travelled_distance: number;
  min_size: number;
  max_size: number;
  size: number;
  zone: number;
  topSpeed: number;
  tail: Array<object>;
  wiggle_speed: number;
  blink_offset: number;
  alpha: number;

  constructor(x: number, y: number, target: {x: number, y: number}) {
    this.position = new Vector(x, y);
    this.velocity = new Vector(0, 0).fromAngle(Util.random(0,TWO_PI));
    this.acceleration = new Vector(0, 0);
    this.target = target;
    this.travelled_distance = 0;
    this.min_size = 1;
    this.max_size = 3;
    this.size = Util.random(this.min_size, this.max_size);
    this.zone = this.size * 2;
    this.topSpeed = Util.map(this.size,this.min_size,this.max_size,40,10);
    this.tail = [];
    
    let tailLength = Math.floor(Util.map(this.size, this.min_size, this.max_size, 4, 16));
    
    for (let i = 0; i < tailLength; i++) {
      this.tail.push({
        x: this.position.x,
        y: this.position.y
      });
    }
    this.wiggle_speed = Util.map(this.size, this.min_size, this.max_size, 2 , 1.2);
    this.blink_offset = Util.random(0, 100);
    this.alpha = Util.random(0.1, 1);
  }
  render() {
    this.update();
    this.draw();
  }
  update() {
    const old_position: Vector = this.position.copy();
    // Focus on target
    const t: Vector = new Vector(this.target.x, this.target.y);
    const angle: number = this.position.angle(t);
    const d_f_target: number = t.dist(this.position);
    const f: Vector = new Vector(0, 0).fromAngle(angle);

    f.setMag(Util.map(Util.clamp(d_f_target,0,400), 0, 400, 0, this.topSpeed * 0.1));
    this.addForce(f);
    
    // Update position and velocity
    this.velocity.add(this.acceleration);

    if(d_f_target < 800){
      this.velocity.limit(Util.map(Util.clamp(d_f_target,0,800), 0, 800, this.topSpeed*0.4, this.topSpeed));
    }else{
      this.velocity.limit(this.topSpeed);
    }
    this.position.add(this.velocity);
    // Reset acceleration for the next loop
    this.acceleration.mult(0);
    this.travelled_distance += old_position.dist(this.position);

    const wiggle: number =
      Math.sin(frame * this.wiggle_speed) *
      Util.map(this.velocity.mag(), 0, this.topSpeed, 0, this.size);
    const w_a: number = this.velocity.heading() + Math.PI / 2;

    const w_x: number = this.position.x + Math.cos(w_a) * wiggle;
    const w_y: number = this.position.y + Math.sin(w_a) * wiggle;

    this.travelled_distance = 0;

    const from: number = this.tail.length - 1;
    const to: number = 0;
    const n: Vector = new Vector(0, 0).fromAngle(Util.random(0,TWO_PI));

    n.setMag(Math.random()*this.size);

  
    const tail = { x: w_x+ n.x, y: w_y + n.y};

    this.tail.splice(from, 1);
    this.tail.splice(to, 0, tail);
  }
  draw() {
    const energy: number = Util.map(this.velocity.mag(),0,this.topSpeed,0.1,1);

    const color: string =
      "hsl("+Math.sin((frame + this.blink_offset) * 0.1) * 360+",50%,"+
        Util.map(this.velocity.mag(),0,this.topSpeed,40,100) * this.alpha
    +"%)";

    ctx.globalAlpha = this.alpha;

    ctx.strokeStyle = color;

    for (let i = 0; i < this.tail.length - 1; i++) {
      const t = this.tail[i];
      const next_t = this.tail[i + 1];

      ctx.lineWidth = Util.map(i, 0, this.tail.length - 1, this.size, 1);
      ctx.beginPath();
      ctx.moveTo(t.x, t.y);
      ctx.lineTo(next_t.x, next_t.y);
      ctx.closePath();
      ctx.stroke();
    }
    
    const gradient_size: number = 10 * energy;
    const grd = ctx.createRadialGradient(
      this.position.x,this.position.y , 5,
      this.position.x,this.position.y, gradient_size);

    grd.addColorStop(0, "rgba(255,255,255,0.01)");
    grd.addColorStop(0.1, "rgba(255,120,200,0.02)");
    grd.addColorStop(0.9, "rgba(255,255,120,0)");
    grd.addColorStop(1, "rgba(0,0,0,0)");

    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(this.position.x - gradient_size / 2 ,this.position.y - gradient_size / 2 , gradient_size, gradient_size);
    ctx.globalAlpha = energy + 0.2;
    ctx.fillStyle = "white";
  
    for(let i = 0; i < 4; i++){
      const n: Vector = new Vector(0, 0).fromAngle(Util.random(0,TWO_PI));

      n.setMag(Math.random()*energy*10);
      n.add(this.position);
      ctx.beginPath();
      ctx.arc(n.x,n.y,Math.random(),0,TWO_PI)
      ctx.fill();
    }
    
  }
  addForce(vector: Vector) {
    this.acceleration.add(vector);
  }
  avoid(others: [Arrow]) {
    others.forEach(other => {
      if (other !== this) {
        const dist = this.position.dist(other.position);
        const  max_dist = this.zone + other.size;

        if (max_dist - dist >= 0) {
          const angle = other.position.angle(this.position);
          const force = new Vector(0, 0).fromAngle(angle);

          force.setMag(Util.map(dist, 0, max_dist, 2, 0));
          this.addForce(force);
        }
      }
    });
  }
}

const arrows = [];

for (let i = 0; i < 100; i++) {
  arrows.push(new Arrow(W / 2, H / 2, mouse));
}

let frame: number = 0;

ctx.strokeStyle = "white";

function loop() {
  ctx.fillStyle="black";
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 0.2;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "lighter";

  arrows.forEach(a => {
    a.avoid(arrows);
  });

  arrows.forEach(a => {
    a.render();
  });

  frame += 1;
  requestAnimationFrame(loop);
}

ctx.lineCap = "round";
ctx.lineJoin = "round";

loop();
