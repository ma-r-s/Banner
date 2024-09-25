import { solve } from 'yalps';

/**
 * @typedef {Object} Course
 * @property {string} codigo - The course code.
 * @property {string[]} attributes - The attributes or requirements the course satisfies.
 * @property {number} creditos - The number of credits the course offers.
 */

/**
 * Builds a linear programming model based on the given requirements and courses.
 *
 * @param {Object} requirements - The requirements with their respective limits.
 * @param {Course[]} courses - The list of courses that can satisfy the requirements.
 * @param {string} objective - The objective to maximize (e.g., 'creditos').
 * @returns {Object} The LP model.
 */
function buildLPModel(requirements, courses, objective = 'creditos') {
	const constraints = {};
	const variables = {};

	// Define constraints based on the requirements
	for (const [requirement, limit] of Object.entries(requirements)) {
		constraints[requirement] = { max: limit };
	}

	// Define variables for each course that satisfies the requirements
	courses.forEach((course) => {
		const { codigo: courseCode, attributes, creditos: credits } = course;

		attributes.forEach((requirement) => {
			const variableName = `${courseCode}_${requirement}`;

			if (!variables[variableName]) {
				variables[variableName] = { [objective]: credits };

				// Set coefficients for each requirement
				attributes.forEach((req) => {
					variables[variableName][req] = req === requirement ? 1 : 0;
				});
			}
		});

		// Add constraints to ensure each course is used at most once
		const oneUseConstraint = `one_use_${courseCode}`;
		constraints[oneUseConstraint] = { max: 1 };

		attributes.forEach((req) => {
			const variableName = `${courseCode}_${req}`;
			variables[variableName][oneUseConstraint] = 1;
		});
	});

	return {
		direction: 'maximize', // Objective direction
		objective, // Objective to maximize
		constraints, // Defined constraints
		variables, // Defined variables
		binaries: true // Variables are binary (0 or 1)
	};
}

/**
 * Handles "OR" requirements by selecting the best combination of courses.
 *
 * @param {Object} requirements - The OR requirements with their options.
 * @param {Course[]} availableCourses - The list of available courses.
 * @returns {Object} The mapping of selected courses and unused courses.
 */
export function fillOrRequirements(requirements, availableCourses) {
	const orMapping = {};
	let totalOrCredits = 0;

	// Validate inputs
	if (
		!requirements ||
		typeof requirements !== 'object' ||
		!Array.isArray(availableCourses) ||
		availableCourses.length === 0
	) {
		return { orCredits: 0, orMap: {}, orUnused: availableCourses };
	}

	// Iterate over each requisite and its options
	for (const [requisite, options] of Object.entries(requirements)) {
		let bestOption = null;
		let highestCredits = 0;

		// Evaluate each option to find the one with the highest total credits
		for (const option of options) {
			let optionCredits = 0;
			const selectedCourses = [];

			for (const courseCode of option) {
				const course = availableCourses.find((c) => c.codigo === courseCode);
				if (course) {
					optionCredits += course.creditos;
					selectedCourses.push({ codigo: course.codigo, creditos: course.creditos });
				}
			}

			// Update the best option if this one has more credits
			if (optionCredits > highestCredits) {
				highestCredits = optionCredits;
				bestOption = selectedCourses;
			}
		}

		// If a valid option is found, update the mapping and total credits
		if (bestOption) {
			orMapping[requisite] = bestOption;
			totalOrCredits += highestCredits;

			// Remove the used courses from the available pool
			const usedCourseCodes = bestOption.map((course) => course.codigo);
			availableCourses = availableCourses.filter(
				(course) => !usedCourseCodes.includes(course.codigo)
			);
		}
	}

	return {
		orCredits: totalOrCredits,
		orMap: orMapping,
		orUnused: availableCourses
	};
}

/**
 * Solves the linear programming model and maps the selected courses.
 *
 * @param {Object} model - The LP model to solve.
 * @param {Course[]} courses - The list of available courses.
 * @param {string} requirementType - The type of requirement (e.g., 'bags', 'must').
 * @returns {Object} The mapping of selected courses and unused courses.
 */
