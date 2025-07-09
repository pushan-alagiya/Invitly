import { store } from "@/store";
import { AxiosRequestConfig } from "axios";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// import { store } from 'src/store'

const injectToken = (config: AxiosRequestConfig): AxiosRequestConfig => {
  const newConfig = { ...config };
  const state = store.getState();
  try {
    if (state.auth.userDetails?.token && newConfig.headers) {
      newConfig.headers.Authorization = `Bearer ${state.auth.userDetails?.token}`;
    }

    if (newConfig.headers)
      newConfig.headers["ngrok-skip-browser-warning"] = "true";

    return newConfig;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error(String(error));
  }
};

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get the user's timezone
const convertUTCtoLocal = (utcDate: Date) => {
  const zonedDate = toZonedTime(new Date(utcDate), timeZone); // Convert to user's time zone
  return new Date(format(zonedDate, "yyyy-MM-dd'T'HH:mm:ssXXX")); // ISO 8601 format with timezone offset
};

const formatDate = (dateString: string) => {
  const date = convertUTCtoLocal(new Date(dateString));
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours24 = date.getHours();
  const hours = String(hours24 % 12 || 12).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours24 >= 12 ? "PM" : "AM";

  return `${day}-${month}-${year} | ${hours}:${minutes} ${ampm}`;
};

export const NetworkUtils = { injectToken, formatDate, convertUTCtoLocal };
