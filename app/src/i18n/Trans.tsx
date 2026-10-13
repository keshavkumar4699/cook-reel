import { Fragment, type ReactNode } from 'react';
import { t, type MessageKey, type Params } from './index';

/**
 * A translated sentence with React nodes in some of its {placeholders}, so word order stays the
 * translator's: <Trans k="recipe.variationOf" values={{ title: <Txt variant="bodyStrong">{title}</Txt> }} />.
 * Render it inside a <Txt>.
 */
export function Trans({ k, values, params }: { k: MessageKey; values: Record<string, ReactNode>; params?: Params }) {
  const tokens: Params = { ...params };
  for (const name of Object.keys(values)) tokens[name] = `@@${name}@@`;
  const parts = t(k, tokens).split(/@@(\w+)@@/);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? <Fragment key={index}>{values[part]}</Fragment> : part ? <Fragment key={index}>{part}</Fragment> : null,
      )}
    </>
  );
}
