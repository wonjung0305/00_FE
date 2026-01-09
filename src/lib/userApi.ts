// 회원탈퇴용 api

import api from "@/lib/axios";

export async function deleteUser(token?: string | null) {
  return api.delete("/api/user/delete", {
    validateStatus: () => true,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}