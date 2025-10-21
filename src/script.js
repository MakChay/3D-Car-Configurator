import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CAR_MODELS } from './models/CarModels.js';
import { SoundManager } from './utils/SoundManager.js';
import { authService } from './services/AuthService.js';
import gsap from 'gsap';

class CarConfigurator {
    constructor() {
        // Previous initialization code remains...
        this.loader = new GLTFLoader();
        this.soundManager = new SoundManager();
        this.animations = {};
        this.currentViewMode = 'exterior';
        this.mixer = null;
        this.actions = {};
        
        this.init();
        this.setupEventListeners();
        this.setupTheme();
        this.setupAuthentication();
    }

    async loadCarModel() {
        const modelData = CAR_MODELS[this.currentModel];
        
        try {
            // Load exterior model
            const gltf = await this.loader.loadAsync(modelData.modelUrl);
            this.car = gltf.scene;
            
            // Setup animations
            this.mixer = new THREE.AnimationMixer(this.car);
            gltf.animations.forEach(clip => {
                this.actions[clip.name] = this.mixer.clipAction(clip);
            });

            // Apply materials
            this.car.traverse(child => {
                if (child.isMesh) {
                    if (child.name.includes('body')) {
                        child.material = new THREE.MeshPhysicalMaterial({
                            color: this.currentColor,
                            metalness: 0.8,
                            roughness: 0.2,
                            clearcoat: 1.0,
                            clearcoatRoughness: 0.1
                        });
                    }
                }
            });

            this.scene.add(this.car);
            this.soundManager.play('configuration');

        } catch (error) {
            console.error('Error loading model:', error);
        }
    }

    async loadInteriorView() {
        if (this.currentViewMode === 'interior') return;

        const modelData = CAR_MODELS[this.currentModel];
        
        try {
            const gltf = await this.loader.loadAsync(modelData.interiorUrl);
            this.interior = gltf.scene;
            
            // Position camera inside the car
            gsap.to(this.camera.position, {
                x: 0,
                y: 1.2,
                z: 0,
                duration: 1.5,
                ease: "power2.inOut"
            });

            this.scene.add(this.interior);
            this.currentViewMode = 'interior';
            this.soundManager.play('configuration');

        } catch (error) {
            console.error('Error loading interior:', error);
        }
    }

    toggleDoors() {
        const doorAction = this.actions['door_open'];
        if (doorAction) {
            if (doorAction.isRunning()) {
                doorAction.reverse();
                this.soundManager.play('doorClose');
            } else {
                doorAction.reset().play();
                this.soundManager.play('doorOpen');
            }
        }
    }

    setupAuthentication() {
        authService.onAuthStateChange((user) => {
            if (user) {
                this.loadUserConfigurations();
            }
        });
    }

    async loadUserConfigurations() {
        try {
            const config = await authService.getConfiguration();
            if (config) {
                this.applyConfiguration(config);
            }
        } catch (error) {
            console.error('Error loading configuration:', error);
        }
    }

    async saveConfiguration() {
        try {
            if (!authService.user) {
                // Show login/register modal
                document.getElementById('authModal').style.display = 'block';
                return;
            }

            const config = {
                model: this.currentModel,
                color: this.currentColor,
                wheels: this.currentWheels,
                interior: this.currentInterior
            };

            await authService.saveConfiguration(config);
            this.showNotification('Configuration saved successfully!', 'success');
            this.soundManager.play('configuration');
        } catch (error) {
            this.showNotification('Error saving configuration', 'error');
        }
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));

        if (this.mixer) {
            this.mixer.update(0.016); // Update animations
        }

        if (this.car && this.isRotating) {
            this.car.rotation.y += 0.005;
        }

        // Rotate wheels if car is moving
        if (this.actions['wheel_rotate']) {
            this.actions['wheel_rotate'].play();
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CarConfigurator();
});