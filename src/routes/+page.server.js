import { error } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { loginSchema } from './Bar/LogIn/schema';
import { registerSchema } from './Bar/Register/schema';

export const actions = {
	login: async (event) => {
		const form = await superValidate(event, valibot(loginSchema));
		if (!form.valid) {
			error(400, { message: 'Invalid form data.' });
		}
		try {
			await event.locals.pb
				.collection('users')
				.authWithPassword(form.data.email, form.data.password);
		} catch (e) {
			console.log('Error: ', e);
			error(500, { message: e.message });
		}
		redirect(303, '/');
	},
	register: async (event) => {
		const form = await superValidate(event, valibot(registerSchema));
		if (!form.valid) {
			error(400, { message: 'Invalid form data.' });
		}
		try {
			await event.locals.pb.collection('users').create(form.data);
			await event.locals.pb.collection('users').requestVerification(form.data.email);
		} catch (e) {
			console.log('Error: ', e);
			error(500, {
				message: 'This ' + Object.keys(e.response.data).join(', ') + ' is already in use'
			});
		}
		redirect(303, '/');
	}
};

export const load = async ({ locals }) => {
	try {
		// Fetch courses
		const courses = await locals.pb.collection('courses').getFullList();

		// Fetch all attributes
		const attributes = await locals.pb.collection('attributes').getFullList();

		// Create a map of attribute IDs to attribute names
		const attributeMap = {};
		attributes.forEach((attr) => {
			attributeMap[attr.id] = attr.attribute; // Only store the 'attribute' field
		});

		// Enrich courses with just the attribute names
		const enrichedCourses = courses.map((course) => {
			const courseAttributes = course.attributes_ids.map((attrId) => attributeMap[attrId]);
			return { ...course, attributes: courseAttributes }; // attributes is now an array of attribute names
		});

		return { courses: enrichedCourses };
	} catch (err) {
		console.log('Error fetching courses and attributes: ', err);
		throw error(500, 'Failed to fetch data');
	}
};
