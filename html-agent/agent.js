const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Use the API key provided
const genAI = new GoogleGenerativeAI("AIzaSyCNToaVNY_xVD-wU7tiiVCCgCJ7ccqsHpU");

async function runAgent(docxFileName) {
    try {
        const docxPath = path.isAbsolute(docxFileName) ? docxFileName : path.join(__dirname, docxFileName);

        if (!fs.existsSync(docxPath)) {
            console.error(`❌ Error: File not found at ${docxPath}`);
            return;
        }

        console.log(`\n📄 Reading: ${path.basename(docxPath)}...`);
        const { value: rawText } = await mammoth.extractRawText({ path: docxPath });

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Task: Convert this Word Document text into clean HTML code.
            Rules:
            1. Identify headings and wrap them in <h3> tags.
            2. Wrap paragraphs in <p> tags and lists in <ul>/<li>.
            3. Output only valid HTML tags, no markdown formatting.
            
            Content:
            ${rawText}
        `;

        console.log("🤖 AI is transforming document into <h3> structured HTML...");
        const result = await model.generateContent(prompt);
        let htmlOutput = result.response.text();
        htmlOutput = htmlOutput.replace(/^```html\n?|```$/g, '').trim();

        const baseName = path.basename(docxPath, '.docx').replace(/\s+/g, '_');
        const outputName = `${baseName}_converted.html`;
        fs.writeFileSync(path.join(__dirname, outputName), htmlOutput);

        console.log("\n✅ Conversion Complete!");
        console.log(`📂 Result saved to: html-agent/${outputName}`);

    } catch (error) {
        console.error("\n❌ Error:", error.message);
    }
}

const inputFile = process.argv[2] || 'test_file.docx';
runAgent(inputFile);
