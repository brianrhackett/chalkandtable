export const themes = {
	"red-dark": {
        name: "Red",
        mode: "dark",
        background: "#1c1917",
        accent: "#fb2c36",
    },
	"red-light": {
        name: "Red",
        mode: "light",
        background: "#f5f5f5",
        accent: "#82181a",
    },
	"orange-dark": {
        name: "Orange",
        mode: "dark",
        background: "#0f172b",
        accent: "#ff6900",
    },
	"orange-light": {
        name: "Orange",
        mode: "light",
        background: "#fbf9f5",
        accent: "#ca3500",
    },
	"gold-dark": {
        name: "Gold",
        mode: "dark",
        background: "#0a0a0a",
        accent: "#ffba00",
    },
	"indigo-light": {
        name: "Indigo",
        mode: "light",
        background: "#f3f1f3",
        accent: "#372aac",
    },
	"green-dark": {
        name: "Green",
        mode: "dark",
        background: "#151a17",
        accent: "#84cc16",
    },
	"green-light": {
        name: "Green",
        mode: "light",
        background: "#f5f5f4",
        accent: "#007a55",
    },
	"blue-dark": {
        name: "Blue",
        mode: "dark",
        background: "#030712",
        accent: "#00d3f2",
    },
	"blue-light": {
        name: "Blue",
        mode: "light",
        background: "#e5e7eb",
        accent: "#1447e6",
    },
	"purple-dark": {
        name: "Purple",
        mode: "dark",
        background: "#0c090c",
        accent: "#c27aff",
    },
	"purple-light": {
        name: "Purple",
        mode: "light",
        background: "#f3f1f3",
        accent: "#6e11b0",
    },
} as const;

export type ThemeKey = keyof typeof themes;