import localApi from "@/lib/axios";

/** 회원탈퇴 */
export async function deleteUser(): Promise<void> {
  const r = await localApi.delete("/api/user/delete", {
    validateStatus: () => true,
  });

  if (r.status === 401 || r.status === 402) throw { status: r.status };
  if (r.status < 200 || r.status >= 300) throw r;
}