import { superValidate } from 'sveltekit-superforms';
import { loginSchema } from './Bar/LogIn/schema';
import { valibot } from 'sveltekit-superforms/adapters';

export const load = async () => {
	const form = await superValidate(valibot(loginSchema));
	return { form };
};
