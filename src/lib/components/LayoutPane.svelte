<script lang="ts">
	import { getContext, onMount } from "svelte";
	import Select from "./ui/Select.svelte";
	import { views } from "./views/views";
	import { type RootContext, rootKey } from "$lib/ctxKeys";
	import { type Pane, type PaneEvents } from "$lib/layout/layout";

	export let id: number;

	const { layout } = getContext<RootContext>(rootKey);

	let pane: Pane | null = null;

	let viewKey = "timelineEditor" as keyof typeof views;
	$: view = views[viewKey];

	onMount(() => {
		function getPane() {
			pane = layout.getPane(id).unwrapOrLog(null);
		}

		getPane();

		const listeners: [keyof PaneEvents, number | null][] = ([
			["split", () => getPane()],
			["unsplit", () => getPane()],
			["close", () => pane = null],
			["resize", () => getPane()],
		] as [keyof PaneEvents, () => void][]).map(([event, f]) => [event, layout.on(event, id, f).unwrapOrLog(null)]);

		return () => {
			for (const [event, listener] of listeners) {
				if (listener !== null) layout.unsub(event, id, listener);
			}
		};
	});

	function updateView(s: string) {
		viewKey = s as keyof typeof views;
	}
</script>

{#if pane && !("root" in pane)}
	<div
		class="flex gap-1"
		class:flex-col={pane.split && pane.direction === "vertical"}
		style:flex-grow={pane.unit === "weight" ? pane.size : "0"}
		style:flex-basis={pane.unit === "exact" ? `${pane.size}em` : "0"}
	>
		{#if pane.split}
			{#each pane.childrenId as i (i)}
				<svelte:self id={i} />
			{/each}
		{/if}

		{#if !pane.split}
			<div class="flex-1 flex flex-col bg-zinc-900 rounded-md border-t border-t-zinc-800 shadow shadow-black/40">
				<div class="flex justify-between items-start p-1.5 gap-4 z-10">
					<div class="flex flex-wrap items-center gap-2">
						<Select
							entries={Object.fromEntries(Object.entries(views).map(([k, v]) => [k, v.name]))}
							buttonClass="m-[1px] w-5 h-5"
							onChange={updateView}
						>
							<div slot="title" class="absolute inset-[7px] rounded-full bg-zinc-200" />
						</Select>
						<svelte:component this={view.barLeft} />
					</div>
					{#if view.barMiddle}
						<div class="flex flex-wrap items-center gap-2 justify-center">
							<svelte:component this={view.barMiddle} />
						</div>
					{/if}
					{#if view.barRight || view.barMiddle}
						<div class="flex flex-wrap items-center gap-2 justify-right">
							<svelte:component this={view.barRight} />
						</div>
					{/if}
				</div>
				<div class="flex-1 relative">
					<div class="absolute inset-0 overflow-auto">
						<svelte:component this={view.main} />
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
