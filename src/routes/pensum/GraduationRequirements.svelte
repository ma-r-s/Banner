<script>
	export let requirements;
	export let programId;
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import RequisiteGroup from './RequisiteGroup.svelte';
	import { toast } from 'svelte-sonner';

	let newGroupType = '';
	let newGroupDescription = '';
	let open;

	// Function to create a new group object
	const createGroup = (type, description) => ({ type, description, requisites: [] });

	// Function to add a new group
	const addGroup = () => {
		if (newGroupType && newGroupDescription) {
			requirements = [...requirements, createGroup(newGroupType, newGroupDescription)];
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
		requirements = requirements.filter((_, i) => i !== index);
	};

	// Function to save requirements
	const saveRequirements = async () => {
		try {
			const response = await fetch('/pensum', {
				method: 'POST',

				body: JSON.stringify({
					requirements: JSON.parse(JSON.stringify(requirements), null, 2),
					programId
				})
			});

			if (!response.ok) {
				throw new Error('Failed to save the updated requirements');
			}

			// Show success toast after successful save
			toast.success('Requisitos guardados exitosamente', {
				description: 'Los requisitos del programa han sido actualizados correctamente.'
			});
		} catch (error) {
			console.error(error);
			toast.error('Error al guardar los requisitos', {
				description: 'No se pudieron guardar los requisitos, intenta nuevamente.'
			});
		}
	};
</script>

<!-- Graduation Requirements Section -->
<div class="space-y-4">
	<!-- List of requirement groups -->
	{#each requirements as group, index}
		<RequisiteGroup {group} on:delete={() => deleteGroup(index)} />
	{/each}

	<Dialog.Root bind:open>
		<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>
			Crear Grupo de Requisitos
		</Dialog.Trigger>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Crear Grupo de Requisitos</Dialog.Title>
				<Dialog.Description>
					Añade un nuevo grupo de requisitos para el programa.
				</Dialog.Description>
			</Dialog.Header>
			<div class="grid gap-4 py-4">
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="type" class="text-right">Nombre</Label>
					<Input id="type" bind:value={newGroupType} class="col-span-3" placeholder="e.g., CBUs" />
				</div>
				<div class="grid grid-cols-4 items-center gap-4">
					<Label for="description" class="text-right">Descripcion</Label>
					<Input
						id="description"
						bind:value={newGroupDescription}
						class="col-span-3"
						placeholder="e.g., Curso Básico Uniandino"
					/>
				</div>
			</div>
			<Dialog.Footer>
				<Button type="submit" on:click={addGroup}>Create Group</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<!-- Save Button with Toast -->
	<div>
		<Button on:click={saveRequirements}>Guardar Requisitos</Button>
	</div>
</div>
