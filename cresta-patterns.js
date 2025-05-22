// CRESTA Text Bitmap Pattern (bolder letters with spacing)
export const CRESTA_PATTERN = [
    // C
    [0,1,1,1,1,0],
    [1,1,0,0,1,0],
    [1,1,0,0,0,0],
    [1,1,0,0,1,0],
    [0,1,1,1,1,0],
    [0,0,0,0,0,0], // spacing
    // R
    [1,1,1,1,0,0],
    [1,1,0,1,1,0],
    [1,1,1,1,0,0],
    [1,1,0,1,1,0],
    [1,1,0,0,1,1],
    [0,0,0,0,0,0], // spacing
    // E
    [1,1,1,1,1,0],
    [1,1,0,0,0,0],
    [1,1,1,1,0,0],
    [1,1,0,0,0,0],
    [1,1,1,1,1,0],
    [0,0,0,0,0,0], // spacing
    // S
    [0,1,1,1,1,0],
    [1,1,0,0,0,0],
    [0,1,1,1,0,0],
    [0,0,0,1,1,0],
    [1,1,1,1,0,0],
    [0,0,0,0,0,0], // spacing
    // T
    [1,1,1,1,1,1],
    [0,0,1,1,0,0],
    [0,0,1,1,0,0],
    [0,0,1,1,0,0],
    [0,0,1,1,0,0],
    [0,0,0,0,0,0], // spacing
    // A
    [0,1,1,1,0,0],
    [1,1,0,1,1,0],
    [1,1,1,1,1,0],
    [1,1,0,1,1,0],
    [1,1,0,1,1,0]
];

// CRESTA Color Themes (Text, Background Base Color)
export const crestaThemes = [
    { name: "Ivory/Ebony", text: [1, 1, 0.94], bgBase: [0.1, 0.1, 0.1] },
    { name: "Gold/Indigo", text: [1, 0.84, 0], bgBase: [0.29, 0, 0.51] },
    { name: "Lime/Azure", text: [0.75, 1, 0], bgBase: [0, 0.5, 1] },
    { name: "Orange/Blue", text: [1, 0.65, 0], bgBase: [0, 0.3, 1] }  // Bright electric blue background
];

// CRESTA Background Animations
export const crestaBackgrounds = [
    {
        name: "Diag. Streaks",
        fn: (t, x, y) => Math.abs(Math.sin((x - y) * 0.15 + t * 0.7))
    },
    {
        name: "Gentle Wave",
        fn: (t, x, y) => Math.sin(x * 0.1 + y * 0.1 + t * 0.2) * 0.5 + 0.5
    },
    {
        name: "Plasma Storm",
        fn: (t, x, y) => {
            const scale = 0.15;
            const speed = 2.0;
            // Create multiple overlapping wave patterns
            const wave1 = Math.sin(x * scale + t * speed) * Math.cos(y * scale + t * speed);
            const wave2 = Math.sin((x + y) * scale + t * speed * 1.5) * 0.5;
            const wave3 = Math.cos(x * scale - y * scale + t * speed * 0.7);
            const turbulence = Math.sin(t * speed * 0.5) * 0.2; // Add time-based turbulence
            
            // Combine waves with turbulence and normalize
            return (wave1 + wave2 + wave3 + turbulence + 2) / 4;
        }
    },
    {
        name: "Interference",
        fn: (t, x, y) => {
            const v1 = Math.sin((x * 0.1 + t * 0.4) * Math.cos(t * 0.1));
            const v2 = Math.cos((y * 0.1 - t * 0.3) * Math.sin(t * 0.05));
            return ((v1 + v2) / 2 + 1) / 2; // Normalize
        }
    }
];

export let currentCrestaThemeIndex = 0;  // Will now default to Ivory/Ebony
export let currentCrestaBgIndex = 0;     // Will now default to Diag. Streaks

export function setCurrentCrestaTheme(index) {
    currentCrestaThemeIndex = index;
}

export function setCurrentCrestaBackground(index) {
    currentCrestaBgIndex = index;
}

export function getCrestaPixelData(t, x, y, COLS, ROWS) {
    const theme = crestaThemes[currentCrestaThemeIndex];
    const bgAnimation = crestaBackgrounds[currentCrestaBgIndex];
    
    const bgIntensity = bgAnimation.fn(t, x, y) * 0.25; // Scale intensity, can be tuned

    const patternWidth = 6 * 6; 
    const patternHeight = 5; 
    
    const offsetX = Math.floor((COLS - patternWidth) / 2);
    const offsetY = Math.floor((ROWS - patternHeight) / 2);
    
    if (y >= offsetY && y < offsetY + patternHeight &&
        x >= offsetX && x < offsetX + patternWidth) {
        
        const localX = x - offsetX;
        const charIndex = Math.floor(localX / 6);
        const charX = localX % 6;
        const patternY = y - offsetY;
        
        if (charIndex < 6 && CRESTA_PATTERN[charIndex * 6 + patternY][charX]) {
            return theme.text;
        }
    }
    
    return [
        bgIntensity * theme.bgBase[0],
        bgIntensity * theme.bgBase[1],
        bgIntensity * theme.bgBase[2]
    ];
} 