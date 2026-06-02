const fs = require('fs');
const path = 'public/views/corretivas.php';
let html = fs.readFileSync(path, 'utf8');

// Update modal-box styling
html = html.replace(
    /<div class="modal-box" style="background: #fafafa; border-radius: 16px; width: 100%; max-width: 700px; padding: 30px; box-shadow: 0 10px 30px rgba\(0,0,0,0\.2\); position: relative; font-family: 'Inter', sans-serif;">/,
    `<div class="modal-box" style="background: #fafafa; border-radius: 16px; width: 100%; max-width: 700px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); position: relative; font-family: 'Inter', sans-serif; max-height: 90vh; overflow-y: auto;">`
);

// Reduce some vertical margins to make it fit better
html = html.replace(
    /<h2 style="margin: 0 0 30px 0; color: #f44336; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">/,
    `<h2 style="margin: 0 0 20px 0; color: #f44336; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">`
);

html = html.replace(
    /<div style="display: flex; justify-content: center; align-items: center; gap: 30px; margin-bottom: 40px;">/,
    `<div style="display: flex; justify-content: center; align-items: center; gap: 30px; margin-bottom: 25px;">`
);

html = html.replace(
    /<div style="border-top: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea; padding: 15px 0; margin-bottom: 30px;">/,
    `<div style="border-top: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea; padding: 12px 0; margin-bottom: 20px;">`
);

fs.writeFileSync(path, html, 'utf8');
console.log('Modal styling updated for scrolling and compact height');
