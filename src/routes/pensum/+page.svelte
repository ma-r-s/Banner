<script>
	import ProgramSelector from '$lib/components/local/ProgramSelector.svelte';
	import GraduationRequirements from './GraduationRequirements.svelte';

	export let data;

	let selectedProgramRequirements = null;
	let selectedProgram = null;

	// Handle the selected program from the ProgramSelector component
	const handleProgramSelect = (event) => {
		selectedProgram = event.detail;
		selectedProgramRequirements = selectedProgram?.requirements || null;
	};
</script>

<h1 class="mb-4 text-2xl font-bold">Requisitos de Grado</h1>

<!-- Use ProgramSelector component -->
<ProgramSelector
	departments={data.departments}
	programs={data.programs}
	on:selectProgram={handleProgramSelect}
/>

<!-- Display Graduation Requirements -->
{#if selectedProgramRequirements}
	<GraduationRequirements
		requirements={selectedProgramRequirements}
		programId={selectedProgram?.id}
	/>
{/if}
