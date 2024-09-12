<script>
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { loginSchema } from './schema.js';
	import { superForm } from 'sveltekit-superforms';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { LoaderCircle } from 'lucide-svelte';
	// import SuperDebug from 'sveltekit-superforms';
	export let data;
	export let dialogOpen;
	const form = superForm(data.loginForm, {
		validators: valibotClient(loginSchema),
		onError: ({ result }) => {
			toast.error(result.error.message);
		},
		onResult: ({ result }) => {
			if (result.status === 303) dialogOpen = false;
		}
	});

	const { form: formData, enhance, delayed } = form;
</script>

<Dialog.Header>
	<Dialog.Title>Inicia sesíon</Dialog.Title>
</Dialog.Header>
<form method="POST" action="?/login" class="space-y-4" use:enhance>
	<Form.Field {form} name="email">
		<Form.Control let:attrs>
			<Form.Label>Correo</Form.Label>
			<Input {...attrs} bind:value={$formData.email} placeholder={'Ingresa tu correo Uniandes'} />
		</Form.Control>
		<!-- <Form.Description>We will email you to verify your account.</Form.Description> -->
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="password">
		<Form.Control let:attrs>
			<Form.Label>Contraseña</Form.Label>
			<Input
				{...attrs}
				bind:value={$formData.password}
				type="password"
				placeholder="Ingresa tu contraseña"
			/>
		</Form.Control>
		<!-- <Form.Description>Choose a strong password.</Form.Description> -->
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button>
		{#if $delayed}
			<LoaderCircle class="size-4 animate-spin" />
		{:else}
			Iniciar sesíon
		{/if}
	</Form.Button>
	<!-- <SuperDebug  data={$formData} /> -->
</form>
