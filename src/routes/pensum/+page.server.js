import { error } from '@sveltejs/kit';

export const actions = {
	// Other actions if needed

	// Custom save action that handles JSON requests
	default: async ({ request, locals }) => {
		try {
			// Parse the incoming JSON request body
			const { requirements, programId } = await request.json();

			// Update the program's graduation requirements
			await locals.pb.collection('programs').update(programId, {
				requirements: requirements // Overwrite with the updated requirements
			});

			return { success: true };
		} catch (err) {
			console.error('Error updating program:', err);
			throw error(500, 'Failed to save the updated requirements');
		}
	}
};
