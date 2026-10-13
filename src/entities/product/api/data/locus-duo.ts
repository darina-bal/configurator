import type {
  DescriptionBlock,
  OptionValue,
  Product,
  ProductPhoto,
  ProductVariant,
} from '../../model/types';
import { buildSpecs } from './build-specs';
import { FINISH } from './finishes';
import { mediaUrl, variantFiles } from './sources';

/**
 * На centersvet.ru это две отдельные страницы SUPERSLIM DALI — светильники под встроенный
 * (/product/superslim_dali/) и накладной (/product/sps_dali_surface/) трек. Конфигуратор
 * объединяет их в один товар с выбором трека. Снимок данных на 2026-10-12.
 *
 * Встроенный и накладной LOCUS DUO — разные изделия (22 мм / 4 Вт и 50 мм / 8 Вт): различия
 * отражены в характеристиках, цене, фото и чертеже каждого SKU. Блоки описания — те же плашки,
 * что стоят перед группой SSD.LOCUS на соответствующей странице сайта.
 */

const WARRANTY_YEARS = 5;

const SERIES_BLOCK: DescriptionBlock = {
  title: 'SUPERSLIM (DALI)',
  paragraphs: [
    'Минималистичная световая система для максимально эстетичного решения задач по освещению в дизайне интерьера.',
  ],
};

const RECESSED_DESCRIPTION: DescriptionBlock[] = [
  SERIES_BLOCK,
  {
    title: 'ТРЕКИ',
    paragraphs: [
      'Встроенные треки с поддержкой плавной регулировки яркости светильников по протоколу DALI.',
    ],
  },
  {
    title: 'SSD.LOCUS',
    paragraphs: [
      'Светильник для встроенного трека мощностью 4-12 Вт. Представлены модели с декоративной окантовкой, а также светильник с возможностью настройки угла света.',
      'Плавная регулировка яркости по протоколу DALI.',
    ],
  },
];

const SURFACE_DESCRIPTION: DescriptionBlock[] = [
  SERIES_BLOCK,
  {
    title: 'ТРЕК',
    paragraphs: [
      'Накладной трек с поддержкой плавной регулировки яркости светильников по протоколу DALI.',
    ],
  },
  {
    title: 'SSD.LOCUS',
    paragraphs: [
      'Светильник для накладного трека мощностью 12 Вт с новой качественной оптикой и декоративной окантовкой. Плавная регулировка яркости по протоколу DALI. Корпус светильника после установки перекрывает трек.',
    ],
  },
];

/** Чертёж на сайте один на группу (все цвета) и свой у каждого типа трека. */
const DIAGRAM: Record<'recessed' | 'surface', ProductPhoto> = {
  recessed: {
    src: mediaUrl('shemu/ssd_locus_turn_duo_221225.svg'),
    alt: 'LOCUS DUO, встроенный трек — чертёж с размерами',
  },
  surface: {
    src: mediaUrl('shemu/ssd_locus_duo_1630_pb_dali__180825.svg'),
    alt: 'LOCUS DUO, накладной трек — чертёж с размерами',
  },
};

interface VariantDef {
  track: 'recessed' | 'surface';
  sku: string;
  finish: OptionValue;
  price: number;
  stock: number;
  power: number;
  cct: number;
  angle: string;
  photo: string;
}

function createVariant(def: VariantDef): ProductVariant {
  const trackLabel = def.track === 'recessed' ? 'Встроенный' : 'Накладной';

  return {
    sku: def.sku,
    selection: { track: def.track, finish: def.finish.id },
    price: def.price,
    stock: def.stock,
    warranty: WARRANTY_YEARS,
    photo: { src: mediaUrl(def.photo), alt: `LOCUS DUO — ${trackLabel} трек, ${def.finish.label}` },
    diagram: DIAGRAM[def.track],
    specs: buildSpecs({
      series: 'SUPERSLIM DALI',
      sku: def.sku,
      finish: def.finish.code ?? def.finish.label,
      power: def.power,
      cct: def.cct,
      angle: def.angle,
      ip: 40,
      voltage: 48,
      warranty: WARRANTY_YEARS,
    }),
    files: variantFiles(),
    description: def.track === 'recessed' ? RECESSED_DESCRIPTION : SURFACE_DESCRIPTION,
  };
}

