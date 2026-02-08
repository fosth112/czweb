import axios from "axios"

const resolveBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  return "/api"
}

const axiosInstance = axios.create({
  baseURL: resolveBaseUrl(),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios error:', error);
    return Promise.reject(error);
  }
)

export default axiosInstance
