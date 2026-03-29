import {defineField, defineType} from 'sanity'

export const audioButton = defineType({
  name: 'audioButton',
  title: 'Botón de Audio',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      description: 'El texto que aparece en el botón, ej: "Nazario del barrio"',
      validation: (Rule) => Rule.required().min(1).max(80),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Identificador único para compartir el audio por URL',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'audioFile',
      title: 'Archivo de Audio',
      type: 'file',
      description: 'Subir .mp3 para máxima compatibilidad (iOS/Safari no soporta .ogg)',
      options: {
        accept: 'audio/*',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'emoji',
      title: 'Emoji',
      type: 'string',
      description: 'Emoji decorativo — en Windows: Win+punto, en Mac: Cmd+Ctrl+Espacio',
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: 'color',
      title: 'Color del Botón',
      type: 'string',
      description: 'Colores del estilo de la botonera',
      options: {
        list: [
          {title: 'Rojo', value: '#FF3B3B'},
          {title: 'Amarillo', value: '#FFDE00'},
          {title: 'Celeste', value: '#00B4D8'},
          {title: 'Verde neon', value: '#39FF14'},
          {title: 'Naranja', value: '#FF6B35'},
          {title: 'Violeta', value: '#BF5FFF'},
          {title: 'Rosa', value: '#FF2D78'},
          {title: 'Blanco', value: '#F0F0F0'},
        ],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'reference',
      description: 'Categoría para el filtro (crear desde el menú Categorías)',
      to: [{type: 'category'}],
    }),
    defineField({
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Número para ordenar los botones en la grilla (menor = primero)',
      initialValue: 99,
    }),
  ],
  orderings: [
    {
      title: 'Orden manual',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Título A-Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      emoji: 'emoji',
      category: 'category.label',
    },
    prepare({title, emoji, category}) {
      return {
        title: emoji ? `${emoji} ${title}` : title,
        subtitle: category ?? 'Sin categoría',
      }
    },
  },
})
