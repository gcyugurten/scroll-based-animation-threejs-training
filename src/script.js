import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

gui
    .addColor(parameters, 'materialColor')
    .onChange(() => {
        material.color.set(parameters.materialColor)
    })

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


// Texture
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

/**
 * objects
 */
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)
scene.add(mesh1, mesh2, mesh3)


const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)


const distance = 4
mesh1.position.y = -distance * 0
mesh1.position.x = 2

mesh2.position.y = -distance * 1
mesh2.position.x = -2

mesh3.position.y = -distance * 2
mesh3.position.x = 2




/**
 * particles
 */
const count = 200
const geometry = new THREE.BufferGeometry()
const positions = new Float32Array(count * 3)
for(let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * 10
    positions[i3 + 1] = distance * 0.5 -  Math.random() * distance * 3
    positions[i3 + 2] = (Math.random() - 0.5) * 10
}
geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: '#eeeeee'
})

const particles = new THREE.Points(geometry, particlesMaterial)
scene.add(particles)


/**
 * cursor
 */
let cursor = {
    x: 0,
    y: 0
}
window.addEventListener('mousemove', (e) => {
    cursor.x = (e.clientX / sizes.width) - 0.5
    cursor.y = (e.clientY / sizes.height) - 0.5

})



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
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

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)
/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * scroll
 */

const objects = [mesh1, mesh2, mesh3]

let scrollY = window.scrollY
let currSection = 0, objectsAnimated = false

window.addEventListener('scroll', () => {
    scrollY = window.scrollY 

    const newSection = Math.round(scrollY / sizes.height)
    
    if(newSection != currSection) {
        currSection = newSection
        objectsAnimated = true

        const animationPromise = new Promise((resolve) => {
            resolve()
        })
        animationPromise.then(() => {
            // console.log(true)
            gsap.to(
                objects[currSection].rotation, 
                {
                    duration: 1.5,
                    ease: 'power2.inOut',
                    x: '+=6',
                    y: '+=3'
                }
            )
        }).then(() => {
            // console.log("awdiii")
            setTimeout(() => {
                objectsAnimated = false

            }, 1501)
        })
        

    }

})


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    if(!objectsAnimated) {
        for(const mesh of objects) {
            mesh.rotation.x = elapsedTime * 0.1
            mesh.rotation.y = elapsedTime * 0.12

        }
    }


    camera.position.y = -(scrollY / sizes.height) * distance

    const parallaxX = cursor.x 
    const parallaxY = cursor.y

    cameraGroup.position.x = parallaxX 
    cameraGroup.position.y = -parallaxY 



    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()