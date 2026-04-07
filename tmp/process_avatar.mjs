import Jimp from 'jimp';

async function removeBg() {
    const srcPath = 'C:/Users/Mathe/.gemini/antigravity/brain/fc060a53-d8d3-4bc1-8156-db45f8579849/media__1775148092456.jpg';
    const destPath = 'c:/Users/Mathe/Documents/App padrão trust/public/avatar_full.png';

    try {
        const image = await Jimp.read(srcPath);
        
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            // Remove white and very light grayish-blue background
            // The background in the new image is a light blue/grey #f0f4f8, so we look for bright pixels that are kinda neutral.
            // A simple threshold on HSV saturation/value or just RGB sum works.
            // Looking at the image, bg is very light. R>235, G>235, B>245
            // But let's be careful not to delete his white shirt.
            // His shirt has self-shadows, the background is smooth.
            // An easier way: CSS mix-blend-mode actually worked fine for the shirt when there was no complex background!
            // I will just make the absolute brightest pure white/blue background transparent with crop.
            // Actually, we don't need Jimp to remove the background if we just use `mix-blend-mode: multiply` on the parent!
            // Wait, if we use `mix-blend-mode: multiply` on individual arms overlapping the torso, they will blend INTO the torso!
            // That means his arm overlapping his shirt will become dark! We MUST have a transparent background.
            
            // Let's do a strict removal of colors that are close to #f0f4fa
            if (r > 220 && g > 230 && b > 230) {
                // To avoid cutting the shirt (which is usually r~240, g~240, b~240), we look for the blue tint in the bg.
                // Or just distance from top-left pixel color.
            }
        });
        
        // Actually, let me just save it as PNG first, and test a simple flood-fill in JS, or we can just use Jimp to resize/crop out the edges.
        
        await image.writeAsync(destPath);
        console.log("Image copied and converted to PNG!");
    } catch (e) {
        console.error(e);
    }
}

removeBg();
