"use server";

import { refresh } from "next/cache";

import { auth } from "@/lib/auth";
import { getWritableCalendars } from "@/lib/calendar/events";
import { createGoogleEvent } from "@/lib/calendar/write";

export type ActionState = { error: string | null };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

export async function createEventAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // 서버 액션은 누구나 부를 수 있는 입구다. 매번 세션을 확인한다.
  const session = await auth();
  if (!session?.user.member) throw new Error("로그인이 필요하다");
  if (!session.accessToken) {
    return { error: "구글 로그인이 만료됐다. 로그아웃했다가 다시 로그인해라." };
  }

  const text = (name: string) => String(formData.get(name) ?? "").trim();

  const title = text("title");
  if (!title) return { error: "제목을 적어라." };

  // 고를 수 있는 캘린더인지 서버가 다시 본다. 화면이 보낸 값을 그대로 믿지 않는다.
  const calendarId = text("calendarId");
  const writable = await getWritableCalendars();
  if (!writable.some((calendar) => calendar.id === calendarId)) {
    return { error: "그 캘린더에는 일정을 넣을 수 없다." };
  }

  const allDay = formData.get("allDay") === "on";
  const startDate = text("startDate");
  const endDate = text("endDate") || startDate;
  if (!DATE.test(startDate) || !DATE.test(endDate)) {
    return { error: "날짜를 확인해라." };
  }

  const startTime = text("startTime");
  const endTime = text("endTime");
  if (!allDay && (!TIME.test(startTime) || !TIME.test(endTime))) {
    return { error: "시각을 확인해라." };
  }

  const start = allDay ? startDate : `${startDate}T${startTime}`;
  const end = allDay ? endDate : `${endDate}T${endTime}`;
  if (allDay ? end < start : end <= start) {
    return { error: "끝이 시작보다 빠르다." };
  }

  const result = await createGoogleEvent(
    {
      calendarId,
      title,
      allDay,
      startDate,
      endDate,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      location: text("location"),
      description: text("description"),
      colorId: text("colorId") || undefined,
    },
    session.accessToken,
  );

  if (!result.ok) return { error: result.message };

  // 방금 넣은 일정이 바로 보여야 한다. 안 보이면 실패한 줄 알고 또 누른다.
  refresh();
  return { error: null };
}
