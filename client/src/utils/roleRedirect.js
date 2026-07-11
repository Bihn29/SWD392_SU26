export const getRoleCode = (user) => {
  if (!user) return null;

  if (typeof user.role === "string") {
    return user.role;
  }

  if (user.role?.code) {
    return user.role.code;
  }

  if (user.role?.name) {
    return user.role.name;
  }

  return null;
};

export const getRedirectPathByRole = (user) => {
  const roleCode = getRoleCode(user);

  switch (roleCode) {
    case "Admin":
      return "/admin";
    case "Manager":
      return "/admin";
    case "Teacher":
      return "/teacher";
    case "Student":
      return "/student";
    default:
      if (user?.permissions?.includes('dashboard:view') || user?.role?.permissions?.includes('dashboard:view')) {
        return "/admin/dashboard";
      }
      if (user?.permissions?.includes('subjects:view') || user?.role?.permissions?.includes('subjects:view')) {
        return "/admin/subjects";
      }
      return "/";
  }
};
