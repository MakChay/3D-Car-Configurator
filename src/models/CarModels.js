export const CAR_MODELS = {
    sedan: {
        name: 'Luxury Sedan',
        modelUrl: '/assets/models/sedan.glb',
        price: 420000,
        interiorUrl: '/assets/models/sedan_interior.glb',
        sounds: {
            door: '/assets/sounds/door_open.mp3',
            engine: '/assets/sounds/engine_start.mp3'
        },
        animations: ['door_open', 'door_close', 'wheel_rotate'],
        configurations: {
            colors: [
                { name: 'Midnight Black', hex: '#2c3e50', price: 0 },
                { name: 'Ruby Red', hex: '#e74c3c', price: 15000 },
                { name: 'Ocean Blue', hex: '#3498db', price: 15000 }
            ],
            wheels: [
                { name: 'Standard', model: 'wheel_standard.glb', price: 0 },
                { name: 'Sport', model: 'wheel_sport.glb', price: 25000 },
                { name: 'Premium', model: 'wheel_premium.glb', price: 45000 }
            ],
            interior: [
                { name: 'Black Leather', texture: 'leather_black.jpg', price: 0 },
                { name: 'Brown Leather', texture: 'leather_brown.jpg', price: 15000 },
                { name: 'Beige Leather', texture: 'leather_beige.jpg', price: 15000 }
            ]
        }
    },
    suv: {
        name: 'Premium SUV',
        modelUrl: '/assets/models/suv.glb',
        price: 550000,
        interiorUrl: '/assets/models/suv_interior.glb',
        sounds: {
            door: '/assets/sounds/door_open.mp3',
            engine: '/assets/sounds/engine_start.mp3'
        },
        animations: ['door_open', 'door_close', 'wheel_rotate', 'tailgate_open'],
        configurations: {
            colors: [
                { name: 'Graphite Grey', hex: '#2c3e50', price: 0 },
                { name: 'Forest Green', hex: '#27ae60', price: 15000 },
                { name: 'Desert Sand', hex: '#d35400', price: 15000 }
            ],
            wheels: [
                { name: 'Standard', model: 'wheel_suv_standard.glb', price: 0 },
                { name: 'All-Terrain', model: 'wheel_suv_at.glb', price: 30000 },
                { name: 'Premium', model: 'wheel_suv_premium.glb', price: 50000 }
            ],
            interior: [
                { name: 'Black Leather', texture: 'leather_black.jpg', price: 0 },
                { name: 'Brown Leather', texture: 'leather_brown.jpg', price: 20000 },
                { name: 'Beige Leather', texture: 'leather_beige.jpg', price: 20000 }
            ]
        }
    },
    sports: {
        name: 'GT Sports',
        modelUrl: '/assets/models/sports.glb',
        price: 680000,
        interiorUrl: '/assets/models/sports_interior.glb',
        sounds: {
            door: '/assets/sounds/sports_door.mp3',
            engine: '/assets/sounds/sports_engine.mp3'
        },
        animations: ['door_open', 'door_close', 'wheel_rotate', 'spoiler_deploy'],
        configurations: {
            colors: [
                { name: 'Racing Red', hex: '#e74c3c', price: 0 },
                { name: 'Stealth Black', hex: '#2c3e50', price: 20000 },
                { name: 'Silver Arrow', hex: '#bdc3c7', price: 20000 }
            ],
            wheels: [
                { name: 'Sport', model: 'wheel_sports_standard.glb', price: 0 },
                { name: 'Track', model: 'wheel_sports_track.glb', price: 40000 },
                { name: 'Carbon', model: 'wheel_sports_carbon.glb', price: 60000 }
            ],
            interior: [
                { name: 'Black Alcantara', texture: 'alcantara_black.jpg', price: 0 },
                { name: 'Red Leather', texture: 'leather_red.jpg', price: 25000 },
                { name: 'Carbon Trim', texture: 'carbon_fiber.jpg', price: 35000 }
            ]
        }
    }
};