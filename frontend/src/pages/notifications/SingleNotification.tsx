import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../redux/store";
import { toggleSetting, type NotificationType } from "../../../redux/slices/notificationsSlice";

interface SingleNotificationArgs<T extends keyof NotificationType> {
  section: T;
  sectionKey: keyof NotificationType[T];
  title: string;
  desc: string;
  startValue: boolean;
}

const SingleNotification = <T extends keyof NotificationType>({ section, sectionKey, title, desc, startValue }: 
  SingleNotificationArgs<T>) => {

  const [enabled, setEnabled] = useState<boolean>(startValue);

  const dispatch = useDispatch<AppDispatch>();

  function handleSetting(enabled: boolean) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dispatch(toggleSetting({section, sectionKey, value: enabled} as any))
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        const value = !enabled
        setEnabled(value)
        handleSetting(value)
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          const value = !enabled
          setEnabled(value)
          handleSetting(value)
        }
      }}
      className="
    w-full flex items-center justify-between
    py-4 px-4 text-left rounded-xl
    transition-all
    hover:bg-gray-100
    dark:hover:bg-violet-700/30
    cursor-pointer
    focus:outline-none
    focus:ring-2 focus:ring-violet-400
  "
    >
  
      <div className="flex flex-col">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-gray-600 dark:text-gray-500">
          {desc}
        </p>
      </div>
      
      <Switch
        checked={enabled}
        onCheckedChange={(value) => {
          setEnabled(value)
          handleSetting(value)
        }}
        onClick={(e) => e.stopPropagation()}
        className="
      scale-110
      bg-violet-200 dark:bg-slate-700          
      data-[state=checked]:bg-violet-400         
      data-[state=unchecked]:dark:bg-emerald-700/50  
      data-[state=checked]:before:translate-x-5
      before:bg-white
      before:transition-transform
      focus:ring-2 focus:ring-violet-400
    "
      />
    </div>

  )
}

export default SingleNotification
