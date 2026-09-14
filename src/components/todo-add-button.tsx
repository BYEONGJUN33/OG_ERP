"use client";

import { useState } from "react";

import { Modal } from "@/components/modal";
import { TodoAddForm } from "@/components/todo-add-form";

/** 할 일 추가는 창을 띄워서 한다. 화면을 떠나지 않는다. */
export function TodoAddButton({
  members,
  defaultOwner,
  label = "할 일 추가",
  small = false,
}: {
  members: string[];
  defaultOwner: string;
  label?: string;
  small?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={small ? "btn px-2 py-1 text-xs" : "btn-primary"}
      >
        {small ? "+ 추가" : label}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="할 일 추가" width="max-w-xl">
        <div className="p-5">
          <TodoAddForm
            members={members}
            defaultOwner={defaultOwner}
            stacked
            onDone={() => setOpen(false)}
          />
        </div>
      </Modal>
    </>
  );
}
