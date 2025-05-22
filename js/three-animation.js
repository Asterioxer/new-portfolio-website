/**
 * Interactive 3D Background Animation
 * Using Three.js to create a responsive, interactive particle system
 * that complements the portfolio design
 */

// Import Three.js and its components
import * as THREE from '../node_modules/three/build/three.module.js';
import { FontLoader } from '../node_modules/three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from '../node_modules/three/examples/jsm/geometries/TextGeometry.js';

// Theme colors from CSS variables
const COLORS = {
    primary: 0x00d9ff,    // #00d9ff
    secondary: 0x6e56cf,  // #6e56cf
    accent: 0xff61d8,     // #ff61d8
    dark: 0x101010        // #101010
};

class ParticleBackground {
    constructor() {
        this.container = document.getElementById('three-bg');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetMouseX = 0;
        this.targetMouseY = 0;
        this.clock = new THREE.Clock();
        
        // Performance settings
        this.isMobile = window.innerWidth < 768;
        this.particleCount = this.isMobile ? 200 : 400; // Increased for better text formation
        this.particleSize = this.isMobile ? 0.15 : 0.2;
        
        // Animation states
        this.animationPhase = 'initial'; // 'initial', 'toText', 'text', 'fromText'
        this.transitionProgress = 0;
        this.transitionDuration = 2.5; // seconds - faster transition for more dynamic effect
        this.textHoldDuration = 3.0; // seconds - reduced hold time
        this.phaseStartTime = 0;
        
        // Original positions and text positions
        this.originalPositions = null;
        this.textPositions = null;
        this.textReady = false;
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        // Scene setup
        this.scene = new THREE.Scene();
        
        // Camera setup
        this.setupCamera();
        
        // Renderer setup
        this.setupRenderer();
        
        // Load font first, then create particles
        this.loadFont();
        
        // Add event listeners
        this.addEventListeners();
        
        // Start animation loop
        this.animate();
        
        // Set initial animation phase
        this.phaseStartTime = this.clock.getElapsedTime();
    }
    
    loadFont() {
        const loader = new FontLoader();
        
        // Start with regular particles while font loads
        this.createParticles();
        
        // Load font and then create text geometry
        loader.load('../node_modules/three/examples/fonts/helvetiker_bold.typeface.json', (font) => {
            this.font = font;
            this.createTextGeometry();
        });
    }
    
    createTextGeometry() {
        const message = "Hello, I'm SOHAM";
        
        // Create text geometry with appropriate size
        const textSize = this.isMobile ? 0.5 : 1;
        const textGeo = new TextGeometry(message, {
            font: this.font,
            size: textSize,
            height: 0.1,
            curveSegments: 4,
            bevelEnabled: false
        });
        
        // Center the text geometry
        textGeo.computeBoundingBox();
        const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
        const textHeight = textGeo.boundingBox.max.y - textGeo.boundingBox.min.y;
        const textDepth = textGeo.boundingBox.max.z - textGeo.boundingBox.min.z;
        
        textGeo.translate(-textWidth / 2, -textHeight / 2, 0);
        
        // Sample points from the text geometry
        const textPoints = this.samplePointsFromGeometry(textGeo, this.particleCount);
        
        // Store text positions
        this.textPositions = new Float32Array(this.particleCount * 3);
        
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            if (i < textPoints.length) {
                const point = textPoints[i];
                this.textPositions[i3] = point.x;
                this.textPositions[i3 + 1] = point.y;
                this.textPositions[i3 + 2] = point.z;
            } else {
                // For any extra particles, position them randomly around the text
                const radius = 3 + Math.random() * 2;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                
                this.textPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
                this.textPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                this.textPositions[i3 + 2] = radius * Math.cos(phi);
            }
        }
        
