const axios = require('axios');
const crypto = require('crypto');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON' })
        };
    }

    const {
        name,
        email,
        phone,
        countryCode,
        packages,
        numberOfPeople,
        pickupLocation,
        specialRequests,
        totalPrice,
        packageNames,
        content_ids,
        num_items,
        eventId
    } = body;

    const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
    const PIXEL_ID = process.env.FACEBOOK_PIXEL_ID;
    const API_VERSION = 'v21.0';

    const hash = (value) => {
        if (!value) return null;
        return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
    };

    const userData = {
        em: email ? hash(email) : null,
        ph: phone ? hash(phone.replace(/\D/g, '')) : null,
        fn: name ? hash(name.split(' ')[0]) : null
    };

    const eventData = {
        data: [
            {
                event_name: 'Purchase',
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'website',
                event_source_url: 'https://www.rasdeals.com/abudhabi.html',
                event_id: eventId || Date.now().toString(),
                user_data: userData,
                custom_data: {
                    currency: 'AED',
                    value: parseFloat(totalPrice) || 0,
                    content_name: packageNames || 'Unknown',
                    content_category: 'Tour Package',
                    content_ids: content_ids || [],
                    num_items: parseInt(num_items) || 0
                }
            }
        ],
        access_token: ACCESS_TOKEN
    };

    try {
        await axios.post(`https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`, eventData);
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Conversion tracked' })
        };
    } catch (error) {
        console.error('Error sending Conversion API event:', error.response ? error.response.data : error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to track conversion' })
        };
    }
};