import * as THREE from 'three';
import {
    GltfObjectGeometryByName
} from './ruszUtils.js';
import {
    MeshSurfaceSampler
} from 'three/examples/jsm/math/MeshSurfaceSampler';
//import Stats from 'three/examples/jsm/libs/stats.module';

let width = document.documentElement.clientWidth;
let height = document.documentElement.clientHeight;

let scene, camera, renderer, geometry, material, logo, mainGroup, lastScale, intersectionObserver, isInViewport;

//let stats

let mouse = new THREE.Vector2();
let target = new THREE.Vector3();

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(
    75,
    width / height,
    0.1,
    1000
);
camera.position.z = 2;

renderer = new THREE.WebGLRenderer({
    canvas: hero,
    //antialias: true
});
renderer.setClearColor(0x222222, 0);

renderer.setSize(width, height);
$(renderer.domElement).css("position", "sticky");
$(renderer.domElement).css("top", "0");
$(renderer.domElement.parentElement).css("position", "absolute");
$(renderer.domElement.parentElement).css("left", "0");
$(renderer.domElement.parentElement).css("top", "0");
$(renderer.domElement.parentElement).css("width", "100%");
$(renderer.domElement.parentElement).css("height", "100%");

mainGroup = new THREE.Group();

geometry = await GltfObjectGeometryByName('/assets/js/webgl/models/logo.glb', 'logo');
material = new THREE.MeshLambertMaterial({
    color: 0xC3FA01,
});
logo = new THREE.Mesh(geometry, material);


const sampler = new MeshSurfaceSampler(logo).build();

const spritesNumber = 7000; //I would recommend 5000
const spriteScale = 0.0065;

const spriteMaterial = new THREE.SpriteMaterial({
    color: 0xc3fa01,
    depthTest: false,
    depthWrite: false,
    //sizeAttenuation: true
});

let sprites = []

for (let i = 0; i < spritesNumber; i++) {
    const position = new THREE.Vector3();
    sampler.sample(position);
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.scale.set(spriteScale, spriteScale, 1);
    sprites[i] = sprite
    mainGroup.add(sprite);
}

scene.add(mainGroup)

//--

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    width = document.documentElement.clientWidth;
    height = document.documentElement.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
}

window.addEventListener('mousemove', onMouseMove, false);

function onMouseMove(event) {
    mouse.x = (event.clientX / width) * 2 - 1;
    mouse.y = -(event.clientY / height) * 2 + 1;
}

//--



//--


//stats = Stats();
//document.body.appendChild(stats.dom);

initScrollBasedAnimation();
isPartlyInViewportVertically();

animate();

function animate() {
    requestAnimationFrame(animate);
    render();
}

lastScale = mainGroup.scale.x;

function render() {

    if (isInViewport) {
        if (lastScale !== mainGroup.scale.x) {
            // Calculate inverse scale of mainGroup
            const inverseScale = 1 / mainGroup.scale.x;

            // Apply inverse scale to each sprite's scale
            for (let i = 0; i < sprites.length; i++) {
                sprites[i].scale.set(spriteScale * inverseScale, spriteScale * inverseScale, 1);
            }

            lastScale = mainGroup.scale.x;
        }

        target.x += (mouse.x - target.x) * .05;
        target.y += (mouse.y - target.y) * .05;
        target.z = camera.position.z; // assuming the camera is located at ( 0, 0, z );
        mainGroup.lookAt(target);

        renderer.render(scene, camera);

        //stats.update();
    }

}

function initScrollBasedAnimation() {
    const scrollParams = {
        scaleTo: 20,
    }

    //--

    const scrollScaleTl = gsap.timeline({
        scrollTrigger: {
            trigger: renderer.domElement.parentElement,
            pinSpacing: false,
            scrub: true,
            start: "top top",
            end: "bottom top",
        }
    });

    scrollScaleTl.fromTo(mainGroup.scale, {
        x: 1,
        y: 1,
        z: 1,
    }, {
        x: scrollParams.scaleTo,
        y: scrollParams.scaleTo,
        z: scrollParams.scaleTo,
        ease: "linear",
        duration: 1
    });
}

function isPartlyInViewportVertically() {
    screen = new Set();
    intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
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