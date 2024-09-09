<script>
	import '../app.css';
	import Toggle from '$lib/Toggle.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { CircleUserRound } from 'lucide-svelte';
	import { ModeWatcher } from 'mode-watcher';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	// Import your Login and Register components
	import LogIn from '$lib/auth/LogIn.svelte';
	import Register from '$lib/auth/Register.svelte';

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

<div class="container py-10">
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
			<Button class="hidden sm:block" variant="link">Log Out</Button>
			<Button class="hidden sm:flex" variant="ghost" size="icon">
				<CircleUserRound class="size-4" />
			</Button>
		{/if}

		<Toggle />
	</div>

	<ModeWatcher />

	<!-- Dialog Component -->
	{#if dialogOpen}
		<Dialog.Root open={dialogOpen} onOpenChange={(open) => (dialogOpen = open)}>
			<Dialog.Content class="sm:max-w-[425px]">
				<Dialog.Header>
					<Dialog.Title>{currentForm === 'login' ? 'Inicia sesíon' : 'Registrate'}</Dialog.Title>
				</Dialog.Header>

				<!-- Conditionally Render Form -->
				{#if currentForm === 'login'}
					<LogIn />
				{:else}
					<Register />
				{/if}

				<Dialog.Footer>
					<Button on:click={toggleForm}>
						{currentForm === 'login' ? 'Switch to Register' : 'Switch to Log In'}
					</Button>
				</Dialog.Footer>
			</Dialog.Content>
		</Dialog.Root>
	{/if}

	<slot />
</div>
