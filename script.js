import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import gsap from 'gsap';

class CarConfigurator {
    constructor() {
        // Core components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.mixer = null;
        this.clock = new THREE.Clock();

        // Car state
        this.car = null;
        this.currentColor = '#2c3e50';
        this.currentModel = 'sedan';
        this.currentWheels = 'standard';
        this.currentInterior = 'black';
        this.isRotating = true;
        this.animations = {};
        this.currentViewMode = 'exterior';

        // Loaders
        this.loadingManager = new THREE.LoadingManager();
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        this.dracoLoader = new DRACOLoader();
        this.isLoading = true;
        this.loadingManager = new THREE.LoadingManager();
        this.gltfLoader = new GLTFLoader(this.loadingManager);
        this.dracoLoader = new DRACOLoader();
        this.isLoading = true;
        
        // Initialize loading screen
        this.setupLoadingScreen();
        
        this.init();
        this.setupEventListeners();
        this.setupTheme();
    }

    setupLoadingScreen() {
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-family: 'Inter', sans-serif;
        `;

        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.style.cssText = `
            width: 50px;
            height: 50px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #e74c3c;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        `;

        const loadingText = document.createElement('div');
        loadingText.id = 'loadingText';
        loadingText.textContent = 'Loading Car Model...';
        loadingText.style.cssText = `
            font-size: 1.2rem;
            margin-top: 20px;
        `;

        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            width: 200px;
            height: 4px;
            background: #333;
            margin-top: 10px;
            border-radius: 2px;
        `;

        const progress = document.createElement('div');
        progress.id = 'loadingProgress';
        progress.style.cssText = `
            width: 0%;
            height: 100%;
            background: #e74c3c;
            border-radius: 2px;
            transition: width 0.3s ease;
        `;

        progressBar.appendChild(progress);
        loadingOverlay.appendChild(spinner);
        loadingOverlay.appendChild(loadingText);
        loadingOverlay.appendChild(progressBar);
        document.body.appendChild(loadingOverlay);

        // Add spinner animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        // Setup loading manager
        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            const progress = document.getElementById('loadingProgress');
            if (progress) {
                progress.style.width = (itemsLoaded / itemsTotal * 100) + '%';
            }
        };

        this.loadingManager.onLoad = () => {
            this.isLoading = false;
            setTimeout(() => {
                const overlay = document.getElementById('loadingOverlay');
                if (overlay) {
                    overlay.style.opacity = '0';
                    overlay.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => overlay.remove(), 500);
                }
            }, 500);
        };
    }

    init() {
        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        
        // Set up environment map
        new RGBELoader()
            .load('/assets/environment/studio.hdr', (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                this.scene.environment = texture;
                this.scene.background = new THREE.Color(0xf8f9fa);
            });

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(7, 3, 7);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.physicallyCorrectLights = true;

        const container = document.getElementById('carViewer');
        container.appendChild(this.renderer.domElement);

        // Initialize DRACO loader for compressed models
        this.dracoLoader.setDecoderPath('/draco/');
        this.gltfLoader.setDRACOLoader(this.dracoLoader);

        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Lighting
        this.setupLighting();

        // Load initial car model
        this.loadCarModel();

        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));

        // Start animation loop
        this.animate();
    }

    setupLighting() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);

        // Main key light
        const keyLight = new THREE.DirectionalLight(0xffffff, 3);
        keyLight.position.set(5, 5, 5);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.near = 0.1;
        keyLight.shadow.camera.far = 100;
        keyLight.shadow.camera.left = -10;
        keyLight.shadow.camera.right = 10;
        keyLight.shadow.camera.top = 10;
        keyLight.shadow.camera.bottom = -10;
        keyLight.shadow.bias = -0.001;
        this.scene.add(keyLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 2);
        fillLight.position.set(-5, 3, -5);
        this.scene.add(fillLight);

        // Rim light for car highlights
        const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
        rimLight.position.set(0, 5, -10);
        this.scene.add(rimLight);

        // Ground reflection light
        const groundLight = new THREE.DirectionalLight(0xffffff, 0.5);
        groundLight.position.set(0, -5, 0);
        this.scene.add(groundLight);

        // Create a reflective ground plane
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.5,
            roughness: 0.2,
            envMapIntensity: 1.0
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    async loadCarModel() {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = `Loading ${this.currentModel.toUpperCase()}...`;
        }

        // Clear existing car
        if (this.car) {
            this.scene.remove(this.car);
        }

        const modelPath = `/assets/models/${this.currentModel}.glb`;
        
        try {
            const gltf = await this.gltfLoader.loadAsync(modelPath);
            this.car = gltf.scene;
            
            // Apply materials and setup
            this.car.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Apply materials based on mesh names
                    if (child.name.includes('body')) {
                        child.material = new THREE.MeshPhysicalMaterial({
                            color: this.currentColor,
                            metalness: 0.8,
                            roughness: 0.2,
                            clearcoat: 1.0,
                            clearcoatRoughness: 0.1,
                            envMapIntensity: 1.5
                        });
                    } else if (child.name.includes('glass')) {
                        child.material = new THREE.MeshPhysicalMaterial({
                            color: 0x88ccff,
                            transmission: 0.9,
                            transparent: true,
                            metalness: 0.0,
                            roughness: 0.1,
                            ior: 1.5
                        });
                    } else if (child.name.includes('chrome')) {
                        child.material = new THREE.MeshStandardMaterial({
                            color: 0xffffff,
                            metalness: 1.0,
                            roughness: 0.1,
                            envMapIntensity: 2.0
                        });
                    }
                }
            });

        // Car body with realistic curvature
        const bodyGeometry = this.createCarBodyGeometry();
        const bodyMaterial = new THREE.MeshPhysicalMaterial({
            color: this.currentColor,
            metalness: 0.8,
            roughness: 0.2,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
        carBody.castShadow = true;
        carBody.receiveShadow = true;
        this.car.add(carBody);

        // Windows
        const windowGeometry = this.createWindowGeometry();
        const windowMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            transmission: 0.9,
            transparent: true,
            opacity: 0.3,
            roughness: 0.1,
            metalness: 0.0
        });

        const windows = new THREE.Mesh(windowGeometry, windowMaterial);
        this.car.add(windows);

        // Headlights
        this.createHeadlights();
        
        // Taillights
        this.createTaillights();
        
        // Wheels
        this.createWheels();

        this.scene.add(this.car);
    }

    createCarBodyGeometry() {
        // Create a more realistic car body using multiple geometries
        const bodyGroup = new THREE.Group();

        // Main body
        const mainBody = new THREE.Mesh(
            new THREE.BoxGeometry(4, 1.2, 1.8, 32, 16, 16),
            new THREE.MeshPhysicalMaterial({
                color: this.currentColor,
                metalness: 0.8,
                roughness: 0.2
            })
        );
        mainBody.position.y = 0.6;
        bodyGroup.add(mainBody);

        // Hood with curvature
        const hood = new THREE.Mesh(
            new THREE.SphereGeometry(2, 32, 16, 0, Math.PI, 0, Math.PI / 2),
            new THREE.MeshPhysicalMaterial({
                color: this.currentColor,
                metalness: 0.8,
                roughness: 0.2
            })
        );
        hood.position.set(1, 1.2, 0);
        hood.rotation.x = Math.PI;
        bodyGroup.add(hood);

        // Trunk
        const trunk = new THREE.Mesh(
            new THREE.SphereGeometry(1.8, 32, 16, 0, Math.PI, 0, Math.PI / 2),
            new THREE.MeshPhysicalMaterial({
                color: this.currentColor,
                metalness: 0.8,
                roughness: 0.2
            })
        );
        trunk.position.set(-1.2, 1.2, 0);
        trunk.rotation.x = Math.PI;
        bodyGroup.add(trunk);

        return bodyGroup;
    }

    createWindowGeometry() {
        const windowGroup = new THREE.Group();

        // Windshield
        const windshield = new THREE.Mesh(
            new THREE.PlaneGeometry(1.8, 0.8),
            new THREE.MeshPhysicalMaterial({
                color: 0x88ccff,
                transmission: 0.9,
                transparent: true,
                opacity: 0.3
            })
        );
        windshield.position.set(0.8, 1.4, 0);
        windshield.rotation.x = -Math.PI / 6;
        windowGroup.add(windshield);

        // Rear window
        const rearWindow = new THREE.Mesh(
            new THREE.PlaneGeometry(1.6, 0.6),
            new THREE.MeshPhysicalMaterial({
                color: 0x88ccff,
                transmission: 0.9,
                transparent: true,
                opacity: 0.3
            })
        );
        rearWindow.position.set(-1, 1.4, 0);
        rearWindow.rotation.x = Math.PI / 6;
        windowGroup.add(rearWindow);

        return windowGroup;
    }

    createHeadlights() {
        const headlightGroup = new THREE.Group();

        // Left headlight
        const leftHeadlight = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
            new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                emissive: 0x444444,
                emissiveIntensity: 0.5
            })
        );
        leftHeadlight.position.set(2, 0.8, -0.6);
        leftHeadlight.rotation.z = Math.PI / 2;
        headlightGroup.add(leftHeadlight);

        // Right headlight
        const rightHeadlight = new THREE.Mesh(
            new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16),
            new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                emissive: 0x444444,
                emissiveIntensity: 0.5
            })
        );
        rightHeadlight.position.set(2, 0.8, 0.6);
        rightHeadlight.rotation.z = Math.PI / 2;
        headlightGroup.add(rightHeadlight);

        this.car.add(headlightGroup);
    }

    createTaillights() {
        const taillightGroup = new THREE.Group();

        // Left taillight
        const leftTaillight = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.3, 0.2),
            new THREE.MeshPhysicalMaterial({
                color: 0xff0000,
                emissive: 0x440000,
                emissiveIntensity: 0.8
            })
        );
        leftTaillight.position.set(-2, 0.8, -0.6);
        taillightGroup.add(leftTaillight);

        // Right taillight
        const rightTaillight = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.3, 0.2),
            new THREE.MeshPhysicalMaterial({
                color: 0xff0000,
                emissive: 0x440000,
                emissiveIntensity: 0.8
            })
        );
        rightTaillight.position.set(-2, 0.8, 0.6);
        taillightGroup.add(rightTaillight);

        this.car.add(taillightGroup);
    }

    createWheels() {
        const wheelGroup = new THREE.Group();

        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x333333,
            metalness: 0.7,
            roughness: 0.8
        });

        const wheelPositions = [
            [1.2, 0.4, 0.9],   // Front left
            [1.2, 0.4, -0.9],  // Front right
            [-1.2, 0.4, 0.9],  // Rear left
            [-1.2, 0.4, -0.9]  // Rear right
        ];

        wheelPositions.forEach((position, index) => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(position[0], position[1], position[2]);
            wheel.rotation.z = Math.PI / 2;
            wheelGroup.add(wheel);

            // Wheel rim
            const rimGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.32, 8);
            const rimMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xcccccc,
                metalness: 0.9,
                roughness: 0.2
            });
            const rim = new THREE.Mesh(rimGeometry, rimMaterial);
            rim.rotation.z = Math.PI / 2;
            wheel.add(rim);
        });

        this.car.add(wheelGroup);
    }

    updateCarColor(color) {
        this.currentColor = color;
        this.scene.traverse((child) => {
            if (child.isMesh && child.material && child.material.color) {
                // Only change body color, not windows/lights
                if (!child.material.transparent && child.material.metalness > 0.5) {
                    child.material.color.set(color);
                }
            }
        });
    }

    setupEventListeners() {
        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
                e.target.classList.add('active');
                this.updateCarColor(e.target.dataset.color);
                this.updatePrice();
            });
        });

        // Model selection
        document.querySelectorAll('.model-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.model-option').forEach(opt => opt.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentModel = e.currentTarget.dataset.model;
                this.loadCarModel();
                this.updatePrice();
            });
        });

        // Wheel selection
        document.querySelectorAll('.wheel-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.wheel-option').forEach(opt => opt.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.updatePrice();
            });
        });

        // Interior selection
        document.querySelectorAll('.interior-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.interior-option').forEach(opt => opt.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.updatePrice();
            });
        });

        // Control buttons
        document.getElementById('rotateToggle').addEventListener('click', (e) => {
            this.isRotating = !this.isRotating;
            e.target.classList.toggle('active');
        });

        document.getElementById('resetView').addEventListener('click', () => {
            this.controls.reset();
        });

        // Save configuration
        document.querySelector('.save-config-btn').addEventListener('click', () => {
            this.saveConfiguration();
        });

        // Share configuration
        document.querySelector('.share-config-btn').addEventListener('click', () => {
            this.shareConfiguration();
        });

        // Contact form
        document.getElementById('contactForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactForm(e.target);
        });
    }

    updatePrice() {
        const basePrices = {
            sedan: 420000,
            suv: 550000,
            sports: 680000
        };

        let price = basePrices[this.currentModel] || 450000;

        // Add premium for certain colors
        const premiumColors = ['#e74c3c', '#1abc9c', '#9b59b6'];
        if (premiumColors.includes(this.currentColor)) {
            price += 15000;
        }

        // Format price in South African Rand
        const formattedPrice = 'R ' + price.toLocaleString('en-ZA');
        document.querySelector('.price-amount').textContent = formattedPrice;
    }

    saveConfiguration() {
        const config = {
            model: this.currentModel,
            color: this.currentColor,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('carConfig', JSON.stringify(config));
        
        // Show success message
        this.showNotification('Configuration saved successfully!', 'success');
    }

    shareConfiguration() {
        const configUrl = `${window.location.origin}${window.location.pathname}?config=${btoa(JSON.stringify({
            model: this.currentModel,
            color: this.currentColor
        }))}`;

        navigator.clipboard.writeText(configUrl).then(() => {
            this.showNotification('Configuration link copied to clipboard!', 'success');
        });
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async handleContactForm(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            // Simulate API call
            await this.simulateApiCall(data);
            this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            form.reset();
        } catch (error) {
            this.showNotification('Failed to send message. Please try again.', 'error');
        }
    }

    simulateApiCall(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Contact form data:', data);
                resolve();
            }, 1000);
        });
    }

    setupTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Set initial theme
        if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark)) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        if (this.car && this.isRotating) {
            this.car.rotation.y += 0.005;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Utility functions
function scrollToConfigurator() {
    document.getElementById('configurator').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CarConfigurator();
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);