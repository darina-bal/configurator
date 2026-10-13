import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DescriptionBlocks } from './DescriptionBlocks';

const blocks = [
  { title: 'SUPERSLIM (DALI)', paragraphs: ['Минималистичная световая система.'] },
  { title: 'SSD.LOCUS', paragraphs: ['Первый абзац.', 'Второй абзац.'] },
];

describe('DescriptionBlocks', () => {
  it('рисует плашку на каждый блок: заголовок и абзацы', () => {
    render(<DescriptionBlocks blocks={blocks} />);

    const region = screen.getByRole('region', { name: 'Описание' });
    expect(within(region).getAllByRole('article')).toHaveLength(2);
    expect(
      within(region)
        .getAllByRole('heading')
        .map((heading) => heading.textContent),
    ).toEqual(['SUPERSLIM (DALI)', 'SSD.LOCUS']);
  });

  it('каждый абзац — отдельный <p>', () => {
    const { container } = render(<DescriptionBlocks blocks={blocks} />);

    expect(Array.from(container.querySelectorAll('p')).map((p) => p.textContent)).toEqual([
      'Минималистичная световая система.',
      'Первый абзац.',
      'Второй абзац.',
    ]);
  });
});
