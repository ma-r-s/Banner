<script>
	import * as Table from '$lib/components/ui/table';
	export let requisito;
	export let mapping;
</script>

<div class="p-3 text-xl font-semibold">{requisito.type}</div>
<Table.Root>
	<Table.Caption>{requisito.description}</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-[100px]">Requisito</Table.Head>
			<Table.Head>Clases</Table.Head>
			<Table.Head class="w-[50px] text-right">Requeridos</Table.Head>
			<Table.Head class="w-[50px] text-right">Vistos</Table.Head>
			<Table.Head class="w-[50px] text-right">Faltantes</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each requisito.requisites as req}
			{#each Object.keys(req.data) as course}
				<Table.Row>
					<Table.Cell class="font-medium">{req.name}</Table.Cell>
					<Table.Cell class="">
						<div class="justify-left flex gap-4">
							{#each mapping[course] || [] as seen}
								<div>{seen.codigo}</div>
							{/each}
						</div>
					</Table.Cell>
					<Table.Cell class="text-right">{req.data[course]}</Table.Cell>
					<Table.Cell class="text-right">
						{mapping[course]?.seen || 0}
					</Table.Cell>
					<Table.Cell class="text-right">
						{req.data[course] - (mapping[course]?.seen || 0)}
					</Table.Cell>
				</Table.Row>
			{/each}
		{/each}
	</Table.Body>
</Table.Root>
