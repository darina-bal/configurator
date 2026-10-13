import { describe, expect, it } from 'vitest';

import { FOOTER_ROWS, isFooterGroup, isFooterSection } from './footer-rows';

const sections = FOOTER_ROWS.filter(isFooterSection);

describe('FOOTER_ROWS', () => {
  it('содержит все разделы подвала сайта в его порядке', () => {
    expect(FOOTER_ROWS.map((row) => row.title)).toEqual([
      'Наши консультанты',
      'Наши шоурумы',
      'Наши соцсети',
      'Кабинет дизайнера',
      'О компании',
      'Контакты',
      'Карьера',
    ]);
  });

  it('у каждого раздела есть пункты, а у вложенных списков — их названия', () => {
    for (const section of sections) {
      expect(section.items.length, section.title).toBeGreaterThan(0);
      for (const item of section.items) {
        if (isFooterGroup(item)) expect(item.links.length, item.label).toBeGreaterThan(0);
      }
    }
  });

  it('названия пунктов в пределах одного списка не повторяются (по ним строятся ключи)', () => {
    for (const section of sections) {
      const labels = section.items.map((item) => (isFooterGroup(item) ? item.label : item));
      expect(new Set(labels).size, section.title).toBe(labels.length);

      for (const item of section.items) {
        if (isFooterGroup(item))
          expect(new Set(item.links).size, item.label).toBe(item.links.length);
      }
    }
  });

  it('в данных нет адресов: подвал целиком — заглушка, ни на сайт, ни в соцсети он не ведёт', () => {
    expect(JSON.stringify(FOOTER_ROWS)).not.toMatch(/https?:|href|centersvet/i);
  });

  it('примечание о Meta есть только у списка соцсетей', () => {
    const withNote = sections.filter((section) => section.note);

    expect(withNote.map((section) => section.title)).toEqual(['Наши соцсети']);
    expect(withNote[0]?.note).toContain('Meta');
  });

  it('определяет вид строки и пункта', () => {
    const [first, , , account] = FOOTER_ROWS;
    if (!first || !account) throw new Error('Нет строк подвала');

    expect(isFooterSection(first)).toBe(true);
    expect(isFooterSection(account)).toBe(false);
    expect(isFooterGroup({ label: 'Дилеры', links: [] })).toBe(true);
    expect(isFooterGroup('Москва')).toBe(false);
  });
});
