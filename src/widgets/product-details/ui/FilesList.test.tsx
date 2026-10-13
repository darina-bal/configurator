import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { ProductFile } from '@/entities/product';

import { FilesList } from './FilesList';

const files: ProductFile[] = [
  { title: '3D Files', format: 'rar', kind: '3d', available: false },
  { title: 'DIALux', format: 'rar', kind: 'document', available: false },
  { title: 'Паспорт, инструкция', format: 'pdf', kind: 'document', available: true },
];

describe('FilesList', () => {
  it('показывает строку на каждый файл с названием и расширением', () => {
    render(<FilesList files={files} />);

    const list = screen.getByRole('region', { name: 'Файлы для скачивания' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('3D Files.rar');
    expect(items[2]).toHaveTextContent('Паспорт, инструкция.pdf');
  });

  it('файл, который есть, — ссылка-заглушка: без адреса и без перехода в новую вкладку', () => {
    render(<FilesList files={files} />);

    const stub = screen.getByText('Паспорт, инструкция').closest('a');
    expect(stub).not.toBeNull();
    expect(stub).not.toHaveAttribute('href');
    expect(stub).not.toHaveAttribute('target');
    expect(stub).toHaveTextContent('.pdf');
  });

  it('файла нет — приглушённая строка, не ссылка', () => {
    render(<FilesList files={files} />);

    expect(screen.getByText('3D Files').closest('a')).toBeNull();
    expect(screen.getAllByText('файла нет')).toHaveLength(2);
  });

  it('ни одной настоящей ссылки в блоке нет', () => {
    const { container } = render(<FilesList files={files} />);

    expect(container.querySelectorAll('a[href]')).toHaveLength(0);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('ничего не рисует без файлов', () => {
    const { container } = render(<FilesList files={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
