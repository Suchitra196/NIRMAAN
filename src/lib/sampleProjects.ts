import { ALL_DISTRICTS } from "./maharashtra";

export interface SampleUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "OFFICER" | "CONTRACTOR";
  status: "ACTIVE";
  department: string;
  designation?: string;
  hierarchyLevel: number;
}

export const SAMPLE_USERS: SampleUser[] = [
  // 1 Admin
  {
    id: "user-admin-01",
    name: "Dr. Arvind Kulkarni (Administrator)",
    email: "admin@nirmaan.demo",
    phone: "9822011001",
    role: "ADMIN",
    status: "ACTIVE",
    department: "GENERAL_ADMINISTRATION",
    designation: "Chief Administrative Officer",
    hierarchyLevel: 1,
  },
  // 3 Officers
  {
    id: "user-officer-pune",
    name: "Er. Rameshwar Jadhav",
    email: "officer.pune@nirmaan.demo",
    phone: "9822011002",
    role: "OFFICER",
    status: "ACTIVE",
    department: "WORKS_CONSTRUCTION",
    designation: "Superintending Engineer",
    hierarchyLevel: 2,
  },
  {
    id: "user-officer-nagpur",
    name: "Dr. Sunita Deshmukh",
    email: "officer.nagpur@nirmaan.demo",
    phone: "9822011003",
    role: "OFFICER",
    status: "ACTIVE",
    department: "RURAL_WATER_SUPPLY",
    designation: "Executive Project Officer",
    hierarchyLevel: 2,
  },
  {
    id: "user-officer-nashik",
    name: "Er. Vikas Shinde",
    email: "officer.nashik@nirmaan.demo",
    phone: "9822011004",
    role: "OFFICER",
    status: "ACTIVE",
    department: "HEALTH",
    designation: "District Health Infrastructure Engineer",
    hierarchyLevel: 2,
  },
  // 4 Contractors
  {
    id: "user-contractor-sahyadri",
    name: "Sahyadri Infra Projects Pvt Ltd",
    email: "contractor.sahyadri@nirmaan.demo",
    phone: "9822011005",
    role: "CONTRACTOR",
    status: "ACTIVE",
    department: "NONE",
    designation: "Class-A Empanelled Contractor",
    hierarchyLevel: 99,
  },
  {
    id: "user-contractor-vidarbha",
    name: "Vidarbha Civil Engineering Works",
    email: "contractor.vidarbha@nirmaan.demo",
    phone: "9822011006",
    role: "CONTRACTOR",
    status: "ACTIVE",
    department: "NONE",
    designation: "Class-A Empanelled Contractor",
    hierarchyLevel: 99,
  },
  {
    id: "user-contractor-marathwada",
    name: "Marathwada Water Solutions LLP",
    email: "contractor.marathwada@nirmaan.demo",
    phone: "9822011007",
    role: "CONTRACTOR",
    status: "ACTIVE",
    department: "NONE",
    designation: "Specialized Water Infrastructure Contractor",
    hierarchyLevel: 99,
  },
  {
    id: "user-contractor-konkan",
    name: "Konkan Coastal Builders",
    email: "contractor.konkan@nirmaan.demo",
    phone: "9822011008",
    role: "CONTRACTOR",
    status: "ACTIVE",
    department: "NONE",
    designation: "Coastal Infrastructure Contractor",
    hierarchyLevel: 99,
  },
];

export const SAMPLE_DEPARTMENTS = [
  { code: "WORKS_CONSTRUCTION", name: "Works & Construction", label: "सार्वजनिक बांधकाम विभाग" },
  { code: "RURAL_WATER_SUPPLY", name: "Rural Water Supply", label: "ग्रामीण पाणी पुरवठा विभाग" },
  { code: "AGRICULTURE", name: "Agriculture & Soil Conservation", label: "कृषी व मृदसंधारण विभाग" },
  { code: "HEALTH", name: "Health & Family Welfare", label: "सार्वजनिक आरोग्य विभाग" },
  { code: "EDUCATION_PRIMARY", name: "Primary Education", label: "प्राथमिक शिक्षण विभाग" },
  { code: "WATER_SUPPLY_SANITATION", name: "Water Supply & Sanitation", label: "पाणी पुरवठा व स्वच्छता विभाग" },
];

export interface SampleProject {
  id: string;
  name: string;
  district: string;
  description: string;
  status: "ONGOING" | "DELAYED" | "COMPLETED";
  budgetPlanned: number;
  budgetActual: number;
  tenderAmount: number;
  officerId: string;
  contractorId: string;
  officerName: string;
  contractorName: string;
  tasks: {
    id: string;
    title: string;
    description: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
    dueDate: string;
  }[];
  installments: {
    id: string;
    amount: number;
    description: string;
    datePaid: string;
  }[];
  paymentRequests: {
    id: string;
    amount: number;
    description: string;
    proofImages: string[];
    status: "PENDING" | "APPROVED" | "REJECTED";
    officerNote?: string;
  }[];
}

