<script lang="ts">
	import { getContext, onMount } from "svelte";
	import LayoutPane from "./LayoutPane.svelte";
	import { type RootContext, rootKey } from "$lib/ctxKeys";

	const { layout } = getContext<RootContext>(rootKey);

	let rootPane = false;

	onMount(() => {
		const id1 = layout.on("split", "root", () => rootPane = true).unwrapOrLog(null);
		const id2 = layout.on("close", "root", () => rootPane = false).unwrapOrLog(null);

		return () => {
			if (id1 !== null) layout.unsub("split", "root", id1);
			if (id2 !== null) layout.unsub("close", "root", id2);
		};
	});
</script>

<div class="flex-1 p-1 flex">
	{#if rootPane}
		<LayoutPane id={1} />
	{/if}
</div>
