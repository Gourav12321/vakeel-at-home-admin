export const apiBaseUrl = "http://localhost:5970/api/v1";

export const apiUrls = {
  auth: {
    login: "/auth",
    statistics: "/auth/statistics",
  },
  lawyers: {
    getAllLawyers: "/lawyers",
    getLawyerById: "/lawyers",
    toggleStatus: "/toggle-profile-status",
  },
};
