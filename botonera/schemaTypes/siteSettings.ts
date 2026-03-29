import {defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Configuración del Sitio',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título de la Página',
      type: 'string',
      description: 'Ej: "La Botonera de Nazario"',
      validation: (Rule) => Rule.required(),
      initialValue: 'La Botonera de Nazario',
    }),
    defineField({
      name: 'description',
      title: 'Descripción / Subtítulo',
      type: 'string',
      description: 'Texto que aparece debajo del título',
      initialValue: 'Los berretines del Titán',
    }),
    defineField({
      name: 'characterImage',
      title: 'Imagen del Personaje',
      type: 'image',
      description: 'Foto de Nazario para el header',
      options: {
        hotspot: true,
      },
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({title}) {
      return {
        title: title ?? 'Configuración del Sitio',
      }
    },
  },
})
