import type { MemberName } from "@/config/users";

declare module "next-auth" {
  interface Session {
    user: {
      member: MemberName | null;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
    /** 구글 API 호출용. 서버에서만 쓴다. */
    accessToken?: string;
    /** 갱신 실패 등. 있으면 다시 로그인해야 한다. */
    tokenError?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    member?: MemberName | null;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    tokenError?: string;
  }
}

export {};
