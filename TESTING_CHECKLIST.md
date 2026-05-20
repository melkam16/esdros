# 🧪 Testing & Deployment Checklist

## Pre-Deployment Verification

### Environment Setup
- [ ] Node.js version compatible (v18+)
- [ ] npm dependencies installed (`npm install`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] TypeScript compiling without errors

---

## Database Verification

### Schema Checks
- [ ] User table has `id`, `email`, `firstName`, `lastName`, `role`, `passwordHash`
- [ ] Faculty table has `id`, `userId`, `departmentId`
- [ ] Department table has `id`, `name`, `code`
- [ ] Course table has `id`, `code`, `title`, `credits`, `track`, `classId`
- [ ] CourseSection table has `id`, `courseId`, `facultyId`, `semester`, `room`, `capacity`
- [ ] Enrollment table has `id`, `studentId`, `courseSectionId`, `grade`

### Foreign Keys
- [ ] Faculty.userId → User.id (UNIQUE, CASCADE)
- [ ] Faculty.departmentId → Department.id
- [ ] CourseSection.courseId → Course.id (CASCADE)
- [ ] CourseSection.facultyId → Faculty.id
- [ ] Enrollment.courseSectionId → CourseSection.id (CASCADE)

### Constraints
- [ ] User.email is UNIQUE
- [ ] Department.code is UNIQUE
- [ ] Course.code is UNIQUE
- [ ] Class.code is UNIQUE
- [ ] Enrollment has @@unique([studentId, courseSectionId])

---

## API Endpoint Testing

### Faculty Management Endpoints

#### POST /api/admin/faculty/add
```bash
# Test: Add valid faculty
curl -X POST http://localhost:3000/api/admin/faculty/add \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Abebe",
    "lastName": "Tekle",
    "email": "abebe@esdros.edu",
    "departmentId": "YOUR_DEPT_ID",
    "password": "TestPass123"
  }'
```

- [ ] Returns 201 with success message
- [ ] Faculty created in database
- [ ] User created with FACULTY role
- [ ] Password hashed (not plaintext)
- [ ] Unique email enforced (duplicate email returns 400)
- [ ] Department existence checked (invalid dept returns 404)
- [ ] All required fields validated (missing fields return 400)

#### GET /api/admin/faculty/add
```bash
curl http://localhost:3000/api/admin/faculty/add
```

- [ ] Returns 200 with faculty array
- [ ] Includes facultyId, userId, name, email, department
- [ ] Includes courseSections count
- [ ] Includes list of courses
- [ ] Handles empty array gracefully (no faculty)

#### DELETE /api/admin/faculty/delete?facultyId=ID
```bash
curl -X DELETE http://localhost:3000/api/admin/faculty/delete?facultyId=YOUR_ID
```

- [ ] Returns 200 on successful deletion
- [ ] Faculty record deleted from database
- [ ] User record deleted from database
- [ ] Associated CourseSection records deleted
- [ ] Cannot delete if active enrollments (returns 409)
- [ ] Faculty not found returns 404

### Course Assignment Endpoints

#### POST /api/admin/faculty/assign-course
```bash
curl -X POST http://localhost:3000/api/admin/faculty/assign-course \
  -H "Content-Type: application/json" \
  -d '{
    "facultyId": "YOUR_FAC_ID",
    "courseId": "YOUR_COURSE_ID",
    "semester": "2026-Fall",
    "room": "A101",
    "capacity": 40
  }'
```

- [ ] Returns 201 with assignment details
- [ ] CourseSection created in database
- [ ] Faculty exists check works (404 if not)
- [ ] Course exists check works (404 if not)
- [ ] Duplicate prevention works (400 if already assigned)
- [ ] Room is optional (null allowed)
- [ ] Capacity defaults to 40 if not provided

#### GET /api/admin/faculty/assign-course
```bash
curl http://localhost:3000/api/admin/faculty/assign-course
```

- [ ] Returns 200 with assignments array
- [ ] Includes course info (title, code, credits)
- [ ] Includes faculty info (name, email, department)
- [ ] Includes enrollment statistics
- [ ] Returns enrollment percentage
- [ ] Handles empty array (no assignments)

#### GET /api/admin/faculty/assign-course?facultyId=ID
```bash
curl http://localhost:3000/api/admin/faculty/assign-course?facultyId=YOUR_ID
```

- [ ] Filters assignments by faculty ID
- [ ] Returns only that faculty's assignments
- [ ] Returns empty array if no assignments

#### DELETE /api/admin/faculty/assign-course?sectionId=ID
```bash
curl -X DELETE http://localhost:3000/api/admin/faculty/assign-course?sectionId=YOUR_ID
```

- [ ] Returns 200 on successful deletion
- [ ] CourseSection deleted from database
- [ ] Cannot delete if active enrollments (returns 409)
- [ ] Section not found returns 404

