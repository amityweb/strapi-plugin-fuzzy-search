import fuzzysort from 'fuzzysort';
import { transliterate } from 'transliteration';
import { Entity, FilteredEntry, Result } from '../interfaces/interfaces';

export default ({
  model,
  keys,
  query,
  result,
}: {
  model: FilteredEntry;
  keys: string[];
  query: string;
  result: Result;
}): Result => {
  const { pluralName } = model.schemaInfo;

  /**
   * Transliterate relevant fields for the entry
   */
  model[pluralName].forEach((entry) => {
    const entryKeys = Object.keys(entry);

    entry.transliterations = {};

    entryKeys.forEach((key) => {
      if (!keys.includes(key) || !entry[key]) return;

      entry.transliterations[key] = transliterate(entry[key]);
    });
  });

  const transliterationKeys = keys.map((key) => `transliterations.${key}`);

  const { uid, schemaInfo, fuzzysortOptions } = model;

  const transliteratedResult: Result = {
    uid,
    schemaInfo,
    fuzzysortResults: fuzzysort.go<Entity>(query, model[pluralName], {
      threshold: fuzzysortOptions.threshold,
      limit: fuzzysortOptions.limit,
      keys: transliterationKeys,
      scoreFn: (a) =>
        Math.max(
          ...fuzzysortOptions.keys.map((key, index) =>
            a[index] ? a[index].score + key.weight : -9999
          )
        ),
    }),
  };

  const previousResults = result.fuzzysortResults;

  if (!previousResults.total) return transliteratedResult;

  const newResults = [...previousResults] as any[];

  // In the chance that a transliterated result scores higher than its non-transliterated counterpart,
  // overwrite the original result with the transliterated result and resort the results
  transliteratedResult.fuzzysortResults.forEach((res) => {
    const origIndex = previousResults.findIndex(
      (origRes) => origRes.obj.id === res.obj.id && origRes.score <= res.score
    );

    if (origIndex >= 0) newResults[origIndex] = res;
  });

  newResults.sort((a, b) => b.score - a.score);

  return result;
};
