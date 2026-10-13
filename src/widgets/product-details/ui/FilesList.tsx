import clsx from 'clsx';

import type { ProductFile } from '@/entities/product';
import { Icon } from '@/shared/ui/icon';
import { StubLink } from '@/shared/ui/stub-link';

import styles from './FilesList.module.scss';

interface FilesListProps {
  files: ProductFile[];
}

function FileRow({ file }: Readonly<{ file: ProductFile }>) {
  const content = (
    <>
      <span className={styles.name}>
        <Icon name={file.kind === '3d' ? 'cube' : 'checkbox'} size={file.kind === '3d' ? 17 : 14} />
        {file.title}
      </span>
      <span className={styles.ext}>
        .{file.format}
        <Icon name="download" size={17} />
      </span>
    </>
  );

  // Файла у изделия нет: строка остаётся на месте, но приглушена (как на сайте).
  if (!file.available) {
    return (
      <div className={clsx(styles.link, styles.disabled)}>
        {content}
        <span className={styles.hidden}>файла нет</span>
      </div>
    );
  }

  // Файл есть, но скачать его в прототипе нельзя: строка выглядит как ссылка, а ведёт никуда.
  return <StubLink className={styles.link}>{content}</StubLink>;
}

/** Серая плашка «блок скачивания»: строка на файл — значок, название, расширение и стрелка. */
export function FilesList({ files }: Readonly<FilesListProps>) {
  if (files.length === 0) return null;

  return (
    <section className={styles.panel} aria-label="Файлы для скачивания">
      <ul className={styles.list}>
        {files.map((file) => (
          <li key={file.title} className={styles.item}>
            <FileRow file={file} />
          </li>
        ))}
      </ul>
    </section>
  );
}
