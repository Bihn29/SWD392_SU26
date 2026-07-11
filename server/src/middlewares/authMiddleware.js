const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const { DEFAULT_ROLE_PERMISSIONS } = require('../constants/permissions');

const resolveRole = async (roleCode) => {
  const role = await Role.findOne({ code: roleCode }).lean();
  return {
    role,
    permissions: role?.status === 'Active'
      ? role.permissions
      : (role ? [] : (DEFAULT_ROLE_PERMISSIONS[roleCode] || [])),
  };
};

/**
 * Middleware: Verify JWT token and attach user to req.user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or account is deactivated.',
      });
    }

    const { role, permissions } = await resolveRole(user.role);
    if (role && role.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'User role is inactive.',
      });
    }

    req.user = user;
    req.userRole = role;
    req.userPermissions = permissions;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

/**
 * Middleware: Optional auth – attach user if token provided, don't block if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        const { role, permissions } = await resolveRole(user.role);
        if (!role || role.status === 'Active') {
          req.user = user;
          req.userRole = role;
          req.userPermissions = permissions;
        }
      }
    }
    next();
  } catch {
    next();
  }
};

module.exports = { protect, optionalAuth };
