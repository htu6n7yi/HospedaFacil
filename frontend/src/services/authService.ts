import api from "./api";

interface LoginCredentials {
  usuario: string;
  senha: string;
}

interface LoginResponse {
  token: string;
  user?: {
    id: string;
    nome: string;
    email: string;
  };
}

const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", credentials);
    localStorage.setItem("token", data.token);
    return data;
  },

  logout() {
    localStorage.removeItem("token");
    window.location.href = "/";
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  },
};

export default authService;