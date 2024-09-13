<!-- src/routes/pensum/+page.svelte -->
<script>
	export let data;

	import GraduationRequirements from './GraduationRequirements.svelte';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { tick } from 'svelte';
	import { cn } from '$lib/utils.js';

	let selectedDepartment = null;
	let selectedProgram = null;
	let selectedProgramRequirements = null;

	let openDepartment = false;
	let openProgram = false;

	// Filter programs based on the selected department
	$: filteredPrograms = selectedDepartment
		? data.programs.filter((program) => program.department_id === selectedDepartment)
		: [];

	// Update the graduation requirements once a program is selected
	$: {
		const programId = selectedProgram;
		const program = data.programs.find((p) => p.id === programId);
		if (program) {
			selectedProgramRequirements = program.requirements; // Assume requirements is a JSON field
		} else {
			selectedProgramRequirements = null;
		}
	}

	// Clean previous program selection
	let cleanOld = () => {
		selectedProgramRequirements = null;
		selectedProgram = null;
	};

	// Focus the trigger after selecting an item
	function closeAndFocusTrigger(triggerId) {
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<h1 class="mb-4 text-2xl font-bold">Requisitos de Grado</h1>
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
						? data.departments.find((d) => d.id === selectedDepartment)?.name
						: 'Select a department'}
					<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</Popover.Trigger>
			<Popover.Content class="w-[200px] p-0">
				<Command.Root>
					<Command.Input placeholder="Search department..." />
					<Command.Empty>No department found.</Command.Empty>
					<Command.Group>
						{#each data.departments as department}
							<Command.Item
								value={department.id}
								onSelect={() => {
									selectedDepartment = department.id;
									cleanOld();
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

	<!-- Program ComboBox -->
	{#if selectedDepartment}
		{#if filteredPrograms.length > 0}
			<div class="mb-4">
				<label for="program" class="mb-2 block">Select Program</label>
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
								: 'Select a program'}
							<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</Popover.Trigger>
					<Popover.Content class="w-[200px] p-0">
						<Command.Root>
							<Command.Input placeholder="Search program..." />
							<Command.Empty>No program found.</Command.Empty>
							<Command.Group>
								{#each filteredPrograms as program}
									<Command.Item
										value={program.id}
										onSelect={() => {
											selectedProgram = program.id;
											closeAndFocusTrigger(ids.trigger);
											openProgram = false;
										}}
									>
										<Check
											class={cn(
												'mr-2 h-4 w-4',
												selectedProgram !== program.id && 'text-transparent'
											)}
										/>
										{program.name}
									</Command.Item>
								{/each}
							</Command.Group>
						</Command.Root>
					</Popover.Content>
				</Popover.Root>
			</div>
		{:else}
			<p class="mt-3">No programs found for the selected department.</p>
		{/if}
	{/if}
</div>

<!-- Pass the selected program's requirements to GraduationRequirements -->
{#if selectedProgramRequirements}
	<GraduationRequirements requirements={selectedProgramRequirements} />
{/if}
