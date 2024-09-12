<script>
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { createEventDispatcher } from 'svelte';
	import Trash from 'lucide-svelte/icons/trash';

	import MustRule from './MustRule.svelte';
	import BagsRule from './BagsRule.svelte';

	export let requisite;
	export let index;

	const dispatch = createEventDispatcher();

	// Function to remove this requisite
	const removeRequisite = () => {
		dispatch('remove', { index });
	};

	// Available rules
	const rules = [
		{ value: 'must', label: 'Must' },
		{ value: 'bags', label: 'Bags' }
	];

	// Initialize selected rule object
	let selected = rules.find((rule) => rule.value === requisite.rule) || '';

	// Watch for changes in the selected rule and reset requisite data accordingly
	$: {
		requisite.rule = selected.value;
	}
</script>

<div class="flex gap-4">
	<Input class="w-40" bind:value={requisite.name} placeholder="Requisite Name" />

	<!-- Dropdown to select the rule using the Select component -->
	<Select.Root bind:selected>
		<Select.Trigger class="w-32">
			<Select.Value placeholder="Select a rule" />
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				<Select.Label>Rule</Select.Label>
				{#each rules as rule}
					<Select.Item value={rule.value} label={rule.label}>
						{rule.label}
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
		<Select.Input name="rule" />
	</Select.Root>

	<!-- Dynamically load the component for the selected rule -->
	{#if requisite.rule === 'must'}
		<MustRule bind:data={requisite.data} />
	{:else if requisite.rule === 'bags'}
		<BagsRule bind:data={requisite.data} />
	{/if}
	<div class="grow"></div>

	<Button class="aspect-square p-3" variant="destructive" on:click={removeRequisite}
		><Trash class="size-full"></Trash></Button
	>
</div>
