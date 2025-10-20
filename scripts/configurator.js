class ProductConfigurator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.carModel = null;
        this.materials = {};
        this.autoRotate = true;
        
        // Configuration state
        this.configuration = {
            model: 'sports',
            color: '#2c3e50',
            finish: 'gloss',
            interior: 'black',
            trim: 'carbon',
            wheels: 'standard',
            calipers: 'black',
            features: {
                spoiler: false,
                exhaust: false,
                suspension: false,
                sunroof: false,
                lights: false,
                windows: true
            },
            basePrice: 65000,
            totalPrice: 65800
        };
        
        this.init();
    }
    
    async init() {
        this.createScene();
        this.setupLighting();
        await this.loadCarModel();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
        this.hideLoading();
    }
    
    createScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0c0c0c);
        this.scene.fog = new THREE.Fog(0x0c0c0c, 10, 50);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        this.camera.position.set(8, 4, 8);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(800, 500);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        const viewer = document.getElementById('viewer');
        viewer.innerHTML = '';
        viewer.appendChild(this.renderer.domElement);
        
        this.onWindowResize();
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Main directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(10, 15, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-10, 5, -10);
        this.scene.add(fillLight);
        
        // Rim light
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
        rimLight.position.set(0, 5, -15);
        this.scene.add(rimLight);
        
        // Ground plane
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Grid helper
        const gridHelper = new THREE.GridHelper(50, 50, 0x444444, 0x222222);
        this.scene.add(gridHelper);
    }
    
    async loadCarModel() {
        return new Promise((resolve) => {
            // Create a realistic car model using primitives
            this.createRealisticCarModel();
            resolve();
        });
    }
    
    createRealisticCarModel() {
        this.carModel = new THREE.Group();
        
        // Car body (main chassis)
        const body = this.createCarBody();
        this.carModel.add(body);
        
        // Windows
        const windows = this.createWindows();
        this.carModel.add(windows);
        
        // Wheels
        this.wheels = this.createWheels();
        this.carModel.add(this.wheels);
        
        // Lights
        const lights = this.createLights();
        this.carModel.add(lights);
        
        // Details
        const details = this.createDetails();
        this.carModel.add(details);
        
        this.scene.add(this.carModel);
    }
    
    createCarBody() {
        const bodyGroup = new THREE.Group();
        
        // Main body
        const bodyGeometry = new THREE.BoxGeometry(4.5, 1.2, 12);
        this.materials.body = new THREE.MeshStandardMaterial({
            color: new THREE.Color(this.configuration.color),
            roughness: this.getRoughnessForFinish(this.configuration.finish),
            metalness: this.getMetalnessForFinish(this.configuration.finish)
        });
        
        const body = new THREE.Mesh(bodyGeometry, this.materials.body);
        body.castShadow = true;
        body.receiveShadow = true;
        body.position.y = 0.6;
        bodyGroup.add(body);
        
        // Roof
        const roofGeometry = new THREE.BoxGeometry(3.2, 0.8, 4);
        const roof = new THREE.Mesh(roofGeometry, this.materials.body);
        roof.castShadow = true;
        roof.receiveShadow = true;
        roof.position.set(0, 1.8, -1);
        bodyGroup.add(roof);
        
        // Hood
        const hoodGeometry = new THREE.BoxGeometry(3.5, 0.4, 3);
        const hood = new THREE.Mesh(hoodGeometry, this.materials.body);
        hood.castShadow = true;
        hood.receiveShadow = true;
        hood.position.set(0, 0.8, 3.5);
        bodyGroup.add(hood);
        
        // Trunk
        const trunkGeometry = new THREE.BoxGeometry(3.5, 0.5, 2.5);
        const trunk = new THREE.Mesh(trunkGeometry, this.materials.body);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        trunk.position.set(0, 0.75, -4.5);
        bodyGroup.add(trunk);
        
        // Front bumper
        const frontBumperGeometry = new THREE.BoxGeometry(4, 0.3, 1);
        const frontBumper = new THREE.Mesh(frontBumperGeometry, this.materials.body);
        frontBumper.position.set(0, 0.15, 5.5);
        bodyGroup.add(frontBumper);
        
        // Rear bumper
        const rearBumperGeometry = new THREE.BoxGeometry(4, 0.3, 1);
        const rearBumper = new THREE.Mesh(rearBumperGeometry, this.materials.body);
        rearBumper.position.set(0, 0.15, -5.5);
        bodyGroup.add(rearBumper);
        
        return bodyGroup;
    }
    
    createWindows() {
        const windowGroup = new THREE.Group();
        
        // Windshield material
        this.materials.window = new THREE.MeshStandardMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.3,
            roughness: 0.1,
            metalness: 0.9
        });
        
        // Windshield
        const windshieldGeometry = new THREE.BoxGeometry(3, 0.8, 0.1);
        const windshield = new THREE.Mesh(windshieldGeometry, this.materials.window);
        windshield.position.set(0, 1.6, 1.5);
        windshield.rotation.x = Math.PI / 8;
        windowGroup.add(windshield);
        
        // Rear window
        const rearWindowGeometry = new THREE.BoxGeometry(3, 0.6, 0.1);
        const rearWindow = new THREE.Mesh(rearWindowGeometry, this.materials.window);
        rearWindow.position.set(0, 1.6, -3);
        rearWindow.rotation.x = -Math.PI / 8;
        windowGroup.add(rearWindow);
        
        // Side windows
        const sideWindowGeometry = new THREE.BoxGeometry(0.1, 0.6, 3);
        
        const leftWindow = new THREE.Mesh(sideWindowGeometry, this.materials.window);
        leftWindow.position.set(-2.1, 1.6, -0.5);
        windowGroup.add(leftWindow);
        
        const rightWindow = new THREE.Mesh(sideWindowGeometry, this.materials.window);
        rightWindow.position.set(2.1, 1.6, -0.5);
        windowGroup.add(rightWindow);
        
        return windowGroup;
    }
    
    createWheels() {
        const wheelsGroup = new THREE.Group();
        
        // Wheel material
        this.materials.wheel = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.8,
            metalness: 0.2
        });
        
        this.materials.rim = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.3,
            metalness: 0.8
        });
        
        this.materials.calipers = new THREE.MeshStandardMaterial({
            color: 0x2c3e50, // Default black
            roughness: 0.5,
            metalness: 0.3
        });
        
        // Wheel positions [x, y, z]
        const wheelPositions = [
            [-1.5, 0.6, 3.5],   // Front left
            [1.5, 0.6, 3.5],    // Front right
            [-1.5, 0.6, -3.5],  // Rear left
            [1.5, 0.6, -3.5]    // Rear right
        ];
        
        wheelPositions.forEach((position) => {
            const wheelAssembly = this.createWheelAssembly();
            wheelAssembly.position.set(position[0], position[1], position[2]);
            wheelsGroup.add(wheelAssembly);
        });
        
        return wheelsGroup;
    }
    
    createWheelAssembly() {
        const wheelGroup = new THREE.Group();
        
        // Tire
        const tireGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.4, 16);
        const tire = new THREE.Mesh(tireGeometry, this.materials.wheel);
        tire.rotation.z = Math.PI / 2;
        wheelGroup.add(tire);
        
        // Rim
        const rimGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.42, 12);
        const rim = new THREE.Mesh(rimGeometry, this.materials.rim);
        rim.rotation.z = Math.PI / 2;
        wheelGroup.add(rim);
        
        // Wheel spokes
        const spokeGeometry = new THREE.BoxGeometry(0.8, 0.1, 0.1);
        for (let i = 0; i < 8; i++) {
            const spoke = new THREE.Mesh(spokeGeometry, this.materials.rim);
            spoke.rotation.z = (i * Math.PI) / 4;
            wheelGroup.add(spoke);
        }
        
        // Brake caliper
        const caliperGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.15);
        const caliper = new THREE.Mesh(caliperGeometry, this.materials.calipers);
        caliper.position.set(0.5, 0, 0);
        wheelGroup.add(caliper);
        
        return wheelGroup;
    }
    
    createLights() {
        const lightsGroup = new THREE.Group();
        
        // Headlights
        const headlightGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        this.materials.headlight = new THREE.MeshStandardMaterial({
            color: 0xffffcc,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, this.materials.headlight);
        leftHeadlight.position.set(-1.2, 0.8, 5);
        lightsGroup.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, this.materials.headlight);
        rightHeadlight.position.set(1.2, 0.8, 5);
        lightsGroup.add(rightHeadlight);
        
        // Taillights
        const taillightGeometry = new THREE.BoxGeometry(0.4, 0.2, 0.1);
        this.materials.taillight = new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.8
        });
        
        const leftTaillight = new THREE.Mesh(taillightGeometry, this.materials.taillight);
        leftTaillight.position.set(-1.2, 0.8, -5);
        lightsGroup.add(leftTaillight);
        
        const rightTaillight = new THREE.Mesh(taillightGeometry, this.materials.taillight);
        rightTaillight.position.set(1.2, 0.8, -5);
        lightsGroup.add(rightTaillight);
        
        return lightsGroup;
    }
    
    createDetails() {
        const detailsGroup = new THREE.Group();
        
        // Grille
        const grilleGeometry = new THREE.BoxGeometry(2.5, 0.6, 0.1);
        const grilleMaterial = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.8,
            metalness: 0.2
        });
        const grille = new THREE.Mesh(grilleGeometry, grilleMaterial);
        grille.position.set(0, 0.8, 4.8);
        detailsGroup.add(grille);
        
        // Side mirrors
        const mirrorGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.1);
        const mirrorMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c3e50,
            roughness: 0.4,
            metalness: 0.6
        });
        
        const leftMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        leftMirror.position.set(-2.3, 1.4, 1.5);
        detailsGroup.add(leftMirror);
        
        const rightMirror = new THREE.Mesh(mirrorGeometry, mirrorMaterial);
        rightMirror.position.set(2.3, 1.4, 1.5);
        detailsGroup.add(rightMirror);
        
        // Door handles
        const handleGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.1);
        const handleMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.3,
            metalness: 0.7
        });
        
        const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        leftHandle.position.set(-2.1, 1.0, 0);
        detailsGroup.add(leftHandle);
        
        const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        rightHandle.position.set(2.1, 1.0, 0);
        detailsGroup.add(rightHandle);
        
        return detailsGroup;
    }
    
    getRoughnessForFinish(finish) {
        const roughnessMap = {
            'gloss': 0.1,
            'matte': 0.8,
            'metallic': 0.3,
            'pearl': 0.2
        };
        return roughnessMap[finish] || 0.1;
    }
    
    getMetalnessForFinish(finish) {
        const metalnessMap = {
            'gloss': 0.9,
            'matte': 0.1,
            'metallic': 0.8,
            'pearl': 0.6
        };
        return metalnessMap[finish] || 0.9;
    }
    
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = this.autoRotate;
        this.controls.autoRotateSpeed = 1.0;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI / 2;
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Auto-rotate toggle
        const rotateBtn = document.getElementById('rotate-btn');
        rotateBtn.addEventListener('click', () => {
            this.autoRotate = !this.autoRotate;
            this.controls.autoRotate = this.autoRotate;
            rotateBtn.classList.toggle('active', this.autoRotate);
        });
        
        // Reset view
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            this.controls.reset();
        });
        
        // Camera presets
        const cameraPresets = document.querySelectorAll('.camera-preset');
        cameraPresets.forEach(preset => {
            preset.addEventListener('click', (e) => {
                const view = e.target.getAttribute('data-view');
                this.setCameraView(view);
                
                cameraPresets.forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Configuration steps
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => {
            step.addEventListener('click', (e) => {
                const stepName = e.target.getAttribute('data-step');
                this.showControlPanel(stepName);
                
                steps.forEach(s => s.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // Color selection
        const colorOptions = document.querySelectorAll('.color-option[data-color]');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                const color = option.getAttribute('data-color');
                const price = parseInt(option.getAttribute('data-price') || '0');
                this.changeColor(color, price);
            });
        });
        
        // Finish selection
        const finishOptions = document.querySelectorAll('.material-option[data-finish]');
        finishOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                finishOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                const finish = option.getAttribute('data-finish');
                const price = parseInt(option.getAttribute('data-price') || '0');
                this.changeFinish(finish, price);
            });
        });
        
        // Wheel selection
        const wheelOptions = document.querySelectorAll('.wheel-option');
        wheelOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                wheelOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                const wheels = option.getAttribute('data-wheels');
                const price = parseInt(option.getAttribute('data-price') || '0');
                this.changeWheels(wheels, price);
            });
        });
        
        // Caliper color selection
        const caliperOptions = document.querySelectorAll('.color-option[data-calipers]');
        caliperOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                caliperOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                const caliperColor = option.getAttribute('data-calipers');
                const price = parseInt(option.getAttribute('data-price') || '0');
                this.changeCalipers(caliperColor, price);
            });
        });
        
        // Feature toggles
        const featureOptions = document.querySelectorAll('.feature-option');
        featureOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                option.classList.toggle('active');
                
                const feature = option.getAttribute('data-feature');
                const price = parseInt(option.getAttribute('data-price') || '0');
                const isActive = option.classList.contains('active');
                this.toggleFeature(feature, isActive, price);
            });
        });
        
        // Car model selection
        const carModelSelect = document.getElementById('car-model');
        carModelSelect.addEventListener('change', (e) => {
            this.changeCarModel(e.target.value);
        });
        
        // Action buttons
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveConfiguration();
        });
        
        document.getElementById('share-btn').addEventListener('click', () => {
            this.shareConfiguration();
        });
    }
    
    setCameraView(view) {
        switch(view) {
            case 'front':
                this.camera.position.set(0, 2, 10);
                this.controls.target.set(0, 1, 0);
                break;
            case 'side':
                this.camera.position.set(10, 2, 0);
                this.controls.target.set(0, 1, 0);
                break;
            case 'rear':
                this.camera.position.set(0, 2, -10);
                this.controls.target.set(0, 1, 0);
                break;
            case 'top':
                this.camera.position.set(0, 10, 0);
                this.controls.target.set(0, 1, 0);
                break;
            case 'interior':
                this.camera.position.set(0, 3, 3);
                this.controls.target.set(0, 2, 0);
                break;
        }
        this.controls.update();
    }
    
    showControlPanel(panelName) {
        // Hide all panels
        document.querySelectorAll('.control-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Show selected panel
        document.getElementById(`${panelName}-panel`).classList.add('active');
    }
    
    changeColor(color, price) {
        this.configuration.color = color;
        if (this.materials.body) {
            this.materials.body.color.set(color);
        }
        this.updatePrice(price, 'color');
    }
    
    changeFinish(finish, price) {
        this.configuration.finish = finish;
        if (this.materials.body) {
            this.materials.body.roughness = this.getRoughnessForFinish(finish);
            this.materials.body.metalness = this.getMetalnessForFinish(finish);
        }
        this.updatePrice(price, 'finish');
    }
    
    changeWheels(wheelType, price) {
        this.configuration.wheels = wheelType;
        // In a full implementation, this would swap wheel models
        console.log(`Changed wheels to: ${wheelType}`);
        this.updatePrice(price, 'wheels');
    }
    
    changeCalipers(color, price) {
        this.configuration.calipers = color;
        if (this.materials.calipers) {
            const colorMap = {
                'black': 0x2c3e50,
                'red': 0xe74c3c,
                'yellow': 0xf1c40f,
                'silver': 0xbdc3c7
            };
            this.materials.calipers.color.set(colorMap[color] || 0x2c3e50);
        }
        this.updatePrice(price, 'calipers');
    }
    
    toggleFeature(feature, enabled, price) {
        this.configuration.features[feature] = enabled;
        console.log(`Feature ${feature}: ${enabled ? 'enabled' : 'disabled'}`);
        
        // In a full implementation, this would show/hide feature models
        // For now, we'll just update the price
        this.updatePrice(enabled ? price : -price, feature);
    }
    
    changeCarModel(model) {
        this.configuration.model = model;
        // In a full implementation, this would load a different car model
        console.log(`Changed car model to: ${model}`);
    }
    
    updatePrice(priceChange, item) {
        this.configuration.totalPrice = this.configuration.basePrice + priceChange;
        this.updatePriceDisplay();
    }
    
    updatePriceDisplay() {
        const totalElement = document.querySelector('.total-amount');
        if (totalElement) {
            totalElement.textContent = `$${this.configuration.totalPrice.toLocaleString()}`;
        }
    }
    
    saveConfiguration() {
        console.log('Saving configuration:', this.configuration);
        alert('Your car configuration has been saved! Total: $' + this.configuration.totalPrice.toLocaleString());
    }
    
    shareConfiguration() {
        const configString = JSON.stringify(this.configuration, null, 2);
        console.log('Sharing configuration:', configString);
        alert('Configuration shared! Check console for details.');
    }
    
    hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
    
    onWindowResize() {
        const container = document.querySelector('.viewer-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}