<!-- src/routes/pensum/+page.svelte -->
<script>
	export let data;

	import GraduationRequirements from './GraduationRequirements.svelte';
	import * as Select from '$lib/components/ui/select/index.js';

	let selectedDepartment;
	let selectedProgram = '';
	let selectedProgramRequirements = null;
	// Filter programs based on the selected department
	$: filteredPrograms = data.programs.filter(
		(program) => program.department_id === selectedDepartment?.value
	);

	// Update the graduation requirements once a program is selected
	$: {
		const programId = selectedProgram.value;

		const program = data.programs.find((p) => p.id === programId);
		if (program) {
			selectedProgramRequirements = program.requirements; // Assume requirements is a JSON field
		} else {
			selectedProgramRequirements = null;
		}
	}

	let cleanOld = () => {
		selectedProgramRequirements = null;
		selectedProgram = '';
	};
</script>

<h1 class="mb-4 text-2xl font-bold">Requisitos de Grado</h1>
<div class="flex">
	<!-- Department Selector -->
	<div class="mb-4">
		<label for="department" class="mb-2 block">Departamento</label>
		<Select.Root bind:selected={selectedDepartment} onSelectedChange={cleanOld}>
			<Select.Trigger class="w-[180px]">
				<Select.Value placeholder="Departamento" />
			</Select.Trigger>
			<Select.Content>
				<Select.Group>
					<Select.Label>Departments</Select.Label>
					{#each data.departments as department}
						<Select.Item value={department.id} label={department.name}>
							{department.name}
						</Select.Item>
					{/each}
				</Select.Group>
			</Select.Content>
		</Select.Root>
	</div>

	<!-- Program Selector -->
	{#if selectedDepartment}
		{#if filteredPrograms.length > 0}
			<div class="mb-4">
				<label for="program" class="mb-2 block">Select Program</label>
				<Select.Root bind:selected={selectedProgram}>
					<Select.Trigger class="w-[180px]">
						<Select.Value placeholder="Select a program" />
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Programs</Select.Label>
							{#each filteredPrograms as program}
								<Select.Item value={program.id} label={program.name}>
									{program.name}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			</div>
		{:else}
			<p>No programs found for the selected department.</p>
		{/if}
	{/if}
</div>

<!-- Pass the selected program's requirements to GraduationRequirements -->
{#if selectedProgramRequirements}
	<GraduationRequirements requirements={selectedProgramRequirements} />
{/if}
