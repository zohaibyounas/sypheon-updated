const particleCount = 20000;

const particleSize = 0.2;

const defaultAnimationSpeed = 1,
  morphAnimationSpeed = 18,
  color = "#FFFFFF";

// Triggers
const triggers = document.getElementsByTagName("span");

const scrollIcon = document.querySelector(".scroll-icon");

// Function to handle scroll event
function handleScroll() {
  // Check if the scroll position is greater than a certain threshold
  if (window.scrollY > 100) {
    // Animate the scroll icon to disappear
    gsap.to(scrollIcon, { opacity: 0, duration: 0.3 });
  } else {
    // Animate the scroll icon to appear
    gsap.to(scrollIcon, { opacity: 1, duration: 0.3 });
  }
}

// Add scroll event listener to window
window.addEventListener("scroll", handleScroll);

// Renderer
var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
var container = document.getElementById("hero-sectionbg");

// Prepend the renderer DOM element to make it the first child of the container
container.prepend(renderer.domElement);

// Ensure Full Screen on Resize
function fullScreen() {
  camera.aspect = (window.innerWidth / window.innerHeight) * 2;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
let view = 0;

let lastScrollY = window.scrollY;

window.addEventListener(
  "scroll",
  (event) => {
    event.preventDefault();

    // Check if the scroll position is within the desired section
    const section = document.querySelector(".hero-section");
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    const scrollPosition = window.scrollY;

    if (scrollPosition >= sectionTop && scrollPosition <= sectionBottom) {
      // Inside the desired section, enable zoom effect
      let zoom = camera.zoom;
      let direction = window.scrollY - lastScrollY;
      zoom += direction * 0.01;
      zoom = Math.min(Math.max(1.15, zoom), 80);
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }

    lastScrollY = window.scrollY;
  },
  { passive: false }
);

window.addEventListener("resize", fullScreen, false);

// Scene
var scene = new THREE.Scene();
// scene.background = new THREE.Color("rgba(0, 0, 0, 0)");
// Camera and position
var camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

camera.position.x = -14; // Move the camera to the left
camera.position.y = 32; // Move the camera above
camera.position.z = 60;
// camera.position.x= 20;

// Lighting
var light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

// Orbit Controls
var controls = new THREE.OrbitControls(camera);
controls.noZoom = true;
controls.update();

// Particle Vars
var particles = new THREE.Geometry();

var texts = [];

var pMaterial = new THREE.PointCloudMaterial({
  size: particleSize,
});

// Texts
var loader = new THREE.FontLoader();
var typeface =
  "https://threejs.org/examples/fonts/droid/droid_serif_bold.typeface.json";

loader.load(typeface, (font) => {
  Array.from(triggers).forEach((trigger, idx) => {
    texts[idx] = {};

    texts[idx].geometry = new THREE.TextGeometry(trigger.textContent, {
      font: font,
      size: window.innerWidth * 0.02,
      height: 5,
      curveSegments: 5,
    });

    THREE.GeometryUtils.center(texts[idx].geometry);

    texts[idx].particles = new THREE.Geometry();

    texts[idx].points = THREE.GeometryUtils.randomPointsInGeometry(
      texts[idx].geometry,
      particleCount
    );

    createVertices(texts[idx].particles, texts[idx].points);

    enableTrigger(trigger, idx);
  });
});

// Particles
for (var p = 0; p < particleCount; p++) {
  var vertex = new THREE.Vector3();
  vertex.x = 0;
  vertex.y = 0;
  vertex.z = 0;

  particles.vertices.push(vertex);
}

function createVertices(emptyArray, points) {
  for (var p = 0; p < particleCount; p++) {
    var vertex = new THREE.Vector3();
    vertex.x = points[p]["x"];
    vertex.y = points[p]["y"];
    vertex.z = points[p]["z"];

    emptyArray.vertices.push(vertex);
  }
}

function enableTrigger(trigger, idx) {
  trigger.setAttribute("data-disabled", false);

  trigger.addEventListener("click", () => {
    morphTo(texts[idx].particles, trigger.dataset.color);
  });

  if (idx == 0) {
    morphTo(texts[idx].particles, trigger.dataset.color);
  }
}

var particleSystem = new THREE.PointCloud(particles, pMaterial);

particleSystem.sortParticles = true;

// Add the particles to the scene
scene.add(particleSystem);

// Animate
const normalSpeed = defaultAnimationSpeed / 100,
  fullSpeed = morphAnimationSpeed / 100;

let animationVars = {
  speed: normalSpeed,
  color: color,
  rotation: -45,
};

// Animate
function animate() {
  //   particleSystem.rotation.y += animationVars.speed;
  particles.verticesNeedUpdate = true;

  particleSystem.material.color = new THREE.Color(animationVars.color);

  window.requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();

function morphTo(newParticles, color = "#f3f3f3") {
  console.log(particles);
  TweenMax.to(animationVars, 0.1, {
    ease: Power4.easeIn,
    speed: fullSpeed,
    onComplete: slowDown,
  });

  TweenMax.to(animationVars, 2, {
    ease: Linear.easeNone,
    color: color,
  });

  // Rotate the particle letter
  TweenMax.to(particleSystem.rotation, 2, {
    ease: Elastic.easeOut.config(0.1, 0.3),
    x: Math.PI / 1.1, // Rotate around x-axis
    y: Math.PI / 1, // Rotate around y-axis
    z: Math.PI / 1, // Rotate around z-axis
  });

  for (var i = 0; i < particles.vertices.length; i++) {
    TweenMax.to(particles.vertices[i], 2, {
      ease: Elastic.easeOut.config(0.1, 0.3),
      x: newParticles.vertices[i].x,
      y: newParticles.vertices[i].y,
      z: newParticles.vertices[i].z,
    });
  }

  TweenMax.to(animationVars, 2, {
    ease: Elastic.easeOut.config(0.1, 0.3),
    rotation: animationVars.rotation == 45 ? -45 : 45,
  });
}

function slowDown() {
  TweenMax.to(animationVars, 0.3, {
    ease: Power2.easeOut,
    speed: normalSpeed,
    delay: 0.2,
  });
}
function onMouseMove(event) {
  const mouseX = (event.clientX - window.innerWidth / 2) / 100;
  const mouseY = (event.clientY - window.innerHeight / 2) / 100;

  camera.position.x += (mouseX - camera.position.x) * 0.6;
  camera.position.y += (-mouseY - camera.position.y) * 0.6;
  camera.lookAt(scene.position);
}

window.addEventListener("mousemove", onMouseMove, false);
