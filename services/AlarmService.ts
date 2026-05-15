import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alarm, RepeatType } from "../types/alarm";

const ALARMS_STORAGE_KEY = "@alarms";

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const AlarmService = {
  // Получить все будильники
  async getAllAlarms(): Promise<Alarm[]> {
    try {
      const alarmsJson = await AsyncStorage.getItem(ALARMS_STORAGE_KEY);
      if (!alarmsJson) return [];
      return JSON.parse(alarmsJson);
    } catch (error) {
      console.error("Failed to get alarms:", error);
      return [];
    }
  },

  // Сохранить будильник
  async saveAlarm(alarm: Alarm): Promise<void> {
    try {
      const alarms = await this.getAllAlarms();
      const index = alarms.findIndex((a) => a.id === alarm.id);

      // Отменяем старые уведомления для этого будильника
      await this.cancelAlarmNotifications(alarm.id);

      if (index >= 0) {
        alarms[index] = alarm;
      } else {
        alarms.push(alarm);
      }

      await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));

      // Планируем новые уведомления если будильник включён
      if (alarm.isEnabled) {
        await this.scheduleAlarmNotifications(alarm);
      }
    } catch (error) {
      console.error("Failed to save alarm:", error);
      throw error;
    }
  },

  // Удалить будильник
  async deleteAlarm(id: string): Promise<void> {
    try {
      const alarms = await this.getAllAlarms();
      const filtered = alarms.filter((a) => a.id !== id);
      await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(filtered));
      await this.cancelAlarmNotifications(id);
    } catch (error) {
      console.error("Failed to delete alarm:", error);
      throw error;
    }
  },

  // Получить следующий timestamp для будильника
  getNextTimestamp(alarm: Alarm): number | null {
    const now = new Date();
    const [hours, minutes] = alarm.time.split(":").map(Number);

    let targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    if (alarm.repeatType === "once") {
      // Для однократного будильника используем сохранённую дату
      if (alarm.createdAt) {
        targetDate = new Date(alarm.createdAt);
        targetDate.setHours(hours, minutes, 0, 0);
      }
      return targetDate > now ? targetDate.getTime() : null;
    }

    if (alarm.repeatType === "daily") {
      if (targetDate <= now) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      return targetDate.getTime();
    }

    if (alarm.repeatType === "weekly" && alarm.repeatDays.length > 0) {
      const currentDay = now.getDay();
      // Ищем следующий день недели
      let daysToAdd = 7;
      for (const day of alarm.repeatDays.sort()) {
        if (day > currentDay) {
          daysToAdd = day - currentDay;
          break;
        }
      }
      if (daysToAdd === 7 && alarm.repeatDays.includes(currentDay)) {
        daysToAdd = 0;
      } else if (daysToAdd === 7) {
        daysToAdd = 7 - currentDay + alarm.repeatDays[0];
      }

      targetDate.setDate(targetDate.getDate() + daysToAdd);
      return targetDate.getTime();
    }

    return null;
  },

  // Запланировать уведомления для будильника
  async scheduleAlarmNotifications(alarm: Alarm): Promise<void> {
    const nextTimestamp = this.getNextTimestamp(alarm);
    if (!nextTimestamp) return;

    // Основное уведомление-будильник
    await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.title || "Будильник",
        body: alarm.note || "Пора вставать!",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        categoryIdentifier: "alarm",
        data: { alarmId: alarm.id, type: "alarm" },
      },
      trigger: {
        date: new Date(nextTimestamp),
        channelId: "alarms",
      },
      identifier: `alarm_${alarm.id}`,
    });

    // Уведомление за 5 минут (если включено)
    if (alarm.advanceMinutes > 0) {
      const advanceTimestamp = nextTimestamp - alarm.advanceMinutes * 60 * 1000;
      if (advanceTimestamp > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Будильник через ${alarm.advanceMinutes} минут`,
            body: alarm.note || "Скоро будильник",
            sound: false,
            data: { alarmId: alarm.id, type: "advance" },
          },
          trigger: {
            date: new Date(advanceTimestamp),
            channelId: "alarms",
          },
          identifier: `advance_${alarm.id}`,
        });
      }
    }
  },

  // Отменить уведомления будильника
  async cancelAlarmNotifications(alarmId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(`alarm_${alarmId}`);
    await Notifications.cancelScheduledNotificationAsync(`advance_${alarmId}`);
  },

  // Отменить все уведомления
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Включить/выключить будильник
  async toggleAlarm(id: string, enabled: boolean): Promise<void> {
    const alarms = await this.getAllAlarms();
    const alarm = alarms.find((a) => a.id === id);
    if (alarm) {
      alarm.isEnabled = enabled;
      await this.saveAlarm(alarm);
    }
  },
};
