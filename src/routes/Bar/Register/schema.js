import * as v from 'valibot';
export const registerSchema = v.pipe(
	v.object({
		name: v.pipe(
			v.string('Tu nombre debe ser un string.'),
			v.nonEmpty('Por favor, ingresa tu nombre.'),
			v.minLength(5, 'Tu nombre debe tener al menos 5 caracteres.')
		),
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
		),
		passwordConfirm: v.string()
	}),
	v.forward(
		v.partialCheck(
			[['password'], ['passwordConfirm']],
			(input) => input.password === input.passwordConfirm,
			'Las contraseñas no coinciden.'
		),
		['passwordConfirm']
	)
);
