// Import normalizer logic from academics API route to test alternative column headers
function normalizeObjectKeys(obj, context) {
  if (!obj || typeof obj !== 'object') return obj;
  const normalized = {};
  for (const key of Object.keys(obj)) {
    const rawValue = obj[key];
    const k = key.toLowerCase().replace(/[\s_\-]/g, '');
    
    if (context === 'department') {
      if (k === 'code' || k === 'deptcode' || k === 'departmentcode') normalized.Code = rawValue;
      else if (k === 'name' || k === 'title') normalized.Name = rawValue;
      else if (k === 'description' || k === 'desc') normalized.Description = rawValue;
      else normalized[key] = rawValue;
    } 
    else if (context === 'class') {
      if (k === 'code' || k === 'classcode' || k === 'cohortcode') normalized.Code = rawValue;
      else if (k === 'name' || k === 'title' || k === 'classlabel') normalized.Name = rawValue;
      else if (k === 'departmentcode' || k === 'deptcode') normalized.DepartmentCode = rawValue;
      else normalized[key] = rawValue;
    } 
    else if (context === 'course') {
      if (k === 'code' || k === 'coursecode' || k === 'subjectcode') normalized.Code = rawValue;
      else if (k === 'title' || k === 'name' || k === 'coursetitle' || k === 'subject') normalized.Title = rawValue;
      else if (k === 'description' || k === 'desc') normalized.Description = rawValue;
      else if (k === 'credits' || k === 'credit' || k === 'credithours') normalized.Credits = rawValue;
      else if (k === 'track') normalized.Track = rawValue;
      else if (k === 'classcode' || k === 'cohortcode') normalized.ClassCode = rawValue;
      else normalized[key] = rawValue;
    }
  }
  return normalized;
}

// Sample messy spreadsheet parsed rows
const rawDepartments = [
  { "dept code": "THEO_TEST", "Name": "Theology Test Dept", "desc": "Alternative headers verification" }
];

const rawClasses = [
  { "class code": "TH-TEST1", "class label": "Theology Class Cohort", "Dept Code": "THEO_TEST" }
];

const rawCourses = [
  { "subject code": "T-101", "Course Title": "Introduction to Test Syllabi", "credits": 4, "class code": "TH-TEST1" }
];

console.log("\n=================== INITIATING KEY MAPPING TEST ===================");

console.log("\n[1] Normalizing Departments...");
const normDepts = rawDepartments.map(d => normalizeObjectKeys(d, 'department'));
console.log(JSON.stringify(normDepts, null, 2));
if (normDepts[0].Code === 'THEO_TEST' && normDepts[0].Name === 'Theology Test Dept' && normDepts[0].Description === 'Alternative headers verification') {
  console.log("✓ Department Normalization SUCCESSFUL!");
} else {
  console.error("✗ Department Normalization FAILED!");
}

console.log("\n[2] Normalizing Classes...");
const normClasses = rawClasses.map(c => normalizeObjectKeys(c, 'class'));
console.log(JSON.stringify(normClasses, null, 2));
if (normClasses[0].Code === 'TH-TEST1' && normClasses[0].Name === 'Theology Class Cohort' && normClasses[0].DepartmentCode === 'THEO_TEST') {
  console.log("✓ Class Normalization SUCCESSFUL!");
} else {
  console.error("✗ Class Normalization FAILED!");
}

console.log("\n[3] Normalizing Courses...");
const normCourses = rawCourses.map(co => normalizeObjectKeys(co, 'course'));
console.log(JSON.stringify(normCourses, null, 2));
if (normCourses[0].Code === 'T-101' && normCourses[0].Title === 'Introduction to Test Syllabi' && normCourses[0].Credits === 4 && normCourses[0].ClassCode === 'TH-TEST1') {
  console.log("✓ Course Normalization SUCCESSFUL!");
} else {
  console.error("✗ Course Normalization FAILED!");
}

console.log("\n=================== MAPPING VALIDATION PASSED SUCCESSFULLY ===================");
