export type RepeatType = "once" | "daily" | "weekly";

export interface Alarm {
  id: string;
  title: string;
  note: string;
  time: string; // "HH:MM"
  repeatType: RepeatType;
  repeatDays: number[]; // 0 = воскресенье, 1 = понедельник, ... 6 = суббота
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  advanceMinutes: number; // уведомление за X минут
}

export const weekDays = [
  { value: 0, label: "Вс" },
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
];

export const fullWeekDays: Record<number, string> = {
  0: "Воскресенье",
  1: "Понедельник",
  2: "Вторник",
  3: "Среда",
  4: "Четверг",
  5: "Пятница",
  6: "Суббота",
};