export const locusDuo: Product = {
  slug: 'locus_duo',
  name: 'LOCUS DUO',
  description: [SERIES_BLOCK],
  options: [
    {
      id: 'track',
      label: 'Трек',
      description: 'Светильник подбирается под тип трека.',
      kind: 'card',
      values: [
        {
          id: 'recessed',
          label: 'Встроенный',
          hint: 'Без видимой рамки, заподлицо с потолком',
        },
        {
          id: 'surface',
          label: 'Накладной',
          hint: 'На потолок, стену и углы, возможен подвес',
        },
      ],
    },
    {
      id: 'finish',
      label: 'Цвет',
      description: 'Выберите отделку корпуса.',
      kind: 'swatch',
      values: [FINISH.paintWhite, FINISH.paintBlack, FINISH.patinaSatin],
    },
  ],
  variants: [
    // Встроенный трек — SSD LOCUS TURN DUO 22.
    createVariant({
      track: 'recessed',
      sku: 'SSD LOCUS TURN DUO 22 0427 36° APW DALI',
      finish: FINISH.paintWhite,
      price: 10800,
      stock: 199,
      power: 4,
      cct: 2700,
      angle: 'Medium',
      photo: 'icon_400_400/ssd_locus_duo_0430_pw_icon_221225.jpg',
    }),
    createVariant({
      track: 'recessed',
      sku: 'SSD LOCUS TURN DUO 22 0427 36° APB DALI',
      finish: FINISH.paintBlack,
      price: 10800,
      stock: 191,
      power: 4,
      cct: 2700,
      angle: 'Medium',
      photo: 'icon_400_400/ssd_locus_duo_0430_pb_icon_221225.jpg',
    }),
    createVariant({
      track: 'recessed',
      sku: 'SSD LOCUS TURN DUO 22 0427 36° APG DALI',
      finish: FINISH.patinaSatin,
      price: 10800,
      stock: 0,
      power: 4,
      cct: 2700,
      angle: 'Medium',
      photo: 'icon_400_400/ssd_locus_duo_0430_sg_icon_221225.jpg',
    }),
    // Накладной трек — SSD LOCUS DUO 50.
    createVariant({
      track: 'surface',
      sku: 'SSD.LOCUS.DUO.50.8W.30K.15A.APW.DALI',
      finish: FINISH.paintWhite,
      price: 18600,
      stock: 99,
      power: 8,
      cct: 3000,
      angle: 'Spot',
      photo: 'svetilnik/superslim_dali/ssd_locus_duo_paint_white_icon_180825.jpg',
    }),
    createVariant({
      track: 'surface',
      sku: 'SSD.LOCUS.DUO.50.8W.30K.15A.APB.DALI',
      finish: FINISH.paintBlack,
      price: 18600,
      stock: 194,
      power: 8,
      cct: 3000,
      angle: 'Spot',
      photo: 'svetilnik/superslim_dali/ssd_locus_duo_paint_black_icon_180825.jpg',
    }),
    createVariant({
      track: 'surface',
      sku: 'SSD.LOCUS.DUO.50.8W.27K.15A.APG.DALI',
      finish: FINISH.patinaSatin,
      price: 20800,
      stock: 0,
      power: 8,
      cct: 2700,
      angle: 'Spot',
      photo: 'svetilnik/superslim_dali/ssd_locus_duo_patina_brass_icon_180825.jpg',
    }),
  ],
  // Видео серии SUPERSLIM DALI со страницы встроенных треков на сайте — общее для обоих треков
  // (у страницы накладных треков собственного видео нет).
  extraMedia: [
    {
      id: 'video',
      kind: 'video',
      src: mediaUrl('video_main/superslim_dali_2026-09-25_desk_250926.mp4'),
      label: 'Видео',
      alt: 'Видео о системе SUPERSLIM DALI',
    },
  ],
};
