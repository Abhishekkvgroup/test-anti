const fs = require('fs');
let html = fs.readFileSync('c:/Users/KVGROUP-189/Desktop/test/wollongong-guide/clean_content.html', 'utf8');

const headingsToReplace = [
    "Why Strategic Unpacking Matters in Wollongong Homes",
    "Start With Your <strong>Moving-In Setup</strong>",
    "Using Your Home Packing Planner During Unpacking",
    "Room-by-Room<strong> Unpacking Tips </strong>for Wollongong Homes",
    "Kitchen and Dining Area First",
    "Bedrooms and Bathrooms Next",
    "Living Areas and Family Spaces",
    "Using Your Relocation Packing Guide in Reverse",
    "Dealing With Boxes and Packing Materials",
    "Following Your Comprehensive Moving Checklist",
    "Making Your Wollongong Home Functional Fast",
    "Storage Solutions for Unpacked Items",
    "Smart Unpacking for Wollongong's Climate",
    "Getting Help With Unpacking in Wollongong",
    "Asking Friends and Family for Support",
    "Common Unpacking Mistakes to Avoid",
    "When to Call It Done",
    "FAQs-"
];

headingsToReplace.forEach(h => {
    // Escape specific chars for regex
    let escapedH = h.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    let regex = new RegExp(`<p>\\s*${escapedH}\\s*</p>`, 'g');
    html = html.replace(regex, `<h3>${h}</h3>`);
});

// Also replace the Title
let titleStr = "<strong>Unpacking After Move</strong> for Wollongong Homes: Make Your New Space Functional Fast";
let escapedTitle = titleStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
html = html.replace(new RegExp(`<p>\\s*${escapedTitle}\\s*</p>`, 'g'), `<h3>${titleStr}</h3>`);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wollongong Move - Unpacking Guide</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="progress"></div>
    
    <div class="slides-container">
        <!-- Slide 1: Welcome -->
        <div class="slide active">
            <div class="background" style="background-image: url('images/coastal.png');"></div>
            <div class="content">
                <div class="glass-card">
                    <h1>Wollongong Relocation</h1>
                    <p>Unpacking After Move for Wollongong Homes</p>
                    <button id="start-btn" class="primary-btn">READ THE GUIDE</button>
                </div>
            </div>
        </div>

        <!-- Slide 2: Guide Content -->
        <div class="slide">
            <div class="background" style="background-image: url('images/unpacking.png');"></div>
            <div class="content scrollable-content">
                <div class="glass-card article-card">
                    ${html}
                </div>
            </div>
        </div>
    </div>
    <script src="script.js"></script>
</body>
</html>`;

fs.writeFileSync('c:/Users/KVGROUP-189/Desktop/test/wollongong-guide/index.html', fullHtml);
