import type { LoaderFunctionArgs, ShouldRevalidateFunctionArgs } from 'react-router';
import { describe, expect, it } from 'vitest';

import { productLoader, shouldRevalidateProduct } from './product-loader';

const args = (slug?: string) =>
  ({
    params: slug === undefined ? {} : { slug },
    request: new Request('http://localhost/'),
  }) as LoaderFunctionArgs;

describe('productLoader', () => {
  it('возвращает товар по slug', () => {
    expect(productLoader(args('locus_duo')).name).toBe('LOCUS DUO');
  });

  it('бросает ответ 404 для неизвестного slug', () => {
    expect.assertions(2);
    try {
      productLoader(args('unknown'));
    } catch (error) {
      expect(error).toBeInstanceOf(Response);
      expect((error as Response).status).toBe(404);
    }
  });

  it('бросает ответ 404, если slug не передан', () => {
    expect(() => productLoader(args())).toThrow(Response);
  });
});

describe('shouldRevalidateProduct', () => {
  const revalidate = (currentSlug: string, nextSlug: string) =>
    shouldRevalidateProduct({
      currentParams: { slug: currentSlug },
      nextParams: { slug: nextSlug },
    } as unknown as ShouldRevalidateFunctionArgs);

  it('не перезапускает loader при смене опций (тот же slug)', () => {
    expect(revalidate('locus_duo', 'locus_duo')).toBe(false);
  });

  it('перезапускает loader при переходе на другой товар', () => {
    expect(revalidate('locus_duo', 'loop_rt_main')).toBe(true);
  });
});
