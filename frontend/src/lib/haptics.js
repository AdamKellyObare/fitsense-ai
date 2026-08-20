import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

// Fire-and-forget, same as the app's other best-effort native calls
// (SecureStorage's setSynchronize, the native camera's cancel handling) —
// haptic feedback failing should never block or surface an error in the
// actual meal-logging flow. No-ops on web (gated, not just silently
// no-op-ing via the plugin itself) since haptics are meaningless there.

export function hapticLogSuccess() {
  if (!Capacitor.isNativePlatform()) return;
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}

export function hapticGoalReached() {
  if (!Capacitor.isNativePlatform()) return;
  Haptics.notification({ type: NotificationType.Success }).catch(() => {});
}
