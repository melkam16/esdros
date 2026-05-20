# Quick Reference: Faculty & Course Management System

## 🚀 What Was Added

A complete faculty management and course assignment system for administrators.

### **Two Main New Admin Pages**

| Page | URL | Purpose |
|------|-----|---------|
| 🧑‍🏫 Faculty Management | `/dashboard/admin/faculty` | Add, view, and manage faculty members |
| 📚 Course Management | `/dashboard/admin/courses` | Assign courses to faculty & track enrollment |

### **Updated Admin Pages**

| Page | URL | Changes |
|------|-----|---------|
| Academic Console | `/dashboard/admin/academics` | Added faculty & course assignment sections |
| Admin Sidebar | All admin pages | Added 2 new menu items |

---

## 📋 Quick Feature List

### Faculty Management
- **Add Faculty** → Fill in first/last name, email, department, password
- **View Directory** → Search faculty by name, email, or department
- **Track Assignments** → See how many courses each faculty teaches
- **Delete Faculty** → Remove members (if no active enrollments)

### Course Management
- **Assign Courses** → Select faculty, course, semester, room, capacity
- **View Assignments** → See all course sections with enrollment tracking
- **Update Info** → Manage room assignments and class capacity
- **Remove Assignments** → Delete sections (if no active enrollments)

---

## 🔗 API Endpoints

### Faculty Operations
```
POST   /api/admin/faculty/add              ← Add new faculty
GET    /api/admin/faculty/add              ← List all faculty
DELETE /api/admin/faculty/delete?id=...    ← Delete faculty member
```

### Course Assignments
```
POST   /api/admin/faculty/assign-course              ← Assign course
GET    /api/admin/faculty/assign-course              ← List assignments
GET    /api/admin/faculty/assign-course?facultyId=... ← Filter by faculty
DELETE /api/admin/faculty/assign-course?sectionId=... ← Remove assignment
```

---

## 📁 File Organization

```
app/
├── api/admin/faculty/
│   ├── add/route.ts                    ← Faculty CRUD
│   ├── assign-course/route.ts          ← Course assignments
│   └── delete/route.ts                 ← Faculty deletion
│
├── dashboard/admin/
│   ├── faculty/
│   │   └── page.tsx                   ← Faculty page
│   │
│   ├── courses/
│   │   ├── page.tsx                   ← Courses page
│   │   └── CourseListView.tsx         ← Courses table
│   │
│   └── academics/
│       ├── FacultyManagementForm.tsx   ← Add faculty form
│       ├── CourseAssignmentForm.tsx    ← Assign courses form
│       ├── FacultyListView.tsx         ← Faculty table
│       └── page.tsx                   ← Updated academic console

Documentation/
├── FEATURES.md                         ← Complete feature docs
└── IMPLEMENTATION_GUIDE.md             ← Implementation details
```

---

## 🎯 How to Use

### Add a Faculty Member
```
1. Go to /dashboard/admin/faculty
2. Click "Add Faculty Member"
3. Fill in the form:
   • First Name: John
   • Last Name: Doe
   • Email: john@esdros.edu
   • Department: [Select from dropdown]
   • Password: [Enter secure password]
4. Click "Add Faculty Member"
5. Success! Faculty appears in directory
```

### Assign a Course to Faculty
```
1. Go to /dashboard/admin/courses
2. Click "Assign Course to Faculty"
3. Fill in the form:
   • Faculty Member: [Select from dropdown]
   • Course: [Select from dropdown]
   • Semester: 2026-Fall (format as YEAR-SEASON)
   • Room: A101 (optional)
   • Class Capacity: 40 (default)
4. Click "Assign Course"
5. Success! Course appears in assignments table
```

### View Faculty Directory
```
1. Go to /dashboard/admin/faculty
2. Scroll to "Faculty Directory" section
3. Search by name, email, or department
4. View courses assigned to each faculty
5. See active status and course count
```

### View Course Assignments
```
1. Go to /dashboard/admin/courses
2. Scroll to "Current Course Assignments" section
3. Filter by track (Theology/Geez Language)
4. Search by course code or title
5. See faculty assignments and enrollment %
6. Click "Remove" to unassign (if no enrollments)
```

---

## ✅ Key Validation Rules

| Check | Rule |
|-------|------|
| Email | Must be unique in system |
| Password | Minimum 6 characters |
| Department | Must exist in system |
| Course Assignment | Faculty can't be assigned same course twice per semester |
| Deletion | Faculty can't be deleted if they have student enrollments |

---

## 📊 Database Relationships

```
User (1) ────────────→ (1) Faculty ────────────→ (∞) CourseSection
         CREATES                    HAS MANY            CONTAINS


Course (1) ────────────→ (∞) CourseSection ────────────→ (∞) Enrollment
         CONTAINS                    HAS MANY            FROM STUDENTS


Department (1) ────────────→ (∞) Faculty
            CONTAINS
```

---

## 🔒 Security

- Admin role required for all operations
- Passwords hashed with SHA-256
- Email uniqueness enforced
- Enrollment protection prevents accidental deletions
- Form validation on both client and server

---

## 📝 Example Data

### Sample Faculty Addition
```json
{
  "firstName": "Abebe",
  "lastName": "Tekle",
  "email": "abebe.tekle@esdros.edu",
  "departmentId": "dept-001",
  "password": "SecurePassword123"
}
```

### Sample Course Assignment
```json
{
  "facultyId": "faculty-001",
  "courseId": "course-001",
  "semester": "2026-Fall",
  "room": "A101",
  "capacity": 35
}
```

---

## 🚨 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Email already in use | Use a different email address |
| Cannot delete faculty | Faculty has active student enrollments. Remove enrollments first. |
| Cannot remove assignment | Course section has active students. Remove enrollments first. |
| Department not found | Create department in Academic Records first |
| Forms not submitting | Check browser console for validation errors |

---

## 📚 Full Documentation

For complete details, see:
- **FEATURES.md** - Comprehensive feature documentation
- **IMPLEMENTATION_GUIDE.md** - Implementation details and workflows
- **API route comments** - Inline documentation in code

---

## 🎓 Menu Navigation

The admin sidebar now shows:

```
📊 Console Home
📋 Admissions CRM
📚 Academic Records
🧑‍🏫 Faculty Management        ← NEW
📚 Course Management         ← NEW
💰 Fee Management
📈 Reports
```

---

## 📞 Support

All features include:
- ✅ Input validation
- ✅ Error messages
- ✅ Success confirmations
- ✅ Real-time updates
- ✅ Responsive design

---

**Status:** ✅ Complete and Ready to Use

Navigate to `/dashboard/admin/faculty` or `/dashboard/admin/courses` to start managing faculty and courses!
