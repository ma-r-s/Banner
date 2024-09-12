<script>
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { registerSchema } from './schema.js';
	import { superForm } from 'sveltekit-superforms';
	import * as Dialog from '$lib/components/ui/dialog/index.js';

	import { valibotClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { LoaderCircle } from 'lucide-svelte';
	// import SuperDebug from 'sveltekit-superforms';
	export let data;
	export let dialogOpen;
	const form = superForm(data.registerForm, {
		validators: valibotClient(registerSchema),
		onError: ({ result }) => {
			toast.error(result.error.message);
		},
		onResult: ({ result }) => {
			if (result.status === 303) {
				dialogOpen = false;
				toast.success('Registro exitoso, verifica tu correo para activar tu cuenta');
			}
		}
	});

	const { form: formData, enhance, delayed } = form;
</script>

<Dialog.Header>
	<Dialog.Title>Registrate</Dialog.Title>
</Dialog.Header>
<form method="POST" action="?/register" class="space-y-4" use:enhance>
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label>Nombre</Form.Label>
			<Input {...attrs} bind:value={$formData.name} placeholder={'Ingresa tu nombre'} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="email">
		<Form.Control let:attrs>
			<Form.Label>Correo</Form.Label>
			<Input {...attrs} bind:value={$formData.email} placeholder={'Ingresa tu correo Uniandes'} />
		</Form.Control>
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
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="passwordConfirm">
		<Form.Control let:attrs>
			<Form.Label>Confirma tu Contraseña</Form.Label>
			<Input
				{...attrs}
				bind:value={$formData.passwordConfirm}
				type="password"
				placeholder="Repite tu contraseña"
			/>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button>
		{#if $delayed}
			<LoaderCircle class="size-4 animate-spin" />
		{:else}
			Registrate
		{/if}
	</Form.Button>
	<!-- <SuperDebug  data={$formData} /> -->
</form>
