import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { StubLink } from './StubLink';

describe('StubLink', () => {
  it('показывает текст как обычная ссылка, но без адреса и без перехода в новую вкладку', () => {
    render(<StubLink>Контакты</StubLink>);

    const stub = screen.getByText('Контакты');
    expect(stub.tagName).toBe('A');
    expect(stub).not.toHaveAttribute('href');
    expect(stub).not.toHaveAttribute('target');
    expect(stub).not.toHaveAttribute('rel');
  });

  it('не ссылка для вспомогательных технологий: роль link у неё не появляется', () => {
    render(<StubLink>Контакты</StubLink>);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('не попадает в порядок обхода с клавиатуры', async () => {
    render(
      <>
        <button type="button">До</button>
        <StubLink>Заглушка</StubLink>
        <button type="button">После</button>
      </>,
    );

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'До' })).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'После' })).toHaveFocus();
  });

  it('добавляет свои классы к классам места использования и передаёт остальные атрибуты', () => {
    render(
      <StubLink className="custom" data-testid="stub">
        Контакты
      </StubLink>,
    );

    const stub = screen.getByTestId('stub');
    expect(stub).toHaveClass('custom');
    expect(stub).toHaveClass('stub');
  });
});
