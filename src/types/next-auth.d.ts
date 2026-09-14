import type { MemberName } from "@/config/users";

declare module "next-auth" {
  interface Session {
    user: {
      member: MemberName | null;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    member?: MemberName | null;
  }
}

export {};
