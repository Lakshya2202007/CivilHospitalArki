/**
 * Tenders, Quotations & Procurement — Demo Data
 * ================================================
 * IMPORTANT: All data below is SAMPLE / DEMO data for development purposes.
 * It does NOT represent actual government tenders or official procurement notices.
 * Replace with real backend data (Firebase / REST API) in production.
 */

/* ── Filter Option Constants ── */

export const TENDER_STATUSES = [
  'All',
  'Active',
  'Closing Soon',
  'Closed',
  'Awarded',
  'Cancelled',
];

export const TENDER_DEPARTMENTS = [
  'All Departments',
  'Medical Equipment',
  'Pharmacy',
  'Information Technology',
  'Civil Works',
  'Electrical',
  'General Administration',
  'Radiology',
  'Laboratory',
  'Housekeeping & Sanitation',
];

export const TENDER_TYPES = [
  'All Types',
  'Tender',
  'Quotation',
  'Procurement Notice',
];

/* ── Status Derivation Helper ── */

/**
 * Derives a display status from the tender's dates and explicit status.
 * - If explicitly 'Awarded' or 'Cancelled', return as-is.
 * - If closing date is in the past → 'Closed'
 * - If closing date is within 3 days → 'Closing Soon'
 * - Otherwise → 'Active'
 */
export function deriveTenderStatus(tender) {
  const explicit = tender.status;
  if (explicit === 'Awarded' || explicit === 'Cancelled') return explicit;

  const now = new Date();
  const closing = new Date(tender.closingDate);
  const diffMs = closing - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return 'Closed';
  if (diffDays <= 3) return 'Closing Soon';
  return 'Active';
}

/* ── Procurement Announcements ── */

export const PROCUREMENT_ANNOUNCEMENTS = [
  {
    id: 'ann-001',
    title: 'New medical equipment procurement process initiated for FY 2026-27',
    date: '2026-09-10',
    category: 'Medical Equipment',
  },
  {
    id: 'ann-002',
    title: 'Annual pharmacy supply quotation — Submissions open',
    date: '2026-09-08',
    category: 'Pharmacy',
  },
  {
    id: 'ann-003',
    title: 'IT infrastructure upgrade — Vendor registration notice',
    date: '2026-09-05',
    category: 'Information Technology',
  },
  {
    id: 'ann-004',
    title: 'Hospital building maintenance contract — Pre-bid meeting scheduled',
    date: '2026-09-01',
    category: 'Civil Works',
  },
];

/* ── Demo Tender Records ── */

