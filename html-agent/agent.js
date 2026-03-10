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

        console.log("✅ Conversion Complete!");
        console.log(`📂 Result saved to: html-agent/${outputName}\n`);

    } catch (error) {
        console.error("\n❌ Error processing document:", error.message);
    }
}

async function processMultipleFiles(directoryPath) {
    try {
        const fullDirPath = path.isAbsolute(directoryPath) ? directoryPath : path.join(__dirname, directoryPath);
        
        if (!fs.existsSync(fullDirPath)) {
             console.error(`❌ Error: Directory not found at ${fullDirPath}`);
             return;
        }

        console.log(`\n🔍 Scanning directory for DOCX files: ${fullDirPath}`);
        
        // Read all files in the directory
        const files = fs.readdirSync(fullDirPath);
        
        // Filter only files ending with .docx
        const docxFiles = files.filter(file => file.endsWith('.docx') && !file.startsWith('~$'));
        
        if (docxFiles.length === 0) {
            console.log("⚠️ No .docx files found in the directory.");
            return;
        }
        
        console.log(`📑 Found ${docxFiles.length} Word document(s). Starting batch conversion...`);

        // Loop through each file and run the agent
        for (let i = 0; i < docxFiles.length; i++) {
            const file = docxFiles[i];
            console.log(`\n--- Processing File ${i + 1} of ${docxFiles.length} ---`);
            await runAgent(path.join(fullDirPath, file));
            
            // Adding a small delay to avoid hitting the free API rate limit (15 requests per minute)
            if (i < docxFiles.length - 1) {
                console.log("⏳ Pausing for 4 seconds to respect API limits...");
                await new Promise(resolve => setTimeout(resolve, 4000));
            }
        }
        
        console.log("\n🎉 All files processed successfully!");

    } catch (error) {
        console.error("\n❌ Directory processing error:", error.message);
    }
}

// Get input from command line: can be a file or a folder path
const inputPath = process.argv[2] || '.'; // Default to current folder (.)

// Check if the input is a directory or a specific file
const fullInputPath = path.isAbsolute(inputPath) ? inputPath : path.join(__dirname, inputPath);

try {
    const stats = fs.statSync(fullInputPath);
    if (stats.isDirectory()) {
        // It's a folder, run the batch process
        processMultipleFiles(inputPath);
    } else if (stats.isFile() && inputPath.endsWith('.docx')) {
        // It's a single file, run just that one
        runAgent(inputPath);
    } else {
        console.error("❌ Please provide a valid .docx file or a folder path.");
    }
} catch(err) {
    if (inputPath !== '.') {
         console.error(`❌ Error: Could not find path ${inputPath}`);
    } else {
         console.error("❌ Error reading current directory.");
    }
}