const PROJECT_TEMPLATES = [
  {
    type: "Road & Bridges",
    deptCode: "WORKS_CONSTRUCTION",
    namePattern: (d: string) => `[${d}] Construction of All-Weather Connecting Road & Culverts`,
    descPattern: (d: string) => `Upgradation of 12 km rural link road with storm-water drainage in ${d} district under Zilla Parishad annual infrastructure plan.`,
    budgetBase: 8500000,
  },
  {
    type: "Water Supply Scheme",
    deptCode: "RURAL_WATER_SUPPLY",
    namePattern: (d: string) => `[${d}] Solar Dual Pump Piped Water Supply Scheme`,
    descPattern: (d: string) => `Installation of solar dual-pump potable drinking water supply system with 50,000L elevated storage reservoir in ${d} district.`,
    budgetBase: 6200000,
  },
  {
    type: "School Infrastructure",
    deptCode: "EDUCATION_PRIMARY",
    namePattern: (d: string) => `[${d}] Digital ZP School Building Modernization & Science Lab`,
    descPattern: (d: string) => `Modernization of 6 classrooms, digital smart board installation, and roof rainwater harvesting in ${d} primary schools.`,
    budgetBase: 4200000,
  },
  {
    type: "Health Center",
    deptCode: "HEALTH",
    namePattern: (d: string) => `[${d}] Primary Health Sub-Center Upgradation & Maternity Wing`,
    descPattern: (d: string) => `Renovation of rural dispensary, 10-bed maternity wing addition, and 24x7 solar power backup installation in ${d}.`,
    budgetBase: 5800000,
  },
];

