import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alarm } from "../types/alarm";
import { Platform, Vibration } from "react-native";
import * as Notifications from "expo-notifications";

const ALARMS_STORAGE_KEY = "@alarms";
let activeTimeouts: { [key: string]: NodeJS.Timeout } = {};

export const AlarmService = {
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

  async saveAlarm(alarm: Alarm): Promise<void> {
    try {
      const alarms = await this.getAllAlarms();
      const index = alarms.findIndex((a) => a.id === alarm.id);

      if (index >= 0) {
        alarms[index] = alarm;
      } else {
        alarms.push(alarm);
      }

      await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(alarms));
      await this.scheduleAllAlarms();
    } catch (error) {
      console.error("Failed to save alarm:", error);
      throw error;
    }
  },

  async deleteAlarm(id: string): Promise<void> {
    try {
      const alarms = await this.getAllAlarms();
      const filtered = alarms.filter((a) => a.id !== id);
      await AsyncStorage.setItem(ALARMS_STORAGE_KEY, JSON.stringify(filtered));

      if (activeTimeouts[id]) {
        clearTimeout(activeTimeouts[id]);
        delete activeTimeouts[id];
      }
    } catch (error) {
      console.error("Failed to delete alarm:", error);
      throw error;
    }
  },

  getNextDate(alarm: Alarm): Date | null {
    const now = new Date();
    const [hours, minutes] = alarm.time.split(":").map(Number);

    let targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    if (alarm.repeatType === "once") {
      if (targetDate <= now) {
        return null;
      }
      return targetDate;
    }

    if (alarm.repeatType === "daily") {
      if (targetDate <= now) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      return targetDate;
    }

    if (alarm.repeatType === "weekly" && alarm.repeatDays.length > 0) {
      const currentDay = now.getDay();
      let daysToAdd = 7;

      for (const day of alarm.repeatDays.sort()) {
        if (day > currentDay) {
          daysToAdd = day - currentDay;
          break;
        }
      }

      if (daysToAdd === 7 && alarm.repeatDays.includes(currentDay)) {
        if (targetDate > now) {
          daysToAdd = 0;
        } else {
          daysToAdd = 7 - currentDay + alarm.repeatDays[0];
        }
      } else if (daysToAdd === 7) {
        daysToAdd = 7 - currentDay + alarm.repeatDays[0];
      }

      targetDate.setDate(targetDate.getDate() + daysToAdd);
      return targetDate;
    }

    return null;
  },

  async scheduleAllAlarms(): Promise<void> {
    // Очищаем все активные таймеры
    for (const id in activeTimeouts) {
      clearTimeout(activeTimeouts[id]);
    }
    activeTimeouts = {};

    const alarms = await this.getAllAlarms();
    console.log(`Scheduling ${alarms.length} alarms`);

    for (const alarm of alarms) {
      if (alarm.isEnabled) {
        const nextDate = this.getNextDate(alarm);
        if (nextDate && nextDate > new Date()) {
          const delay = nextDate.getTime() - Date.now();
          console.log(
            `Scheduling alarm "${alarm.title}" for ${nextDate.toLocaleString()}, delay: ${delay}ms`,
          );

          activeTimeouts[alarm.id] = setTimeout(() => {
            this.triggerAlarm(alarm);
          }, delay);
        } else {
          console.log(`Alarm ${alarm.id} has no future date`);
        }
      }
    }
  },

  async triggerAlarm(alarm: Alarm): Promise<void> {
    console.log(`TRIGGERING ALARM: ${alarm.title}`);

    // Вибрация
    Vibration.vibrate([0, 1000, 500, 1000, 500, 1000], true);

    // Показываем уведомление
    await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.title || "Будильник",
        body: alarm.note || "Пора вставать!",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: {
          alarmId: alarm.id,
          type: "alarm",
          title: alarm.title,
          note: alarm.note,
        },
      },
      trigger: null,
    });

    // Если однократный, отключаем его
    if (alarm.repeatType === "once") {
      alarm.isEnabled = false;
      await this.saveAlarm(alarm);
    }

    // Перепланируем для повторяющихся
    if (alarm.repeatType !== "once") {
      await this.scheduleAllAlarms();
    }
  },

  async cancelAllAlarms(): Promise<void> {
    for (const id in activeTimeouts) {
      clearTimeout(activeTimeouts[id]);
    }
    activeTimeouts = {};
  },
};
