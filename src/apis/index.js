// export const apiBaseUrl = "http://localhost:5970/api/v1";
export const apiBaseUrl = "https://vakeel-at-home-server.vercel.app/api/v1";

export const apiUrls = {
  auth: {
    login: "/auth",
    statistics: "/auth/statistics",
    toggleStatus: "/auth/toggle-profile-status",
    getAllPublics: "/auth/publics",
    getAllClerks: "/auth/clerks",
    getById: "/auth",
  },
  lawyers: {
    getAllLawyers: "/lawyers",
    getLawyerById: "/lawyers",
  },
};
