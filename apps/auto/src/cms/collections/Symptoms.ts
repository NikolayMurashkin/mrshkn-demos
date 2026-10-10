import type { CollectionConfig } from 'payload';
import { SYMPTOM_PLACES } from '../../consts';

/** Симптомы «где болит»: выбор симптома открывает карточку его узла. */
export const Symptoms: CollectionConfig = {
  slug: 'symptoms',
  labels: { singular: 'Симптом', plural: 'Симптомы' },
  orderable: true,
  admin: {
    useAsTitle: 'text',
    defaultColumns: ['text', 'node', 'updatedAt'],
  },
  fields: [
    { name: 'text', label: 'Симптом', type: 'text', required: true, localized: true },
    {
      name: 'key',
      label: 'Ключ',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Латиница через дефис: «chain-rattle»' },
    },
    { name: 'node', label: 'Узел', type: 'relationship', relationTo: 'nodes', required: true },
    {
      name: 'place',
      label: 'Место в сцене',
      type: 'select',
      options: SYMPTOM_PLACES.map((place) => ({ label: place, value: place })),
      admin: { description: 'Разнесенный узел: привод ГРМ или задняя ось. Пусто — основное место узла' },
    },
  ],
};
