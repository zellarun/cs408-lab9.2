/**
 * Author: Zella Running
 * Date: 24 October 2025
 * Description: Bouncing balls with an evil circle that removes them on contact. Counts remaining balls.
 **/

// ==== set up canvas ====
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const para = document.querySelector("p");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

// ==== utility functions ====
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomRGB() {
  return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

// ==== base class ====
class Shape {
  constructor(x, y, velX, velY) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
  }
}

// ==== Ball class ====
class Ball extends Shape {
  constructor(x, y, velX, velY, color, size) {
    super(x, y, velX, velY);
    this.color = color;
    this.size = size;
    this.exists = true;
  }

  draw() {
    if (!this.exists) return;
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fill();
  }

  update() {
    if (!this.exists) return;
    if (this.x + this.size >= width) this.velX = -Math.abs(this.velX);
    if (this.x - this.size <= 0) this.velX = Math.abs(this.velX);
    if (this.y + this.size >= height) this.velY = -Math.abs(this.velY);
    if (this.y - this.size <= 0) this.velY = Math.abs(this.velY);
    this.x += this.velX;
    this.y += this.velY;
  }

  collisionDetect() {
    if (!this.exists) return;
    for (const ball of balls) {
      if (this !== ball && ball.exists) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.hypot(dx, dy);
        if (distance < this.size + ball.size) {
          ball.color = this.color = randomRGB();
        }
      }
    }
  }
}

// ==== EvilCircle class ====
const CONTROL_MODE = "mouse";

class EvilCircle extends Shape {
  constructor(x, y) {
    super(x, y, 20, 20);
    this.color = "white";
    this.size = 10;

    if (CONTROL_MODE === "keyboard") {
      window.addEventListener("keydown", (e) => {
        if (e.key === "a") this.x -= this.velX;
        if (e.key === "d") this.x += this.velX;
        if (e.key === "w") this.y -= this.velY;
        if (e.key === "s") this.y += this.velY;
        this.checkBounds();
      });
    } else {
      const rect = canvas.getBoundingClientRect();
      window.addEventListener("mousemove", (e) => {
        this.x = e.clientX - rect.left;
        this.y = e.clientY - rect.top;
        this.checkBounds();
      });

      // optional touch control
      canvas.addEventListener(
        "touchmove",
        (e) => {
          const t = e.touches[0];
          this.x = t.clientX - rect.left;
          this.y = t.clientY - rect.top;
          this.checkBounds();
          e.preventDefault();
        },
        { passive: false }
      );
    }
  }

  draw() {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.stroke();
  }

  checkBounds() {
    if (this.x + this.size >= width) this.x = width - this.size;
    if (this.x - this.size <= 0) this.x = this.size;
    if (this.y + this.size >= height) this.y = height - this.size;
    if (this.y - this.size <= 0) this.y = this.size;
  }

  collisionDetect() {
    for (const ball of balls) {
      if (ball && ball.exists) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.hypot(dx, dy);
        if (distance < this.size + ball.size) {
          ball.exists = false;
          ballCount--;
          para.textContent = `BALL COUNT: ${ballCount}`;
        }
      }
    }
  }
}

// ==== create balls ====
const balls = [];
let ballCount = 0;

while (balls.length < 25) {
  const size = random(10, 20);
  const ball = new Ball(
    random(size, width - size),
    random(size, height - size),
    random(-7, 7),
    random(-7, 7),
    randomRGB(),
    size
  );
  balls.push(ball);
  ballCount++;
  para.textContent = `BALL COUNT: ${ballCount}`;
}

// ==== create evil circle ====
const evilCircle = new EvilCircle(random(0, width), random(0, height));

// ==== animation loop ====
function loop() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, width, height);

  for (const ball of balls) {
    if (ball.exists) {
      ball.draw();
      ball.update();
      ball.collisionDetect();
    }
  }

  evilCircle.draw();
  evilCircle.checkBounds();
  evilCircle.collisionDetect();

  requestAnimationFrame(loop);
}
loop();
