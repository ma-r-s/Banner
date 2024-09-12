<script>
	import LogIn from './LogIn/LogIn.svelte';
	import Register from './Register/Register.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Toggle from './Toggle.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { CircleUserRound } from 'lucide-svelte';
	let dialogOpen = false;
	let currentForm = 'login'; // Toggle between 'login' and 'register'
	export let data;
	function openDialog(formType) {
		currentForm = formType;
		dialogOpen = true;
	}

	function toggleForm() {
		currentForm = currentForm === 'login' ? 'register' : 'login';
	}
</script>

<div class="mb-6 flex gap-4">
	<p class="text-xl font-bold">Revisión de Carpeta</p>
	<div class="flex-grow"></div>

	{#if !data.user}
		<Button class="hidden sm:block" variant="outline" on:click={() => openDialog('login')}
			>Iniciar sesíon</Button
		>
		<Button class="hidden sm:block" variant="outline" on:click={() => openDialog('register')}
			>Registrarse</Button
		>
	{:else}
		<Button href="/pensum" variant="link">Editar Pensum</Button>
		<Button href="/logout" variant="link">Log Out</Button>
		<Button class="hidden sm:flex" variant="ghost" size="icon">
			<CircleUserRound class="size-4" />
		</Button>
	{/if}

	<Toggle />
</div>

<!-- Dialog Component -->
{#if dialogOpen}
	<Dialog.Root open={dialogOpen} onOpenChange={(open) => (dialogOpen = open)}>
		<Dialog.Content class="sm:max-w-[425px]">
			<!-- Conditionally Render Form -->
			{#if currentForm === 'login'}
				<LogIn {data} bind:dialogOpen />
			{:else}
				<Register {data} bind:dialogOpen />
			{/if}

			<Dialog.Footer>
				<button class="text-sm underline" on:click={toggleForm}>
					{#if currentForm === 'login'}
						<p>¿No tienes cuenta? Regístrate</p>
					{:else}
						<p>¿Ya tienes cuenta? Inicia sesíon</p>
					{/if}
				</button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/if}
