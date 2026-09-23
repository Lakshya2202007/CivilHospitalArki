/** Notice board / marquee — section 2.B of the mapping plan. */
const createSchema = {
  title: { type: 'string', required: true, max: 300, label: 'Notice Title' },
  noticeDate: { type: 'date', required: true, label: 'Notice Date' },
  attachmentUrl: { type: 'string', max: 500, default: '', label: 'Attachment' },
  attachmentName: { type: 'string', max: 200, default: '', label: 'Attachment Name' },
  // The "Visibility Toggle" switch that hides old notices from the public site.
  isVisible: { type: 'boolean', default: true, label: 'Visibility' },
};

const updateSchema = createSchema;

module.exports = { createSchema, updateSchema };
