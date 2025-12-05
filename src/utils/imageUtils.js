/**
 * Compresses a base64 image string.
 * @param {string} base64String - The base64 string of the image.
 * @param {number} maxWidth - The maximum width of the compressed image.
 * @param {number} quality - The quality of the compressed image (0 to 1).
 * @returns {Promise<string>} - A promise that resolves to the compressed base64 string.
 */
export const compressImage = (base64String, maxWidth = 1024, quality = 0.7) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64String;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = (error) => reject(error);
    });
};

/**
 * Compresses all base64 images in an object recursively
 * @param {Object|Array} obj - Object or array containing base64 images
 * @param {number} quality - Compression quality (0.0 - 1.0), default 0.7
 * @returns {Promise<Object|Array>} - Object/array with compressed images
 */
export const compressImagesInObject = async (obj, quality = 0.7) => {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return Promise.all(obj.map(item => compressImagesInObject(item, quality)));
    }

    // Handle objects
    const compressed = {};
    for (const [key, value] of Object.entries(obj)) {
        // Check if this is a base64 image field (common field names)
        if (typeof value === 'string' && value.startsWith('data:image/')) {
            try {
                compressed[key] = await compressImage(value, 1024, quality);
            } catch (error) {
                console.error(`Error compressing image in field ${key}:`, error);
                compressed[key] = value; // Keep original on error
            }
        } else if (typeof value === 'object' && value !== null) {
            // Recursively process nested objects/arrays
            compressed[key] = await compressImagesInObject(value, quality);
        } else {
            compressed[key] = value;
        }
    }
    return compressed;
};
