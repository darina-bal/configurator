import type { DescriptionBlock } from '@/entities/product';

import styles from './DescriptionBlocks.module.scss';

interface DescriptionBlocksProps {
  blocks: DescriptionBlock[];
}

/** Серые плашки описания: заголовок и абзацы — как блоки описания на страницах centersvet.ru. */
export function DescriptionBlocks({ blocks }: Readonly<DescriptionBlocksProps>) {
  return (
    <section className={styles.root} aria-label="Описание">
      {blocks.map((block, index) => (
        <article key={`${index}-${block.title}`} className={styles.block}>
          <h2 className={styles.title}>{block.title}</h2>
          <div className={styles.text}>
            {block.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
