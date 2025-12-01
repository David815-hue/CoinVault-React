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
