import { ComponentChildren } from "preact"
import { cn } from "../utils.ts"

export function Kbd(props: { children: ComponentChildren; class?: string }) {
	return (
		<kbd class={cn(
			"text-xs px-1.5 py-px rounded text-zinc-300 border border-zinc-800 bg-zinc-700 shadow-[0_3px_0_0] shadow-zinc-800 opacity-80",
			"transition-all duration-300 ease-cubic hover:opacity-100 hover:backdrop-blur-sm group flex items-center backdrop-blur-0",
			props.class,
		)}>
			<span class={cn(
				"inline-block max-w-0 overflow-hidden whitespace-nowrap opacity-0 mr-0",
				"group-hover:opacity-100 group-hover:mr-1.5 group-hover:max-w-10 transition-all duration-300 ease-cubic",
			)}>
				Press
			</span>
			{props.children}
		</kbd>
	)
}
