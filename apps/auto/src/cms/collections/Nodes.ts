import type { CollectionConfig } from 'payload';
import { NODE_KEYS } from '../../consts';

/**
 * Узлы «где болит». Ключ связывает узел со сценой и не переводится; имя и причины с ценой и сроком — свои
 * на каждом языке: цены на русском в рублях, на английском в долларах.
 */
export const Nodes: CollectionConfig = {
  slug: 'nodes',
  labels: { singular: 'Узел', plural: 'Узлы' },
  orderable: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'key', 'updatedAt'],
  },
  fields: [
    { name: 'name', label: 'Название', type: 'text', required: true, localized: true },
    {
      name: 'key',
      label: 'Узел в сцене',
      type: 'select',
      required: true,
      unique: true,
      options: NODE_KEYS.map((key) => ({ label: key, value: key })),
      admin: { description: 'По ключу сцена находит узел машины; у каждого узла свой' },
    },
    {
      name: 'causes',
      label: 'Вероятные причины',
      labels: { singular: 'Причина', plural: 'Причины' },
      type: 'array',
      required: true,
      minRows: 1,
      localized: true,
      fields: [
        { name: 'text', label: 'Причина', type: 'text', required: true },
        {
          name: 'price',
          label: 'Цена работы «от»',
          type: 'number',
          required: true,
          min: 1,
          admin: { description: 'Целое число: на русском — рубли, на английском — доллары', step: 1 },
        },
        { name: 'term', label: 'Срок', type: 'text', required: true, admin: { description: '«1–2 ч», «1 день»' } },
      ],
    },
  ],
};
