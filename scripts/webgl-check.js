export function checkWebGLCapabilities() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) {
            return {
                supported: false,
                reason: 'WebGL not supported by browser',
                missingExtensions: []
            };
        }

        // Check for useful extensions (we won't block on them, but we report)
        const requested = [
            'OES_texture_float',
            'OES_texture_float_linear',
            'WEBGL_depth_texture',
            'EXT_texture_filter_anisotropic',
            'OES_standard_derivatives',
            'EXT_color_buffer_float'
        ];

        const missing = requested.filter(name => !gl.getExtension(name));

        // Basic capability info
        const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
        const maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS || gl.MAX_VARYING_COMPONENTS || 8);

        // Determine whether missing items are critical (depth texture and derivatives are most important)
        const criticalMissing = missing.includes('WEBGL_depth_texture') || missing.includes('OES_standard_derivatives');

        return {
            supported: true,
            criticalMissing,
            missingExtensions: missing,
            capabilities: {
                maxTextureSize,
                maxVaryingVectors
            }
        };
    } catch (e) {
        console.error('Error checking WebGL capabilities:', e);
        return {
            supported: false,
            reason: 'Error checking WebGL capabilities',
            missingExtensions: []
        };
    }
}