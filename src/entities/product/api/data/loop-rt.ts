import type { OptionValue, Product, ProductVariant } from '../../model/types';
import { buildSpecs } from './build-specs';
import { FINISH } from './finishes';
import { mediaUrl, variantFiles } from './sources';

/** Источник: страница /product/loop_rt_main/ на centersvet.ru (снимок на 2026-10-12). */

const PRICE = 4800;
const WARRANTY_YEARS = 2;

/** Чертёж на сайте один на все отделки. */
const DIAGRAM = { src: mediaUrl('svg/loop_rt80_140125.svg'), alt: 'LOOP.RT — чертёж с размерами' };

interface VariantDef {
  sku: string;
  finish: OptionValue;
  angle: string;
  stock: number;
  photo: string;
}

function createVariant(def: VariantDef): ProductVariant {
  return {
    sku: def.sku,
    selection: { finish: def.finish.id },
    price: PRICE,
    stock: def.stock,
    warranty: WARRANTY_YEARS,
    photo: { src: mediaUrl(def.photo), alt: `LOOP.RT — ${def.finish.label}` },
    diagram: DIAGRAM,
    specs: buildSpecs({
      series: 'LOOP.RT',
      sku: def.sku,
      finish: def.finish.code ?? def.finish.label,
      power: 12,
      cct: 3000,
      angle: def.angle,
      ip: 44,
      voltage: 220,
      warranty: WARRANTY_YEARS,
    }),
    files: variantFiles(),
  };
}

export const loopRt: Product = {
  slug: 'loop_rt_main',
  name: 'LOOP.RT',
  description: [
    {
      title: 'LOOP.RT',
      paragraphs: [
        'Встроенный потолочный светильник мощностью 12 Вт с поворотной конструкцией и сферической линзой.',
        'Регулировка яркости по протоколу DALI. Представлены модели из 100% латуни. Глубина встройки 70 мм.',
      ],
    },
  ],
  options: [
    {
      id: 'finish',
      label: 'Цвет',
      description: 'Выберите отделку корпуса.',
      kind: 'swatch',
      values: [FINISH.paintWhite, FINISH.paintBlack, FINISH.patinaBrass, FINISH.darkBrass],
    },
  ],
  variants: [
    createVariant({
      sku: 'LOOP.RT80.12W.30K.80A.APW.DALI',
      finish: FINISH.paintWhite,
      angle: 'Medium',
      stock: 162,
      photo: 'svetilnik/loop_rt80/loop_rt80_paint_white_black_frame_180825.jpg',
    }),
    createVariant({
      sku: 'LOOP.RT80.12W.30K.80A.APB.DALI',
      finish: FINISH.paintBlack,
      angle: 'Medium',
      stock: 199,
      photo: 'svetilnik/loop_rt80/loop_rt80_paint_black_140125.jpg',
    }),
    createVariant({
      sku: 'LOOP.RT80.12W.30K.80A.BPG.DALI',
      finish: FINISH.patinaBrass,
      angle: 'Wide',
      stock: 195,
      photo: 'svetilnik/loop_rt80/loop_rt80_patina_brass_180825.jpg',
    }),
    createVariant({
      sku: 'LOOP.RT80.12W.30K.80A.BPD.DALI',
      finish: FINISH.darkBrass,
      angle: 'Wide',
      stock: 190,
      photo: 'svetilnik/loop_rt80/loop_rt80_dark_brass_180825.jpg',
    }),
  ],
  // Видео этого светильника с его страницы на сайте — плеер Kinescope («OREO RT LOOP»).
  extraMedia: [
    {
      id: 'video',
      kind: 'embed',
      src: 'https://kinescope.io/embed/0VyBHQewD3SgJFEVqiwV19',
      label: 'Видео',
      alt: 'Видео о светильнике LOOP.RT',
    },
  ],
};
