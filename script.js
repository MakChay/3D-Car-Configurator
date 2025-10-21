class CarConfigurator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.car = null;
        this.currentColor = '#2c3e50';
        this.currentModel = 'sedan';
        this.isRotating = true;
        
        this.init();
        this.setupEventListeners();
        this.setupTheme();
    }

    init() {
        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8f9fa);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(5, 3, 5);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const container = document.getElementById('carViewer');
        container.appendChild(this.renderer.domElement);

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
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 15);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point lights for better car visualization
        const pointLight1 = new THREE.PointLight(0xffffff, 0.5);
        pointLight1.position.set(-10, 10, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
        pointLight2.position.set(10, 5, -10);
        this.scene.add(pointLight2);
    }

    loadCarModel() {
        // Create a realistic car model using high-poly geometry
        this.createRealisticCar();
    }

    createRealisticCar() {
        // Clear existing car
        if (this.car) {
            this.scene.remove(this.car);
        }

        this.car = new THREE.Group();

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