import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useDocumentTitle } from './use-document-title';

describe('useDocumentTitle', () => {
  it('устанавливает заголовок документа и обновляет его при изменении', () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: 'LOOP.RT — Центрсвет' },
    });
    expect(document.title).toBe('LOOP.RT — Центрсвет');

    rerender({ title: 'LOCUS DUO — Центрсвет' });
    expect(document.title).toBe('LOCUS DUO — Центрсвет');
  });
});
