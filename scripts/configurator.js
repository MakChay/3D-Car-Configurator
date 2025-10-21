import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export class CarConfigurator {
    constructor(options = {}) {
        this.options = options;
        this.fallback = !!options.fallback;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.carModel = null;
        this.environment = null;
        this.materials = {};
        // render-on-demand flag
        this.needsRender = true;
        
        // Enhanced configuration state
        this.configuration = {
            model: 'sports-car',
            color: '#1a1a1a',
            finish: 'gloss',
            interior: {
                material: 'leather-black',
                trim: 'carbon'
            },
            wheels: {
                design: 'aero',
                calipers: 'black',
                tires: 'summer'
            },
            features: {
                'spoiler': true,
                'sport-exhaust': false,
                'suspension': true,
                'premium-sound': true,
                'sunroof': false,
                'led-lights': true
            },
            basePrice: 185000,
            optionsTotal: 12500,
            totalPrice: 197500
        };
        
        // Enhanced car models data
        this.carModels = {
            'sports-car': {
                name: 'Hyper Sport',
                description: '0-100 km/h in 2.9s • Top speed 350 km/h',
                basePrice: 185000,
                specs: {
                    acceleration: '2.9s',
                    topSpeed: '350 km/h',
                    power: '650 HP',
                    torque: '800 Nm'
                }
            },
            'sedan': {
                name: 'GT Sedan',
                description: 'Executive luxury with premium comfort and technology',
                basePrice: 95000,
                specs: {
                    acceleration: '4.2s',
                    topSpeed: '280 km/h',
                    power: '450 HP',
                    torque: '600 Nm'
                }
            },
            'suv': {
                name: 'Urban SUV',
                description: 'Spacious and versatile with premium features',
                basePrice: 75000,
                specs: {
                    acceleration: '5.8s',
                    topSpeed: '240 km/h',
                    power: '380 HP',
                    torque: '550 Nm'
                }
            },
            'truck': {
                name: 'Adventure 4x4',
                description: 'Rugged capability with modern comfort',
                basePrice: 65000,
                specs: {
                    acceleration: '7.2s',
                    topSpeed: '200 km/h',
                    power: '320 HP',
                    torque: '700 Nm'
                }
            }
        };
        
        // Enhanced option prices
        this.optionPrices = {
            color: {
                '#1a1a1a': 0,
                '#dc2626': 1200,
                '#2563eb': 1200,
                '#f59e0b': 2500,
                '#ffffff': 800,
                '#6b7280': 900
            },
            finish: {
                'gloss': 0,
                'matte': 3500,
                'metallic': 2200,
                'chrome': 5000
            },
            interior: {
                'leather-black': 0,
                'leather-brown': 3500,
                'leather-beige': 2800,
                'alcantara': 4200
            },
            trim: {
                'carbon': 0,
                'wood': 2800,
                'aluminum': 1800,
                'titanium': 5500
            },
            wheels: {
                'aero': 0,
                'sport': 2500,
                'premium': 4800,
                'racing': 7200
            },
            calipers: {
                'black': 0,
                'red': 1200,
                'yellow': 1200,
                'blue': 1200
            },
            tires: {
                'summer': 0,
                'performance': 1800,
                'track': 3200
            },
            features: {
                'spoiler': 4500,
                'sport-exhaust': 3200,
                'suspension': 5800,
                'premium-sound': 4200,
                'sunroof': 2800,
                'led-lights': 2200
            }
        };

        this.init();
    }

    async init() {
        try {
            console.log('Initializing configurator...');
            this.createScene();
            console.log('Scene created');
            this.setupLighting();
            console.log('Lighting setup complete');
            this.setupControls();
            console.log('Controls setup complete');
            this.setupEventListeners();
            console.log('Event listeners setup complete');
            await this.loadCarModel();
            console.log('Car model loaded');
            this.hideLoading();
            console.log('Loading screen hidden');
            this.updatePriceDisplay();
            console.log('Price display updated');
            // Start render loop (render-on-demand)
            this.startRenderLoop();
            this.requestRender();
        } catch (error) {
            console.error('Failed to initialize configurator:', error);
            this.showError('Failed to load car configurator. Please refresh the page.');
        }
    }

    createScene() {
        // Create scene with better environment
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0f172a);
        
        // Load HDR environment map (skip if fallback)
        if (this.fallback) {
            console.log('Fallback mode: using simple environment map');
            this.scene.environment = this.createSimpleEnvironmentMap();
        } else {
            try {
                const rgbeLoader = new RGBELoader();
                rgbeLoader.setDataType(THREE.UnsignedByteType);
                rgbeLoader.load('assets/env/environment.hdr', (texture) => {
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    // Use PMREMGenerator if renderer is ready
                    try {
                        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
                        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                        this.scene.environment = envMap;
                        pmremGenerator.dispose();
                    } catch (pmremError) {
                        console.warn('PMREM failed, falling back to equirectangular texture', pmremError);
                        this.scene.environment = texture;
                    }
                }, undefined, (err) => {
                    console.warn('Failed to load HDR, using simple environment', err);
                    this.scene.environment = this.createSimpleEnvironmentMap();
                });
            } catch (e) {
                console.warn('RGBELoader not available or failed, using simple environment', e);
                this.scene.environment = this.createSimpleEnvironmentMap();
            }
        }
        
        // Create camera with better settings
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        this.camera.position.set(6, 3, 10);
        
        // Create advanced renderer with error handling
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('webgl2', {
                alpha: true,
                antialias: true,
                powerPreference: "high-performance",
                failIfMajorPerformanceCaveat: false
            }) || canvas.getContext('webgl', {
                alpha: true,
                antialias: true,
                powerPreference: "high-performance",
                failIfMajorPerformanceCaveat: false
            });

            if (!context) {
                throw new Error('WebGL not supported');
            }

            this.renderer = new THREE.WebGLRenderer({ 
                canvas: canvas,
                context: context,
                antialias: true,
                alpha: true,
                powerPreference: "high-performance"
            });
            
            this.renderer.setSize(800, 500);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            this.renderer.outputEncoding = THREE.sRGBEncoding;
            this.renderer.physicallyCorrectLights = true;
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.2;
        } catch (error) {
            console.error('Error creating WebGL renderer:', error);
            throw new Error('Failed to initialize WebGL renderer');
        }
        
        const viewer = document.getElementById('viewer');
        viewer.innerHTML = '';
        viewer.appendChild(this.renderer.domElement);
        
        this.onWindowResize();
    }

    createSimpleEnvironmentMap() {
        // Create a simple environment map without PMREMGenerator
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');
        
        // Create gradient background
        const gradient = context.createLinearGradient(0, 0, 256, 256);
        gradient.addColorStop(0, '#1e293b');
        gradient.addColorStop(1, '#0f172a');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 256, 256);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        return texture;
    }

    setupLighting() {
        // Enhanced studio lighting setup
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Key light - main illumination
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(10, 15, 8);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 2048;
        keyLight.shadow.mapSize.height = 2048;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 50;
        keyLight.shadow.camera.left = -20;
        keyLight.shadow.camera.right = 20;
        keyLight.shadow.camera.top = 20;
        keyLight.shadow.camera.bottom = -20;
        this.scene.add(keyLight);
        
        // Fill light - soft illumination from opposite side
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
        fillLight.position.set(-8, 10, -6);
        this.scene.add(fillLight);
        
        // Rim light - backlight for edge definition
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
        rimLight.position.set(-5, 8, -12);
        this.scene.add(rimLight);
        
        // Ground light - bounce light from floor
        const groundLight = new THREE.DirectionalLight(0x404080, 0.3);
        groundLight.position.set(0, -10, 0);
        this.scene.add(groundLight);

        this.createEnhancedEnvironment();
    }

    createEnhancedEnvironment() {
        // Reflective floor for better car presentation
        const floorGeometry = new THREE.PlaneGeometry(40, 40);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.1,
            metalness: 0.9
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Enhanced grid helper
        const gridHelper = new THREE.GridHelper(40, 40, 0x444444, 0x222222);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
        
        // Background elements for visual interest
        this.createBackgroundElements();
    }

    createBackgroundElements() {
        // Add some subtle background elements for visual appeal
        const backgroundGroup = new THREE.Group();
        
        // Create some abstract shapes in the background
        for (let i = 0; i < 5; i++) {
            const geometry = new THREE.BoxGeometry(2, 0.5, 0.2);
            const material = new THREE.MeshBasicMaterial({
                color: 0x334155,
                transparent: true,
                opacity: 0.1
            });
            const box = new THREE.Mesh(geometry, material);
            box.position.set(
                (Math.random() - 0.5) * 30,
                0.5,
                -15 - Math.random() * 10
            );
            box.rotation.y = Math.random() * Math.PI;
            backgroundGroup.add(box);
        }
        
        this.scene.add(backgroundGroup);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.8;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.enablePan = false;
        // request render when controls change
        this.controls.addEventListener('change', () => this.requestRender());
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Model selection
        document.querySelectorAll('.model-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const model = e.currentTarget.dataset.model;
                this.selectModel(model);
            });
        });
        
        // Configuration steps
        document.querySelectorAll('.step').forEach(step => {
            step.addEventListener('click', (e) => {
                const stepName = e.currentTarget.dataset.step;
                this.showConfigurationStep(stepName);
            });
        });
        
        // Color selection
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.currentTarget.dataset.color;
                this.selectColor(color);
            });
        });
        
        // Finish selection
        document.querySelectorAll('.finish-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const finish = e.currentTarget.dataset.finish;
                this.selectFinish(finish);
            });
        });
        
        // Interior material selection
        document.querySelectorAll('.material-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const material = e.currentTarget.dataset.material;
                this.selectInteriorMaterial(material);
            });
        });
        
        // Trim selection
        document.querySelectorAll('.trim-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const trim = e.currentTarget.dataset.trim;
                this.selectTrim(trim);
            });
        });
        
        // Wheel selection
        document.querySelectorAll('.wheel-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const wheels = e.currentTarget.dataset.wheels;
                this.selectWheels(wheels);
            });
        });
        
        // Caliper selection
        document.querySelectorAll('.caliper-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const calipers = e.currentTarget.dataset.calipers;
                this.selectCalipers(calipers);
            });
        });
        
        // Tire selection
        document.querySelectorAll('.tire-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const tires = e.currentTarget.dataset.tires;
                this.selectTires(tires);
            });
        });
        
        // Feature toggles
        document.querySelectorAll('.feature-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const feature = e.currentTarget.dataset.feature;
                this.toggleFeature(feature);
            });
        });
        
        // Viewer controls
        document.getElementById('rotate-toggle').addEventListener('click', () => {
            this.toggleAutoRotate();
        });
        
        document.getElementById('reset-view').addEventListener('click', () => {
            this.resetView();
        });
        
        document.getElementById('toggle-lights').addEventListener('click', () => {
            this.toggleHeadlights();
        });
        
        // Camera presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.setCameraView(view);
            });
        });
        
        // Action buttons
        document.getElementById('save-config').addEventListener('click', () => {
            this.saveConfiguration();
        });
        
        document.getElementById('share-config').addEventListener('click', () => {
            this.shareConfiguration();
        });
        
        document.getElementById('contact-dealer').addEventListener('click', () => {
            this.contactDealer();
        });
    }

    async loadCarModel() {
        this.showLoading();
        const loadingStatus = document.getElementById('loading-status');
        
        try {
            if (loadingStatus) {
                loadingStatus.textContent = 'Creating car model...';
            }
            
            // Create enhanced car model with better geometry
            await this.createEnhancedCarModel();
            
            if (loadingStatus) {
                loadingStatus.textContent = 'Finalizing setup...';
            }
            
            // Short delay to ensure everything is rendered
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (!this.carModel || !this.scene) {
                throw new Error('Car model or scene not properly initialized');
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('Error loading car model:', error);
            this.showError('Failed to load car model. Please try again.');
            if (loadingStatus) {
                loadingStatus.textContent = 'Error: ' + error.message;
            }
        }
    }

    showError(message) {
        console.error(message);
        const errorOverlay = document.getElementById('error-overlay');
        const errorMessage = document.getElementById('error-message');
        if (errorOverlay && errorMessage) {
            errorMessage.textContent = message;
            errorOverlay.style.display = 'flex';
            this.hideLoading();
        }
    }

    createEnhancedCarModel() {
        console.log('Creating car model...');
        if (this.carModel) {
            // dispose previous model
            this.scene.remove(this.carModel);
            this.disposeObject(this.carModel);
        }
        
        this.carModel = new THREE.Group();
        this.carModel.name = 'car';
        
        // Create main car body with better geometry
        const bodyGroup = this.createCarBody();
        this.carModel.add(bodyGroup);
        
        // Add detailed wheels
        const wheelPositions = [
            [-1.2, -0.4, 2.5],
            [1.2, -0.4, 2.5],
            [-1.2, -0.4, -2.5],
            [1.2, -0.4, -2.5]
        ];
        
        wheelPositions.forEach((position, index) => {
            const wheel = this.createDetailedWheel();
            wheel.position.set(position[0], position[1], position[2]);
            this.carModel.add(wheel);
        });
        
        // Add spoiler if selected
        if (this.configuration.features.spoiler) {
            const spoiler = this.createSpoiler();
            this.carModel.add(spoiler);
        }
        
        this.scene.add(this.carModel);
        // apply basic PBR tweaks to body material if present
        if (this.materials.body) {
            this.applyPBR(this.materials.body, { envMapIntensity: 1.0 });
        }
        // request a render for the new model
        this.requestRender();
    }

    createCarBody() {
        const bodyGroup = new THREE.Group();
        
        // Main body - more detailed geometry
        const bodyGeometry = new THREE.BoxGeometry(4.2, 1.4, 8.5, 8, 6, 16);
        this.materials.body = new THREE.MeshStandardMaterial({
            color: new THREE.Color(this.configuration.color),
            roughness: this.getRoughnessForFinish(this.configuration.finish),
            metalness: this.getMetalnessForFinish(this.configuration.finish)
        });
        
        const body = new THREE.Mesh(bodyGeometry, this.materials.body);
        body.castShadow = true;
        body.receiveShadow = true;
        bodyGroup.add(body);
        
        // Windshield
        const windshieldGeometry = new THREE.BoxGeometry(3.8, 0.8, 2.5);
        const windshieldMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x88ccff,
            transmission: 0.9,
            transparent: true,
            opacity: 0.3,
            roughness: 0.1,
            metalness: 0,
            clearcoat: 1,
            clearcoatRoughness: 0.1
        });
        const windshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
        windshield.position.set(0, 1.1, 1.2);
        windshield.castShadow = true;
        bodyGroup.add(windshield);
        
        // Windows
        const sideWindowGeometry = new THREE.BoxGeometry(1.5, 0.6, 3);
        const sideWindowMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x334455,
            transmission: 0.8,
            transparent: true,
            opacity: 0.2,
            roughness: 0.1
        });
        
        const leftWindow = new THREE.Mesh(sideWindowGeometry, sideWindowMaterial);
        leftWindow.position.set(-1.8, 1.0, 0);
        bodyGroup.add(leftWindow);
        
        const rightWindow = new THREE.Mesh(sideWindowGeometry, sideWindowMaterial);
        rightWindow.position.set(1.8, 1.0, 0);
        bodyGroup.add(rightWindow);
        
        // Headlights
        const headlightGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const headlightMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffcc,
            emissive: 0xffff99,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.9
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-1.0, 0.6, 3.8);
        leftHeadlight.scale.set(1, 0.5, 0.3);
        bodyGroup.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(1.0, 0.6, 3.8);
        rightHeadlight.scale.set(1, 0.5, 0.3);
        bodyGroup.add(rightHeadlight);
        
        // Taillights
        const taillightGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.2);
        const taillightMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff3333,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        
        const leftTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        leftTaillight.position.set(-1.2, 0.6, -3.8);
        bodyGroup.add(leftTaillight);
        
        const rightTaillight = new THREE.Mesh(taillightGeometry, taillightMaterial);
        rightTaillight.position.set(1.2, 0.6, -3.8);
        bodyGroup.add(rightTaillight);
        
        return bodyGroup;
    }

    createDetailedWheel() {
        const wheelGroup = new THREE.Group();
        
        // Tire with better geometry
        const tireGeometry = new THREE.CylinderGeometry(0.55, 0.55, 0.35, 16);
        const tireMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.8,
            metalness: 0.1
        });
        const tire = new THREE.Mesh(tireGeometry, tireMaterial);
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        wheelGroup.add(tire);
        
        // Rim with detailed design
        const rimGeometry = new THREE.CylinderGeometry(0.42, 0.42, 0.36, 12);
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.2,
            metalness: 0.8
        });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.z = Math.PI / 2;
        rim.castShadow = true;
        wheelGroup.add(rim);
        
        // Wheel spokes
        const spokeGeometry = new THREE.BoxGeometry(0.3, 0.08, 0.08);
        const spokeMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.3,
            metalness: 0.9
        });
        
        for (let i = 0; i < 6; i++) {
            const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
            spoke.rotation.z = (i * Math.PI) / 3;
            spoke.position.y = 0.02;
            wheelGroup.add(spoke);
        }
        
        // Center cap
        const capGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 8);
        const capMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.4,
            metalness: 0.6
        });
        const cap = new THREE.Mesh(capGeometry, capMaterial);
        cap.rotation.z = Math.PI / 2;
        wheelGroup.add(cap);
        
        return wheelGroup;
    }

    createSpoiler() {
        const spoilerGroup = new THREE.Group();
        
        // Main spoiler wing
        const wingGeometry = new THREE.BoxGeometry(3.5, 0.1, 0.8);
        const wingMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.7
        });
        const wing = new THREE.Mesh(wingGeometry, wingMaterial);
        wing.position.set(0, 1.8, -3.5);
        spoilerGroup.add(wing);
        
        // Supports
        const supportGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.1);
        const leftSupport = new THREE.Mesh(supportGeometry, wingMaterial);
        leftSupport.position.set(-1.5, 1.5, -3.5);
        spoilerGroup.add(leftSupport);
        
        const rightSupport = new THREE.Mesh(supportGeometry, wingMaterial);
        rightSupport.position.set(1.5, 1.5, -3.5);
        spoilerGroup.add(rightSupport);
        
        return spoilerGroup;
    }

    // Configuration methods
    selectModel(model) {
        this.configuration.model = model;
        this.configuration.basePrice = this.carModels[model].basePrice;
        
        // Update UI
        document.querySelectorAll('.model-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-model="${model}"]`).classList.add('active');
        
        document.getElementById('current-model').textContent = this.carModels[model].name;
        document.getElementById('model-description').textContent = this.carModels[model].description;
        
        this.updatePriceDisplay();
        this.loadCarModel();
    }

    selectColor(color) {
        this.configuration.color = color;
        
        // Update UI
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-color="${color}"]`).classList.add('active');
        
        // Update 3D model
        if (this.materials.body) {
            this.materials.body.color.set(color);
        }
        
        this.updatePriceDisplay();
    }

    selectFinish(finish) {
        this.configuration.finish = finish;
        
        // Update UI
        document.querySelectorAll('.finish-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-finish="${finish}"]`).classList.add('active');
        
        // Update 3D model
        if (this.materials.body) {
            this.materials.body.roughness = this.getRoughnessForFinish(finish);
            this.materials.body.metalness = this.getMetalnessForFinish(finish);
        }
        
        this.updatePriceDisplay();
    }

    selectInteriorMaterial(material) {
        this.configuration.interior.material = material;
        
        // Update UI
        document.querySelectorAll('.material-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-material="${material}"]`).classList.add('active');
        
        this.updatePriceDisplay();
    }

    selectTrim(trim) {
        this.configuration.interior.trim = trim;
        
        // Update UI
        document.querySelectorAll('.trim-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-trim="${trim}"]`).classList.add('active');
        
        this.updatePriceDisplay();
    }

    selectWheels(wheels) {
        this.configuration.wheels.design = wheels;
        
        // Update UI
        document.querySelectorAll('.wheel-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-wheels="${wheels}"]`).classList.add('active');
        
        this.updatePriceDisplay();
    }

    selectCalipers(calipers) {
        this.configuration.wheels.calipers = calipers;
        
        // Update UI
        document.querySelectorAll('.caliper-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-calipers="${calipers}"]`).classList.add('active');
        
        this.updatePriceDisplay();
    }

    selectTires(tires) {
        this.configuration.wheels.tires = tires;
        
        // Update UI
        document.querySelectorAll('.tire-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-tires="${tires}"]`).classList.add('active');
        
        this.updatePriceDisplay();
    }

    toggleFeature(feature) {
        this.configuration.features[feature] = !this.configuration.features[feature];
        
        // Update UI
        const option = document.querySelector(`[data-feature="${feature}"]`);
        option.classList.toggle('active');
        
        // Update 3D model for visual features
        if (feature === 'spoiler') {
            this.toggleSpoiler(this.configuration.features[feature]);
        }
        
        this.updatePriceDisplay();
    }

    toggleSpoiler(visible) {
        // Remove existing spoiler
        const existingSpoiler = this.carModel.getObjectByName('spoiler');
        if (existingSpoiler) {
            this.carModel.remove(existingSpoiler);
        }
        
        // Add spoiler if enabled
        if (visible) {
            const spoiler = this.createSpoiler();
            spoiler.name = 'spoiler';
            this.carModel.add(spoiler);
        }
    }

    toggleHeadlights() {
        // Toggle headlight emissive intensity
        const headlights = this.carModel.children.flatMap(child => 
            child.children.filter(obj => obj.material && obj.material.emissive)
        );
        
        headlights.forEach(light => {
            light.material.emissiveIntensity = light.material.emissiveIntensity > 0 ? 0 : 0.5;
        });
        
        const btn = document.getElementById('toggle-lights');
        btn.classList.toggle('active', headlights[0]?.material.emissiveIntensity > 0);
    }

    showConfigurationStep(step) {
        // Update steps
        document.querySelectorAll('.step').forEach(s => {
            s.classList.remove('active');
        });
        document.querySelector(`[data-step="${step}"]`).classList.add('active');
        
        // Show corresponding section
        document.querySelectorAll('.config-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${step}-section`).classList.add('active');
    }

    // Price calculation
    calculateOptionsTotal() {
        let total = 0;
        
        // Color
        total += this.optionPrices.color[this.configuration.color];
        
        // Finish
        total += this.optionPrices.finish[this.configuration.finish];
        
        // Interior
        total += this.optionPrices.interior[this.configuration.interior.material];
        total += this.optionPrices.trim[this.configuration.interior.trim];
        
        // Wheels
        total += this.optionPrices.wheels[this.configuration.wheels.design];
        total += this.optionPrices.calipers[this.configuration.wheels.calipers];
        total += this.optionPrices.tires[this.configuration.wheels.tires];
        
        // Features
        Object.entries(this.configuration.features).forEach(([feature, enabled]) => {
            if (enabled) {
                total += this.optionPrices.features[feature];
            }
        });
        
        return total;
    }

    updatePriceDisplay() {
        const optionsTotal = this.calculateOptionsTotal();
        const totalPrice = this.configuration.basePrice + optionsTotal;
        
        this.configuration.optionsTotal = optionsTotal;
        this.configuration.totalPrice = totalPrice;
        
        document.getElementById('base-price').textContent = `$${this.configuration.basePrice.toLocaleString()}`;
        document.getElementById('options-total').textContent = `+$${optionsTotal.toLocaleString()}`;
        document.getElementById('final-price').textContent = `$${totalPrice.toLocaleString()}`;
    }

    // Viewer controls
    toggleAutoRotate() {
        this.controls.autoRotate = !this.controls.autoRotate;
        const btn = document.getElementById('rotate-toggle');
        btn.classList.toggle('active', this.controls.autoRotate);
    }

    resetView() {
        this.controls.reset();
        this.camera.position.set(6, 3, 10);
        this.controls.target.set(0, 1, 0);
        this.controls.update();
    }

    setCameraView(view) {
        // Update UI
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Set camera position based on view
        switch(view) {
            case 'front':
                this.camera.position.set(0, 2, 12);
                this.controls.target.set(0, 1, 0);
                break;
            case 'side':
                this.camera.position.set(12, 2, 0);
                this.controls.target.set(0, 1, 0);
                break;
            case 'rear':
                this.camera.position.set(0, 2, -12);
                this.controls.target.set(0, 1, 0);
                break;
            case 'interior':
                this.camera.position.set(0, 1.5, 3);
                this.controls.target.set(0, 1.2, 0);
                break;
        }
        this.controls.update();
    }

    // Utility methods
    getRoughnessForFinish(finish) {
        const roughnessMap = {
            'gloss': 0.1,
            'matte': 0.8,
            'metallic': 0.3,
            'chrome': 0.05
        };
        return roughnessMap[finish] || 0.1;
    }

    getMetalnessForFinish(finish) {
        const metalnessMap = {
            'gloss': 0.9,
            'matte': 0.1,
            'metallic': 0.8,
            'chrome': 1.0
        };
        return metalnessMap[finish] || 0.9;
    }

    // Action methods
    saveConfiguration() {
        const configData = {
            ...this.configuration,
            timestamp: new Date().toISOString(),
            configurationId: this.generateId()
        };
        
        // Save to localStorage
        localStorage.setItem('carConfiguration', JSON.stringify(configData));
        
        this.showNotification('Configuration saved successfully!', 'success');
    }

    shareConfiguration() {
        const configString = JSON.stringify(this.configuration, null, 2);
        
        if (navigator.share) {
            navigator.share({
                title: 'My Car Configuration',
                text: `Check out my ${this.carModels[this.configuration.model].name} configuration!`,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(configString).then(() => {
                this.showNotification('Configuration copied to clipboard!', 'success');
            });
        }
    }

    contactDealer() {
        const message = `Hello, I'm interested in the ${this.carModels[this.configuration.model].name} I configured. Total price: $${this.configuration.totalPrice.toLocaleString()}`;
        window.open(`mailto:hello@autocraftpro.com?subject=Car Configuration Inquiry&body=${encodeURIComponent(message)}`);
    }

    generateId() {
        return 'config_' + Math.random().toString(36).substr(2, 9);
    }

    // UI helpers
    showLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
            console.log('Loading screen shown');
            // Simulate progress
            let progress = 0;
            const progressFill = document.getElementById('progress-fill');
            const interval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                }
                if (progressFill) {
                    progressFill.style.width = `${progress}%`;
                }
            }, 100);
        } else {
            console.error('Loading overlay element not found');
        }
    }

    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            console.log('Loading screen hidden');
        } else {
            console.error('Loading overlay element not found');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--background-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
            box-shadow: var(--shadow);
            z-index: 10000;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    onWindowResize() {
        const container = document.querySelector('.viewer-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.requestRender();
    }

    requestRender() {
        this.needsRender = true;
    }

    renderIfNeeded() {
        if (!this.needsRender) return;
        this.needsRender = false;
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    startRenderLoop() {
        const loop = () => {
            this.renderIfNeeded();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    // Utility to apply PBR-friendly tweaks to a material
    applyPBR(material, options = {}) {
        if (!material) return;
        // Ensure physical correctness
        material.envMapIntensity = options.envMapIntensity ?? 1.0;
        material.metalness = options.metalness ?? material.metalness ?? 0.5;
        material.roughness = options.roughness ?? material.roughness ?? 0.4;
        material.needsUpdate = true;
    }

    // Dispose helper for objects and materials
    disposeObject(obj) {
        if (!obj) return;
        if (obj.geometry) {
            obj.geometry.dispose();
        }
        if (obj.material) {
            const mat = obj.material;
            if (Array.isArray(mat)) {
                mat.forEach(m => {
                    if (m.map) m.map.dispose();
                    if (m.envMap) m.envMap.dispose();
                    m.dispose();
                });
            } else {
                if (mat.map) mat.map.dispose();
                if (mat.envMap) mat.envMap.dispose();
                mat.dispose();
            }
        }
        if (obj.children) {
            obj.children.forEach(child => this.disposeObject(child));
        }
    }

}