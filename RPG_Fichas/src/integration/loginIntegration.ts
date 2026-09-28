const API_URL = "https://login-p26w.onrender.com/fatec/login";

export interface LoginResponse {
  userId: string;
  username: string;
  roles: string[];
}

export interface CreateUserData {
  username: string;
  password: string;
  email: string;
  cep: string;
}

export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/v1/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error("Usuário ou senha inválidos");
  }

  return response.json();
}

export async function createUser(
  data: CreateUserData
): Promise<void> {
  const response = await fetch(`${API_URL}/v1/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Não foi possível criar o usuário");
  }
}