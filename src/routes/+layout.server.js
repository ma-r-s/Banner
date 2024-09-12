import { superValidate } from 'sveltekit-superforms';
import { loginSchema } from './Bar/LogIn/schema';
import { registerSchema } from './Bar/Register/schema';
import { valibot } from 'sveltekit-superforms/adapters';

export const load = async ({ locals }) => {
	const loginForm = await superValidate(valibot(loginSchema));
	const registerForm = await superValidate(valibot(registerSchema));

	return {
		loginForm,
		registerForm,
		user: locals.user || undefined
	};
};
