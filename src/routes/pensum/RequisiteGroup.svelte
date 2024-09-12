<script>
	import { createEventDispatcher } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card';
	import Requisite from './Requisite.svelte';
	import Trash from 'lucide-svelte/icons/trash';
	import Plus from 'lucide-svelte/icons/plus';
	export let group;
	const dispatch = createEventDispatcher();

	// Function to add a new requisite
	const addRequisite = () => {
		group.requisites = [...group.requisites, { data: {}, rule: '', name: '' }];
	};

	// Function to handle requisite removal
	const handleRemoveRequisite = (event) => {
		const { index } = event.detail;
		group.requisites = group.requisites.filter((_, i) => i !== index);
	};

	// Function to delete the entire group
	const deleteGroup = () => {
		dispatch('delete');
	};
</script>

<!-- Use the Card component to display each group -->
<Card.Root>
	<Card.Header>
		<div class="flex justify-between">
			<div>
				<Card.Title>{group.type}</Card.Title>
				<Card.Description>{group.description}</Card.Description>
			</div>
			<Button class="aspect-square p-3" variant="ghost" on:click={deleteGroup}>
				<Trash class="size-full"></Trash>
			</Button>
		</div>
	</Card.Header>

	<Card.Content>
		<!-- Display each requisite in a clean, simple form -->
		<div class="space-y-4">
			{#each group.requisites as requisite, index}
				<Requisite {requisite} {index} on:remove={handleRemoveRequisite} />
			{/each}

			<!-- Button to add a new requisite and delete the group -->
			<Button class="aspect-square p-3" on:click={addRequisite}>
				<Plus class="size-full"></Plus>
			</Button>
		</div>
	</Card.Content>
</Card.Root>
