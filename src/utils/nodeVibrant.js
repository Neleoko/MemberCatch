const Vibrant = require('node-vibrant');

async function getUserAvatarColor(avatarURL) {
     const palette = await new Promise((resolve, reject) => {
        Vibrant.from(avatarURL).getPalette((err, palette) => {
            if (err) {
                reject(err);
            } else {
                resolve(palette);
            }
        });
    });
    const dominantColor = palette.Vibrant.rgb;

    return rgbToHex(dominantColor[0], dominantColor[1], dominantColor[2]);
}

function rgbToHex(r, g, b) {
    // Convertir chaque composante en sa représentation hexadécimale
    const red = Math.round(r).toString(16).padStart(2, '0');
    const green = Math.round(g).toString(16).padStart(2, '0');
    const blue = Math.round(b).toString(16).padStart(2, '0');

    // Concaténer les composantes pour former la couleur hexadécimale
    const hexColor = `#${red}${green}${blue}`;

    return hexColor.toUpperCase(); // Optionnel : convertir en majuscules pour la cohérence
}

module.exports = {
    getUserAvatarColor
};