import { superValidate } from 'sveltekit-superforms';
import { loginSchema } from './Bar/LogIn/schema';
import { registerSchema } from './Bar/Register/schema';
import { valibot } from 'sveltekit-superforms/adapters';
import { error } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const loginForm = await superValidate(valibot(loginSchema));
	const registerForm = await superValidate(valibot(registerSchema));

	try {
		// Fetch courses
		const courses = await locals.pb.collection('courses').getFullList();
		const departments = await locals.pb.collection('departments').getFullList();
		const programs = await locals.pb.collection('programs').getFullList();
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
		console.log('fetching data');
		return {
			courses: enrichedCourses,
			programs,
			departments,
			loginForm,
			registerForm,
			user: locals.user || undefined
		};
	} catch (err) {
		console.log('Error fetching courses and attributes: ', err);
		throw error(500, 'Failed to fetch data');
	}
};
