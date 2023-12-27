<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { type RootContext, rootKey } from "$lib/ctxKeys";
	import { type Pane } from "$lib/layout/layout";

	export let id: number;

	const { layout } = getContext<RootContext>(rootKey);

	let pane: Pane | null = null;

	onMount(() => {
		function getPane() {
			pane = layout.getPane(id).unwrapOrLog(null);
		}

		getPane();

		const id1 = layout.on("split", id, () => getPane()).unwrapOrLog(null);
		const id2 = layout.on("unsplit", id, () => getPane()).unwrapOrLog(null);
		const id3 = layout.on("close", id, () => pane = null).unwrapOrLog(null);

		return () => {
			if (id1 !== null) layout.unsub("split", id, id1);
			if (id2 !== null) layout.unsub("unsplit", id, id2);
			if (id3 !== null) layout.unsub("close", id, id3);
		};
	});
</script>

{#if pane && !("root" in pane)}
	<div
		class={`flex-1 flex gap-1 ${!pane.split && "bg-zinc-900  rounded-md border-t border-t-zinc-800 shadow shadow-black/40"}`}
		class:flex-col={pane.split && pane.direction === "vertical"}
		style:flex={pane.unit === "weight" ? pane.size : null}
		style:width={pane.unit === "pixels" ? `${pane.size}px` : null}
	>
		{#if pane.split}
			{#each pane.childrenId as i (i)}
				<svelte:self id={i} />
			{/each}
		{/if}

		{#if !pane.split}
			<div class="absolute p-1">
				<span style="white-space: pre-line">
					{id}: {JSON.stringify(pane, null, 2)}
				</span>
			</div>
		{/if}
	</div>
{/if}
