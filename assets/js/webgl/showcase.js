console.clear();

import * as THREE from "three";
//import Stats from 'three/examples/jsm/libs/stats.module';

let width = document.documentElement.clientWidth;
let height = document.documentElement.clientHeight;

let scene,
  camera,
  renderer,
  geometry,
  material,
  texture,
  frameAlpha,
  mainGroup,
  wrapperGroup,
  intersectionObserver,
  isInViewport;

let planes = [];
let planesZ = -1;
let planesEvenX = -0.5;
let planesOddX = 0.5;

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const textureLoader = new THREE.TextureLoader();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

  renderer = new THREE.WebGLRenderer({
    canvas: showcase,
    antialias: true,
    alpha: true,
  });
  //renderer.setClearColor(0xFFFFFF, 1);
  renderer.setSize(width, height);

  frameAlpha = textureLoader.load(
    "./assets/js/webgl/textures/showcase/FrameAlphaMap.jpg"
  );
  mainGroup = new THREE.Group();

  renderer.domElement.parentElement
    .querySelectorAll("img")
    .forEach((img, index) => {
      //texture must be 1024x1024
      //texture is being resized to 9x16

      geometry = new THREE.PlaneGeometry(1, 1);

      texture = textureLoader.load(img.src);

      material = new THREE.MeshBasicMaterial({
        map: texture,
        alphaMap: frameAlpha,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1, //defaultly hidden
      });
      planes[index] = new THREE.Mesh(geometry, material);

      planes[index].position.z = index * planesZ;
      if (index % 2 == 0) {
        planes[index].position.x = planesEvenX;
      } else {
        planes[index].position.x = planesOddX;
      }

      planes[index].userData.href = img.dataset.href;

      mainGroup.add(planes[index]);
    });

  wrapperGroup = new THREE.Group();
  wrapperGroup.add(mainGroup);
  scene.add(wrapperGroup);

  window.addEventListener("resize", onWindowResize, false);

  function onWindowResize() {
    width = document.documentElement.clientWidth;
    height = document.documentElement.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
  }

  window.addEventListener("mousedown", onWindowMouseDown, false);

  // Handle clicks on cards
  function onWindowMouseDown(event) {
    if (!isInViewport) return;
    event.preventDefault();

    // Check for intersections with the cards
    const intersects = raycaster.intersectObjects(mainGroup.children, true);

    // If an intersection is found, navigate to the specified URL
    if (intersects.length > 0) {
      const href = intersects[0].object.userData.href;
      if (href) {
        //window.location.href = href;
        window.open(href, "_blank");
      }
    }
  }

  renderer.domElement.addEventListener("mousemove", onMouseMove, false);

  function onMouseMove(event) {
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    // Set the raycaster's position and direction based on the mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with the cards
    const intersects = raycaster.intersectObjects(mainGroup.children, true);

    // If an intersection is found, add the pointer class to the canvas
    if (intersects.length > 0) {
      renderer.domElement.style.cursor = "pointer";
    } else {
      renderer.domElement.style.cursor = "auto";
    }
  }

  renderer.domElement.addEventListener("mouseleave", onMouseLeave, false);

  function onMouseLeave(event) {
    renderer.domElement.style.cursor = "pointer";
  }

  //stats = Stats();
  //stats.domElement.style.cssText = 'position:fixed;top:0px;left:80px;';
  //document.body.appendChild(stats.dom);

  initScrollBasedAnimation();
  isPartlyInViewportVertically();

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  if (isInViewport) {
    renderer.render(scene, camera);
    //stats.update();
  }
}

function initScrollBasedAnimation() {
  let visibleAtOnce = 3;
  camera.position.z = 2;
  let screenStop = 75;

  const scrollParams = {
    fromPosZ: planesZ, //First plane
    toPosZ: planes.length * -planesZ, //Last plane
    opacityDuration: 0.5,
    fromBgColor: "#FFFFFF",
    toBgColor: "#C3FA01",
  };

  const scrollPosTl = gsap.timeline({
    scrollTrigger: {
      trigger: renderer.domElement.parentElement,
      pinSpacing: false,
      scrub: true,
      start: "top top",
      end: screenStop + "% top", //so that there is one screen blank
    },
  });

  scrollPosTl.fromTo(
    mainGroup.position,
    {
      z: scrollParams.fromPosZ,
    },
    {
      z: scrollParams.toPosZ,
      ease: "linear",
      duration: 1,
    }
  );

  for (let i = 0; i < planes.length; i++) {
    let start = i * (planes.length + 2) + "% top";
    let end = i * (planes.length + 2) + (i + 3) * visibleAtOnce + "% top";

    let planeTl = gsap.timeline({
      scrollTrigger: {
        trigger: renderer.domElement.parentElement,
        pinSpacing: false,
        scrub: true,
        start: start,
        end: end,
      },
    });

    planeTl.fromTo(
      planes[i].material,
      {
        opacity: 0.0,
      },
      {
        opacity: 1.0,
        ease: "linear",
        duration: 0.33,
      }
    );
  }

  const scrollPosSecTl = gsap.timeline({
    scrollTrigger: {
      trigger: renderer.domElement.parentElement,
      pinSpacing: false,
      scrub: true,
      start: screenStop + "% top",
      end: "bottom top", //so that there is one screen blank
    },
  });

  const positionContinue = (scrollParams.toPosZ / 100) * (100 - screenStop);

  scrollPosSecTl.fromTo(
    mainGroup.position,
    {
      z: scrollParams.toPosZ,
    },
    {
      z: scrollParams.toPosZ + positionContinue,
      ease: "linear",
      duration: 1,
    }
  );

  //--

  const scrollBgTl = gsap.timeline({
    scrollTrigger: {
      trigger: renderer.domElement.parentElement,
      pinSpacing: false,
      scrub: true,
      start: "top top",
      end: screenStop + "% top", //so that there is one screen blank
    },
  });

  scrollBgTl.fromTo(
    renderer.domElement.parentElement,
    {
      backgroundColor: scrollParams.fromBgColor,
    },
    {
      backgroundColor: scrollParams.toBgColor,
      ease: "linear",
      duration: 1,
      delay: 0.75,
    }
  );
}

function isPartlyInViewportVertically() {
  screen = new Set();
  intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        screen.add(entry.target);
        isInViewport = true;
      } else {
        screen.delete(entry.target);
        isInViewport = false;
      }
    });
  });

  intersectionObserver.observe(renderer.domElement);
}

if (document.readyState === "complete") {
  init();
} else {
  window.addEventListener("load", init());
}