function solveLPModel(model, courses, requirementType) {
	const solution = solve(model);

	const mapping = {};
	const selectedCourses = new Set();
	let totalCredits = 0;

	// Initialize mapping for each requirement
	for (const req in model.constraints) {
		if (!req.startsWith('one_use_')) {
			mapping[req] = [];
		}
	}

	// Process the solution if it's optimal or feasible
	if (['optimal', 'feasible'].includes(solution.status)) {
		solution.variables.forEach(([variable, value]) => {
			if (value === 1) {
				const [courseCode, requirement] = variable.split('_');
				const course = courses.find((c) => c.codigo === courseCode);

				if (course && mapping[requirement]) {
					mapping[requirement].push({ codigo: course.codigo, creditos: course.creditos });
					selectedCourses.add(course.codigo);
					totalCredits += course.creditos;
				}
			}
		});
	}

	// Identify unused courses after selection
	const unusedCourses = courses.filter((course) => !selectedCourses.has(course.codigo));

	return {
		[`${requirementType}Credits`]: totalCredits,
		[`${requirementType}Map`]: mapping,
		[`${requirementType}Unused`]: unusedCourses
	};
}

/**
 * Handles "bags" requirements using linear programming.
 *
 * @param {Object} reqs - The "bags" requirements.
 * @param {Course[]} courses - The list of available courses.
 * @returns {Object} The mapping of selected courses and unused courses.
 */
export function fillBagsRequirements(reqs, courses) {
	const bagsModel = buildLPModel(reqs, courses, 'creditos');
	return solveLPModel(bagsModel, courses, 'bags');
}

/**
 * Handles "must" requirements using linear programming.
 *
 * @param {Object} reqs - The "must" requirements.
 * @param {Course[]} courses - The list of available courses.
 * @returns {Object} The mapping of selected courses and unused courses.
 */
export function fillMustRequirements(reqs, courses) {
	const mustModel = buildLPModel(reqs, courses, 'creditos');
	return solveLPModel(mustModel, courses, 'must');
}

/**
 * Assigns courses based on the given requirements and available courses.
 *
 * @param {Object[]} requirements - The list of requirement sections.
 * @param {Course[]} availableCourses - The list of available courses.
 * @returns {Object} The assignment result including credits, mapping, and unused courses.
 */
export function assign(requirements, availableCourses) {
	// Validate input types
	if (!Array.isArray(requirements) || !Array.isArray(availableCourses)) {
		throw new Error('Invalid input. Both arguments must be arrays.');
	}

	// Reorganize the requirements structure for easier processing
	const structuredRequirements = restructureRequirements(requirements);

	// Handle "OR" requirements first
	const { orMap, orCredits, orUnused } = fillOrRequirements(
		structuredRequirements.or,
		availableCourses
	);

	// Handle "bags" requirements with the remaining courses
	const { bagsMap, bagsCredits, bagsUnused } = fillBagsRequirements(
		structuredRequirements.bags,
		orUnused
	);

	// Handle "must" requirements with the remaining courses
	const { mustMap, mustCredits, mustUnused } = fillMustRequirements(
		structuredRequirements.must,
		bagsUnused
	);

	// Combine all mappings
	const combinedMapping = { ...orMap, ...bagsMap, ...mustMap };

	// Calculate total credits from all requirement types
	const totalCredits = orCredits + bagsCredits + mustCredits;

	return {
		credits: totalCredits,
		mapping: combinedMapping,
		unused: mustUnused
	};
}

/**
 * Restructures the requirements into categorized groups: OR, bags, and must.
 *
 * @param {Object[]} requirements - The list of requirement sections.
 * @returns {Object} The structured requirements.
 */
function restructureRequirements(requirements) {
	const structuredReqs = {
		or: {},
		bags: {},
		must: {}
	};

	// Iterate over each section of requirements
	requirements.forEach((section) => {
		if (!section.requisites || !Array.isArray(section.requisites)) {
			return;
		}

		section.requisites.forEach((req) => {
			const { rule, data } = req;

			// Initialize the rule category if it doesn't exist
			if (!structuredReqs[rule]) {
				structuredReqs[rule] = {};
			}

			// Merge the data into the corresponding rule category
			Object.entries(data).forEach(([key, value]) => {
				if (structuredReqs[rule][key]) {
					// If the key already exists, merge the arrays or handle accordingly
					if (Array.isArray(structuredReqs[rule][key]) && Array.isArray(value)) {
						structuredReqs[rule][key] = [...structuredReqs[rule][key], ...value];
					} else {
						structuredReqs[rule][key] = value;
					}
				} else {
					structuredReqs[rule][key] = value;
				}
			});
		});
	});

	return structuredReqs;
}