---

## Component Testing

### FacultyManagementForm Component

#### Form Rendering
- [ ] Form displays all 5 input fields
- [ ] Department dropdown populates correctly
- [ ] Submit button displays
- [ ] Cancel button works

#### Form Validation
- [ ] Required field validation works
- [ ] Email format validation works
- [ ] Password confirmation checking works
- [ ] Error messages display for validation failures
- [ ] Form is disabled while loading

#### Form Submission
- [ ] API call made on submit
- [ ] Success message appears
- [ ] Form clears after success
- [ ] Form closes after 2 seconds
- [ ] Faculty list refreshes

#### Error Handling
- [ ] Email duplicate error shown (400)
- [ ] Department not found error shown (404)
- [ ] Server error handled gracefully (500)

### FacultyListView Component

#### Display
- [ ] Faculty directory displays
- [ ] Faculty count shown in badge
- [ ] Table headers correct
- [ ] Faculty data populated

#### Search Functionality
- [ ] Search by name works
- [ ] Search by email works
- [ ] Search by department works
- [ ] Case-insensitive search
- [ ] Partial matching works
- [ ] Clear search shows all

#### Table Content
- [ ] Name displayed correctly
- [ ] Email displayed correctly
- [ ] Department shown
- [ ] Course count accurate
- [ ] Status indicator shows

#### Empty State
- [ ] "No faculty found" message shows when empty
- [ ] Search message shows when filtered empty

### CourseAssignmentForm Component

#### Form Rendering
- [ ] Faculty dropdown displays
- [ ] Course dropdown displays
- [ ] Semester input displays
- [ ] Room input displays (optional)
- [ ] Capacity input displays
- [ ] Submit button displays

#### Dropdowns
- [ ] Faculty list loads correctly
- [ ] Course list loads correctly
- [ ] Options selectable
- [ ] Placeholder text shows

#### Form Submission
- [ ] API call made on submit
- [ ] Success message appears
- [ ] Assignment added to table
- [ ] Form clears after success
- [ ] Form closes after 2 seconds

#### Validation
- [ ] Faculty required validation
- [ ] Course required validation
- [ ] Semester required validation
- [ ] Capacity minimum validation
- [ ] Error messages display

#### Assignment Removal
- [ ] Remove button appears in table
- [ ] Confirmation prompt shows
- [ ] API delete call made
- [ ] Row removed on success
- [ ] Error shown if enrollments exist

### CourseListView Component

#### Display
- [ ] Courses list displays
- [ ] Course count shown
- [ ] Table headers correct
- [ ] Course data populated

#### Search & Filter
- [ ] Search by code works
- [ ] Search by title works
- [ ] Track filter works (Theology/Geez)
- [ ] Combined search and filter works
- [ ] Empty results message shows

#### Enrollment Tracking
- [ ] Progress bar displays
- [ ] Enrollment percentage calculated
- [ ] Current/capacity shown
- [ ] Color indicates usage level

---

## Page Navigation Testing

### Faculty Management Page (/dashboard/admin/faculty)
- [ ] Page loads without errors
- [ ] Header and description display
- [ ] Stats boxes show correct values
- [ ] FacultyManagementForm component renders
- [ ] FacultyListView component renders
- [ ] Sidebar highlights Faculty Management link

### Course Management Page (/dashboard/admin/courses)
- [ ] Page loads without errors
- [ ] Header and description display
- [ ] Stats boxes show correct values
- [ ] CourseAssignmentForm component renders
- [ ] CourseListView component renders
- [ ] Sidebar highlights Course Management link

### Academic Console Page (/dashboard/admin/academics)
- [ ] Page loads without errors
- [ ] Academic Structure section displays (existing)
- [ ] Faculty Management section displays (new)
- [ ] Course Assignment section displays (new)
- [ ] All forms functional

### Admin Sidebar Navigation
- [ ] Console Home link works
- [ ] Admissions CRM link works
- [ ] Academic Records link works
- [ ] **Faculty Management link works** (NEW)
- [ ] **Course Management link works** (NEW)
- [ ] Fee Management link works
- [ ] Reports link works
- [ ] Active link highlighted correctly
- [ ] Logout button visible

---

## UI/UX Testing

### Responsiveness
- [ ] Desktop layout (1920px) displays correctly
- [ ] Tablet layout (768px) displays correctly
- [ ] Mobile layout (375px) displays correctly
- [ ] Tables scroll horizontally on mobile
- [ ] Forms stack on mobile
- [ ] Buttons clickable on touch devices

### Accessibility
- [ ] Form labels associated with inputs
- [ ] Error messages associated with fields
- [ ] Focus visible on interactive elements
- [ ] Color contrast meets standards
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

