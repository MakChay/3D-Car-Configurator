export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { name, email, phone, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            return res.status(400).json({ 
                message: 'Name, email, and message are required' 
            });
        }

        // Here you would typically:
        // 1. Send an email using a service like SendGrid
        // 2. Save to a database
        // 3. Integrate with CRM
        
        // For now, we'll just log and return success
        console.log('Contact form submission:', {
            name,
            email,
            phone,
            message,
            timestamp: new Date().toISOString()
        });

        res.status(200).json({ 
            message: 'Message received successfully!',
            success: true 
        });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            success: false 
        });
    }
}