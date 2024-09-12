import * as v from 'valibot';

export const loginSchema = v.object({
	email: v.pipe(
		v.string('Tu correo debe ser un string.'),
		v.nonEmpty('Por favor, ingresa tu correo.'),
		v.email('Ingresa un correo válido.'),
		v.endsWith('@uniandes.edu.co', 'Ingresa un correo Uniandes válido.')
	),
	password: v.pipe(
		v.string('Tu contraseña debe ser un string.'),
		v.nonEmpty('Por favor, ingresa tu contraseña.'),
		v.minLength(8, 'Tu contraseña debe tener al menos 8 caracteres.')
	)
});
