// Debug
//const gui = new dat.GUI()
const map = new THREE.TextureLoader().load( 'http://localhost/Meta/src/img/metalogo.png' );

// Canvas
const canvas = document.querySelector('#canvas');
canvas.setAttribute("style", "background:#fff");

// Scene
const scene = new THREE.Scene();
scene.background = 0xfff;

// Objects
//const geometry = new THREE.TorusKnotGeometry(.5, .2, 100, 16, 1, 2);
const geometry = new THREE.SphereGeometry(.5, 100, 100);

// Materials
const material = new THREE.MeshPhongMaterial({
    transparent: true,
    alpha:10,
    color:0x363e66,
});

// Mesh
const sphere = new THREE.Mesh(geometry,material)
scene.add(sphere)

// Lights

const pointLight = new THREE.PointLight(0xffffff, 0.1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

/**
 * Sizes
 */
const sizes = {
    width: 200,//window.innerWidth,
    height: 200//window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    background:0xfff
})
renderer.setSize(sizes.width, sizes.height)
//renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.x = .5 * elapsedTime;
    sphere.rotation.y = .5 * elapsedTime;
    sphere.rotation.z = .5 * elapsedTime;

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)
    //renderer.setClearAlpha(1)
    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
    scene.visible = true;
    scene.background = new THREE.Color("white");
    
}

//tick()