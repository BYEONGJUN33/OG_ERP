import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

import { memberNameOf } from "@/config/users";
import { GOOGLE_SCOPE_PARAM } from "@/lib/auth/scopes";

const ALLOWED_HD = process.env.ALLOWED_HD ?? "open-garden.co.kr";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          // 구글 계정 선택 화면을 회사 도메인으로 제한한다.
          // 편의 기능일 뿐이므로 아래 signIn 에서 서버가 다시 검증한다.
          hd: ALLOWED_HD,
          scope: GOOGLE_SCOPE_PARAM,
          prompt: "select_account",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    /**
     * 두 겹으로 막는다.
     * 1) 이메일 도메인이 회사 도메인인가  (hd 파라미터는 위조 가능하므로 여기서 다시 본다)
     * 2) config/users.ts 목록에 있는 사람인가
     */
    signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      if (!profile?.email_verified) return false;
      if (!email.endsWith(`@${ALLOWED_HD}`)) return false;
      return memberNameOf(email) !== null;
    },
    jwt({ token }) {
      token.member = memberNameOf(token.email);
      return token;
    },
    session({ session, token }) {
      session.user.member = token.member ?? null;
      return session;
    },
  },
  session: { strategy: "jwt" },
  trustHost: true,
} satisfies NextAuthConfig;
