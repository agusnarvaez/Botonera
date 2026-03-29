import {defineField, defineType} from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Categoría',
  type: 'document',
  fields: [
    defineField({
      name: 'label',
      title: 'Nombre',
      type: 'string',
      description: 'Nombre visible en el filtro, ej: "Clásicos"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Identificador interno',
      type: 'slug',
      description: 'Se genera automáticamente desde el nombre',
      options: {source: 'label', maxLength: 32},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Orden en el filtro',
      type: 'number',
      description: 'Menor número = aparece primero',
      initialValue: 99,
    }),
  ],
  orderings: [
    {
      title: 'Orden',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'label', subtitle: 'slug.current'},
  },
})
