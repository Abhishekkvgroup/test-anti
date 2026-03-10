const fs = require('fs');
let html = fs.readFileSync('c:/Users/KVGROUP-189/Desktop/test/wollongong-guide/content.html', 'utf8');
// remove img tags with base64
html = html.replace(/<img[^>]+src="data:image[^>]+>/g, '');
fs.writeFileSync('c:/Users/KVGROUP-189/Desktop/test/wollongong-guide/clean_content.html', html);
