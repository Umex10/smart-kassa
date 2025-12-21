import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import { addNotification } from "../../../redux/slices/notificationsSlice";
import { NEWS } from "../../../constants/Notifications";
import { getDateNow } from "@/utils/rides/getDate";
import { useNotificationCheck } from "@/hooks/useNotificationCheck";
import { useEffect } from "react";

export const useCheckForNews = (trigger: boolean) => {
  const dispatch = useDispatch<AppDispatch>();

  const inlineSlider = useSelector((state: RootState) =>
    state.notificationsState.activeSettings.inlineSlider);

  const hasNotSendRegister = useNotificationCheck(NEWS.REGISTER);

  useEffect(() => {
    
    if (!inlineSlider.news) return;
  
    if (!trigger) return;

    if (hasNotSendRegister) {
      dispatch(addNotification({
        id: NEWS.REGISTER,
        icon: "handmetal",
        title: "Welcome! 🧏‍♂️",
        desc: "You successfully created an account!",
        date: getDateNow(),
        read: false,
        color: "emerald"
      }))
    }
  }, [inlineSlider, trigger, hasNotSendRegister, dispatch])

} 