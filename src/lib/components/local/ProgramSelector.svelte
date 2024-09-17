<script>
	import { createEventDispatcher } from 'svelte';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils.js';

	export let departments = [];
	export let programs = [];

	let selectedDepartment = null;
	let selectedNivel = null;
	let selectedProgram = null;

	let openDepartment = false;
	let openNivel = false;
	let openProgram = false;

	const dispatch = createEventDispatcher();

	// Reset program and nivel when department changes
	const cleanOld = () => {
		selectedProgram = null;
		selectedNivel = null;
		dispatch('selectProgram', null); // Dispatch null when resetting the selected program
	};

	// Close popovers and refocus the trigger
	const closeAndFocusTrigger = async (triggerId) => {
		await tick();
		document.getElementById(triggerId)?.focus();
	};

	// Get unique levels (niveles) for programs in the selected department
	$: niveles = selectedDepartment
		? Array.from(
				new Set(programs.filter((p) => p.department_id === selectedDepartment).map((p) => p.type))
			)
		: [];

	// Filter programs based on the selected department and nivel
	$: filteredPrograms =
		selectedDepartment && selectedNivel
			? programs.filter(
					(program) =>
						program.department_id === selectedDepartment && program.type === selectedNivel
				)
			: [];

	// Emit the selected program
	$: {
		if (selectedProgram) {
			const selectedProgramObj = programs.find((p) => p.id === selectedProgram);
			dispatch('selectProgram', selectedProgramObj);
		} else {
			dispatch('selectProgram', null); // If no program is selected, dispatch null
		}
	}
</script>

<div class="flex items-center space-x-4">
	<!-- Department ComboBox -->
	<div class="mb-4">
		<label for="department" class="mb-2 block">Departamento</label>
		<Popover.Root bind:open={openDepartment} let:ids>
			<Popover.Trigger asChild let:builder>
				<Button
					builders={[builder]}
					variant="outline"
					role="combobox"
					aria-expanded={openDepartment}
					class="w-[200px] justify-between"
				>
					{selectedDepartment
						? departments.find((d) => d.id === selectedDepartment)?.name
						: 'Elige un Departamento'}
					<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</Popover.Trigger>
			<Popover.Content class="w-[200px] p-0">
				<Command.Root>
					<Command.Input placeholder="Buscar departamento..." />
					<Command.Empty>No department found.</Command.Empty>
					<Command.Group>
						{#each departments as department}
							<Command.Item
								value={department.name}
								onSelect={() => {
									selectedDepartment = department.id;
									cleanOld(); // Reset nivel and program when department changes
									closeAndFocusTrigger(ids.trigger);
									openDepartment = false;
								}}
							>
								<Check
									class={cn(
										'mr-2 h-4 w-4',
										selectedDepartment !== department.id && 'text-transparent'
									)}
								/>
								{department.name}
							</Command.Item>
						{/each}
					</Command.Group>
				</Command.Root>
			</Popover.Content>
		</Popover.Root>
	</div>

	<!-- Nivel ComboBox (Only show after a department is selected) -->
	{#if selectedDepartment}
		<div class="mb-4">
			<label for="nivel" class="mb-2 block">Nivel</label>
			<Popover.Root bind:open={openNivel} let:ids>
				<Popover.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						variant="outline"
						role="combobox"
						aria-expanded={openNivel}
						class="w-[200px] justify-between"
					>
						{selectedNivel ? selectedNivel : 'Elige un Nivel'}
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-[200px] p-0">
					<Command.Root>
						<Command.Input placeholder="Buscar nivel..." />
						<Command.Empty>No nivel found.</Command.Empty>
						<Command.Group>
							{#each niveles as nivel}
								<Command.Item
									value={nivel}
									onSelect={() => {
										selectedNivel = nivel;
										selectedProgram = null; // Reset the program when nivel changes
										closeAndFocusTrigger(ids.trigger);
										openNivel = false;
									}}
								>
									<Check
										class={cn('mr-2 h-4 w-4', selectedNivel !== nivel && 'text-transparent')}
									/>
									{nivel}
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
		</div>
	{/if}

	<!-- Program ComboBox (Only show after a nivel is selected) -->
	{#if selectedNivel}
		<div class="mb-4">
			<label for="program" class="mb-2 block">Programa</label>
			<Popover.Root bind:open={openProgram} let:ids>
				<Popover.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						variant="outline"
						role="combobox"
						aria-expanded={openProgram}
						class="w-[200px] justify-between"
					>
						{selectedProgram
							? filteredPrograms.find((p) => p.id === selectedProgram)?.name
							: 'Elige un Programa'}
						<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-[200px] p-0">
					<Command.Root>
						<Command.Input placeholder="Buscar programa..." />
						<Command.Empty>No program found.</Command.Empty>
						<Command.Group>
							{#each filteredPrograms as program}
								<Command.Item
									value={program.name}
									onSelect={() => {
										selectedProgram = program.id;
										closeAndFocusTrigger(ids.trigger);
										openProgram = false;
									}}
								>
									<Check
										class={cn('mr-2 h-4 w-4', selectedProgram !== program.id && 'text-transparent')}
									/>
									{program.name}
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
		</div>
	{/if}
</div>
