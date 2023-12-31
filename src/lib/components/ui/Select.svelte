<script lang="ts">
	export let entries: Record<string, string>;
	export let selected = Object.keys(entries)[0];
	export let buttonClass = "";
	export let dropdownClass = "";
	export let onChange: (value: typeof selected) => void = () => {};

	let open = false;

	$: onChange(selected);
</script>

<button
	class={"px-1.5 py-0.5 bg-zinc-950/50 border border-zinc-700/60 rounded shadow-sm shadow-black/30 relative " + buttonClass}
	class:cursor-default={open}
	on:click={() => open = !open}
	on:pointerleave={() => open = false}
>
	<slot name="title" {entries} {selected}>
		{entries[selected] || ""}
	</slot>
	{#if open}
		<div class="absolute pt-[3px] top-full left-0">
			<div class={"-ml-[1px] w-max bg-zinc-800/40 backdrop-blur border border-zinc-800/50 rounded shadow-sm shadow-black/30" + dropdownClass}>
				<slot name="content" {entries} {selected}>
					<ul class="p-0.5">
						{#each Object.entries(entries) as [entry, name]}
							<li>
								<button
									class="w-full px-2 py-1 text-left bg-opacity-60 rounded-sm relative"
									class:bg-sky-500={entry === selected}
									on:click={() => selected = entry}
								>
									<div class={`"z-0 absolute inset-0 rounded-sm ${entry !== selected && "hover:bg-white/10"}`} />
									<span style:text-shadow={entry === selected ? "0 1px 1.5px #000a" : ""}>
										{name}
									</span>
								</button>
							</li>
						{/each}
					</ul>
					<slot name="contentExtra" />
				</slot>
			</div>
		</div>
	{/if}
</button>
