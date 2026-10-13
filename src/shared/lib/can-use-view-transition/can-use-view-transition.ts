import { prefersReducedMotion } from '@/shared/lib/prefers-reduced-motion';

/**
 * Можно ли запускать View Transition: браузер поддерживает API и пользователь не просил
 * уменьшить движение. Без поддержки запрашивать переход не нужно — React Router в этом случае
 * пишет предупреждение в консоль.
 */
export function canUseViewTransition(): boolean {
  return typeof document.startViewTransition === 'function' && !prefersReducedMotion();
}
