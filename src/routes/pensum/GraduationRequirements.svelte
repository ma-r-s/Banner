<script>
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import RequisiteGroup from './RequisiteGroup.svelte';

	let requirementGroups = [];
	let newGroupType = '';
	let newGroupDescription = '';
	let open;

	// Function to create a new group object
	const createGroup = (type, description) => ({ type, description, requisites: [] });

	// Function to add a new group
	const addGroup = () => {
		if (newGroupType && newGroupDescription) {
			requirementGroups = [...requirementGroups, createGroup(newGroupType, newGroupDescription)];
			resetForm();
		}
		open = false;
	};

	// Function to reset the form fields
	const resetForm = () => {
		newGroupType = '';
		newGroupDescription = '';
	};

	// Function to remove a group by index
	const deleteGroup = (index) => {
		requirementGroups = requirementGroups.filter((_, i) => i !== index);
	};

	// Function to export requirement groups as JSON
	const exportToJson = () => {
		const json = JSON.stringify(requirementGroups, null, 2);
		console.log(json);
	};

	// Function to import requirement groups from a JSON file
	const importJson = (event) => {
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			const json = JSON.parse(e.target.result);
			requirementGroups = json;
		};
		reader.readAsText(file);
	};
</script>

<!-- Graduation Requirements Section -->
<div class="space-y-4">
	<Input class="max-w-80" type="file" on:change={importJson} />

	<!-- List of requirement groups -->
	{#each requirementGroups as group, index}
		<RequisiteGroup {group} on:delete={() => deleteGroup(index)} />
	{/each}

	<Dialog.Root bind:open>
		<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
			Create New Requirement Group
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Create Requirement Group</Dialog.Title>
				<Dialog.Description>
					Add a new requirement group by filling in the details below.
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="type" class="text-right">Group Type</Label>
					<Input id="type" bind:value={newGroupType} class="col-span-3" placeholder="e.g., CBUs" />
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="description" class="text-right">Description</Label>
					<Input
						id="description"
						bind:value={newGroupDescription}
						class="col-span-3"
						placeholder="Description"
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button type="submit" on:click={addGroup}>Create Group</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
	<div>
		<Button on:click={exportToJson}>Export JSON</Button>
	</div>
</div>
