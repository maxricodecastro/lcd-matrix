import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import {
    getCrestaPixelData,
    setCurrentCrestaTheme,
    setCurrentCrestaBackground,
    crestaThemes, // Import the themes array
    crestaBackgrounds, // Import the backgrounds array
    currentCrestaThemeIndex as initialCrestaThemeIndex,
    currentCrestaBgIndex as initialCrestaBgIndex
} from './cresta-patterns.js';

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Get the display case element
const displayCase = document.getElementById('display-case');

// Create camera
// const camera = new THREE.PerspectiveCamera(75, displayCase.clientWidth / displayCase.clientHeight, 0.1, 1000);
// camera.position.z = 15; // Will be defined after canvas is sized

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(displayCase.clientWidth, displayCase.clientHeight); // Old way
displayCase.appendChild(renderer.domElement); // Append to the new display-case div FIRST

// Get actual styled dimensions of the canvas element
const canvasActualWidth = renderer.domElement.clientWidth;
const canvasActualHeight = renderer.domElement.clientHeight;

// Now set up camera and renderer size with the actual canvas dimensions
const camera = new THREE.PerspectiveCamera(75, canvasActualWidth / canvasActualHeight, 0.1, 1000);
// camera.position.z = 15; // Old position, too far
camera.position.z = 4.0; // Adjusted from 5.000 to accommodate higher resolution grid

renderer.setSize(canvasActualWidth, canvasActualHeight); // Set drawing buffer to match styled canvas size

// Grid constants
const COLS = 96;
const ROWS = 48;
const SPACING = 0.167;

// Create grid of points
const geometry = new THREE.BufferGeometry();
const positions = [];
const colors = [];

for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
        positions.push((x - COLS/2) * SPACING, (ROWS/2 - y) * SPACING, 0);
        colors.push(0.0, 0.0, 0.0); // Initial color black
    }
}

geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

// Create points material
const material = new THREE.PointsMaterial({
    size: 0.12,  // Reduced size for crisper points
    vertexColors: true,
    sizeAttenuation: true,
    alphaTest: 0.99,  // Increased alpha test for sharper edges
    transparent: true,
    blending: THREE.AdditiveBlending,  // Add blending for brighter, more distinct points
});

// Create points system
const points = new THREE.Points(geometry, material);
scene.add(points);

// Main animation loop
function animate(time) {
    requestAnimationFrame(animate);
    const t = time * 0.001;
    const colorsArray = points.geometry.attributes.color.array;

    for (let i = 0; i < ROWS * COLS; i++) {
        const x = i % COLS;
        const y = Math.floor(i / COLS);
        // Directly call getCrestaPixelData as it's the only pattern
        const [r, g, b] = getCrestaPixelData(t, x, y, COLS, ROWS);
        colorsArray[i * 3] = r;
        colorsArray[i * 3 + 1] = g;
        colorsArray[i * 3 + 2] = b;
    }
    points.geometry.attributes.color.needsUpdate = true;
    renderer.render(scene, camera);
}

// Handle window resize (or rather, display case resize, if it were dynamic)
window.addEventListener('resize', () => {
    // Update camera aspect ratio and renderer size based on the displayCase dimensions
    if (displayCase && renderer.domElement) {
        const newCanvasWidth = renderer.domElement.clientWidth;
        const newCanvasHeight = renderer.domElement.clientHeight;

        camera.aspect = newCanvasWidth / newCanvasHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newCanvasWidth, newCanvasHeight);
    }
});

// DOM Elements for Cresta controls
const crestaThemeControls = document.getElementById('cresta-theme-controls');
const crestaBgControls = document.getElementById('cresta-background-controls');

// Audio Manager for handling multiple sound instances
class AudioManager {
    constructor(audioPath, poolSize = 5) {
        this.audioPool = Array.from({ length: poolSize }, () => {
            const audio = new Audio(audioPath);
            audio.preload = 'auto';
            return audio;
        });
        this.currentIndex = 0;
    }

    play() {
        const audio = this.audioPool[this.currentIndex];
        audio.currentTime = 0; // Reset the audio to start
        audio.play();
        this.currentIndex = (this.currentIndex + 1) % this.audioPool.length;
    }
}

// Create audio manager instance
const buttonClickSound = new AudioManager('ClickEffect.mp3');

// Function to dynamically create buttons
function createButtons(container, items, dataAttribute, clickHandler, initialActiveIndex) {
    container.innerHTML = ''; // Clear existing buttons
    items.forEach((item, index) => {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        
        const label = document.createElement('div');
        label.className = 'button-label';
        label.textContent = item.name;
        
        const button = document.createElement('button');
        button.dataset[dataAttribute] = index;
        if (index === initialActiveIndex) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            buttonClickSound.play(); // Play click sound
            container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
            button.classList.add('active');
            clickHandler(index);
        });
        
        buttonContainer.appendChild(label);
        buttonContainer.appendChild(button);
        container.appendChild(buttonContainer);
    });
}

// Populate Cresta Theme Buttons
createButtons(crestaThemeControls, crestaThemes, 'crestaTheme', setCurrentCrestaTheme, initialCrestaThemeIndex);

// Populate Cresta Background Buttons
createButtons(crestaBgControls, crestaBackgrounds, 'crestaBg', setCurrentCrestaBackground, initialCrestaBgIndex);

// Start animation
animate(0);
