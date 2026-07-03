const fs = require('fs');
const path = require('path');

const users = [
  { name: "Quản trị viên", email: "admin@onlinelearn.vn", password: "password123", role: "Admin", isActive: true },
  { name: "Quản lý hệ thống", email: "manager@onlinelearn.vn", password: "password123", role: "Manager", isActive: true },
];

for (let i = 1; i <= 5; i++) {
  users.push({
    name: `Giảng viên ${i}`, email: `teacher${i}@onlinelearn.vn`, password: "password123", role: "Teacher", isActive: true
  });
}

for (let i = 1; i <= 30; i++) {
  users.push({
    name: `Học viên ${i}`, email: `student${i}@onlinelearn.vn`, password: "password123", role: "Student", isActive: true
  });
}

const subjects = [
  { name: "Cơ bản về ReactJS", category: "Phát triển Frontend", expertEmail: "teacher1@onlinelearn.vn", status: "Published", featured: true, description: "Làm quen với ReactJS từ cơ bản." },
  { name: "Lập trình NodeJS Toàn tập", category: "Phát triển Backend", expertEmail: "teacher2@onlinelearn.vn", status: "Published", featured: true, description: "Khóa học chuyên sâu về NodeJS." },
  { name: "MongoDB và Mongoose thực chiến", category: "Database", expertEmail: "teacher3@onlinelearn.vn", status: "Published", featured: false, description: "Cơ sở dữ liệu NoSQL hiệu quả." },
  { name: "Thiết kế UI/UX cho người mới bắt đầu", category: "Thiết kế UI/UX", expertEmail: "teacher4@onlinelearn.vn", status: "Published", featured: false, description: "Các nguyên tắc cơ bản của UI/UX." },
  { name: "Cấu trúc dữ liệu và giải thuật", category: "Cơ bản", expertEmail: "teacher5@onlinelearn.vn", status: "Published", featured: true, description: "Cấu trúc dữ liệu và thuật toán." },
  { name: "Lập trình di động với React Native", category: "Phát triển Mobile", expertEmail: "teacher1@onlinelearn.vn", status: "Published", featured: false, description: "Ứng dụng di động đa nền tảng." },
  { name: "Xây dựng RESTful API với ExpressJS", category: "Phát triển Backend", expertEmail: "teacher2@onlinelearn.vn", status: "Published", featured: false, description: "Tạo API với Express." },
  { name: "Kiểm thử phần mềm cơ bản", category: "Testing", expertEmail: "teacher3@onlinelearn.vn", status: "Draft", featured: false, description: "Khái niệm kiểm thử cơ bản." },
  { name: "Git và GitHub cho sinh viên", category: "Công cụ", expertEmail: "teacher4@onlinelearn.vn", status: "Unpublished", featured: false, description: "Quản lý mã nguồn với Git." },
  { name: "JavaScript ES6+ hiện đại", category: "Phát triển Frontend", expertEmail: "teacher5@onlinelearn.vn", status: "Published", featured: true, description: "JavaScript hiện đại." }
];

const lessons = [];
subjects.forEach(subj => {
  lessons.push({
    subjectName: subj.name,
    title: `Giới thiệu ${subj.name}`,
    type: "Video",
    order: 1,
    videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk",
    htmlContent: "",
    status: "Active"
  });
  lessons.push({
    subjectName: subj.name,
    title: `Chương 1: Kiến thức cốt lõi`,
    type: "HTML",
    order: 2,
    videoUrl: "",
    htmlContent: "<h2>Kiến thức cốt lõi</h2><p>Học các khái niệm quan trọng nhất.</p>",
    status: "Active"
  });
  lessons.push({
    subjectName: subj.name,
    title: `Bài kiểm tra: ${subj.name}`,
    type: "Quiz",
    order: 3,
    videoUrl: "",
    htmlContent: "",
    status: "Active"
  });
});

const registrations = [];
// For the 8 published/featured subjects, add some students
const publishedSubjects = subjects.filter(s => s.status === 'Published');
publishedSubjects.forEach((subj, idx) => {
  // 3 approved students per course
  for (let i = 1; i <= 3; i++) {
    const studentIdx = (idx * 3 + i) % 30 || 30; // spread them out
    registrations.push({
      studentEmail: `student${studentIdx}@onlinelearn.vn`,
      subjectName: subj.name,
      status: "Approved",
    });
  }
  // 1 pending student
  registrations.push({
    studentEmail: `student${(idx + 15) % 30 || 30}@onlinelearn.vn`,
    subjectName: subj.name,
    status: "Pending",
  });
});

const data = { users, subjects, lessons, registrations };
fs.writeFileSync(path.join(__dirname, '../data/seed.vi.json'), JSON.stringify(data, null, 2), 'utf-8');
console.log('Done generating seed.vi.json');
