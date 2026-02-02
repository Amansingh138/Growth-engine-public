
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.APIFREE_API_KEY;
const baseUrl = "https://api.apifree.ai/v1/chat/completions";

const modelsToTest = [
    "gpt-4o",
    "gpt-4",
    "gpt-3.5-turbo",
    "gpt-4-turbo",
    "gpt-4-1106-preview",
    "claude-3-opus",
    "claude-3-sonnet",
    "gemini-1.5-pro"
];

async function testModel(model) {
    try {
        const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: "Hi" }]
            })
        });

        if (response.ok) {
            console.log(`✅ Model '${model}' is VALID.`);
            return true;
        } else {
            const errorText = await response.text();
            console.log(`❌ Model '${model}' failed: ${response.status} - ${errorText}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Model '${model}' error: ${error.message}`);
        return false;
    }
}


async function run() {
    console.log("Starting load test...");
    const model = "gpt-4";
    const largePrompt = "This is a test context. ".repeat(200); // ~4800 characters

    console.log(`Testing '${model}' with large payload...`);
    await testModel(model);
    // We need to modify testModel to accept prompt or just hardcode it for this test check.
    // Actually let's just rewrite the specific test call here or modify testModel logic.
}

// Redefining testModel to take a prompt
async function testModelWithPrompt(model, prompt) {
    try {
        const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (response.ok) {
            console.log(`✅ Model '${model}' with large prompt is VALID.`);
            return true;
        } else {
            const errorText = await response.text();
            console.log(`❌ Model '${model}' with large prompt failed: ${response.status} - ${errorText}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Model '${model}' error: ${error.message}`);
        return false;
    }
}

async function runTest() {
    const largePrompt = "Context: " + "A".repeat(5000) + " Question: Hi";
    await testModelWithPrompt("gpt-4", largePrompt);
}

runTest();

