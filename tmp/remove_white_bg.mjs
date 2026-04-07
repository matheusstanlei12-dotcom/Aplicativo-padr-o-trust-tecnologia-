import Jimp from 'jimp';

async function removeWhiteBackground() {
    const filePath = 'c:/Users/Mathe/Documents/App padrão trust/public/avatar.png';
    try {
        const image = await Jimp.read(filePath);
        
        // Convert white/near-white pixels to transparent
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            // AI generated images often have off-white backgrounds (e.g., 245, 245, 250)
            if (r > 235 && g > 235 && b > 235) {
                // Ensure we don't accidentally remove the white shirt too aggressively
                // Usually the corners are definitely background.
                // We'll just apply a simple flood fill approach or color threshold.
                // A threshold of 240+ across rgb is very safe for solid white backgrounds.
                this.bitmap.data[idx + 3] = 0; // Alpha channel = 0 (transparent)
            }
        });

        await image.writeAsync(filePath);
        console.log(`Fundo branco removido com sucesso em ${filePath}`);
    } catch (e) {
        console.error("Erro ao processar imagem:", e);
    }
}

removeWhiteBackground();
