import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";
import "dayjs/locale/ru";
import "dayjs/locale/zh-cn";
import "dayjs/locale/ko";
import { useAppState } from "@/ui/states/appState";
import { ss } from "@/ui/utils";

dayjs.extend(relativeTime);

interface Props {
  date: string | number;
}

const locales = {
  en: "en",
  ru: "ru",
  zh: "zh-cn",
  kr: "ko",
};

const todayLocale = {
  en: "Today",
  ru: "Сегодня",
  zh: "今天",
  kr: "오늘",
};

export default function DateComponent({ date }: Props) {
  const { language } = useAppState(ss(["language"]));

  const dateFormat = dayjs(date).locale(
    locales[language as keyof typeof locales]
  );

  if (dayjs().startOf("day").isSame(dateFormat)) {
    return <>{todayLocale[language as keyof typeof todayLocale]}</>;
  }

  return <>{dateFormat.format("D MMMM")}</>;
}
