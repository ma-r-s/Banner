<script>
	import { Separator } from '$lib/components/ui/separator/index.js';
	import DataTable from './BuscarMaterias.svelte';
	import RequisiteTable from './RequisiteTable.svelte';
	import ProgramSelector from '$lib/components/local/ProgramSelector.svelte';
	import { assign } from '$lib/opt.js';
	export let data;
	let requisitos = [];
	let selectedCourses = [];
	let selectedProgram = null;
	let mapping, credits, unused;
	const result = assign(requisitos, selectedCourses); // Use selectedCourses here
	mapping = result.mapping;
	credits = result.credits;
	unused = result.unused;

	const handleProgramSelect = (event) => {
		selectedProgram = event.detail; // Assign the selected program (or null)
		requisitos = selectedProgram?.requirements || [];
		handleUpdate({ detail: selectedCourses, force: true });
	};

	// Update selected courses when the child component sends an event
	const handleUpdate = (event) => {
		if (JSON.stringify(event.detail) != JSON.stringify(selectedCourses) || event.force) {
			selectedCourses = event.detail;
			const result = assign(requisitos, selectedCourses); // Use selectedCourses here
			mapping = result.mapping;
			credits = result.credits;
			unused = result.unused;
		}
	};
</script>

<p class="mb-4 text-3xl font-bold">Prueba de revisión de Carpeta</p>

<ProgramSelector
	departments={data.departments}
	programs={data.programs}
	on:selectProgram={handleProgramSelect}
/>
<Separator class="my-4" />
<DataTable courses={data.courses} on:update={handleUpdate} />

<!-- Display total credits -->
{#if requisitos?.length > 0}
	<Separator class="my-4" />
	<p class="my-4 text-lg font-semibold">Revisión de carpeta para {selectedProgram?.name}</p>
	{#each requisitos as requisito, i (i)}
		<RequisiteTable {requisito} {mapping} />
	{/each}
	<Separator class="my-4" />

	<!-- Display unused courses -->
	<p class="text-lg font-semibold">Total de créditos usados: {credits}</p>
	<div>
		<p class="mt-6 text-lg font-semibold">Cursos no utilizados: {unused.length}</p>
		<div class="flex flex-wrap">
			{#each unused as course}
				<div class="p-4">{course.codigo}</div>
			{/each}
		</div>
	</div>
{/if}