        this.textReady = true;
    }
    
    samplePointsFromGeometry(geometry, count) {
        // Convert geometry to buffer geometry if it's not already
        const bufferGeometry = geometry.isBufferGeometry 
            ? geometry 
            : new THREE.BufferGeometry().fromGeometry(geometry);
        
        // Get positions attribute
        const positions = bufferGeometry.attributes.position.array;
        const points = [];
        
        // Sample random points from geometry vertices
        for (let i = 0; i < count && i < positions.length / 3; i++) {
            const index = Math.floor(Math.random() * (positions.length / 3)) * 3;
            points.push(new THREE.Vector3(
                positions[index],
                positions[index + 1],
                positions[index + 2]
            ));
        }
        
        return points;
    }
    
    setupCamera() {
        const fov = 75;
        const aspect = this.width / this.height;
        const near = 0.1;
        const far = 1000;
        
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.z = 30;
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true
        });
        
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        this.renderer.setClearColor(0x000000, 0); // Transparent background
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    createParticles() {
        // Remove previous particles if any
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particlesGeometry.dispose();
            this.particlesMaterial.dispose();
        }
        
        // Create geometry
        this.particlesGeometry = new THREE.BufferGeometry();
        
        // Arrays to store particle properties
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);
        const speeds = new Float32Array(this.particleCount);
        const phases = new Float32Array(this.particleCount);
        
        // Color palette
        const colorOptions = [
            new THREE.Color(COLORS.primary),
            new THREE.Color(COLORS.secondary),
            new THREE.Color(COLORS.accent)
        ];
        
        // Generate random particles
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            
            // Position (spread in a 3D space)
            const radius = 20 + Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);  // x
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);  // y
            positions[i3 + 2] = radius * Math.cos(phi);  // z
            
            // Color (pick from palette)
            const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
            
            // Start with very small size for dramatic growth effect
            sizes[i] = this.particleSize * (0.2 + Math.random() * 0.3);
            
            // Animation properties
            speeds[i] = 0.2 + Math.random() * 0.3;
            phases[i] = Math.random() * Math.PI * 2;
            
            // Additional properties for enhanced transitions
            this.particlesGeometry.userData.initialSizes = sizes.slice();
        }
        
        // Store original random positions
        this.originalPositions = positions.slice();
        
        // Set attributes
        this.particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Store animation properties
        this.particlesGeometry.userData = {
            speeds: speeds,
            phases: phases
        };
        
        // Create material
        this.particlesMaterial = new THREE.PointsMaterial({
            size: this.particleSize,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create the particle system
        this.particles = new THREE.Points(this.particlesGeometry, this.particlesMaterial);
        this.scene.add(this.particles);
    }
    
    addEventListeners() {
        // Mouse move event
        window.addEventListener('mousemove', (event) => {
            this.targetMouseX = (event.clientX / this.width - 0.5) * 2;
            this.targetMouseY = (event.clientY / this.height - 0.5) * -2;
        });
        
        // Touch events for mobile
        window.addEventListener('touchmove', (event) => {
            if (event.touches.length > 0) {
                this.targetMouseX = (event.touches[0].clientX / this.width - 0.5) * 2;
                this.targetMouseY = (event.touches[0].clientY / this.height - 0.5) * -2;
            }
        }, { passive: true });
        
        // Reset on touch end
        window.addEventListener('touchend', () => {
            this.targetMouseX = 0;
            this.targetMouseY = 0;
        }, { passive: true });
        
        // Resize event
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    handleResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        
        // Update camera
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        
        // Update renderer
        this.renderer.setSize(this.width, this.height);
        
        // Update particle count based on screen size
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth < 768;
        
        // Only recreate particles if mobile state changed
        if (wasMobile !== this.isMobile) {
            this.particleCount = this.isMobile ? 75 : 150;
            this.particleSize = this.isMobile ? 0.15 : 0.2;
            this.createParticles();
        }
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Smooth out mouse movement
        this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
        this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;
        
        // Get timing information
        const delta = this.clock.getDelta();
        const time = this.clock.getElapsedTime();
        const timeSincePhaseStart = time - this.phaseStartTime;
        
        // Handle animation phases
        this.updateAnimationPhase(time, timeSincePhaseStart);
        
        // Only proceed with particle animation if particles exist
        if (this.particles) {
            // Apply rotation based on mouse movement (only when not in text display phase)
            if (this.animationPhase !== 'text') {
                this.particles.rotation.y += (this.mouseX * 0.3 - this.particles.rotation.y) * 0.05;
                this.particles.rotation.x += (this.mouseY * 0.3 - this.particles.rotation.x) * 0.05;
            } else {
                // Subtle rotation during text phase
                this.particles.rotation.y += 0.001;
                this.particles.rotation.x += 0.0005;
            }
            
            // Animate particles
            const positions = this.particlesGeometry.attributes.position.array;
            const speeds = this.particlesGeometry.userData.speeds;
            const phases = this.particlesGeometry.userData.phases;
            const sizes = this.particlesGeometry.attributes.size.array;
            
            // Animation based on current phase
            if (this.textReady) {
                if (this.animationPhase === 'toText') {
                    // Transition to text formation with dramatic effect
                    const progress = Math.min(1.0, timeSincePhaseStart / this.transitionDuration);
                    
                    // Use different easing functions for more dynamic movement
                    this.transitionProgress = this.easeOutBack(progress);
                    const sizeProgress = this.easeOutElastic(progress);
                    const swirlingStrength = 1.0 - this.easeOutQuart(progress);
                    
                    for (let i = 0; i < this.particleCount; i++) {
                        const i3 = i * 3;
                        
                        // Calculate the direct path to target
                        const targetX = this.textPositions[i3];
                        const targetY = this.textPositions[i3 + 1];
                        const targetZ = this.textPositions[i3 + 2];
                        
                        const startX = this.originalPositions[i3];
                        const startY = this.originalPositions[i3 + 1];
                        const startZ = this.originalPositions[i3 + 2];
                        
                        // Add swirling motion during transition
                        const swirl = swirlingStrength * 2;
                        const swirlingX = Math.sin(time * 2 + phases[i] + i * 0.1) * swirl;
                        const swirlingY = Math.cos(time * 3 + phases[i] + i * 0.05) * swirl;
                        const swirlingZ = Math.sin(time * 1.5 + phases[i]) * swirl;
                        
                        // Converging effect - particles come from further away
                        const distance = Math.sqrt(
                            Math.pow(targetX - startX, 2) + 
                            Math.pow(targetY - startY, 2) + 
                            Math.pow(targetZ - startZ, 2)
                        );
                        
                        // Individual particle timing offset based on distance
                        // This makes further particles start moving earlier 
                        const distanceOffset = Math.min(0.3, distance * 0.01);
                        const individualProgress = Math.min(1.0, (progress + distanceOffset) / (1.0 + distanceOffset));
                        const adjustedProgress = this.easeOutBack(individualProgress);
                        
                        // Interpolate positions with swirling and converging effect
                        positions[i3] = this.lerp(startX, targetX, adjustedProgress) + 
                                        (1.0 - adjustedProgress) * swirlingX;
                        
                        positions[i3 + 1] = this.lerp(startY, targetY, adjustedProgress) + 
                                            (1.0 - adjustedProgress) * swirlingY;
                        
                        positions[i3 + 2] = this.lerp(startZ, targetZ, adjustedProgress) + 
                                            (1.0 - adjustedProgress) * swirlingZ;
                        
                        // Size transition: start small, grow to final size with pulse at the end
                        const initialSize = this.particlesGeometry.userData.initialSizes[i];
                        const targetSize = this.particleSize * (1.2 + 0.5 * Math.sin(time * 2 + phases[i]));
                        
                        // Size pulse when reaching destination
                        const sizePulse = individualProgress > 0.8 ? 
                                          Math.sin((individualProgress - 0.8) * 15) * 0.5 : 0;
                        
                        // Calculate size with dramatic growth and pulse effect
                        sizes[i] = this.lerp(initialSize, targetSize, sizeProgress) * (1 + sizePulse);
                    }
                } 
                else if (this.animationPhase === 'fromText') {
                    // Transition from text back to original positions
                    const progress = Math.min(1.0, timeSincePhaseStart / this.transitionDuration);
                    this.transitionProgress = 1.0 - this.easeInOutCubic(progress);
                    
                    for (let i = 0; i < this.particleCount; i++) {
                        const i3 = i * 3;
                        
                        // Interpolate between text and original positions
                        positions[i3] = this.lerp(
                            this.originalPositions[i3], 
                            this.textPositions[i3], 
                            this.transitionProgress
                        );
                        
                        positions[i3 + 1] = this.lerp(
                            this.originalPositions[i3 + 1], 
                            this.textPositions[i3 + 1], 
                            this.transitionProgress
                        );
                        
                        positions[i3 + 2] = this.lerp(
                            this.originalPositions[i3 + 2], 
                            this.textPositions[i3 + 2], 
                            this.transitionProgress
                        );
                        
                        // Add subtle movement during transition
                        positions[i3] += Math.sin(time * speeds[i] + phases[i]) * 0.02 * progress;
                        positions[i3 + 1] += Math.cos(time * speeds[i] + phases[i]) * 0.02 * progress;
                        
                        // Pulse size
                        sizes[i] = this.particleSize * (0.8 + 0.4 * Math.sin(time * speeds[i] + phases[i]));
                    }
                }
                else if (this.animationPhase === 'text') {
                    // Enhanced subtle movement during text display phase
                    for (let i = 0; i < this.particleCount; i++) {
                        const i3 = i * 3;
                        
                        // Create wave-like rippling effect through the text
                        const rippleSpeed = 1.5;
                        const rippleFreq = 0.5;
                        const positionFactor = (this.textPositions[i3] + this.textPositions[i3 + 1]) * rippleFreq;
                        const ripplePhase = time * rippleSpeed + positionFactor;
                        
                        // Combine individual particle motion with wave effect
                        const waveX = Math.sin(ripplePhase) * 0.015;
                        const waveY = Math.cos(ripplePhase) * 0.015;
                        
                        // Apply enhanced motion
                        positions[i3] = this.textPositions[i3] + waveX + Math.sin(time * 1.5 + phases[i]) * 0.01;
                        positions[i3 + 1] = this.textPositions[i3 + 1] + waveY + Math.cos(time * 1.8 + phases[i]) * 0.01;
                        positions[i3 + 2] = this.textPositions[i3 + 2] + Math.sin(time + phases[i]) * 0.005;
                        
                        // More dynamic pulsing size with coordinated wave pattern
                        const sizeFactor = Math.sin(ripplePhase) * 0.1 + 0.2;
                        sizes[i] = this.particleSize * (1.0 + sizeFactor * Math.sin(time * 1.5 + phases[i]));
                    }
                }
                else {
                    // 'initial' phase or after transition is complete
                    for (let i = 0; i < this.particleCount; i++) {
                        const i3 = i * 3;
                        
                        // Return to free-flowing animation
                        positions[i3 + 1] += Math.sin(time * speeds[i] + phases[i]) * 0.01;
                        
                        // Pulse size
                        sizes[i] = this.particleSize * (0.8 + 0.3 * Math.sin(time * 0.5 + phases[i]));
                    }
                }
            } else {
                // Text not ready yet, just do the regular animation
                for (let i = 0; i < this.particleCount; i++) {
                    const i3 = i * 3;
                    positions[i3 + 1] += Math.sin(time * speeds[i] + phases[i]) * 0.01;
                    sizes[i] = this.particleSize * (0.8 + 0.2 * Math.sin(time * 0.5 + phases[i]));
                }
            }
            
            // Update geometry
            this.particlesGeometry.attributes.position.needsUpdate = true;
            this.particlesGeometry.attributes.size.needsUpdate = true;
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    updateAnimationPhase(time, timeSincePhaseStart) {
        // Only proceed if text positions are ready
        if (!this.textReady) return;
        
        // Initial delay before starting the text formation (reduced for faster start)
        const initialDelay = 1.0; // seconds
        
        switch (this.animationPhase) {
            case 'initial':
                // After initialDelay, transition to text
                if (time > initialDelay) {
                    this.animationPhase = 'toText';
                    this.phaseStartTime = time;
                    console.log('Transitioning to text');
                }
                break;
                
            case 'toText':
                // Once transition is complete, hold the text
                if (timeSincePhaseStart >= this.transitionDuration) {
                    this.animationPhase = 'text';
                    this.phaseStartTime = time;
                    console.log('Displaying text');
                }
                break;
                
            case 'text':
                // After holding period, transition back
                if (timeSincePhaseStart >= this.textHoldDuration) {
                    this.animationPhase = 'fromText';
                    this.phaseStartTime = time;
                    console.log('Transitioning from text');
                }
                break;
                
            case 'fromText':
                // Once transition is complete, return to interactive state
                if (timeSincePhaseStart >= this.transitionDuration) {
                    this.animationPhase = 'initial';
                    this.phaseStartTime = time;
                    console.log('Returned to interactive state');
                    
                    // Show the actual hero content as the animation completes
                    document.querySelector('.hero-content').style.opacity = '1';
                    document.querySelector('.hero-content').style.transform = 'translateY(0)';
                }
                break;
        }
    }
    
    // Helper methods for animation
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    
    // Elastic easing for bouncy effect
    easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
    
    // Back easing for overshoot effect
    easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }
    
    // Quart easing for smooth acceleration/deceleration
    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }
    
    // Clean up method
    dispose() {
        window.removeEventListener('resize', this.handleResize.bind(this));
        window.removeEventListener('mousemove', this.handleMouseMove);
        
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particlesGeometry.dispose();
            this.particlesMaterial.dispose();
        }
        
        this.renderer.dispose();
        
        if (this.container && this.renderer.domElement) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a short moment to ensure the container exists
    setTimeout(() => {
        const background = new ParticleBackground();
        
        // Save reference to window for potential cleanup
        window.particleBackground = background;
        
        // Mark the animation as loaded after a short delay to ensure smooth transition
        setTimeout(() => {
            const threeContainer = document.getElementById('three-bg');
            if (threeContainer) {
                threeContainer.classList.add('loaded');
            }
            
            // Initially hide the hero content to reveal it after animation
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.opacity = '0';
                heroContent.style.transform = 'translateY(20px)';
                heroContent.style.transition = 'opacity 1.5s ease, transform 1.5s ease';
            }
        }, 300);
    }, 100);
});

