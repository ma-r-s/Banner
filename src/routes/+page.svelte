<script>
	import DataTable from './BuscarMaterias.svelte';
	import RequisiteTable from './RequisiteTable.svelte';
	import { assign } from '$lib/opt.js';
	import requisitos from '$lib/data/requisitos.json';
	export let data;

	let selectedCourses = [];
	let mapping, credits, unused;
	const result = assign(requisitos, selectedCourses); // Use selectedCourses here
	mapping = result.mapping;
	credits = result.credits;
	unused = result.unused;

	// Update selected courses when the child component sends an event
	const handleUpdate = (event) => {
		if (JSON.stringify(event.detail) != JSON.stringify(selectedCourses)) {
			selectedCourses = event.detail;
			const result = assign(requisitos, selectedCourses); // Use selectedCourses here
			mapping = result.mapping;
			credits = result.credits;
			unused = result.unused;
			console.log('Updated selected courses');
		}
	};
</script>

<p class="text-3xl font-bold">Revisión de Carpeta</p>

<!-- Listen for the update event -->
<DataTable courses={data.courses} on:update={handleUpdate} />

<!-- Display total credits -->
<div class="my-6">
	<p class="text-lg font-semibold">Total de créditos: {credits}</p>
</div>

{#each requisitos as requisito, i (i)}
	<RequisiteTable {requisito} {mapping} />
{/each}

<!-- Display unused courses -->
<div>
	<p class="mt-6 text-lg font-semibold">Cursos no utilizados: {unused.length}</p>
	<div class="flex flex-wrap">
		{#each unused as course}
			<div class="p-4">{course.codigo}</div>
		{/each}
	</div>
</div>
