const { DEFAULT_ROLE_PERMISSIONS } = require('../constants/permissions');

/**
 * Role-based access control middleware factory.
 * Usage: requireRole('Admin', 'Teacher')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}.`,
      });
    }

    next();
  };
};

const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const permissions = req.userPermissions || DEFAULT_ROLE_PERMISSIONS[req.user.role] || [];
    const allowed = permissions.includes('*') || requiredPermissions.some((permission) => permissions.includes(permission));

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required permission(s): ${requiredPermissions.join(', ')}.`,
      });
    }

    next();
  };
};

module.exports = { requireRole, requirePermission };
