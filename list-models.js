
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Hardcoding key for the script to ensure it runs standalone
const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Dummy init to access generic client if needed? 
        // Actually SDK has a model manager usually, checking docs or trying standard list.
        // The SDK exposes listModels on the client or via a manager if I recall correctly.
        // In @google/generative-ai, there isn't a direct "client.listModels" easily exposed in simple usage sometimes.
        // But let's try the standard REST approach if SDK usage is fuzzy, OR just use the SDK reference.
        // Wait, typical SDK usage:
        // const genAI = new GoogleGenerativeAI(API_KEY);
        // Not seeing a direct listModels on genAI instance in basic docs content often.

        // Let's use REST to be 100% sure and avoid SDK import issues in a raw node script if modules aren't set up for "require" vs "import".
        // The project uses "next", so "require" might fail if it's a module-only package (which @google/generative-ai often is).
        // Safe bet: USE LOCAL FETCH with REST endpoint.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("Error or no models found:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Script Error:", error);
    }
}

listModels();
