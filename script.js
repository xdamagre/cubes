const { Engine, Render, Runner, Bodies, World, Mouse, Constraint, Vector, Body, Events } = Matter;

const engine = Engine.create();
const world = engine.world;
engine.world.gravity.y = 1;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: 'transparent'
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Parets
const thickness = 150;
function createWalls() {
  return [
    Bodies.rectangle(window.innerWidth / 2, window.innerHeight + thickness / 2, window.innerWidth * 2, thickness, { isStatic: true }),
    Bodies.rectangle(window.innerWidth / 2, -thickness / 2, window.innerWidth * 2, thickness, { isStatic: true }),
    Bodies.rectangle(-thickness / 2, window.innerHeight / 2, thickness, window.innerHeight * 2, { isStatic: true }),
    Bodies.rectangle(window.innerWidth + thickness / 2, window.innerHeight / 2, thickness, window.innerHeight * 2, { isStatic: true })
  ];
}
let walls = createWalls();
World.add(world, walls);

// Utils
function randomBetween(min, max) { return Math.random() * (max - min) + min; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// Colors
const colors = ['#e63946', '#457b9d', '#f4a261', '#2a9d8f', '#ffbe0b', '#8338ec', '#06d6a0'];

// Formes
const numberOfShapes = randomInt(3, 6);
const shapes = [];

for (let i = 0; i < numberOfShapes; i++) {
  const width = randomBetween(200, 350);
  const height = randomBetween(200, 350);
  const x = randomBetween(200, window.innerWidth - 200);
  const y = randomBetween(150, window.innerHeight - 200);
  const rect = Bodies.rectangle(x, y, width, height, {
    restitution: 0.8,
    friction: 0.1,
    frictionAir: 0.01,
    angle: Math.random() * Math.PI * 2,
    render: { fillStyle: colors[Math.floor(Math.random() * colors.length)] }
  });
  const speed = randomBetween(5, 10);
  const direction = Math.random() * Math.PI * 2;
  Body.setVelocity(rect, { x: Math.cos(direction) * speed, y: Math.sin(direction) * speed });
  Body.setAngularVelocity(rect, randomBetween(-0.1, 0.1));
  shapes.push(rect);
}
World.add(world, shapes);

// ─── Drag: Mouse + Touch ───────────────────────────────────────────────────

let dragConstraint = null;

function getPos(e) {
  if (e.touches) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

function startDrag(pos) {
  for (let shape of shapes) {
    if (Matter.Bounds.contains(shape.bounds, pos)) {
      const localPoint = Vector.sub(pos, shape.position);
      dragConstraint = Constraint.create({
        pointA: { x: pos.x, y: pos.y },
        bodyB: shape,
        pointB: localPoint,
        stiffness: 0.1,
        render: { visible: false }
      });
      World.add(world, dragConstraint);
      break;
    }
  }
}

function moveDrag(pos) {
  if (dragConstraint) {
    dragConstraint.pointA = { x: pos.x, y: pos.y };
  }
}

function endDrag() {
  if (dragConstraint) {
    World.remove(world, dragConstraint);
    dragConstraint = null;
  }
}

// Mouse
render.canvas.addEventListener('mousedown', e => startDrag(getPos(e)));
window.addEventListener('mousemove', e => moveDrag(getPos(e)));
window.addEventListener('mouseup', endDrag);

// Touch
render.canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  startDrag(getPos(e));
}, { passive: false });

window.addEventListener('touchmove', e => {
  e.preventDefault();
  moveDrag(getPos(e));
}, { passive: false });

window.addEventListener('touchend', endDrag);

// ─── Sliders ───────────────────────────────────────────────────────────────

document.getElementById('gv').addEventListener('input', function () {
  engine.world.gravity.y = parseFloat(this.value);
  document.getElementById('gv-value').textContent = parseFloat(this.value).toFixed(2);
});

document.getElementById('gh').addEventListener('input', function () {
  engine.world.gravity.x = parseFloat(this.value);
  document.getElementById('gh-value').textContent = parseFloat(this.value).toFixed(2);
});

// ─── Resize ────────────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  render.canvas.width = window.innerWidth;
  render.canvas.height = window.innerHeight;
  render.options.width = window.innerWidth;
  render.options.height = window.innerHeight;

  // Recrea les parets
  walls.forEach(w => World.remove(world, w));
  walls = createWalls();
  World.add(world, walls);
});
