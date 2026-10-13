import type { DescriptionBlock, Product, ProductOption, ProductVariant } from './types';

const SLUG_PATTERN = /^[a-z0-9_-]+$/;

function isUrlLike(value: string): boolean {
  return value.startsWith('https://') || value.startsWith('/');
}

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const result = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) result.add(value);
    seen.add(value);
  }
  return [...result];
}

/** Ошибки блоков описания: у каждого блока должны быть заголовок и непустые абзацы. */
function validateDescription(blocks: readonly DescriptionBlock[], where: string): string[] {
  const errors: string[] = [];
  blocks.forEach((block, index) => {
    if (!block.title.trim()) errors.push(`${where}: у блока описания №${index + 1} нет заголовка`);
    if (block.paragraphs.length === 0 || block.paragraphs.some((text) => !text.trim())) {
      errors.push(`${where}: в блоке описания №${index + 1} нет текста или есть пустой абзац`);
    }
  });
  return errors;
}

function validateBasics(product: Product, where: string): string[] {
  const errors: string[] = [];
  if (!SLUG_PATTERN.test(product.slug)) errors.push(`${where}: slug должен быть [a-z0-9_-]+`);
  if (!product.name.trim()) errors.push(`${where}: пустое название`);
  if (product.description.length === 0 && product.variants.some((v) => !v.description)) {
    errors.push(`${where}: нет описания (ни общего, ни у каждого SKU)`);
  }
  errors.push(...validateDescription(product.description, where));
  return errors;
}

function validateOption(option: ProductOption, where: string): string[] {
  const errors: string[] = [];
  if (option.values.length === 0) errors.push(`${where}: у опции «${option.id}» нет значений`);
  for (const id of duplicates(option.values.map((value) => value.id))) {
    errors.push(`${where}: в опции «${option.id}» дублируется значение «${id}»`);
  }
  if (option.kind === 'swatch') {
    for (const value of option.values.filter((item) => !item.swatch)) {
      errors.push(`${where}: у значения «${option.id}/${value.id}» нет цвета swatch`);
    }
  }
  return errors;
}

function validateOptions(product: Product, where: string): string[] {
  const errors: string[] = [];
  if (product.options.length === 0) errors.push(`${where}: нет ни одной опции`);
  for (const id of duplicates(product.options.map((option) => option.id))) {
    errors.push(`${where}: дублируется опция «${id}»`);
  }
  for (const option of product.options) errors.push(...validateOption(option, where));
  return errors;
}

/** Ошибки одного SKU: значения опций, числа, адреса фото и чертежа, характеристики, описание. */
function validateVariant(product: Product, variant: ProductVariant, where: string): string[] {
  const errors: string[] = [];
  const sku = `${where}, SKU «${variant.sku}»`;

  for (const option of product.options) {
    const valueId = variant.selection[option.id];
    if (valueId === undefined) {
      errors.push(`${sku}: не задано значение опции «${option.id}»`);
    } else if (!option.values.some((value) => value.id === valueId)) {
      errors.push(`${sku}: неизвестное значение «${valueId}» опции «${option.id}»`);
    }
  }

  if (!Number.isInteger(variant.price) || variant.price <= 0) {
    errors.push(`${sku}: цена должна быть целым числом больше 0`);
  }
  if (!Number.isInteger(variant.stock) || variant.stock < 0) {
    errors.push(`${sku}: остаток должен быть целым числом не меньше 0`);
  }
  if (!Number.isInteger(variant.warranty) || variant.warranty < 0) {
    errors.push(`${sku}: гарантия должна быть целым числом не меньше 0`);
  }
  if (!isUrlLike(variant.photo.src)) errors.push(`${sku}: некорректный URL фото`);
  if (variant.diagram && !isUrlLike(variant.diagram.src)) {
    errors.push(`${sku}: некорректный URL чертежа`);
  }
  if (variant.specs.length === 0) errors.push(`${sku}: нет характеристик`);
  errors.push(...validateDescription(variant.description ?? [], sku));
  return errors;
}

function validateVariants(product: Product, where: string): string[] {
  const errors: string[] = [];
  if (product.variants.length === 0) errors.push(`${where}: нет ни одного SKU`);
  for (const sku of duplicates(product.variants.map((variant) => variant.sku))) {
    errors.push(`${where}: дублируется SKU «${sku}»`);
  }

  const combinations = product.variants.map((variant) =>
    product.options.map((option) => variant.selection[option.id] ?? '?').join('|'),
  );
  for (const combination of duplicates(combinations)) {
    errors.push(`${where}: несколько SKU с одной комбинацией опций «${combination}»`);
  }

  for (const variant of product.variants) {
    errors.push(...validateVariant(product, variant, where));
  }

  // Каждое значение опции должно использоваться хотя бы одним SKU — иначе кнопка «мёртвая».
  for (const option of product.options) {
    for (const value of option.values) {
      if (!product.variants.some((variant) => variant.selection[option.id] === value.id)) {
        errors.push(`${where}: значение «${option.id}/${value.id}» не используется ни одним SKU`);
      }
    }
  }
  return errors;
}

/** Слоты слайдов выбранного SKU: их id нельзя занимать общими слайдами. */
const RESERVED_SLIDE_IDS: ReadonlySet<string> = new Set(['photo', 'diagram']);

/** Дополнительные слайды галереи: уникальные id, не занятые слотами SKU, и корректные ссылки. */
function validateExtraMedia(product: Product, where: string): string[] {
  const errors: string[] = [];
  const mediaIds = (product.extraMedia ?? []).map((media) => media.id);

  for (const id of duplicates(mediaIds)) {
    errors.push(`${where}: id слайда «${id}» не уникален`);
  }
  for (const id of mediaIds.filter((item) => RESERVED_SLIDE_IDS.has(item))) {
    errors.push(`${where}: id слайда «${id}» зарезервирован под фото и чертёж выбранного SKU`);
  }
  for (const media of product.extraMedia ?? []) {
    if (!isUrlLike(media.src)) errors.push(`${where}: некорректный URL слайда «${media.id}»`);
  }
  return errors;
}

/**
 * Проверяет целостность описания товара. Возвращает список проблем (пустой — данные корректны).
 * Прогоняется тестом по всему каталогу, поэтому ошибка в данных нового товара ловится сразу.
 */
export function validateProduct(product: Product): string[] {
  const where = `Товар «${product.slug}»`;

  return [
    ...validateBasics(product, where),
    ...validateOptions(product, where),
    ...validateVariants(product, where),
    ...validateExtraMedia(product, where),
  ];
}
