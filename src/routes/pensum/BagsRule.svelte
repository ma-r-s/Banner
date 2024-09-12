<script>
	export let data;
	import { Input } from '$lib/components/ui/input/index.js';

	// Dynamically extract the attribute and its value from data
	let [attributeKey, credits] = Object.entries(data)[0] || ['', ''];
	// Update the data object when attributeKey or credits changes
	$: data = { [attributeKey]: credits };
</script>

<div class="flex gap-4">
	<Input bind:value={attributeKey} placeholder="Attribute (e.g., ELEPRO)" />
	<Input bind:value={credits} type="number" placeholder="Credits" />
</div>
