const authEndPoint = {
  login: "/auth/login",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  register: "/auth/register",
  isValidResetLink: "/auth/is-valid-reset-page",
  verifyEmail: "/auth/verify-email",
  loginWithToken: "/auth/login-with-token",
};

const projectEndPoint = {
  createProject: "/project",
  getProject: "/project",
  getRecentProject: "/project/recent",
  deleteProject: "/project",
  updateProject: "/project",
  getProjectDetails: "/project",
  // Project Access Management
  access: "/projectAccess",
};

const eventEndPoint = {
  createEvent: "/event",
  getEvents: "/event",
  getRecentEvents: "/event/recent",
  updateEvent: "/event",
  deleteEvent: "/event",
  getEventDetails: "/event/details",
  addGuestToEvent: "/event",
  removeGuestFromEvent: "/event",
  getEventGuests: "/event",
  updateEventExpectedMembers: "/event/update-event-expected-members",
  generateGuestReport: "/event",
  sendInvitations: "/event",
};

const guestEndPoint = {
  createGuest: "/guest",
  getGuests: "/guest",
  getGuestDetails: "/guest/details",
  deleteGuest: "/guest",
  updateGuest: "/guest",
  getProjectGuests: "/guest",
  getGuestLogs: "/guest/logs",
  updateGuestPosition: "/guest",
  importGuests: "/guest/import-vcf-or-csv",
};

const templateEndPoint = {
  createTemplate: "/template",
  getTemplate: "/template",
  getEventTemplates: "/template/event",
  getRecentProjectTemplates: "/template/project",
  updateTemplate: "/template",
  deleteTemplate: "/template",
  setDefaultTemplate: "/template",
};

const permissionEndPoint = {
  getPermissions: "/permissions",
  createPermission: "/permissions",
  updatePermission: "/permissions",
  deletePermission: "/permissions",
};

const roleEndPoint = {
  getRoles: "/roles",
  createRole: "/roles",
  updateRole: "/roles",
  deleteRole: "/roles",
  assignPermissions: "/roles",
};

const userRoleEndPoint = {
  getUserRoles: "/users",
  assignRole: "/users",
  removeRole: "/users",
};

const premiumEndPoint = {
  getPremiumUsers: "/premium/users",
  grantPremiumAccess: "/premium/users",
  removePremiumAccess: "/premium/users",
  getPremiumFeatures: "/premium/features",
};

const paymentEndPoint = {
  createPayment: "/payments",
  getPayments: "/payments",
  getPaymentDetails: "/payments",
  updatePayment: "/payments",
  deletePayment: "/payments",
};

export const adminEndPoint = {
  getStats: "/admin/stats",
  getActivity: "/admin/activity",
  getHealth: "/admin/health",
  // User management endpoints
  getUserStats: "/admin/users/stats",
  getUsers: "/admin/users",
  getUserById: (id: string) => `/admin/users/${id}`,
  updateUserStatus: (id: string) => `/admin/users/${id}/status`,
  updateUserRole: (id: string) => `/admin/users/${id}/role`,
  updateUser: (id: string) => `/admin/users/${id}`,
  deleteUser: (id: string) => `/admin/users/${id}`,
  getRoles: "/admin/roles",
  createUser: "/user/admin/create",

  // Roles & Permissions management endpoints
  getRoleStats: "/admin/roles/stats",
  createRole: "/admin/roles",
  getRoleById: (id: string) => `/admin/roles/${id}`,
  updateRole: (id: string) => `/admin/roles/${id}`,
  deleteRole: (id: string) => `/admin/roles/${id}`,

  // Permissions management endpoints
  getPermissions: "/admin/permissions",
  createPermission: "/admin/permissions",
  updatePermission: (id: string) => `/admin/permissions/${id}`,
  deletePermission: (id: string) => `/admin/permissions/${id}`,
};

export {
  authEndPoint,
  projectEndPoint,
  eventEndPoint,
  guestEndPoint,
  templateEndPoint,
  permissionEndPoint,
  roleEndPoint,
  userRoleEndPoint,
  premiumEndPoint,
  paymentEndPoint,
};
