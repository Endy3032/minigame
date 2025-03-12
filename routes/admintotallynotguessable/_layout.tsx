import { FreshContext } from "$fresh/server.ts"
import { PhaseLabel } from "../../islands/Phase.tsx"
import ScoreCounter from "../../islands/ScoreCounter.tsx"
import { TeamView } from "../../islands/TeamView.tsx"
import { team1Score, team2Score } from "../../scores.ts"

const routes = [
	{
		route: "codename",
		label: "Chung Sức",
	},
	{
		route: "multichoice",
		label: "Trắc Nghiệm",
	},
	{
		route: "truefalse",
		label: "Đúng/Sai",
	},
	{
		route: "written",
		label: "Tự Luận",
	},
]

export default async function Layout(_: Request, ctx: FreshContext) {
	const curRoute = routes.findIndex(v => ctx.url.pathname.includes(v.route))
	const prev = routes[Math.max(0, curRoute - 1)]
	const next = routes[Math.min(3, curRoute + 1)]

	return (
		<>
			<div className="flex w-full justify-between gap-4 items-center">
				<a href={prev.route}
					class={`min-w-40 text-center px-4 py-4 h-fit bg-[#3B4252] rounded-lg ${prev === routes[curRoute] ? "invisible" : ""}`}
				>
					&lt; {prev.label}
				</a>
				<div class="flex items-center justify-self-center gap-16">
					<TeamView curRoute={curRoute} />
				</div>
				<a href={next.route}
					class={`min-w-40 text-center px-4 py-4 h-fit bg-[#3B4252] rounded-lg ${next === routes[curRoute] ? "invisible" : ""}`}
				>
					{next.label} &gt;
				</a>
			</div>
			<div class="px-8 py-6 rounded-xl border border-[#88c0d0] w-full flex-1 flex justify-center items-center">
				<ctx.Component />
			</div>
		</>
	)
}