### Visual Design
- [ ] Consistent color scheme
- [ ] Consistent typography
- [ ] Consistent spacing
- [ ] Icons render correctly
- [ ] Status badges display properly
- [ ] Success messages green
- [ ] Error messages red

---

## Performance Testing

### Load Times
- [ ] Faculty page loads in < 2 seconds
- [ ] Courses page loads in < 2 seconds
- [ ] Add faculty form responds immediately to input
- [ ] Search filters respond immediately
- [ ] Table pagination (if implemented) smooth

### Database Queries
- [ ] GET /api/admin/faculty/add completes in < 100ms
- [ ] GET /api/admin/faculty/assign-course completes in < 100ms
- [ ] POST routes complete in < 500ms
- [ ] No N+1 query problems

### Browser Dev Tools
- [ ] No console errors
- [ ] No console warnings
- [ ] Network requests reasonable
- [ ] DOM tree reasonable size
- [ ] No memory leaks on navigation

---

## Security Testing

### Authentication/Authorization
- [ ] Only admins can access pages (requires auth check)
- [ ] Non-admin users cannot access endpoints
- [ ] Role-based access enforced

### Data Security
- [ ] Passwords never logged
- [ ] Passwords never sent in plain text
- [ ] Email validation prevents injection
- [ ] No SQL injection possible
- [ ] No XSS vulnerabilities

### Error Messages
- [ ] Error messages don't expose sensitive data
- [ ] "User not found" messages generic
- [ ] Database errors don't leak structure

---

## Integration Testing

### Flow: Complete Faculty Addition
```
1. Navigate to /admin/faculty
2. Fill form with valid data
3. Submit form
4. Verify success message
5. Check faculty in directory
6. Verify in database: SELECT * FROM Faculty
7. Verify User created: SELECT * FROM User
```

- [ ] All steps complete successfully
- [ ] Data persists to database
- [ ] Directory updates in real-time

### Flow: Complete Course Assignment
```
1. Navigate to /admin/courses
2. Fill assignment form
3. Submit form
4. Verify success message
5. Check assignment in table
6. Verify in database: SELECT * FROM CourseSection
7. Verify enrollment tracking works
```

- [ ] All steps complete successfully
- [ ] Data persists to database
- [ ] Enrollment calculation correct

### Flow: Faculty Deletion Protection
```
1. Add student enrollment to course section
2. Try to delete that faculty member
3. Should show error about active enrollments
4. Faculty not deleted
```

- [ ] Protection works correctly

---

## Data Integrity Testing

### Email Uniqueness
```
1. Add faculty: john@test.edu
2. Try to add faculty: john@test.edu
3. Should reject with error
```
- [ ] Works correctly

### Department Validation
```
1. Try to add faculty with invalid departmentId
2. Should reject with "not found" error
```
- [ ] Works correctly

### Duplicate Assignments
```
1. Assign course THEO-101 to faculty in Fall 2026
2. Try to assign same course to same faculty in Fall 2026
3. Should reject with error
```
- [ ] Works correctly

---

## Cleanup & Verification

### Database Cleanup
- [ ] Test data removed
- [ ] No orphaned records
- [ ] Relationships intact

### Code Quality
- [ ] No unused imports
- [ ] No console.log statements
- [ ] TypeScript no errors
- [ ] ESLint passes (if configured)

### Documentation
- [ ] FEATURES.md accurate
- [ ] IMPLEMENTATION_GUIDE.md complete
- [ ] QUICK_REFERENCE.md helpful
- [ ] ARCHITECTURE.md correct
- [ ] Code comments clear

---

## Final Deployment Steps

- [ ] All tests pass
- [ ] Database backup created
- [ ] Environment variables set
- [ ] SSL certificates valid (if applicable)
- [ ] CDN configured (if applicable)
- [ ] Monitoring enabled
- [ ] Logging configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Backups automated
- [ ] Documentation deployed
- [ ] Team trained on new features
- [ ] Go-live approval obtained

---

## Post-Deployment Monitoring

- [ ] Monitor error rates (should be < 0.1%)
- [ ] Monitor response times (should be < 500ms)
- [ ] Monitor API usage
- [ ] Check user feedback
- [ ] Monitor database performance
- [ ] Review logs for issues
- [ ] Verify backups working
- [ ] Check security scanning

---

## Rollback Plan

If issues encountered:
1. Stop deployment
2. Restore from backup
3. Revert code changes
4. Notify stakeholders
5. Document issues
6. Plan fixes
7. Retry deployment

---

## Sign-Off

- [ ] QA Manager: _________________ Date: _____
- [ ] Development Lead: _________________ Date: _____
- [ ] System Admin: _________________ Date: _____
- [ ] Product Manager: _________________ Date: _____

---

**Status:** Ready for deployment once all items checked ✅

**Last Updated:** May 18, 2026
