# Faculty and Course Management Features

## Overview

This document details the new faculty management and course assignment features added to the Esdros SMS system. These features enable administrators to efficiently add new faculty members to the system and assign courses to faculty across different semesters.

---

## Features Added

### 1. Faculty Management

#### 1.1 Add New Faculty Members

**Location:** `/dashboard/admin/faculty` or `/dashboard/admin/academics`

**Description:**
Administrators can add new faculty members to the system with the following information:
- First Name
- Last Name
- Email Address (unique per system)
- Department Assignment
- Password (auto-generated or custom)

**API Endpoint:**
```
POST /api/admin/faculty/add
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "departmentId": "string (uuid)",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Faculty member added successfully",
  "data": {
    "facultyId": "string",
    "userId": "string",
    "email": "string",
    "name": "string",
    "department": "string"
  }
}
```

#### 1.2 View Faculty Directory

**Location:** `/dashboard/admin/faculty`

**Description:**
Display all faculty members in the system with:
- Name and Email
- Department Assignment
- Number of Assigned Courses
- Current Enrollment Status
- Search and Filter Capabilities

**API Endpoint:**
```
GET /api/admin/faculty/add
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "userId": "string",
      "name": "string",
      "email": "string",
      "department": "string",
      "departmentId": "string",
      "courseSections": "number",
      "courses": ["string"]
    }
  ]
}
```

#### 1.3 Delete Faculty Members

**Location:** Via the Faculty Directory or Admin Panel

**Description:**
Remove faculty members from the system. The system prevents deletion of faculty with active course enrollments.

**API Endpoint:**
```
DELETE /api/admin/faculty/delete?facultyId={facultyId}
```

**Response:**
```json
{
  "success": true,
  "message": "Faculty member deleted successfully",
  "data": {
    "deletedFacultyId": "string",
    "deletedName": "string"
  }
}
```

---

### 2. Course Assignment Management

#### 2.1 Assign Courses to Faculty

**Location:** `/dashboard/admin/courses` or `/dashboard/admin/academics`

**Description:**
Administrators can assign courses to faculty members for specific semesters. Each assignment includes:
- Faculty Member Selection
- Course Selection
- Semester Information
- Room Assignment (optional)
- Class Capacity Configuration

**API Endpoint:**
```
POST /api/admin/faculty/assign-course
```

**Request Body:**
```json
{
  "facultyId": "string (uuid)",
  "courseId": "string (uuid)",
  "semester": "string (e.g., '2026-Fall')",
  "room": "string (optional)",
  "capacity": "number (default: 40)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Course assigned to faculty successfully",
  "data": {
    "sectionId": "string",
    "courseTitle": "string",
    "courseCode": "string",
    "facultyName": "string",
    "department": "string",
    "semester": "string",
    "room": "string",
    "capacity": "number",
    "enrollments": "number"
  }
}
```

#### 2.2 View Course Assignments

**Location:** `/dashboard/admin/courses`

**Description:**
View all course assignments with:
- Course Code and Title
- Assigned Faculty Name
- Semester Information
- Room Assignment
- Enrollment Status
- Current vs. Capacity Percentage

**API Endpoint:**
```
GET /api/admin/faculty/assign-course
GET /api/admin/faculty/assign-course?facultyId={facultyId}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "courseId": "string",
      "courseTitle": "string",
      "courseCode": "string",
      "credits": "number",
      "track": "string",
      "facultyId": "string",
      "facultyName": "string",
      "facultyEmail": "string",
      "department": "string",
      "semester": "string",
      "room": "string",
      "capacity": "number",
      "currentEnrollment": "number",
      "enrollmentPercentage": "number"
    }
  ]
}
```

#### 2.3 Remove Course Assignment

**Location:** Via Course Assignment List or Admin Panel

**Description:**
Remove a course assignment from a faculty member. The system prevents removal of assignments with active student enrollments.

**API Endpoint:**
```
DELETE /api/admin/faculty/assign-course?sectionId={sectionId}
```

**Response:**
```json
{
  "success": true,
  "message": "Course assignment removed successfully",
  "data": {
    "removedCourse": "string",
    "removedFrom": "string"
  }
}
```

---

## Database Schema Updates

The following models support the new features:

### Faculty Model
```prisma
model Faculty {
  id           String     @id @default(uuid())
  userId       String     @unique
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id])
  
  sections     CourseSection[]
}
```