export const ALL_TENDERS = [
  {
    id: 'CHARKI-2026-001',
    title: 'Procurement of Medical Equipment for OPD Wing',
    description: 'Supply, installation, and commissioning of medical diagnostic equipment including pulse oximeters, BP monitors, nebulizers, and glucometers for the Outpatient Department wing of Civil Hospital Arki.',
    department: 'Medical Equipment',
    type: 'Tender',
    issueDate: '2026-09-15',
    closingDate: '2026-09-30',
    estimatedValue: '₹10,00,000',
    status: 'Active',
    eligibility: 'Registered medical equipment suppliers with at least 3 years of experience in supplying diagnostic equipment to government hospitals. Must possess valid GST registration and relevant certifications.',
    contactInfo: 'Office of the Medical Superintendent, Civil Hospital Arki, District Solan, HP — 171102',
    documents: [
      { name: 'Tender Notice Document', type: 'notice', size: '245 KB' },
      { name: 'Technical Specifications', type: 'specs', size: '180 KB' },
      { name: 'Terms & Conditions', type: 'terms', size: '120 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-002',
    title: 'Annual Pharmacy Drug Supply Contract',
    description: 'Annual rate contract for the supply of essential medicines, surgical consumables, and pharmaceutical products to Civil Hospital Arki for FY 2026-27.',
    department: 'Pharmacy',
    type: 'Tender',
    issueDate: '2026-09-10',
    closingDate: '2026-10-10',
    estimatedValue: '₹25,00,000',
    status: 'Active',
    eligibility: 'Licensed pharmaceutical distributors/wholesalers with valid Drug License (Form 20B/21B). Minimum 5 years of experience in supplying medicines to government institutions.',
    contactInfo: 'Chief Pharmacist, Civil Hospital Arki, District Solan, HP — 171102',
    documents: [
      { name: 'Tender Notice', type: 'notice', size: '200 KB' },
      { name: 'Drug List & Specifications', type: 'specs', size: '350 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-003',
    title: 'IT Network Infrastructure Upgrade',
    description: 'Upgrade of the hospital LAN/WAN network infrastructure, including structured cabling, switches, access points, and firewall installation for improved connectivity across all departments.',
    department: 'Information Technology',
    type: 'Tender',
    issueDate: '2026-09-01',
    closingDate: '2026-09-18',
    estimatedValue: '₹8,50,000',
    status: 'Active',
    eligibility: 'IT infrastructure companies with OEM partnerships and at least 3 completed government projects. Must have valid ISO 9001 certification.',
    contactInfo: 'IT Department, Civil Hospital Arki, District Solan, HP — 171102',
    documents: [
      { name: 'Tender Document', type: 'notice', size: '290 KB' },
      { name: 'Network Layout Plan', type: 'specs', size: '1.2 MB' },
      { name: 'Corrigendum No. 1', type: 'corrigendum', size: '45 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-004',
    title: 'OPD Waiting Area Furniture Supply',
    description: 'Quotation for the supply of furniture items including stainless steel chairs, benches, reception counter, and display boards for the renovated OPD waiting area.',
    department: 'General Administration',
    type: 'Quotation',
    issueDate: '2026-09-12',
    closingDate: '2026-09-22',
    estimatedValue: '₹3,50,000',
    status: 'Active',
    eligibility: 'Registered furniture suppliers. Preference to local MSME vendors. Must provide samples upon request.',
    contactInfo: 'Administrative Officer, Civil Hospital Arki, District Solan, HP — 171102',
    documents: [
      { name: 'Quotation Notice', type: 'notice', size: '150 KB' },
      { name: 'Item Specifications', type: 'specs', size: '95 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-005',
    title: 'Electrical Panel Replacement & Wiring',
    description: 'Replacement of main electrical distribution panels and rewiring of the ground floor wards to comply with current safety standards and fire regulations.',
    department: 'Electrical',
    type: 'Tender',
    issueDate: '2026-08-20',
    closingDate: '2026-09-15',
    estimatedValue: '₹6,75,000',
    status: 'Active',
    eligibility: 'Licensed electrical contractors (Class A) with experience in institutional/hospital electrical work. Must have valid Electrical Contractor License from HP government.',
    contactInfo: 'Executive Engineer (Electrical), Civil Hospital Arki',
    documents: [
      { name: 'Tender Notice', type: 'notice', size: '180 KB' },
      { name: 'BOQ & Specifications', type: 'specs', size: '210 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-006',
    title: 'Hospital Laundry Equipment Procurement',
    description: 'Procurement of commercial-grade washing machines, dryers, ironing equipment, and laundry chemicals for the hospital laundry facility upgrade.',
    department: 'General Administration',
    type: 'Procurement Notice',
    issueDate: '2026-09-05',
    closingDate: '2026-09-25',
    estimatedValue: '₹4,20,000',
    status: 'Active',
    eligibility: 'Authorized dealers of commercial laundry equipment. Must provide warranty of minimum 2 years with AMC option.',
    contactInfo: 'Purchase Committee, Civil Hospital Arki',
    documents: [
      { name: 'Procurement Notice', type: 'notice', size: '160 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-007',
    title: 'X-Ray Machine Annual Maintenance Contract',
    description: 'Annual Maintenance Contract (AMC) for the existing 300mA X-Ray machine and CR system in the Radiology department, including preventive maintenance and breakdown support.',
    department: 'Radiology',
    type: 'Quotation',
    issueDate: '2026-08-25',
    closingDate: '2026-09-16',
    estimatedValue: '₹2,80,000',
    status: 'Active',
    eligibility: 'OEM authorized service providers or accredited biomedical equipment service companies.',
    contactInfo: 'Head of Radiology, Civil Hospital Arki',
    documents: [
      { name: 'Quotation Invitation', type: 'notice', size: '130 KB' },
      { name: 'Equipment Details', type: 'specs', size: '85 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-008',
    title: 'Pathology Lab Reagent Supply',
    description: 'Rate contract for supply of laboratory reagents, chemicals, and consumables for the hospital pathology laboratory for a period of one year.',
    department: 'Laboratory',
    type: 'Quotation',
    issueDate: '2026-09-08',
    closingDate: '2026-09-28',
    estimatedValue: '₹5,50,000',
    status: 'Active',
    eligibility: 'Licensed laboratory reagent suppliers/manufacturers with valid quality certifications (ISO/CE). Must supply products with minimum 80% shelf life remaining.',
    contactInfo: 'Pathology Department, Civil Hospital Arki',
    documents: [
      { name: 'Quotation Notice', type: 'notice', size: '170 KB' },
      { name: 'Reagent List', type: 'specs', size: '220 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-009',
    title: 'Hospital Premises Housekeeping Services',
    description: 'Outsourcing of comprehensive housekeeping and sanitation services for Civil Hospital Arki premises including wards, corridors, washrooms, and outdoor areas.',
    department: 'Housekeeping & Sanitation',
    type: 'Tender',
    issueDate: '2026-08-15',
    closingDate: '2026-09-14',
    estimatedValue: '₹12,00,000',
    status: 'Closed',
    eligibility: 'Registered housekeeping service agencies with at least 5 years of experience in hospital/institutional housekeeping. Must have valid ESI/PF registration.',
    contactInfo: 'Administrative Officer, Civil Hospital Arki',
    documents: [
      { name: 'Tender Document', type: 'notice', size: '280 KB' },
      { name: 'Scope of Work', type: 'specs', size: '190 KB' },
      { name: 'Terms & Conditions', type: 'terms', size: '110 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-010',
    title: 'Boundary Wall Repair & Painting',
    description: 'Civil works for repair, plastering, and painting of the hospital boundary wall along the main road side (approximately 250 running meters).',
    department: 'Civil Works',
    type: 'Quotation',
    issueDate: '2026-08-10',
    closingDate: '2026-08-30',
    estimatedValue: '₹2,10,000',
    status: 'Awarded',
    eligibility: 'Registered civil contractors (Class B or above) with PWD registration.',
    contactInfo: 'Junior Engineer (Civil), Civil Hospital Arki',
    documents: [
      { name: 'Quotation Notice', type: 'notice', size: '140 KB' },
      { name: 'BOQ', type: 'specs', size: '75 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-011',
    title: 'Diesel Generator Set Supply & Installation',
    description: 'Supply, installation, testing and commissioning of 125 KVA silent diesel generator set with automatic changeover panel for uninterrupted power supply.',
    department: 'Electrical',
    type: 'Tender',
    issueDate: '2026-07-20',
    closingDate: '2026-08-20',
    estimatedValue: '₹15,00,000',
    status: 'Awarded',
    eligibility: 'Authorized DG set dealers/distributors with installation capability. Must provide 2 year comprehensive warranty.',
    contactInfo: 'Executive Engineer (Electrical), Civil Hospital Arki',
    documents: [
      { name: 'Tender Document', type: 'notice', size: '310 KB' },
      { name: 'Technical Specifications', type: 'specs', size: '175 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-012',
    title: 'CCTV Surveillance System Expansion',
    description: 'Expansion of existing CCTV surveillance system with addition of 24 IP cameras, NVR upgrade, and monitoring station setup for enhanced hospital security.',
    department: 'Information Technology',
    type: 'Procurement Notice',
    issueDate: '2026-09-14',
    closingDate: '2026-10-14',
    estimatedValue: '₹7,80,000',
    status: 'Active',
    eligibility: 'Registered IT/security system integrators with experience in institutional CCTV installations. Must provide 3-year warranty on all equipment.',
    contactInfo: 'IT Department, Civil Hospital Arki',
    documents: [
      { name: 'Procurement Notice', type: 'notice', size: '195 KB' },
      { name: 'Camera Location Plan', type: 'specs', size: '850 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-013',
    title: 'Biomedical Waste Management Services',
    description: 'Outsourcing of biomedical waste collection, segregation, transportation, and disposal services as per BMW Management Rules 2016.',
    department: 'Housekeeping & Sanitation',
    type: 'Tender',
    issueDate: '2026-07-01',
    closingDate: '2026-07-31',
    estimatedValue: '₹9,00,000',
    status: 'Cancelled',
    eligibility: 'CPCB/SPCB authorized biomedical waste treatment facilities with valid authorization under BMW Rules.',
    contactInfo: 'Infection Control Officer, Civil Hospital Arki',
    documents: [
      { name: 'Tender Notice', type: 'notice', size: '230 KB' },
      { name: 'Cancellation Notice', type: 'corrigendum', size: '60 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-014',
    title: 'Solar Water Heating System Installation',
    description: 'Installation of 1000 LPD capacity solar water heating system for the hospital kitchen and laundry facility to reduce energy consumption.',
    department: 'Civil Works',
    type: 'Procurement Notice',
    issueDate: '2026-09-13',
    closingDate: '2026-10-05',
    estimatedValue: '₹3,90,000',
    status: 'Active',
    eligibility: 'MNRE empanelled solar water heater manufacturers/installers with BIS certified products.',
    contactInfo: 'Engineering Cell, Civil Hospital Arki',
    documents: [
      { name: 'Procurement Notice', type: 'notice', size: '155 KB' },
      { name: 'Site Details', type: 'specs', size: '290 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-015',
    title: 'Ambulance Vehicle Hiring Services',
    description: 'Hiring of one Basic Life Support (BLS) ambulance vehicle on monthly rental basis for patient transfer services for a period of one year.',
    department: 'General Administration',
    type: 'Quotation',
    issueDate: '2026-08-01',
    closingDate: '2026-08-20',
    estimatedValue: '₹6,00,000',
    status: 'Closed',
    eligibility: 'Transport operators with ambulance-fitted vehicles meeting BLS ambulance standards. Valid fitness certificate and commercial vehicle permit required.',
    contactInfo: 'Medical Superintendent, Civil Hospital Arki',
    documents: [
      { name: 'Quotation Notice', type: 'notice', size: '125 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-016',
    title: 'Hospital Management Information System (HMIS)',
    description: 'Procurement and implementation of an integrated Hospital Management Information System covering OPD, IPD, pharmacy, laboratory, billing, and reporting modules.',
    department: 'Information Technology',
    type: 'Tender',
    issueDate: '2026-09-14',
    closingDate: '2026-10-20',
    estimatedValue: '₹18,50,000',
    status: 'Active',
    eligibility: 'Software companies with proven HMIS implementations in at least 3 government hospitals. Must have valid STQC certification or equivalent.',
    contactInfo: 'IT Department, Civil Hospital Arki',
    documents: [
      { name: 'Tender Document', type: 'notice', size: '420 KB' },
      { name: 'Functional Requirements', type: 'specs', size: '560 KB' },
      { name: 'Technical Requirements', type: 'specs', size: '380 KB' },
    ],
  },
  {
    id: 'CHARKI-2026-017',
    title: 'Oxygen Cylinder Refilling Contract',
    description: 'Annual rate contract for regular refilling and supply of medical-grade oxygen cylinders (Type D and Type B) for hospital wards and emergency services.',
    department: 'Medical Equipment',
    type: 'Quotation',
    issueDate: '2026-08-28',
    closingDate: '2026-09-17',
    estimatedValue: '₹4,00,000',
    status: 'Active',
    eligibility: 'Licensed industrial gas suppliers with Drug License for medical oxygen. Must ensure supply within 24 hours of indent.',
    contactInfo: 'Store In-Charge, Civil Hospital Arki',
    documents: [
      { name: 'Quotation Notice', type: 'notice', size: '110 KB' },
    ],
  },
  {
    id: 'CHARKI-2025-045',
    title: 'Ward Bed Linen & Mattress Supply (FY 2025-26)',
    description: 'Supply of cotton bed sheets, pillow covers, blankets, and foam mattresses for all inpatient wards. This is an archived tender from the previous financial year.',
    department: 'General Administration',
    type: 'Tender',
    issueDate: '2025-11-10',
    closingDate: '2025-12-10',
    estimatedValue: '₹5,20,000',
    status: 'Closed',
    eligibility: 'Textile manufacturers/suppliers with experience in institutional linen supply. Products must meet BIS standards.',
    contactInfo: 'Administrative Officer, Civil Hospital Arki',
    documents: [
      { name: 'Tender Document', type: 'notice', size: '200 KB' },
    ],
  },
  {
    id: 'CHARKI-2025-038',
    title: 'Water Purification System Installation (FY 2025-26)',
    description: 'Supply and installation of industrial RO water purification system with 500 LPH capacity for the hospital campus. Archived tender.',
    department: 'Civil Works',
    type: 'Tender',
    issueDate: '2025-09-01',
    closingDate: '2025-10-01',
    estimatedValue: '₹4,80,000',
    status: 'Awarded',
    eligibility: 'Water treatment system manufacturers/authorized dealers with valid WPC certification.',
    contactInfo: 'Engineering Cell, Civil Hospital Arki',
    documents: [
      { name: 'Tender Document', type: 'notice', size: '250 KB' },
      { name: 'Award Notice', type: 'notice', size: '80 KB' },
    ],
  },
];

/* ── Pagination Constants ── */
export const ROWS_PER_PAGE = 8;
