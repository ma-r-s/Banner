import { redirect } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.pb.authStore.isValid) {
		redirect(303, '/');
	}
	// +page.server.js
	try {
		const departments = await locals.pb.collection('departments').getFullList();
		const programs = await locals.pb.collection('programs').getFullList();
		return { departments, programs };
	} catch (err) {
		console.log('Error: ', err);
		throw error(500, err.message);
	}
};
