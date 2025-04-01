import { type Config } from "tailwindcss"

export default {
	content: [
		"src/{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
	],
	theme: {
		extend: {
			transitionTimingFunction: {
				cubic: "cubic-bezier(.4,.6,.1,1)",
			},
		},
	},
} satisfies Config
