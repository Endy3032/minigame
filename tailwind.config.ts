import { type Config } from "tailwindcss"

export default {
	content: [
		"src/{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
	],
	theme: {
		extend: {
			animation: {
				flash: "flash 0.75s ease-in-out",
			},
			keyframes: {
				flash: {
					"0%": {
						filter: "blur(0.25rem) brightness(1)",
					},
					"30%": {
						filter: "blur(0) brightness(2)",
					},
					"100%": {
						filter: "blur(0) brightness(1)",
					},
				},
			},
			transitionTimingFunction: {
				cubic: "cubic-bezier(.4,.6,.1,1)",
			},
		},
	},
} satisfies Config