### CourseSection Model
```prisma
model CourseSection {
  id        String   @id @default(uuid())
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  facultyId String
  faculty   Faculty  @relation(fields: [facultyId], references: [id])
  semester  String
  room      String?
  capacity  Int      @default(40)
  
  enrollments Enrollment[]
}
```

---

## Navigation Updates

The admin sidebar has been updated with new menu items:

- **Faculty Management** - `/dashboard/admin/faculty`
- **Course Management** - `/dashboard/admin/courses`

These options are visible in the admin console sidebar for easy navigation.

---

## Error Handling

The system includes comprehensive error handling:

### Faculty Management Errors

| Error | Status | Description |
|-------|--------|-------------|
| Missing required fields | 400 | First name, last name, email, department, or password missing |
| Email already in use | 400 | Faculty member with this email already exists |
| Department not found | 404 | Selected department doesn't exist |
| Faculty not found | 404 | Faculty member not found for deletion |
| Active enrollments | 409 | Cannot delete faculty with active course enrollments |

### Course Assignment Errors

| Error | Status | Description |
|-------|--------|-------------|
| Missing required fields | 400 | Faculty ID, course ID, or semester missing |
| Faculty not found | 404 | Selected faculty member doesn't exist |
| Course not found | 404 | Selected course doesn't exist |
| Already assigned | 400 | Faculty already assigned to this course in this semester |
| Active enrollments | 409 | Cannot remove assignment with active student enrollments |

---

## UI Components

### FacultyManagementForm
**File:** `/app/dashboard/admin/academics/FacultyManagementForm.tsx`

Interactive form for adding new faculty members with:
- Form validation
- Department selection
- Password confirmation
- Success/error messaging

### FacultyListView
**File:** `/app/dashboard/admin/academics/FacultyListView.tsx`

Table display showing:
- Faculty directory with search
- Department filtering
- Course assignments
- Active status indicator

### CourseAssignmentForm
**File:** `/app/dashboard/admin/academics/CourseAssignmentForm.tsx`

Interactive form for assigning courses with:
- Faculty member selection
- Course selection
- Semester input
- Room and capacity configuration
- Enrollment tracking

### CourseListView
**File:** `/app/dashboard/admin/courses/CourseListView.tsx`

Table display showing:
- All courses in catalog
- Track filtering (Theology/Geez Language)
- Faculty assignments
- Enrollment statistics

---

## Usage Examples

### Example 1: Add a New Faculty Member

1. Navigate to `/dashboard/admin/faculty`
2. Click "Add Faculty Member" button
3. Fill in:
   - First Name: "Abebe"
   - Last Name: "Tekle"
   - Email: "abebe.tekle@esdros.edu"
   - Department: "Department of Theology"
   - Password: "SecurePassword123"
4. Click "Add Faculty Member"
5. Confirmation message displays success

### Example 2: Assign a Course to Faculty

1. Navigate to `/dashboard/admin/courses`
2. Click "Assign Course to Faculty" button
3. Fill in:
   - Faculty Member: "Abebe Tekle - Department of Theology"
   - Course: "THEO-101 - Introduction to Theology (3 credits)"
   - Semester: "2026-Fall"
   - Room: "A101"
   - Class Capacity: "35"
4. Click "Assign Course"
5. Course section appears in "Current Course Assignments" table

### Example 3: View Faculty Directory

1. Navigate to `/dashboard/admin/faculty`
2. Scroll to "Faculty Directory" section
3. View all faculty with their:
   - Contact information
   - Department
   - Course assignments
   - Active status
4. Use search to filter by name, email, or department

---

## Database Migrations

No additional database migrations are required. The existing schema already supports these features through:
- `Faculty` model
- `CourseSection` model
- `User` model with `FACULTY` role

Ensure your database is up-to-date with the latest migrations before using these features.

---

## Security Considerations

1. **Password Security:** Passwords are hashed using SHA-256 before storage
2. **Role-Based Access:** Only ADMIN users can access faculty and course management
3. **Data Integrity:** Cascade deletes prevent orphaned records
4. **Enrollment Protection:** Faculty with active enrollments cannot be deleted or unassigned

---

## Future Enhancements

Potential improvements for future versions:

1. Bulk faculty import via CSV
2. Faculty course load limiting
3. Course schedule conflict detection
4. Automated email notifications for faculty assignments
5. Faculty performance analytics
6. Advanced course section analytics
7. Integration with email systems for credential distribution
8. Faculty availability/preference management

---

## Support

For issues or questions about these features, contact the development team or refer to the main README.md for additional documentation.
