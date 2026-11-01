type Unit = 'kg' | 'head'

/**
 * O preço por kg tem de ser calculado num estágio e lido no seguinte.
 * No mesmo $addFields o Mongo ainda vê o documento original.
 * Carcaça usa o preço por kg gravado. Vivo usa o preço por cabeça,
 * ou o preço por kg vezes o peso quando só esse existe.
 */
export function priceValueStages(unit: Unit) {
  return [
    {
      $addFields: {
        derivedPricePerKg: {
          $cond: [{ $gt: ['$pricePerKg', 0] }, '$pricePerKg', null],
        },
        derivedPricePerHead: {
          $cond: [
            { $gt: ['$price', 0] },
            '$price',
            {
              $cond: [
                { $and: [{ $gt: ['$pricePerKg', 0] }, { $gt: ['$weight', 0] }] },
                { $multiply: ['$pricePerKg', '$weight'] },
                null,
              ],
            },
          ],
        },
      },
    },
    {
      $addFields: {
        value: unit === 'kg' ? '$derivedPricePerKg' : '$derivedPricePerHead',
        weightForWeighting: {
          $cond: [{ $and: [{ $eq: [unit, 'kg'] }, { $gt: ['$weight', 0] }] }, '$weight', 1],
        },
      },
    },
  ]
}
