const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config({ path: '.env.local' });
if (!process.env.DATABASE_URL) {
  require('dotenv').config({ path: '.env' });
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const PDFDocument = require('pdfkit');
const fs = require('fs');

async function test() {
  try {
    console.log("1. Database URL:", process.env.DATABASE_URL ? "Defined" : "MISSING");
    console.log("2. Fetching all students with enrollments...");
    const students = await prisma.student.findMany({
      include: {
        user: true,
        enrollments: {
          include: {
            courseSection: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    console.log(`Total students in DB: ${students.length}`);
    if (students.length === 0) {
      console.log("No students found.");
      return;
    }

    for (const student of students) {
      console.log(`\nAnalyzing Student: ${student.user.firstName} ${student.user.lastName} (ID: ${student.id})`);
      console.log(`Enrollments count: ${student.enrollments.length}`);
      
      let totalPoints = 0;
      let totalCredits = 0;
      
      student.enrollments.forEach(e => {
        if (!e.courseSection) {
          console.log(`- WARNING: Enrollment ${e.id} is missing courseSection!`);
          return;
        }
        if (!e.courseSection.course) {
          console.log(`- WARNING: Enrollment ${e.id} is missing course!`);
          return;
        }
        const credits = e.courseSection.course.credits || 3;
        console.log(`- Course: ${e.courseSection.course.code} (Credits: ${credits}), Grade: ${e.grade}`);
      });
    }

  } catch (error) {
    console.error("FAIL:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();