// Generate 72 sample projects (exactly 2 for each of the 36 districts)
export const SAMPLE_PROJECTS: SampleProject[] = ALL_DISTRICTS.flatMap((district, distIdx) => {
  const t1 = PROJECT_TEMPLATES[(distIdx * 2) % PROJECT_TEMPLATES.length];
  const t2 = PROJECT_TEMPLATES[(distIdx * 2 + 1) % PROJECT_TEMPLATES.length];

  const officerList = [
    { id: "user-officer-pune", name: "Er. Rameshwar Jadhav" },
    { id: "user-officer-nagpur", name: "Dr. Sunita Deshmukh" },
    { id: "user-officer-nashik", name: "Er. Vikas Shinde" },
  ];
  const contractorList = [
    { id: "user-contractor-sahyadri", name: "Sahyadri Infra Projects Pvt Ltd" },
    { id: "user-contractor-vidarbha", name: "Vidarbha Civil Engineering Works" },
    { id: "user-contractor-marathwada", name: "Marathwada Water Solutions LLP" },
    { id: "user-contractor-konkan", name: "Konkan Coastal Builders" },
  ];

  const off1 = officerList[distIdx % officerList.length];
  const off2 = officerList[(distIdx + 1) % officerList.length];
  const con1 = contractorList[distIdx % contractorList.length];
  const con2 = contractorList[(distIdx + 2) % contractorList.length];

  const p1Status: "ONGOING" | "DELAYED" | "COMPLETED" =
    distIdx % 3 === 0 ? "COMPLETED" : distIdx % 3 === 1 ? "ONGOING" : "DELAYED";
  const p2Status: "ONGOING" | "DELAYED" | "COMPLETED" =
    distIdx % 2 === 0 ? "ONGOING" : "COMPLETED";

  const p1Id = `proj-dist-${distIdx + 1}-a`;
  const p2Id = `proj-dist-${distIdx + 1}-b`;

  const p1Planned = t1.budgetBase + (distIdx % 5) * 500000;
  const p1Actual = p1Status === "COMPLETED" ? p1Planned : Math.round(p1Planned * 0.65);
  const p1Tender = Math.round(p1Planned * 0.96);

  const p2Planned = t2.budgetBase + (distIdx % 4) * 450000;
  const p2Actual = p2Status === "COMPLETED" ? p2Planned : Math.round(p2Planned * 0.45);
  const p2Tender = Math.round(p2Planned * 0.95);

  return [
    {
      id: p1Id,
      name: t1.namePattern(district),
      district,
      description: t1.descPattern(district),
      status: p1Status,
      budgetPlanned: p1Planned,
      budgetActual: p1Actual,
      tenderAmount: p1Tender,
      officerId: off1.id,
      officerName: off1.name,
      contractorId: con1.id,
      contractorName: con1.name,
      tasks: [
        {
          id: `${p1Id}-task-1`,
          title: "Site Survey, Soil Testing & Foundation Excavation",
          description: "Initial geotechnical testing and boundary demarcation.",
          status: "COMPLETED",
          dueDate: "2026-04-15",
        },
        {
          id: `${p1Id}-task-2`,
          title: "Structural Civil Works & Core Construction",
          description: "Reinforced cement concrete structure and super-structure raising.",
          status: p1Status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
          dueDate: "2026-08-30",
        },
        {
          id: `${p1Id}-task-3`,
          title: "Finishing, Quality Audit & Handover",
          description: "Surface plastering, utility connections, and final safety clearance.",
          status: p1Status === "COMPLETED" ? "COMPLETED" : "PENDING",
          dueDate: "2026-11-20",
        },
      ],
      installments: [
        {
          id: `${p1Id}-inst-1`,
          amount: Math.round(p1Planned * 0.4),
          description: "First Stage Treasury Release — Mobilization & Foundation",
          datePaid: "2026-01-20",
        },
        {
          id: `${p1Id}-inst-2`,
          amount: Math.round(p1Planned * 0.35),
          description: "Second Stage Treasury Release — Mid-term Milestone Clearance",
          datePaid: "2026-05-18",
        },
      ],
      paymentRequests: [
        {
          id: `${p1Id}-pay-1`,
          amount: Math.round(p1Planned * 0.38),
          description: "Contractor Stage 1 Claim: Foundation and plinth completion verified.",
          proofImages: ["/images/gallery-1.jpg"],
          status: "APPROVED",
          officerNote: "Inspected on-site; work certified compliant with PWD standards.",
        },
        {
          id: `${p1Id}-pay-2`,
          amount: Math.round(p1Planned * 0.28),
          description: "Contractor Stage 2 Claim: Wall masonry and lintel casting.",
          proofImages: ["/images/gallery-3.jpg"],
          status: p1Status === "COMPLETED" ? "APPROVED" : "PENDING",
          officerNote: p1Status === "COMPLETED" ? "Milestone verified by Executive Engineer." : undefined,
        },
      ],
    },
    {
      id: p2Id,
      name: t2.namePattern(district),
      district,
      description: t2.descPattern(district),
      status: p2Status,
      budgetPlanned: p2Planned,
      budgetActual: p2Actual,
      tenderAmount: p2Tender,
      officerId: off2.id,
      officerName: off2.name,
      contractorId: con2.id,
      contractorName: con2.name,
      tasks: [
        {
          id: `${p2Id}-task-1`,
          title: "Hydro-geological Survey & Drilling",
          description: "Groundwater assessment and borewell drilling.",
          status: "COMPLETED",
          dueDate: "2026-03-10",
        },
        {
          id: `${p2Id}-task-2`,
          title: "Storage Tank Construction & Pipeline Laying",
          description: "Distribution network pipeline and 50KL water storage tank.",
          status: p2Status === "COMPLETED" ? "COMPLETED" : "IN_PROGRESS",
          dueDate: "2026-07-25",
        },
      ],
      installments: [
        {
          id: `${p2Id}-inst-1`,
          amount: Math.round(p2Planned * 0.5),
          description: "Stage 1 Departmental Allocation",
          datePaid: "2026-02-14",
        },
      ],
      paymentRequests: [
        {
          id: `${p2Id}-pay-1`,
          amount: Math.round(p2Planned * 0.42),
          description: "Stage 1 Borewell and pipeline trenching milestone claim.",
          proofImages: ["/images/gallery-5.jpg"],
          status: "APPROVED",
          officerNote: "Water discharge yield tested and verified.",
        },
      ],
    },
  ];
});

export const SAMPLE_STATS = {
  totalProjects: SAMPLE_PROJECTS.length, // 72
  ongoingProjects: SAMPLE_PROJECTS.filter((p) => p.status === "ONGOING").length,
  delayedProjects: SAMPLE_PROJECTS.filter((p) => p.status === "DELAYED").length,
  completedProjects: SAMPLE_PROJECTS.filter((p) => p.status === "COMPLETED").length,
  totalBudgetPlanned: SAMPLE_PROJECTS.reduce((sum, p) => sum + p.budgetPlanned, 0),
  totalBudgetActual: SAMPLE_PROJECTS.reduce((sum, p) => sum + p.budgetActual, 0),
  totalTenderValue: SAMPLE_PROJECTS.reduce((sum, p) => sum + p.tenderAmount, 0),
  departmentBreakdown: SAMPLE_DEPARTMENTS.map((d) => ({
    department: d.code,
    count: Math.round(SAMPLE_PROJECTS.length / SAMPLE_DEPARTMENTS.length),
  })),
};
