export const PERMISSION_GROUPS = [
  {
    label: 'Bảng điều khiển',
    key: 'dashboard',
    permissions: [{ id: 'dashboard:view', label: 'Xem Bảng điều khiển' }],
  },
  {
    label: 'Người dùng & Vai trò',
    key: 'users',
    permissions: [
      { id: 'users:view', label: 'Xem danh sách người dùng' },
      { id: 'users:update', label: 'Cập nhật người dùng' },
    ],
  },
  {
    label: 'Khóa học (Admin/Manager)',
    key: 'subjects',
    permissions: [
      { id: 'subjects:view', label: 'Xem danh sách khóa học' },
      { id: 'subjects:create', label: 'Thêm khóa học' },
      { id: 'subjects:update', label: 'Cập nhật khóa học' },
      { id: 'subjects:publish', label: 'Xuất bản khóa học' },
    ],
  },
  {
    label: 'Bài học',
    key: 'lessons',
    permissions: [
      { id: 'lessons:view', label: 'Xem danh sách bài học' },
      { id: 'lessons:create', label: 'Thêm bài học' },
      { id: 'lessons:update', label: 'Cập nhật bài học' },
      { id: 'lessons:delete', label: 'Xóa bài học' },
    ],
  },
  {
    label: 'Quiz & Câu hỏi',
    key: 'quizzes_questions',
    permissions: [
      { id: 'quizzes:view', label: 'Xem danh sách quiz' },
      { id: 'quizzes:create', label: 'Thêm quiz' },
      { id: 'quizzes:update', label: 'Cập nhật quiz' },
      { id: 'questions:view', label: 'Xem danh sách câu hỏi' },
      { id: 'questions:create', label: 'Thêm câu hỏi' },
      { id: 'questions:update', label: 'Cập nhật câu hỏi' },
      { id: 'questions:delete', label: 'Xóa câu hỏi' },
    ],
  },
  {
    label: 'Đăng ký khóa học',
    key: 'registrations',
    permissions: [
      { id: 'registrations:view', label: 'Xem danh sách đăng ký' },
      { id: 'registrations:update', label: 'Cập nhật đăng ký' },
    ],
  },
  {
    label: 'Học tập (Học viên)',
    key: 'learning',
    permissions: [
      { id: 'courses:view', label: 'Xem khóa học (của tôi)' },
      { id: 'courses:register', label: 'Đăng ký khóa học' },
      { id: 'courses:learn', label: 'Vào học khóa học' },
      { id: 'quiz:take', label: 'Làm bài quiz' },
      { id: 'quiz:review', label: 'Xem lại kết quả quiz' },
    ],
  },
  {
    label: 'Hồ sơ cá nhân',
    key: 'profile',
    permissions: [
      { id: 'profile:view', label: 'Xem hồ sơ' },
      { id: 'profile:update', label: 'Cập nhật hồ sơ' },
    ],
  },
  {
    label: 'Báo cáo',
    key: 'reports',
    permissions: [{ id: 'reports:view', label: 'Xem báo cáo' }],
  },
  {
    label: 'Hệ thống (Toàn quyền)',
    key: 'system',
    permissions: [{ id: '*', label: 'Tất cả quyền (Admin)' }],
  },
];
