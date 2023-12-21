<script lang="ts">
	import { onMount, setContext } from "svelte";
	import LayoutContainer from "$lib/components/LayoutContainer.svelte";
	import WindowBar from "$lib/components/WindowBar.svelte";
	import { rootKey, type RootContext } from "$lib/ctxKeys";
	import { Layout } from "$lib/layout/layout";

	const layout = new Layout();

	setContext<RootContext>(rootKey, {
		layout,
	});
</script>

<div class="h-screen flex flex-col bg-zinc-950 text-zinc-300 text-xs">
	<WindowBar />
	<LayoutContainer />
</div>
