const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',

  USERS_VIEW: 'users:view',
  USERS_UPDATE: 'users:update',

  SUBJECTS_VIEW: 'subjects:view',
  SUBJECTS_CREATE: 'subjects:create',
  SUBJECTS_UPDATE: 'subjects:update',
  SUBJECTS_PUBLISH: 'subjects:publish',

  LESSONS_VIEW: 'lessons:view',
  LESSONS_CREATE: 'lessons:create',
  LESSONS_UPDATE: 'lessons:update',
  LESSONS_DELETE: 'lessons:delete',

  QUIZZES_VIEW: 'quizzes:view',
  QUIZZES_CREATE: 'quizzes:create',
  QUIZZES_UPDATE: 'quizzes:update',

  QUESTIONS_VIEW: 'questions:view',
  QUESTIONS_CREATE: 'questions:create',
  QUESTIONS_UPDATE: 'questions:update',
  QUESTIONS_DELETE: 'questions:delete',

  REGISTRATIONS_VIEW: 'registrations:view',
  REGISTRATIONS_UPDATE: 'registrations:update',

  COURSES_VIEW: 'courses:view',
  COURSES_REGISTER: 'courses:register',
  COURSES_LEARN: 'courses:learn',

  QUIZ_TAKE: 'quiz:take',
  QUIZ_REVIEW: 'quiz:review',

  PROFILE_VIEW: 'profile:view',
  PROFILE_UPDATE: 'profile:update',

  REPORTS_VIEW: 'reports:view',
};

module.exports = {
  PERMISSIONS,
};
