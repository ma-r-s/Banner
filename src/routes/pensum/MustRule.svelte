<script>
	export let data;
	import { Input } from '$lib/components/ui/input/index.js';

	// Dynamically extract the attribute and its value from data
	let [attributeKey, courses] = Object.entries(data)[0] || ['', ''];
	// Update the data object when attributeKey or credits changes

	$: data = { [attributeKey]: courses };
</script>

<div class="flex gap-4">
	<Input bind:value={attributeKey} placeholder="Attribute (e.g., CBU)" />
	<Input bind:value={courses} type="number" placeholder="Courses" />
</div>
