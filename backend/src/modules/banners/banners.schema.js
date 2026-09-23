/** Hero banner / slider — section 2.A of the mapping plan. */
const createSchema = {
  title: { type: 'string', required: true, max: 200, label: 'Banner Title' },
  subtitle: { type: 'string', max: 500, default: '', label: 'Banner Subtitle' },
  imageUrl: { type: 'string', max: 500, default: '', label: 'Banner Image' },
  buttonText: { type: 'string', max: 60, default: '', label: 'Button Text' },
  buttonLink: { type: 'string', max: 500, default: '', label: 'Button Link' },
  displayOrder: { type: 'number', min: 0, max: 999, default: 0, label: 'Display Order' },
  isVisible: { type: 'boolean', default: true, label: 'Visibility' },
};

const updateSchema = createSchema;

module.exports = { createSchema, updateSchema };
