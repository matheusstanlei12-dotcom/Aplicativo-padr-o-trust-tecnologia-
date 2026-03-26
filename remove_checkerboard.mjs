import Jimp from 'jimp';

async function fixImage(filename) {
    const filePath = `c:/Users/Mathe/Documents/App padrão trust/trust-mobile-app/public/assets/character/${filename}`;
    const image = await Jimp.read(filePath);
    
    // Scan the image and make light grey/white checkerboard pixels transparent
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const r = this.bitmap.data[idx];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        
        // Typical checkerboard colors in generated images (close to 255 or 204)
        if ((r > 200 && g > 200 && b > 200) || (r > 250 && g > 250 && b > 250)) {
            // Check if it's likely a background pixel (you might need to adjust logic)
            // For now, let's just make pure whites and light greys transparent if they are near edges
            // Simple heuristic for checkerboard removal
            this.bitmap.data[idx + 3] = 0; 
        }
    });

    await image.writeAsync(filePath);
    console.log(`Processed ${filename}`);
}

async function main() {
    await fixImage('welcome.png');
    await fixImage('success.png');
    await fixImage('thinking.png');
}

main();
