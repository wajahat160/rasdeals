const fetch = require('node-fetch');
const crypto = require('crypto');

exports.handler = async (event) => {
  try {
    const { name, email, totalPrice } = JSON.parse(event.body);

    // Facebook Conversions API credentials
    const pixelId = '1105358968102959'; // Your Facebook Pixel ID
    const accessToken = 'EAAIOLNgtXRwBO3CNIZBVXGOzPan6lBwRvydZBZCaFHnIWCimDNuy6fOKIxGUZBj7ZCzgUlLkduShrEZAnGuzZBdXHgDhW1ZCQcVDZB258UDaq9YOUsOKllbyHaZC4zqZBy2xkk7oMzdQ8V7F4F5ZCL8uDnPa5xiRObuJLgWMIOryZCvRyNxcz1FbLMA7fY4RFxbExzcrqHgZDZD'; // Your Access Token
    const apiVersion = 'v18.0'; // Use the latest API version

    // Hash user data (required by Facebook)
    const hashData = (data) => crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
    const hashedEmail = hashData(email);
    const [firstName, lastName = ''] = name.split(' ');
    const hashedFirstName = hashData(firstName);
    const hashedLastName = hashData(lastName);

    // Prepare the event data for Facebook
    const eventData = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000), // Unix timestamp
      user_data: {
        em: [hashedEmail], // Hashed email
        fn: [hashedFirstName], // Hashed first name
        ln: [hashedLastName], // Hashed last name
      },
      custom_data: {
        value: totalPrice,
        currency: 'USD', // Adjust currency as needed (e.g., 'AED' for UAE)
      },
    };

    // Send to Facebook Conversions API
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [eventData],
        }),
      }
    );

    const fbResponse = await response.json();
    if (!response.ok) throw new Error(fbResponse.error?.message || 'API request failed');

    // Return success response
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, name, email, totalPrice, fbResponse }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};