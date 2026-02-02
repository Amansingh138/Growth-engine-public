const https = require('https');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("No API Key found in .env.local");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Fetching models from: https://generativelanguage.googleapis.com/v1beta/models`);

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", json.error);
            } else if (json.models) {
                console.log("Available Models:");
                json.models.forEach(m => {
                    if (m.name.includes("gemini")) {
                        console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
                    }
                });
            } else {
                console.log("Unexpected response:", json);
            }
        } catch (e) {
            console.error("Error parsing response:", e);
            console.log("Raw output:", data);
        }
    });

}).on('error', (err) => {
    console.error("Request Error:", err);
});
