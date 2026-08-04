import { apiClient } from "./api-client";

export const socialApi = {
  // Recipe-related social interactions
  getRecipeDetails: async (recipeId: string | number) => {
    const res = await apiClient.get(`/recipes/${recipeId}`);
    return res.data;
  },
  
  getMyLikes: async () => {
    const res = await apiClient.get<string[]>("/recipes/my-likes");
    return res.data;
  },

  toggleLike: async (recipeId: string | number, nextLiked: boolean) => {
    if (nextLiked) {
      await apiClient.post(`/recipes/${recipeId}/like`);
    } else {
      await apiClient.delete(`/recipes/${recipeId}/like`);
    }
  },
  
  toggleFavorite: async (recipeId: string | number, nextFav: boolean) => {
    if (nextFav) {
      await apiClient.post(`/recipes/${recipeId}/favorite`);
    } else {
      await apiClient.delete(`/recipes/${recipeId}/favorite`);
    }
  },
  
  getRatingStats: async (recipeId: string | number) => {
    const res = await apiClient.get(`/recipes/${recipeId}/rating`);
    return res.data;
  },

  submitRating: async (recipeId: string | number, rating: number) => {
    const res = await apiClient.post(`/recipes/${recipeId}/rating`, { rating });
    return res.data;
  },
  
  getComments: async (recipeId: string | number, page = 1, limit = 10) => {
    const res = await apiClient.get(`/recipes/${recipeId}/comments`, {
      params: { page, limit },
    });
    return res.data;
  },
  
  postComment: async (recipeId: string | number, content: string, parentCommentId?: string | number) => {
    const params = parentCommentId ? { parentCommentId: String(parentCommentId) } : {};
    const res = await apiClient.post(`/recipes/${recipeId}/comments`, { content }, { params });
    return res.data;
  },

  updateComment: async (commentId: string | number, content: string) => {
    const res = await apiClient.patch(`/comments/${commentId}`, { content });
    return res.data;
  },

  deleteComment: async (commentId: string | number) => {
    const res = await apiClient.delete(`/comments/${commentId}`);
    return res.data;
  },

  // User-related social interactions
  getProfile: async (userId: string | number) => {
    const res = await apiClient.get(`/users/${userId}`);
    return res.data;
  },
  
  getFollowers: async (userId: string | number) => {
    const res = await apiClient.get(`/users/${userId}/followers`);
    return res.data;
  },
  
  getFollowing: async (userId: string | number) => {
    const res = await apiClient.get(`/users/${userId}/following`);
    return res.data;
  },

  getMyFollowing: async () => {
    const res = await apiClient.get("/users/me/following");
    return res.data;
  },
  
  toggleFollow: async (userId: string | number, isFollowing: boolean) => {
    if (isFollowing) {
      await apiClient.delete(`/users/${userId}/follow`);
    } else {
      await apiClient.post(`/users/${userId}/follow`);
    }
  },
  
  getMyFavorites: async () => {
    const res = await apiClient.get("/users/me/favorites");
    return res.data;
  },
  
  // Notification-related APIs
  getNotifications: async () => {
    const res = await apiClient.get("/notifications");
    return res.data;
  },
  
  markNotificationRead: async (notificationId: string | number) => {
    const res = await apiClient.patch(`/notifications/${notificationId}/read`);
    return res.data;
  },
  
  markAllNotificationsRead: async () => {
    const res = await apiClient.patch("/notifications/read-all");
    return res.data;
  },
  
  deleteNotification: async (notificationId: string | number) => {
    const res = await apiClient.delete(`/notifications/${notificationId}`);
    return res.data;
  }
};
