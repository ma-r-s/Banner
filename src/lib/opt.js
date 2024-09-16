import { solve } from 'yalps';

// Utility function to build the Linear Programming (LP) model for "must" requirements
function buildMustRequirements(mustRequirements, mustCourses) {
	const constraints = {};
	const variables = {};

	// Define constraints based on the "must" requirements
	for (const requirement in mustRequirements) {
		constraints[requirement] = { max: mustRequirements[requirement] };
	}

	// Define variables for each course that satisfies the "must" requirements
	for (const course of mustCourses) {
		const { codigo: courseCode, attributes, creditos: credits } = course;

		attributes.forEach((requirement) => {
			const variableName = `${courseCode}_${requirement}`;

			// Initialize the variable if it doesn't exist
			if (!variables[variableName]) {
				variables[variableName] = { creditos: credits };

				// Set coefficients for each requirement
				attributes.forEach((req) => {
					variables[variableName][req] = req === requirement ? 1 : 0;
				});
			}
		});
	}

	// Add constraints to ensure each course is used at most once
	mustCourses.forEach((course) => {
		const { codigo: courseCode } = course;
		const courseVariables = course.attributes.map((req) => `${course.codigo}_${req}`);

		constraints[`one_use_${courseCode}`] = { max: 1 };

		// Associate each course variable with the "one_use" constraint
		courseVariables.forEach((variable) => {
			variables[variable][`one_use_${courseCode}`] = 1;
		});
	});

	return {
		direction: 'maximize', // Objective direction
		objective: 'creditos', // Objective to maximize total credits
		constraints, // Defined constraints
		variables, // Defined variables
		binaries: true // Variables are binary (0 or 1)
	};
}

// Utility function to build the LP model for "bags" requirements
function buildBagsRequirements(bagsRequirements, bagsCourses) {
	const constraints = {};
	const variables = {};

	// Define constraints based on the "bags" requirements
	for (const requirement in bagsRequirements) {
		constraints[requirement] = { max: bagsRequirements[requirement] };
	}

	// Define variables for each course that satisfies the "bags" requirements
	for (const course of bagsCourses) {
		const { codigo: courseCode, attributes, creditos: credits } = course;

		attributes.forEach((requirement) => {
			const variableName = `${courseCode}_${requirement}`;

			// Initialize the variable if it doesn't exist
			if (!variables[variableName]) {
				variables[variableName] = { creditos: credits };
				variables[variableName][requirement] = credits; // Coefficient for the requirement
			}
		});
	}

	// Add constraints to ensure each course is used at most once
	bagsCourses.forEach((course) => {
		const { codigo: courseCode } = course;
		const courseVariables = course.attributes.map((req) => `${course.codigo}_${req}`);

		constraints[`one_use_${courseCode}`] = { max: 1 };

		// Associate each course variable with the "one_use" constraint
		courseVariables.forEach((variable) => {
			variables[variable][`one_use_${courseCode}`] = 1;
		});
	});

	return {
		direction: 'maximize', // Objective direction
		objective: 'creditos', // Objective to maximize total credits
		constraints, // Defined constraints
		variables, // Defined variables
		binaries: true // Variables are binary (0 or 1)
	};
}

// Function to handle "OR" requirements by selecting the best combination of courses
export function fillOrRequirements(requirements, availableCourses) {
	const orMapping = {};
	let totalOrCredits = 0;

	// Validate inputs
	if (!requirements || !Array.isArray(availableCourses) || availableCourses.length === 0) {
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
			availableCourses = availableCourses.filter(
				(course) => !bestOption.some((selected) => selected.codigo === course.codigo)
			);
		}
	}

	return {
		orCredits: totalOrCredits,
		orMap: orMapping,
		orUnused: availableCourses
	};
}

// Function to handle "bags" requirements using linear programming
export function fillBagsRequirements(reqs, courses) {
	// Build the LP model for "bags" requirements
	const bagsModel = buildBagsRequirements(reqs, courses);

	// Solve the LP model using YALPS
	const solution = solve(bagsModel);

	const bagsMapping = {};
	const selectedCourses = [];
	let totalBagsCredits = 0;

	// Initialize mapping for each "bags" requirement
	for (const req in reqs) {
		bagsMapping[req] = [];
	}

	// Process the solution if it's optimal or feasible
	if (solution.status === 'optimal' || solution.status === 'feasible') {
		solution.variables.forEach(([variable, value]) => {
			if (value === 1) {
				const [courseCode, requirement] = variable.split('_');
				const course = courses.find((c) => c.codigo === courseCode);

				if (course && bagsMapping[requirement]) {
					bagsMapping[requirement].push({ codigo: course.codigo, creditos: course.creditos });
					selectedCourses.push(course.codigo);
					totalBagsCredits += course.creditos;
				}
			}
		});
	}

	// Identify unused courses after selecting for "bags" requirements
	const unusedCourses = courses.filter((course) => !selectedCourses.includes(course.codigo));

	return {
		bagsCredits: totalBagsCredits,
		bagsMap: bagsMapping,
		bagsUnused: unusedCourses
	};
}

// Function to handle "must" requirements using linear programming
export function fillMustRequirements(reqs, courses) {
	// Build the LP model for "must" requirements
	const mustModel = buildMustRequirements(reqs, courses);

	// Solve the LP model using YALPS
	const solution = solve(mustModel);

	const mustMapping = {};
	const selectedCourses = [];
	let totalMustCredits = 0;

	// Initialize mapping for each "must" requirement
	for (const req in reqs) {
		mustMapping[req] = [];
	}

	// Process the solution if it's optimal or feasible
	if (solution.status === 'optimal' || solution.status === 'feasible') {
		solution.variables.forEach(([variable, value]) => {
			if (value === 1) {
				const [courseCode, requirement] = variable.split('_');
				const course = courses.find((c) => c.codigo === courseCode);

				if (course && mustMapping[requirement]) {
					mustMapping[requirement].push({ codigo: course.codigo, creditos: course.creditos });
					selectedCourses.push(course.codigo);
					totalMustCredits += course.creditos;
				}
			}
		});
	}

	// Identify unused courses after selecting for "must" requirements
	const unusedCourses = courses.filter((course) => !selectedCourses.includes(course.codigo));

	return {
		mustCredits: totalMustCredits,
		mustMap: mustMapping,
		mustUnused: unusedCourses
	};
}

// Main function to assign courses based on requirements and available courses
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

// Helper function to restructure the requirements into categorized groups
function restructureRequirements(requirements) {
	const structuredReqs = {
		or: {},
		bags: {},
		must: {}
	};

	// Iterate over each section of requirements
	requirements.forEach((section) => {
		section.requisites.forEach((req) => {
			const { rule, data } = req;

			// Initialize the rule category if it doesn't exist
			if (!structuredReqs[rule]) {
				structuredReqs[rule] = {};
			}

			// Merge the data into the corresponding rule category
			Object.keys(data).forEach((key) => {
				structuredReqs[rule][key] = data[key];
			});
		});
	});

	return structuredReqs;
}
