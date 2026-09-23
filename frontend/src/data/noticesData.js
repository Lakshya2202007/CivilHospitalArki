export const ROWS_PER_PAGE = 8;

export const NOTICE_CATEGORIES = [
  'All Categories',
  'Health Camps',
  'Vaccination Drives',
  'Recruitment'
];

export const NOTICE_STATUSES = [
  'All',
  'New',
  'Active',
  'Closed',
  'Archived'
];

export const ALL_NOTICES = [
  {
    id: 'PN-2024-001',
    title: 'Mega Blood Donation and Health Checkup Camp',
    category: 'Health Camps',
    publishDate: '2024-05-15T09:00:00Z',
    deadlineDate: '2024-05-20T17:00:00Z',
    status: 'New',
    description: 'Civil Hospital Arki is organizing a mega blood donation and free health checkup camp for all citizens. Free medicines will be distributed.',
    eligibility: 'Open to all citizens above 18 years of age and in good health for blood donation.',
    contactInfo: 'CMO Office, Civil Hospital Arki. Phone: 01796-220024',
    documents: [
      { name: 'Health_Camp_Circular_2024.pdf', size: '1.2 MB' }
    ]
  },
  {
    id: 'PN-2024-002',
    title: 'Recruitment of Staff Nurses (Contract Basis)',
    category: 'Recruitment',
    publishDate: '2024-05-10T10:00:00Z',
    deadlineDate: '2024-05-30T17:00:00Z',
    status: 'Active',
    description: 'Applications are invited for the post of Staff Nurses purely on a contract basis under RKS Civil Hospital Arki.',
    eligibility: 'B.Sc. Nursing or GNM from a recognized institution with HP Nursing Council Registration.',
    contactInfo: 'Establishment Branch, Civil Hospital Arki',
    documents: [
      { name: 'Recruitment_Notice_Nurses.pdf', size: '2.5 MB' },
      { name: 'Application_Form.pdf', size: '800 KB' }
    ]
  },
  {
    id: 'PN-2024-003',
    title: 'Polio Vaccination Drive for Children under 5',
    category: 'Vaccination Drives',
    publishDate: '2024-04-25T11:00:00Z',
    deadlineDate: '2024-04-28T16:00:00Z',
    status: 'Closed',
    description: 'Pulse Polio immunization campaign will be conducted across all booths in Arki Block.',
    eligibility: 'All children aged 0-5 years.',
    contactInfo: 'Immunization Officer, Civil Hospital Arki',
    documents: []
  },
  {
    id: 'PN-2024-004',
    title: 'Walk-in Interview for Data Entry Operator',
    category: 'Recruitment',
    publishDate: '2024-05-18T14:00:00Z',
    deadlineDate: '2024-05-25T10:00:00Z',
    status: 'New',
    description: 'Walk-in interview for one post of Data Entry Operator for the Hospital Information System project.',
    eligibility: 'Graduation with minimum 1 year Diploma in Computer Applications.',
    contactInfo: 'RKS Cell, Civil Hospital Arki',
    documents: [
      { name: 'DEO_Interview_Schedule.pdf', size: '1.1 MB' }
    ]
  },
  {
    id: 'PN-2024-005',
    title: 'Free Eye Checkup and Cataract Surgery Camp',
    category: 'Health Camps',
    publishDate: '2024-04-10T10:00:00Z',
    deadlineDate: '2024-04-15T15:00:00Z',
    status: 'Closed',
    description: 'A free eye checkup camp in collaboration with District Blindness Control Society. Free surgeries for selected patients.',
    eligibility: 'Senior citizens and BPL families.',
    contactInfo: 'Ophthalmology Dept, Civil Hospital Arki',
    documents: [
      { name: 'Eye_Camp_Details.pdf', size: '900 KB' }
    ]
  }
];

export const deriveNoticeStatus = (notice) => {
  if (notice.status === 'Archived') return 'Archived';
  if (notice.status === 'Closed') return 'Closed';
  
  if (notice.deadlineDate) {
    const deadline = new Date(notice.deadlineDate);
    if (deadline < new Date()) {
      return 'Closed';
    }
  }
  
  return notice.status;
};
