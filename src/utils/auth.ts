import { USERS } from "@/data/users";

export const login = (email, password) => {
  const user = USERS.find(u => u.email === email && u.password === password);
  return user || null;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const logoutUser = () => {
  localStorage.removeItem("user");
  window.location.href = "/login";
};
