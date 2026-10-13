import { useEffect } from 'react';

/** Устанавливает заголовок вкладки браузера на время жизни компонента. */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
