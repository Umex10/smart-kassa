import { useDispatch, useSelector } from "react-redux";
import type { AllRide } from "../../../constants/AllRide";
import type { AppDispatch, RootState } from "../../../redux/store";
import { addNotification } from "../../../redux/slices/notificationsSlice";
import { ACHIEVEMENTS } from "../../../constants/Notifications";
import { getDateNow } from "@/utils/rides/getDate";
import { useNotificationCheck } from "@/hooks/useNotificationCheck";
import { useEffect } from "react";

export const useCheckForAchievements = (rides: AllRide[] | null) => {
  const dispatch = useDispatch<AppDispatch>();

  const notifications = useSelector((state: RootState) =>
    state.notificationsState.activeSettings.inlineSlider);

  const hasNotSendFirstRide = useNotificationCheck(ACHIEVEMENTS.FIRST_RIDE);
  const hasNotSendTwoStreak = useNotificationCheck(ACHIEVEMENTS.TWO_STREAK);
  const hasNotSendDistanceRide = useNotificationCheck(ACHIEVEMENTS.DISTANCE_RIDE);

  useEffect(() => {

    if (!notifications.achievements || !rides) return;

    if (rides.length >= 1 && hasNotSendFirstRide) {
      dispatch(addNotification({
        id: ACHIEVEMENTS.FIRST_RIDE,
        icon: "trophy",
        title: "Your first ride ✅",
        desc: "You successfully finished your first ride!",
        date: getDateNow(),
        read: false,
        color: "amber"
      }));
    }

    if (rides.length >= 2 && hasNotSendTwoStreak) {
      dispatch(addNotification({
        id: ACHIEVEMENTS.TWO_STREAK,
        icon: "leaf",
        title: "2-Rides Streak ⭐",
        desc: "You successfully finished 2 rides!",
        date: getDateNow(),
        read: false,
        color: "green"
      }));
    }

    const ride = rides.find(ride => ride.distance >= 50);

    if (ride && hasNotSendDistanceRide) {
      dispatch(addNotification({
        id: ACHIEVEMENTS.DISTANCE_RIDE,
        icon: "flame",
        title: "First ride over 50 meters 🔥",
        desc: "You successfully finished a ride with over 50 meters!",
        date: getDateNow(),
        read: false,
        color: "yellow"
      }));
    }
  }, [rides, dispatch, notifications.achievements, 
    hasNotSendFirstRide, hasNotSendTwoStreak, hasNotSendDistanceRide])

} 