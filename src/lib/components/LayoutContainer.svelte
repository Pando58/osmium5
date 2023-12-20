<script lang="ts">
	import { getContext, onMount } from "svelte";
	import LayoutPane from "./LayoutPane.svelte";
	import { type RootContext, rootKey } from "$lib/ctxKeys";

	const { layout } = getContext<RootContext>(rootKey);

	let rootPane = false;

	onMount(() => {
		const id1 = layout.onRoot("create", () => rootPane = true);
		const id2 = layout.onRoot("destroy", () => rootPane = false);

		return () => {
			if (id1 instanceof Error) {
				console.error(id1);
			} else {
				layout.unsubRoot("create", id1);
			}

			if (id2 instanceof Error) {
				console.error(id2);
			} else {
				layout.unsubRoot("create", id2);
			}
		};
	});
</script>

<div class="flex-1 p-1 flex">
	{#if rootPane}
		<LayoutPane id={0} />
	{/if}
</div>
