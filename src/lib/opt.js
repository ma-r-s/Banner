import { solve } from 'yalps';

// Utility function to build the LP model for "must" requirements
function buildMust(reqsMust, coursesMust) {
	const constraints = {};
	const variables = {};

	for (const req in reqsMust) {
		constraints[req] = { max: reqsMust[req] };
	}

	for (const course of coursesMust) {
		const { codigo, val, creditos } = course;
		val.forEach((req) => {
			const varName = `${codigo}_${req}`;
			if (!variables[varName]) {
				variables[varName] = { creditos };
				val.forEach((r) => (variables[varName][r] = r === req ? 1 : 0));
			}
		});
	}

	coursesMust.forEach((course) => {
		const courseVars = course.val.map((req) => `${course.codigo}_${req}`);
		constraints[`one_use_${course.codigo}`] = { max: 1 };
		courseVars.forEach((courseVar) => {
			variables[courseVar][`one_use_${course.codigo}`] = 1;
		});
	});

	return {
		direction: 'maximize',
		objective: 'creditos',
		constraints,
		variables,
		binaries: true
	};
}

// Utility function to build the LP model for "bags" requirements
function buildBags(reqsBags, coursesBags) {
	const constraints = {};
	const variables = {};

	// Initialize constraints for each requirement to ensure minimum credits
	for (const req in reqsBags) {
		constraints[req] = { max: reqsBags[req] };
	}

	// Initialize variables and constraints for each course
	for (const course of coursesBags) {
		const { codigo, val, creditos } = course;
		val.forEach((req) => {
			const varName = `${codigo}_${req}`;
			if (!variables[varName]) {
				variables[varName] = { creditos };
				variables[varName][req] = creditos;
			}
		});
	}

	// Add constraint to ensure each course is only used once
	coursesBags.forEach((course) => {
		const courseVars = course.val.map((req) => `${course.codigo}_${req}`);
		constraints[`one_use_${course.codigo}`] = { max: 1 };
		courseVars.forEach((courseVar) => {
			variables[courseVar][`one_use_${course.codigo}`] = 1;
		});
	});

	return {
		direction: 'maximize',
		objective: 'creditos',
		constraints,
		variables,
		binaries: true
	};
}

export function fillOr(requirements, unusedCourses) {
	const mapping = {};
	let totalCredits = 0;

	if (!requirements || !Array.isArray(unusedCourses) || unusedCourses.length === 0) {
		return { orCredits: 0, orMap: {}, orUnused: unusedCourses };
	}

	for (const [requisite, options] of Object.entries(requirements)) {
		let bestOption = null;
		let bestCredits = 0;

		for (const option of options) {
			let optionCredits = 0;
			const usedCourses = [];

			for (const course of option) {
				const usedCourse = unusedCourses.find((c) => c.codigo === course);
				if (usedCourse) {
					optionCredits += usedCourse.creditos;
					usedCourses.push({ codigo: usedCourse.codigo, creditos: usedCourse.creditos });
				}
			}

			if (optionCredits > bestCredits) {
				bestCredits = optionCredits;
				bestOption = usedCourses;
			}
		}

		if (bestOption) {
			mapping[requisite] = bestOption;
			totalCredits += bestCredits;
			unusedCourses = unusedCourses.filter((u) => !bestOption.some((c) => c.codigo === u.codigo));
		}
	}

	return { orCredits: totalCredits, orMap: mapping, orUnused: unusedCourses };
}

export function fillBags(reqs, courses) {
	// Build the linear programming model
	const modelBags = buildBags(reqs, courses);
	// Solve the model using YALPS
	const solution = solve(modelBags);
	// Initialize the result structures
	let reqMap = {};
	let usedCourses = [];
	let totalCredits = 0;

	for (let req in reqs) {
		reqMap[req] = [];
	}
	// Process the solution
	if (solution.status === 'optimal' || solution.status === 'feasible') {
		solution.variables.forEach(([variable, value]) => {
			if (value === 1) {
				const [codigo, req] = variable.split('_');
				const course = courses.find((c) => c.codigo === codigo);
				if (course && reqMap[req]) {
					reqMap[req].push({ codigo: course.codigo, creditos: course.creditos });
					usedCourses.push(codigo);
					totalCredits += course.creditos;
				}
			}
		});
	}

	// Collect unused courses
	let unusedCourses = courses.filter((course) => !usedCourses.includes(course.codigo));
	return {
		bagsCredits: totalCredits,
		bagsMap: reqMap,
		bagsUnused: unusedCourses
	};
}

export function fillMust(reqs, courses) {
	// Build the linear programming model
	const modelMust = buildMust(reqs, courses);
	// Solve the model using YALPS
	const solution = solve(modelMust);
	// Initialize the result structures
	let reqMap = {};
	let usedCourses = [];
	let totalCredits = 0;

	for (let req in reqs) {
		reqMap[req] = [];
	}

	// Process the solution
	if (solution.status === 'optimal' || solution.status === 'feasible') {
		solution.variables.forEach(([variable, value]) => {
			if (value === 1) {
				const [codigo, req] = variable.split('_');
				const course = courses.find((c) => c.codigo === codigo);
				if (course && reqMap[req]) {
					reqMap[req].push({ codigo: course.codigo, creditos: course.creditos });
					usedCourses.push(codigo);
					totalCredits += course.creditos;
				}
			}
		});
	}

	// Collect unused courses
	let unusedCourses = courses.filter((course) => !usedCourses.includes(course.codigo));
	return {
		mustCredits: totalCredits,
		mustMap: reqMap,
		mustUnused: unusedCourses
	};
}

export function assign(reqs, seen) {
	if (!Array.isArray(reqs) || !Array.isArray(seen)) {
		throw new Error('Invalid input. Both arguments must be arrays.');
	}
	reqs = changeStructure(reqs);
	let { orMap, orCredits, orUnused } = fillOr(reqs.or, seen);
	let { bagsMap, bagsCredits, bagsUnused } = fillBags(reqs.bags, orUnused);

	let { mustMap, mustCredits, mustUnused } = fillMust(reqs.must, bagsUnused);
	let mapping = { ...orMap, ...bagsMap, ...mustMap };
	let credits = orCredits + bagsCredits + mustCredits;
	return { credits, mapping, unused: mustUnused };
}

function changeStructure(newStructure) {
	const reqs = {};

	newStructure.forEach((section) => {
		section.requisites.forEach((req) => {
			const rule = req.rule;
			const data = req.data;

			if (!reqs[rule]) {
				reqs[rule] = {};
			}

			Object.keys(data).forEach((key) => {
				reqs[rule][key] = data[key];
			});
		});
	});

	return reqs;
}
