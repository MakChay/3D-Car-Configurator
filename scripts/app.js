function isWebGLAvailable() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.Web && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

// Show WebGL error message
function showWebGLError() {
    const errorHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--background-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 2rem;
        ">
            <div style="
                background: var(--background-secondary);
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                max-width: 500px;
                box-shadow: var(--shadow);
            ">
                <h2 style="color: var(--error-color); margin-bottom: 1rem;">
                    WebGL Not Supported
                </h2>
                <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">
                    Your browser doesn't support WebGL, which is required for the 3D car configurator.
                    Please try using a modern browser like Chrome, Firefox, or Edge.
                </p>
                <button onclick="location.reload()" style="
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">
                    Try Again
                </button>
            </div>
        </div>
    `;
    document.body.innerHTML = errorHTML;
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check for WebGL support
    if (!isWebGLAvailable()) {
        showWebGLError();
        return;
    }
    
    // Initialize the car configurator
    try {
        window.carConfigurator = new CarConfigurator();
        
        // Add some additional styling for notifications
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                animation: slideIn 0.3s ease;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .notification-close:hover {
                color: var(--text-primary);
            }
            
            .notification-success {
                border-left: 4px solid var(--success-color);
            }
            
            .notification-error {
                border-left: 4px solid var(--error-color);
            }
            
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
        
    } catch (error) {
        console.error('Failed to initialize car configurator:', error);
        showWebGLError();
    }
});

// Add service worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('SW registered: ', registration);
        }).catch(function(registrationError) {
            console.log('SW registration failed: ', registrationError);
        });
    });
}