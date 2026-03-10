const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * CONFIGURATION
 * 1. Replace the API_KEY with your NEWly generated key from Google AI Studio.
 * 2. Place all your .docx files in the same folder as this script.
 */
const API_KEY = "PASTE_YOUR_NEW_API_KEY_HERE"; 
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Function to convert a single DOCX to HTML using AI
 */
async function convertFile(docxFile) {
    try {
        const docxPath = path.resolve(__dirname, docxFile);
        const fileName = path.basename(docxPath, '.docx');
        const outputFileName = `${fileName}.html`;

        console.log(`\n📖 Reading: ${docxFile}...`);
        
        // 1. Extract raw text from DOCX
        const { value: text } = await mammoth.extractRawText({ path: docxPath });

        if (!text || text.trim().length === 0) {
            console.log(`⚠️ Warning: ${docxFile} appears to be empty. Skipping.`);
            return;
        }

        // 2. Prepare the AI Model (using latest stable flash)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Task: Convert this Word Document content into very clean HTML.
            
            Strict Rules:
            1. All main headings must be wrapped in <h3> tags.
            2. All paragraphs must be wrapped in <p> tags.
            3. All lists must use <ul> and <li> tags.
            4. Do NOT include markdown code blocks (no \`\`\`html at start or end).
            5. Output ONLY the raw HTML tags ready for a website.
            
            Content:
            ${text}
        `;

        console.log(`🤖 AI is converting ${docxFile} to HTML structure...`);
        
        // 3. Generate content
        const result = await model.generateContent(prompt);
        let htmlContent = result.response.text();

        // 4. Final cleanup of any potential AI markdown artifacts
        htmlContent = htmlContent.replace(/^```html\n?|```$/g, '').trim();

        // 5. Save the result
        fs.writeFileSync(path.join(__dirname, outputFileName), htmlContent);
        console.log(`✅ SUCCESS: Created ${outputFileName}`);

    } catch (error) {
        if (error.message.includes('403')) {
            console.error(`\n❌ ERROR: Your API Key is blocked or leaked. Please create a NEW key at https://aistudio.google.com/app/apikey and update Line 11.`);
        } else {
            console.error(`\n❌ ERROR converting ${docxFile}:`, error.message);
        }
    }
}

/**
 * Main function to scan the folder and run the batch
 */
async function runBatch() {
    console.log("------------------------------------------");
    console.log("🚀 MULTI-DOC TO MULTI-HTML AI AGENT STARTING");
    console.log("------------------------------------------");

    try {
        // Find all docx files in the current folder
        const files = fs.readdirSync(__dirname);
        const docxFiles = files.filter(f => f.toLowerCase().endsWith('.docx') && !f.startsWith('~$'));

        if (docxFiles.length === 0) {
            console.log("📭 No .docx files found in this folder.");
            console.log("💡 Tip: Copy your Word files into this folder: " + __dirname);
            return;
        }

        console.log(`📂 Found ${docxFiles.length} files to process.`);

        for (let i = 0; i < docxFiles.length; i++) {
            const file = docxFiles[i];
            console.log(`\n[File ${i + 1}/${docxFiles.length}]`);
            
            await convertFile(file);

            // Respect Rate Limits (Wait 4 seconds between files for FREE tier)
            if (i < docxFiles.length - 1) {
                console.log("⏳ Cooling down AI for 4 seconds...");
                await new Promise(resolve => setTimeout(resolve, 4000));
            }
        }

        console.log("\n------------------------------------------");
        console.log("🎉 BATCH PROCESSING COMPLETE!");
        console.log("------------------------------------------");

    } catch (error) {
        console.error("❌ Fatal Error:", error.message);
    }
}

// Start the process
runBatch();
