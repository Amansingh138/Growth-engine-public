
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const candidates = [
    "gemini-2.0-flash-001",
    "gemini-flash-latest",
    "gemini-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro"
];

async function testModels() {
    console.log("Testing models...");

    for (const modelName of candidates) {
        try {
            console.log(`\nTesting ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, are you working?");
            const response = await result.response;
            console.log(`✅ SUCCESS: ${modelName}`);
            console.log(`Response: ${response.text()}`);
            return; // Stop after first success
        } catch (error) {
            let msg = error.message || error.toString();
            if (msg.includes("404")) msg = "404 Not Found";
            if (msg.includes("429")) msg = "429 Quota/Limit Exceeded";
            console.log(`❌ FAILED: ${modelName} - ${msg}`);
        }
    }
    console.log("\nAll models failed.");
}

testModels();
