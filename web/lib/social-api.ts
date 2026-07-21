import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const socialApiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Auto attach authorization token
socialApiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const socialApi = {
  // Recipe-related social interactions
  getRecipeDetails: async (recipeId: string | number) => {
    const res = await socialApiClient.get(`/recipes/${recipeId}`);
    return res.data;
  },
  
  toggleLike: async (recipeId: string | number, nextLiked: boolean) => {
    if (nextLiked) {
      await socialApiClient.post(`/recipes/${recipeId}/like`);
    } else {
      await socialApiClient.delete(`/recipes/${recipeId}/like`);
    }
  },
  
  toggleFavorite: async (recipeId: string | number, nextFav: boolean) => {
    if (nextFav) {
      await socialApiClient.post(`/recipes/${recipeId}/favorite`);
    } else {
      await socialApiClient.delete(`/recipes/${recipeId}/favorite`);
    }
  },
  
  submitRating: async (recipeId: string | number, rating: number) => {
    const res = await socialApiClient.post(`/recipes/${recipeId}/rating`, { rating });
    return res.data;
  },
  
  getComments: async (recipeId: string | number) => {
    const res = await socialApiClient.get(`/recipes/${recipeId}/comments`);
    return res.data;
  },
  
  postComment: async (recipeId: string | number, content: string) => {
    const res = await socialApiClient.post(`/recipes/${recipeId}/comments`, { content });
    return res.data;
  },

  // User-related social interactions
  getProfile: async (userId: string | number) => {
    const res = await socialApiClient.get(`/users/${userId}`);
    return res.data;
  },
  
  getFollowers: async (userId: string | number) => {
    const res = await socialApiClient.get(`/users/${userId}/followers`);
    return res.data;
  },
  
  getFollowing: async (userId: string | number) => {
    const res = await socialApiClient.get(`/users/${userId}/following`);
    return res.data;
  },
  
  toggleFollow: async (userId: string | number, isFollowing: boolean) => {
    if (isFollowing) {
      await socialApiClient.delete(`/users/${userId}/follow`);
    } else {
      await socialApiClient.post(`/users/${userId}/follow`);
    }
  },
  
  getMyFavorites: async () => {
    const res = await socialApiClient.get("/users/me/favorites");
    return res.data;
  }
};
