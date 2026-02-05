/**
 * Creates a collage from an array of image data URLs
 * @param {string[]} imageUrls - Array of base64 data URLs
 * @returns {Promise<string>} - Base64 data URL of the collage
 */
export async function createCollage(imageUrls) {
    if (!imageUrls || imageUrls.length === 0) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Instagram square format
    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Load all images first
    const images = await Promise.all(
        imageUrls.map(url => new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        }))
    );

    const count = images.length;
    let rows, cols;

    // Determine grid based on count
    if (count === 1) { rows = 1; cols = 1; }
    else if (count <= 2) { rows = 2; cols = 1; } // or 1x2
    else if (count <= 4) { rows = 2; cols = 2; }
    else if (count <= 6) { rows = 3; cols = 2; }
    else if (count <= 9) { rows = 3; cols = 3; }
    else { rows = 4; cols = 3; } // up to 12

    const cellWidth = size / cols;
    const cellHeight = size / rows;

    images.forEach((img, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * cellWidth;
        const y = row * cellHeight;

        // Draw image covering the cell (center crop)
        // Calculate aspect ratios
        const imgAspect = img.width / img.height;
        const cellAspect = cellWidth / cellHeight;

        let drawWidth, drawHeight, sx, sy, sWidth, sHeight;

        if (imgAspect > cellAspect) {
            // Image is wider than cell
            sHeight = img.height;
            sWidth = img.height * cellAspect;
            sx = (img.width - sWidth) / 2;
            sy = 0;
        } else {
            // Image is taller than cell
            sWidth = img.width;
            sHeight = img.width / cellAspect;
            sx = 0;
            sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, cellWidth, cellHeight);

        // Add white border between cells (optional)
        ctx.lineWidth = 10;
        ctx.strokeStyle = '#ffffff';
        ctx.strokeRect(x, y, cellWidth, cellHeight);
    });

    return canvas.toDataURL('image/jpeg', 0.9);
}
