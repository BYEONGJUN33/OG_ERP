"use client";

import { useRouter } from "next/navigation";

import { Modal } from "@/components/modal";

/**
 * 주소를 가진 창. 카드를 누르면 이 창이 뜨고 뒤 화면은 그대로 남는다.
 * 닫으면 원래 화면으로 돌아간다(뒤로 가기와 같다).
 * 주소를 직접 열거나 새로고침하면 창이 아니라 전체 화면으로 열린다.
 */
export function RouteModal({
  title,
  children,
  width,
}: {
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  const router = useRouter();

  return (
    <Modal open onClose={() => router.back()} title={title} width={width}>
      {children}
    </Modal>
  );
}
