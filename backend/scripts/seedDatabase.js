require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Class = require('../models/Class');
const Quiz = require('../models/Quiz');
const Assignment = require('../models/Assignment');
const Material = require('../models/Material');
const Marks = require('../models/Marks');

// DB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_database';

async function seedDatabase() {
  try {
    // Connect DB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear DB
    console.log('🗑️ Clearing old data...');

    await Promise.all([
      User.deleteMany({}),
      Class.deleteMany({}),
      Quiz.deleteMany({}),
      Assignment.deleteMany({}),
      Material.deleteMany({}),
      Marks.deleteMany({})
    ]);

    // ================= USERS =================

    console.log('👤 Creating users...');

    // Admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@edutrackpro.com',
      password: 'admin123',
      role: 'admin'
    });

    // Head
    const head = await User.create({
      name: 'Vinoth Chakkaravarthy',
      email: 'vinoth@edutrackpro.com',
      password: 'head1234',
      role: 'head'
    });

    // Teachers
    const teachersSeed = [
      {
        name: 'Balamuralikrishnan',
        email: 'balamurali@edutrackpro.com',
        password: 'teacher123',
        role: 'teacher'
      },
      {
        name: 'Benazir Begum',
        email: 'benazir@edutrackpro.com',
        password: 'teacher123',
        role: 'teacher'
      },
      {
        name: 'Senthil Kumar',
        email: 'senthil@edutrackpro.com',
        password: 'teacher123',
        role: 'teacher'
      },
      {
        name: 'Selva Lakshmi',
        email: 'selva@edutrackpro.com',
        password: 'teacher123',
        role: 'teacher'
      },
      {
        name: 'Akilandeswari',
        email: 'akila@edutrackpro.com',
        password: 'teacher123',
        role: 'teacher'
      }
    ];

    // NOTE: `insertMany` does not run `pre('save')` password hashing middleware.
    // Hash manually here to ensure logins work for seeded users.
    const hashedTeachersSeed = await Promise.all(
      teachersSeed.map(async (t) => ({
        ...t,
        password: await bcrypt.hash(t.password, 12)
      }))
    );

    const teachers = await User.insertMany(hashedTeachersSeed);

    // Students
    const studentNames = [
      'AMRITHA.B',
      'ANUSHRI.B',
      'AZHAGU MEENA G',
      'DEVIS ARUNA DEVI.D',
      'DHANYA JOHNSY .AR',
      'GOPIKA RANI.A.M',
      'HARINI .T',
      'INIYA.M',
      'JANANI KAMATCHI.S',
      'JEEVAJOTHI M',
      'JEYASHREE.K.A',
      'KANNIKA G',
      'KARISHMA S',
      'KAVITHA. M',
      'KEERTHIGA T S',
      'KEERTHIGA.K',
      'MANASA ASVITHA C.K.M',
      'MANSHA T R',
      'NAGA HARINI .M',
      'PRIYA DHARSHINI.M',
      'RAJADHARSHINI R',
      'RAKSANA V',
      'SHREE VIKHASHINI.J',
      'SUSHMITHA T',
      'VAISHNAVI.S',
      'VIKASNI T R',
      'VISHNU PRIYA.T.K.',
      'YAMUNA R',
      'YUVASRI R',
      'ABISHEK GUHAN P',
      'ACHUTHAN T B',
      'ADITHYA T B',
      'AGILESH K K',
      'DAKSHIN B',
      'JAYAKANTH S',
      'KARUPPASAMY M',
      'KISHORE TS',
      'LOGESH KUMAR M',
      'MANAVENDRA SHAILESH A',
      'MUGESH BALA M',
      'MUHAMMAD YAHYAA',
      'MUTHEESWARAN.R',
      'MUTHUNILAVAN D',
      'NAGAVISHNU KARTHIK B S',
      'PENIEL OSBORN J',
      'PRANAV HARI.T.N',
      'PRAWIN KUMAR .M',
      'ROHAN GANDHI S',
      'SHANMUGAPIRIYAN M',
      'SHIVESHWAR S',
      'SHYAAM SUNDAR PCM',
      'SIVA SUBRAMANI. S',
      'SREE KRISHNA K N',
      'SURAJ GV',
      'SURYA PRAKASH S',
      'SURYA S',
      'VISHAL S',
      'VISHAL.J',
      'VITHESH T',
      'VIVASH.V',
      'MUGESH KANNA M',
      'SANTHOSH S',
      'SANTHOSH KUMAR D',
      'KRISHNA KUMAR N'
    ];

    const studentEmailCounts = new Map();
    const makeStudentEmail = (rawName) => {
      const base = String(rawName)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '') || 'student';

      const current = studentEmailCounts.get(base) || 0;
      studentEmailCounts.set(base, current + 1);

      const suffix = current === 0 ? '' : String(current + 1);
      return `${base}${suffix}@edutrackpro.com`;
    };

    const studentsSeed = studentNames.map((raw) => ({
      name: String(raw).trim().replace(/\s+/g, ' '),
      email: makeStudentEmail(raw),
      password: 'student123',
      role: 'student'
    }));

    const hashedStudentsSeed = await Promise.all(
      studentsSeed.map(async (s) => ({
        ...s,
        password: await bcrypt.hash(s.password, 12)
      }))
    );

    const students = await User.insertMany(hashedStudentsSeed);

    console.log(`✅ ${teachers.length} Teachers created`);
    console.log(`✅ ${students.length} Students created`);

    // ================= CLASSES =================

    console.log('📚 Creating classes...');

    const academicYear = '2025\u20132026';

    // Seed both current (Odd) and previous (Even) semester to enable realistic comparisons.
    const classes = await Class.insertMany([
      // Current semester (Odd - Sem 5)
      {
        classname: 'Object Oriented Programming',
        section: 'CSE-5A',
        teacher: teachers[0]._id,
        students: students.map(s => s._id),
        academicYear,
        semesterType: 'Odd',
        semesterNumber: 5,
        attendanceAverage: 86
      },
      {
        classname: 'Data Structures',
        section: 'CSE-5A',
        teacher: teachers[1]._id,
        students: students.map(s => s._id),
        academicYear,
        semesterType: 'Odd',
        semesterNumber: 5,
        attendanceAverage: 79
      },
      {
        classname: 'Database Management Systems',
        section: 'CSE-5A',
        teacher: teachers[2]._id,
        students: students.map(s => s._id),
        academicYear,
        semesterType: 'Odd',
        semesterNumber: 5,
        attendanceAverage: 73
      },
      {
        classname: 'Computer Networks',
        section: 'CSE-5B',
        teacher: null, // intentionally unassigned for alerts
        students: students.slice(0, 40).map(s => s._id),
        academicYear,
        semesterType: 'Odd',
        semesterNumber: 5,
        attendanceAverage: 68
      },

      // Previous semester (Even - Sem 4)
      {
        classname: 'Operating Systems',
        section: 'CSE-4A',
        teacher: teachers[3]._id,
        students: students.slice(0, 45).map(s => s._id),
        academicYear,
        semesterType: 'Even',
        semesterNumber: 4,
        attendanceAverage: 81
      },
      {
        classname: 'Design and Analysis of Algorithms',
        section: 'CSE-4A',
        teacher: teachers[4]._id,
        students: students.slice(0, 45).map(s => s._id),
        academicYear,
        semesterType: 'Even',
        semesterNumber: 4,
        attendanceAverage: 77
      }
    ]);

    // ================= ASSIGNMENTS =================
    console.log('📝 Creating assignments...');

    const now = Date.now();
    const mkUrl = (name) => `https://example.com/uploads/${encodeURIComponent(name)}`;

    const assignments = await Assignment.insertMany([
      {
        classId: classes[0]._id,
        title: 'Assignment 1: OOP Fundamentals',
        description: 'Implement core OOP concepts (encapsulation, inheritance, polymorphism) with proper class design.',
        dueDate: new Date(now + 5 * 24 * 60 * 60 * 1000),
        totalMarks: 50,
        isPublished: true,
        createdBy: teachers[0]._id,
        submissions: [
          {
            studentId: students[0]._id,
            fileUrl: mkUrl('oop_assignment1_students0.pdf'),
            fileName: 'oop_assignment1.pdf',
            submittedAt: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
            status: 'pending'
          },
          {
            studentId: students[1]._id,
            fileUrl: mkUrl('oop_assignment1_students1.pdf'),
            fileName: 'oop_assignment1.pdf',
            submittedAt: new Date(now - 26 * 60 * 60 * 1000), // 1 day ago
            status: 'graded',
            marks: 42,
            maxMarks: 50,
            feedback: 'Good structure and naming.'
          }
        ]
      },
      {
        classId: classes[1]._id,
        title: 'Assignment 2: Linked List Applications',
        description: 'Solve problems using singly/doubly linked lists and analyze time complexity.',
        dueDate: new Date(now - 2 * 24 * 60 * 60 * 1000), // past due (alerts)
        totalMarks: 100,
        isPublished: true,
        createdBy: teachers[1]._id,
        submissions: [
          {
            studentId: students[2]._id,
            fileUrl: mkUrl('ds_assignment2_students2.pdf'),
            fileName: 'ds_assignment2.pdf',
            submittedAt: new Date(now - 3 * 60 * 60 * 1000), // 3 hours ago
            status: 'late',
            isLate: true
          },
          {
            studentId: students[3]._id,
            fileUrl: mkUrl('ds_assignment2_students3.pdf'),
            fileName: 'ds_assignment2.pdf',
            submittedAt: new Date(now - 7 * 60 * 60 * 1000), // 7 hours ago
            status: 'pending'
          }
        ]
      },
      {
        classId: classes[2]._id,
        title: 'DBMS Mini Task: Normalization',
        description: 'Design schema and normalize to 3NF. Provide ER diagram and rationale.',
        dueDate: new Date(now + 2 * 24 * 60 * 60 * 1000),
        totalMarks: 25,
        isPublished: true,
        createdBy: teachers[2]._id,
        submissions: [
          {
            studentId: students[4]._id,
            fileUrl: mkUrl('dbms_task_students4.pdf'),
            fileName: 'dbms_task.pdf',
            submittedAt: new Date(now - 12 * 60 * 60 * 1000), // 12 hours ago
            status: 'pending'
          }
        ]
      }
    ]);

    console.log(`✅ ${assignments.length} Assignments created`);

    // ================= QUIZZES =================
    console.log('🧪 Creating quizzes...');

    const quizzes = await Quiz.insertMany([
      {
        classId: classes[0]._id,
        title: 'OOP Quiz 1',
        description: 'Core OOP principles and design basics.',
        isPublished: true,
        createdBy: teachers[0]._id,
        questions: [
          { question: 'Which principle hides internal state?', options: ['Encapsulation', 'Inheritance', 'Abstraction', 'Polymorphism'], answer: 'Encapsulation', points: 2 },
          { question: 'What enables runtime method dispatch?', options: ['Compilation', 'Polymorphism', 'Overloading', 'Inlining'], answer: 'Polymorphism', points: 2 }
        ],
        submissions: [
          { studentId: students[0]._id, marks: 3, totalPoints: 4, percentage: 75, submittedAt: new Date(now - 90 * 60 * 1000) },
          { studentId: students[1]._id, marks: 4, totalPoints: 4, percentage: 100, submittedAt: new Date(now - 6 * 60 * 60 * 1000) }
        ]
      },
      {
        classId: classes[2]._id,
        title: 'DBMS Quiz: SQL Basics',
        description: 'SELECT, JOIN, GROUP BY, constraints.',
        isPublished: true,
        createdBy: teachers[2]._id,
        questions: [
          { question: 'Which clause filters groups?', options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], answer: 'HAVING', points: 2 }
        ],
        submissions: [
          { studentId: students[2]._id, marks: 2, totalPoints: 2, percentage: 100, submittedAt: new Date(now - 4 * 60 * 60 * 1000) }
        ]
      }
    ]);

    console.log(`✅ ${quizzes.length} Quizzes created`);

    console.log(`✅ ${classes.length} Classes created`);

    // ================= MARKS =================

    console.log('📊 Creating marks...');

    const marksData = [];

    // Seed marks for current semester classes to enable performance analytics.
    const analyticsStudents = students.slice(0, 50);
    const currentSemesterClasses = classes.filter(c => c.semesterType === 'Odd' && c.semesterNumber === 5);

    analyticsStudents.forEach(student => {
      currentSemesterClasses.forEach(cls => {
        marksData.push({
          studentId: student._id,
          classId: cls._id,
          type: 'quiz',
          title: `${cls.classname} - Unit Quiz`,
          marks: Math.floor(Math.random() * 21) + 20, // 20..40
          totalMarks: 50,
          sourceType: 'Manual'
        });
      });
    });

    const marks = await Marks.insertMany(marksData);

    console.log(`✅ ${marks.length} Marks added`);

    // ================= DONE =================

    console.log('\n====================================');
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('====================================\n');

    console.log('LOGIN DETAILS:\n');

    console.log('Admin   → admin@edutrackpro.com / admin123');
    console.log('Head    → vinoth@edutrackpro.com / head1234');
    console.log('Teacher → balamurali@edutrackpro.com / teacher123');
    console.log(`Student → ${studentsSeed[0].email} / student123 (password same for all students)\n`);

    process.exit();

  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

// Run
seedDatabase();