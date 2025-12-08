// export const apiBaseUrl = "/api/v1"; // Use Next.js proxy instead of direct backend URL
// export const apiBaseUrl = "http://localhost:5970/api/v1"; // Direct backend URL (causes CORS)
export const apiBaseUrl = "https://13-60-62-223.nip.io/api/v1";

export const apiUrls = {
  auth: {
    getOtp: "/otp/send",
    login: "/auth/admin",
    statistics: "/auth/statistics",
    toggleStatus: "/auth/toggle-profile-status",
    getAllPublics: "/auth/publics",
    getAllClerks: "/auth/clerks",
    getById: "/auth",
    getAllUsers: "/auth/all",
    deleteUser: "/auth/delete",
    updateUser: "/auth/profile",
  },
  service: {
    getLawyerServices: "/services/lawyer",
    updateLawyerServices: "/services",
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
    getAllBlogs: "/blogs/admin",
    getBlogById: "/blogs/id",
    verifyBlog: "/blogs/id/verify",
    deleteBlog: "/blogs/id",
  },
  notifications: {
    sendNotification: "/notifications/send-bulk-notification",
  },
  banners: {
    getAllBanners: "/banner",
    createBanner: "/banner",
    updateBanner: "/banner",
    deleteBanner: "/banner",
  },
  categories: {
    getAllCategories: "/category",
    createCategory: "/category",
    updateCategory: "/category",
    deleteCategory: "/category",
  },
  feedback: {
    getAllFeedback: "/feedback",
    getFeedbackById: "/feedback/id",
    createFeedback: "/feedback",
    updateFeedback: "/feedback/id",
    deleteFeedback: "/feedback/id",
    getFeedbackByAuthor: "/feedback/author/id",
  },
  faqs: {
    getAllFAQs: "/faqs",
    getFAQById: "/faqs/id",
    createFAQ: "/faqs",
    updateFAQ: "/faqs/id",
    deleteFAQ: "/faqs/id",
  },
  upload: {
    uploadDocument: "/upload/document",
  },
  lawyerRatings: {
    getUserRatingsByLawyers: "/bookings/user-ratings-by-lawyers",
  },
};
