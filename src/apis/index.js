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
    getAllUsers: "/auth/all",
    deleteUser: "/auth/delete/id",
  },
  lawyers: {
    getAllLawyers: "/lawyers",
    getLawyerById: "/lawyers",
  },
  askMeAnything: {
    getComments: "/ask-me-anything/",
    hideComments: "/ask-me-anything/id/hide/id",
    hidePost: "ask-me-anything/id/hide",
  },
  vahGram: {
    getComments: "/posts",
    hideComments: "posts/id/hide/id",
    hidePost: "posts/id/hide",
  },
  blogs: {
    getAllBlogs: "/blogs",
    getBlogById: "/blogs/id",
    verifyBlog: "/blogs/id/verify",
    deleteBlog: "/blogs/id",
  },
};
