// server/services/certificateGenerator.js

const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

// OPTIONAL: If you want a specific font, download a .ttf file to your server folder
// and uncomment the line below. Otherwise, it uses the system default.
// registerFont(path.join(__dirname, '../fonts/Arial.ttf'), { family: 'Arial' });

const generateCertificate = async (config, contact) => {
  try {
    // 1. Load the background image
    const image = await loadImage(config.bgImage);
    
    // 2. Create Canvas matching the REAL image size
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // 3. Draw the Background
    ctx.drawImage(image, 0, 0, image.width, image.height);

    console.log(`📏 Image Width: ${image.width}px, Height: ${image.height}px`);

    // 4. Draw the Dynamic Fields
    config.fields.forEach((field, index) => {
      // A. Personalize Text - check both standard and custom fields
      let text = field.text.replace(/{{(.*?)}}/g, (match, key) => {
        const cleanKey = key.trim();
        
        // Check standard fields first
        if (contact[cleanKey] !== undefined) {
          return contact[cleanKey];
        }
        
        // Then check customFields
        if (contact.customFields && contact.customFields[cleanKey] !== undefined) {
          return contact.customFields[cleanKey];
        }
        
        // Return empty string if not found
        return "";
      });

      // B. Use coordinates and fontSize as-is (they're already in actual image scale)
      const fontSize = field.fontSize;
      const x = field.x;
      const y = field.y;
      
      // Configure Font
      // We use specific font families to ensure it renders on Linux/Windows servers
      const fontWeight = field.bold !== false ? 'bold' : 'normal';
      ctx.font = `${fontWeight} ${fontSize}px Arial, Helvetica, sans-serif`;
      ctx.textAlign = 'center'; // Center horizontally for varying name lengths
      ctx.textBaseline = 'middle'; // Center vertically
      
      // Set text color
      const textColor = field.color || '#000000';
      ctx.fillStyle = textColor;

      // Optional: Add text stroke for better visibility
      if (field.stroke !== false) {
        ctx.strokeStyle = field.strokeColor || '#FFFFFF';
        ctx.lineWidth = Math.max(1, Math.round(fontSize / 20));
        ctx.strokeText(text, x, y);
      }

      // D. Draw the text
      ctx.fillText(text, x, y);
      
      console.log(`✏️  Field ${index + 1}: "${text}" at (${x}, ${y}), size: ${fontSize}px, color: ${textColor}`);
    });

    return canvas.toBuffer('image/png');

  } catch (error) {
    console.error("❌ Certificate Generation Failed:", error);
    return null;
  }
};

module.exports = { generateCertificate };