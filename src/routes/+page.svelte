<script>
	import DataTable from './BuscarMaterias.svelte';
	import RequisiteTable from './RequisiteTable.svelte';
	import { assign } from '$lib/opt.js';
	import requisitos from '$lib/data/requisitos.json';

	let courses = [];
	let mapping, credits, unused;

	$: {
		const result = assign(requisitos, courses);
		mapping = result.mapping;
		credits = result.credits;
		unused = result.unused;
	}
</script>

<p class="text-3xl font-bold">Revisión de Carpeta</p>
<DataTable bind:courses />
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
