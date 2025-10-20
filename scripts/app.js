document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Premium Car Configurator...');
    
    try {
        // Initialize the 3D configurator
        const configurator = new ProductConfigurator();
        console.log('Premium Car Configurator initialized successfully!');
        
        // Test that controls are working
        setTimeout(() => {
            console.log('Testing controls...');
            console.log('Configurator state:', {
                hasScene: !!configurator.scene,
                hasCamera: !!configurator.camera,
                hasRenderer: !!configurator.renderer,
                hasCarModel: !!configurator.carModel,
                configuration: configurator.configuration
            });
        }, 2000);
        
    } catch (error) {
        console.error('Failed to initialize Premium Car Configurator:', error);
        
        // Show error message to user
        const viewer = document.getElementById('viewer');
        if (viewer) {
            viewer.innerHTML = `
                <div style="color: #ff6b6b; text-align: center; padding: 50px;">
                    <h3>Error Loading 3D Viewer</h3>
                    <p>There was a problem initializing the car configurator.</p>
                    <p>Please check the console for details.</p>
                    <p style="margin-top: 20px; font-size: 0.9rem; color: #a0a0c0;">Error: ${error.message}</p>
                </div>
            `;
        }
    }
});