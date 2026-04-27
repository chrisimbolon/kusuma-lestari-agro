import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { authApi } from "../api/authApi";

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: { username: string; password: string }) => authApi.login(data),
    onSuccess: (res) => { setAuth(res.user, res.access, res.refresh); navigate("/dashboard"); },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  return () => { logout(); navigate("/login"); };
}
