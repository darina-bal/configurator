/** Пользователь просил систему минимизировать анимацию (настройка ОС «уменьшить движение»). */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
