const { Engine, Render, Runner, Bodies, World, Mouse, Constraint, Vector, Body } = Matter;

const engine = Engine.create();
const world = engine.world;

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

// Parets gruixudes
const thickness = 150;

const ground = Bodies.rectangle(window.innerWidth/2, window.innerHeight + thickness/2, window.innerWidth*2, thickness, { isStatic: true });
const ceiling = Bodies.rectangle(window.innerWidth/2, -thickness/2, window.innerWidth*2, thickness, { isStatic: true });
const leftWall = Bodies.rectangle(-thickness/2, window.innerHeight/2, thickness, window.innerHeight*2, { isStatic: true });
const rightWall = Bodies.rectangle(window.innerWidth+thickness/2, window.innerHeight/2, thickness, window.innerHeight*2, { isStatic: true });

World.add(world, [ground, ceiling, leftWall, rightWall]);

// Utilitats random
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Colors
const colors = ['#e63946','#457b9d','#f4a261','#2a9d8f','#ffbe0b','#8338ec','#06d6a0'];

// Nombre aleatori de formes (3 a 6)
const numberOfShapes = randomInt(4, 7);

const shapes = [];

for (let i = 0; i < numberOfShapes; i++) {

  const width = randomBetween(150, 350);
  const height = randomBetween(150, 350);

  const x = randomBetween(200, window.innerWidth - 200);
  const y = randomBetween(150, window.innerHeight - 200);

  const rect = Bodies.rectangle(x, y, width, height, {
    restitution: 0.8,
    friction: 0.1,
    frictionAir: 0.01,
    angle: Math.random() * Math.PI * 2,
    render: { fillStyle: colors[Math.floor(Math.random()*colors.length)] }
  });

  // velocitat inicial random
  const speed = randomBetween(5, 10);
  const direction = Math.random() * Math.PI * 2;

  Body.setVelocity(rect, {
    x: Math.cos(direction) * speed,
    y: Math.sin(direction) * speed
  });

  Body.setAngularVelocity(rect, randomBetween(-0.1, 0.1));

  shapes.push(rect);
}

World.add(world, shapes);

// Drag arreglat global
let dragConstraint = null;

render.canvas.addEventListener('mousedown', e => {
  const mousePos = { x:e.clientX, y:e.clientY };

  for (let shape of shapes) {
    if (Matter.Bounds.contains(shape.bounds, mousePos)) {
      const localPoint = Vector.sub(mousePos, shape.position);

      dragConstraint = Constraint.create({
        pointA: mousePos,
        bodyB: shape,
        pointB: localPoint,
        stiffness: 0.1,
        render: { visible: false }
      });

      World.add(world, dragConstraint);
      break;
    }
  }
});

window.addEventListener('mousemove', e => {
  if (dragConstraint) {
    dragConstraint.pointA = { x:e.clientX, y:e.clientY };
  }
});

window.addEventListener('mouseup', () => {
  if (dragConstraint) {
    World.remove(world, dragConstraint);
    dragConstraint = null;
  }
});

// Sliders gravetat
const gvSlider = document.getElementById('gv');
const ghSlider = document.getElementById('gh');
const gvValue = document.getElementById('gv-value');
const ghValue = document.getElementById('gh-value');

gvSlider.addEventListener('input', () => {
  const val = parseFloat(gvSlider.value);
  engine.world.gravity.y = val;
  gvValue.textContent = val.toFixed(2);
});

ghSlider.addEventListener('input', () => {
  const val = parseFloat(ghSlider.value);
  engine.world.gravity.x = val;
  ghValue.textContent = val.toFixed(2);
});