import type { ProductFile } from '../../model/types';

/** Медиафайлы лежат на CDN centersvet.ru; в репозиторий не копируются (hotlink). */
const CDN_MEDIA = 'https://cdn.centrsvet.ru/media/uploads/';

export function mediaUrl(path: string): string {
  return `${CDN_MEDIA}${path}`;
}

/**
 * Файлы изделия в том же составе и порядке, что в блоке скачивания на centersvet.ru:
 * «3D Files» и «DIALux» (у этих изделий их нет — строки приглушены) и «Паспорт, инструкция» (PDF).
 * Адресов у файлов нет: строка паспорта — ссылка-заглушка.
 */
export function variantFiles(): ProductFile[] {
  return [
    { title: '3D Files', format: 'rar', kind: '3d', available: false },
    { title: 'DIALux', format: 'rar', kind: 'document', available: false },
    { title: 'Паспорт, инструкция', format: 'pdf', kind: 'document', available: true },
  ];
}
