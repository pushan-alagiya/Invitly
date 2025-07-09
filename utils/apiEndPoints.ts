const authEndPoint = {
  login: "/auth/login",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  register: "/auth/register",
  isValidResetLink: "/auth/is-valid-reset-page",
  verifyEmail: "/auth/verify-email",
  // changePassword: "/auth/changePassword",
  loginWithToken: "/auth/login-with-token",
};

const projectEndPoint = {
  createProject: "/project",
  getProject: "/project",
  getRecentProject: "/project/recent",
  deleteProject: "/project",
  updateProject: "/project",
  getProjectDetails: "/project",

  // Project Access End Point
  getProjectAccess: "/project",
  addProjectAccess: "/project",
  deleteProjectAccess: "/project",
  removeProjectAccess: "/project",
  projectAccessLink: "/project",
  addUserAccess: "/project",
};

const eventEndPoint = {
  createEvent: "/event",
  getEvent: "/event",
  getEventDetails: "/event/details",
  deleteEvent: "/event",
  updateEvent: "/event",
  getRecentEvents: "/event/recent",

  // Event Guest Management
  getEventGuests: "/event",
  addGuestToEvent: "/event",
  removeGuestFromEvent: "/event",

  // Update event expected members
  updateEventExpectedMembers: "/event/update-event-expected-members",
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
};

export { authEndPoint, projectEndPoint, eventEndPoint, guestEndPoint };
