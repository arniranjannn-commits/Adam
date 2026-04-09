export interface MessagingItem {
  id: string;
  headline: string;
  subheadline: string;
  valueProposition: string;
  cta: string;
  tone: string;
  channel: string;
  status: 'active' | 'draft' | 'archived';
}

export interface AngleItem {
  id: string;
  title: string;
  hook: string;
  category: string;
  targetEmotion: string;
  supportingData: string;
  status: 'pending' | 'approved' | 'rejected';
  score: number;
}

export interface ICPItem {
  id: string;
  segment: string;
  demographics: string;
  psychographics: string;
  painPoints: string;
  goals: string;
  channels: string;
  size: string;
}

export interface HookItem {
  id: string;
  text: string;
  category: string;
}

export interface AdBriefItem {
  id: string;
  messagingId: string;
  messagingIds: string[];
  angleId: string;
  icpId: string;
  icpIds: string[];
  hookIds: string[];
  situation: string;
  strategy: string;
  strength: 'Strong' | 'Moderate' | 'Weak';
  priority: 'P0' | 'P1' | 'P2';
  format: string;
  duration: string;
  platform: string;
  conceptsGenerated: boolean;
  conceptIds: string[];
  conceptCount: number;
}

export interface GeneratedScript {
  id: string;
  version: number;
  angleTitle: string;
  duration: string;
  tone: string;
  headline: string;
  hook: string;
  cta: string;
  scenes: Array<{ num: number; time: string; description: string }>;
}

export interface AdConceptItem {
  id: string;
  briefId: string;
  title: string;
  hook: string;
  body: string;
  cta: string;
  format: string;
  platform: string;
  status: 'draft' | 'approved' | 'archived';
  createdAt: string;
  variations: number;
  script?: string;
  visualDirection?: string;
}

export const messagingData: MessagingItem[] = [
  {
    id: 'msg-1',
    headline: 'Stop Wasting Time on Manual Reporting',
    subheadline: 'Automate your analytics in 10 minutes',
    valueProposition: 'Save 8+ hours per week by replacing manual spreadsheet work with automated, real-time dashboards that your whole team can access.',
    cta: 'Start Free Trial',
    tone: 'Urgent / Practical',
    channel: 'Paid Social',
    status: 'active',
  },
  {
    id: 'msg-2',
    headline: 'Your Competitors Already Use AI',
    subheadline: "Don't get left behind",
    valueProposition: 'Over 12,000 growth teams use our AI insights to identify opportunities 3x faster than traditional methods. The data advantage is real.',
    cta: 'See How It Works',
    tone: 'Competitive / FOMO',
    channel: 'Search',
    status: 'active',
  },
  {
    id: 'msg-3',
    headline: 'From Data Chaos to Clarity',
    subheadline: 'One platform, all your metrics',
    valueProposition: 'Unify marketing, product, and sales data in a single view. No more switching tabs, no more misaligned numbers across teams.',
    cta: 'Book a Demo',
    tone: 'Aspirational / Clarity',
    channel: 'LinkedIn',
    status: 'active',
  },
  {
    id: 'msg-4',
    headline: 'Trusted by 500+ Fast-Growing Brands',
    subheadline: 'Join the data-driven movement',
    valueProposition: 'From Series A startups to Fortune 500 companies — teams trust us to turn complex data into revenue-driving decisions.',
    cta: 'Read Case Studies',
    tone: 'Social Proof / Trust',
    channel: 'Display',
    status: 'draft',
  },
  {
    id: 'msg-5',
    headline: 'What Gets Measured Gets Managed',
    subheadline: 'Finally, metrics that matter',
    valueProposition: 'Drill into the KPIs that actually drive growth. Our platform surfaces the 20% of metrics responsible for 80% of your results.',
    cta: 'Explore Features',
    tone: 'Educational / Empowering',
    channel: 'YouTube',
    status: 'active',
  },
];

export const anglesData: AngleItem[] = [
  {
    id: 'angle-1',
    title: 'The Time-Thief Problem',
    hook: "You didn't hire analysts to copy-paste numbers into spreadsheets",
    category: 'Pain-Point Agitation',
    targetEmotion: 'Frustration → Relief',
    supportingData: '73% of analysts spend >4 hrs/week on manual data prep. Our users reclaim 8.2 hrs avg.',
    status: 'approved',
    score: 92,
  },
  {
    id: 'angle-2',
    title: 'The Competitive Moat',
    hook: "Your competitor just made a decision you won't see coming for 6 weeks",
    category: 'Competitive Fear',
    targetEmotion: 'Anxiety → Urgency',
    supportingData: '68% of market share shifts happen before laggards notice the trend. Real-time data changes that.',
    status: 'approved',
    score: 88,
  },
  {
    id: 'angle-3',
    title: 'The Single Source of Truth',
    hook: "Which dashboard do you trust when they all show different numbers?",
    category: 'Chaos to Clarity',
    targetEmotion: 'Confusion → Confidence',
    supportingData: 'Teams using unified data platforms see 41% fewer internal disputes and 2.3x faster decision-making.',
    status: 'approved',
    score: 85,
  },
  {
    id: 'angle-4',
    title: 'The Revenue Leak',
    hook: "Every week without real-time attribution is money you'll never track",
    category: 'Loss Aversion',
    targetEmotion: 'Concern → Action',
    supportingData: 'Avg revenue misattribution costs $2.1M/yr for mid-market companies. Most don\'t know it\'s happening.',
    status: 'pending',
    score: 79,
  },
  {
    id: 'angle-5',
    title: 'The Expert Positioning',
    hook: "What separates top 1% growth teams from the rest? This one habit.",
    category: 'Aspirational Identity',
    targetEmotion: 'Aspiration → Motivation',
    supportingData: 'Survey: 94% of top-performing growth teams review key metrics daily vs 31% of average performers.',
    status: 'rejected',
    score: 71,
  },
  {
    id: 'angle-6',
    title: 'The Simplicity Win',
    hook: "Your analytics stack shouldn't require a PhD to use",
    category: 'Simplicity Appeal',
    targetEmotion: 'Overwhelm → Ease',
    supportingData: 'New users create their first dashboard in 9 minutes avg. No SQL, no engineering tickets.',
    status: 'approved',
    score: 83,
  },
];

export const icpData: ICPItem[] = [
  {
    id: 'icp-1',
    segment: 'Growth-Stage SaaS — Head of Marketing',
    demographics: 'Age 30–45, US/UK/Canada, Series B–D company, 50–500 employees, $5M–$50M ARR',
    psychographics: 'Ambitious, data-obsessed, frustrated by tool fragmentation. Reads HBR, attends SaaStr. Wants to be the smartest person in the room.',
    painPoints: 'Disparate data sources, slow reporting cycles, difficulty proving ROI to board, analysts spending time on grunt work.',
    goals: 'Show marketing impact on revenue, move faster on campaigns, justify headcount with hard data.',
    channels: 'LinkedIn, G2, industry newsletters, podcast ads',
    size: '~85,000 in TAM',
  },
  {
    id: 'icp-2',
    segment: 'E-commerce — Performance Marketing Manager',
    demographics: 'Age 26–38, US, DTC brand doing $5M–$50M GMV, team of 3–15 marketers',
    psychographics: 'ROI-first mindset, lives in Meta/Google Ads, frustrated by attribution black boxes, follows Andrew Chen and Nik Sharma.',
    painPoints: 'Post-iOS 14 attribution chaos, ROAS uncertainty, can\'t trust platform-reported numbers, budget justification.',
    goals: 'Accurate cross-channel attribution, scaling winning ads with confidence, reducing wasted spend.',
    channels: 'Meta Ads, YouTube, Twitter/X, eCommerce newsletters',
    size: '~120,000 in TAM',
  },
  {
    id: 'icp-3',
    segment: 'Enterprise — VP of Analytics',
    demographics: 'Age 38–55, Global, F500 or large enterprise, 1000+ employees',
    psychographics: 'Strategic thinker, politically savvy, building internal credibility. Values stability and vendor trust.',
    painPoints: 'Data silos across business units, governance concerns, slow BI turnaround times, shadow IT proliferation.',
    goals: 'Democratize data access, establish single source of truth, reduce engineering backlog dependency.',
    channels: 'LinkedIn, Gartner reports, analyst briefings, industry conferences',
    size: '~45,000 in TAM',
  },
];

export const hooksData: HookItem[] = [
  { id: 'H001', text: 'Stop copy-pasting data into spreadsheets', category: 'Pain' },
  { id: 'H002', text: 'Your competitor just got a 3x data edge', category: 'Fear' },
  { id: 'H003', text: 'Which dashboard do you actually trust?', category: 'Confusion' },
  { id: 'H004', text: "You're bleeding revenue you can't see", category: 'Loss' },
  { id: 'H005', text: 'Top 1% teams do this every morning', category: 'Aspiration' },
  { id: 'H006', text: '9 minutes to your first real insight', category: 'Simplicity' },
  { id: 'H007', text: '8 hours a week — gone forever', category: 'Time' },
  { id: 'H008', text: 'Your analyst is drowning in busywork', category: 'Pain' },
];

export const adBriefData: AdBriefItem[] = [
  {
    id: 'brief-1',
    messagingId: 'msg-1', messagingIds: ['msg-1', 'msg-4'],
    angleId: 'angle-1', icpId: 'icp-1', icpIds: ['icp-1'],
    hookIds: ['H001', 'H007'],
    situation: 'Marketing analyst frustrated after another 4-hour reporting session',
    strategy: 'Social Proof',
    strength: 'Strong', priority: 'P0',
    format: 'Video Ad', duration: '30s', platform: 'LinkedIn',
    conceptsGenerated: true, conceptIds: ['concept-1'], conceptCount: 2,
  },
  {
    id: 'brief-2',
    messagingId: 'msg-2', messagingIds: ['msg-2'],
    angleId: 'angle-2', icpId: 'icp-2', icpIds: ['icp-2'],
    hookIds: ['H002', 'H004'],
    situation: 'Performance marketer realizing competitor launched a new attribution model',
    strategy: 'Fresh',
    strength: 'Strong', priority: 'P0',
    format: 'Static Image', duration: 'N/A', platform: 'Meta',
    conceptsGenerated: false, conceptIds: [], conceptCount: 0,
  },
  {
    id: 'brief-3',
    messagingId: 'msg-3', messagingIds: ['msg-3', 'msg-5'],
    angleId: 'angle-3', icpId: 'icp-1', icpIds: ['icp-1', 'icp-2'],
    hookIds: ['H003', 'H008'],
    situation: 'Head of Marketing in a tense board meeting with conflicting dashboard numbers',
    strategy: 'Educational',
    strength: 'Strong', priority: 'P0',
    format: 'Carousel', duration: 'N/A', platform: 'LinkedIn',
    conceptsGenerated: true, conceptIds: ['concept-2'], conceptCount: 9,
  },
  {
    id: 'brief-4',
    messagingId: 'msg-5', messagingIds: ['msg-5'],
    angleId: 'angle-6', icpId: 'icp-2', icpIds: ['icp-2'],
    hookIds: ['H005', 'H006'],
    situation: 'New growth hire overwhelmed by the complexity of the analytics stack',
    strategy: 'Aspirational',
    strength: 'Moderate', priority: 'P1',
    format: 'Video Ad', duration: '15s', platform: 'YouTube',
    conceptsGenerated: false, conceptIds: [], conceptCount: 0,
  },
  {
    id: 'brief-5',
    messagingId: 'msg-4', messagingIds: ['msg-4'],
    angleId: 'angle-3', icpId: 'icp-3', icpIds: ['icp-3'],
    hookIds: ['H003'],
    situation: 'VP Analytics presenting to C-suite with fragmented reports from 6 different tools',
    strategy: 'Competitive',
    strength: 'Strong', priority: 'P0',
    format: 'Native Ad', duration: 'N/A', platform: 'LinkedIn',
    conceptsGenerated: false, conceptIds: [], conceptCount: 0,
  },
];

export const adConceptsData: AdConceptItem[] = [
  {
    id: 'concept-1',
    briefId: 'brief-1',
    title: 'The Spreadsheet Trap — LinkedIn Video',
    hook: "You didn't hire analysts to copy-paste numbers into spreadsheets...",
    body: 'Open on analyst visibly stressed, staring at multiple spreadsheets. VO: "Every week, your team wastes 8+ hours on manual reporting. Time they could spend finding the insight that changes everything." Cut to clean dashboard. VO: "Stop the madness." Product demo sequence showing one-click automation. CTA banner: "Start free. No credit card."',
    cta: 'Start Free Trial',
    format: 'Video Ad',
    platform: 'LinkedIn',
    status: 'approved',
    createdAt: '2024-03-12',
    variations: 3,
    script: 'SCENE 1 (0–5s): ANALYST looking exhausted at 3 monitors showing spreadsheets.\nVO: "Your analysts are copy-pasting. Again."\n\nSCENE 2 (5–12s): SPLIT SCREEN showing hours wasted vs competitor moving fast.\nVO: "8 hours a week. 416 hours a year. Gone."\n\nSCENE 3 (12–22s): Product screen recording — clean dashboard auto-populating.\nVO: "Our platform connects every data source in minutes. No SQL. No tickets. No waiting."\n\nSCENE 4 (22–30s): Happy team, celebrating metric milestone.\nVO: "Join 12,000 growth teams making faster, better decisions."\nCTA TEXT: "Start Free — No Credit Card Required"',
    visualDirection: 'High contrast. Start dark/stressed → end bright/energetic. Use brand blue (#2563EB) as primary accent. Minimal text overlays. Show real product UI, not illustrations.',
  },
  {
    id: 'concept-2',
    briefId: 'brief-3',
    title: 'Data Chaos → Clarity — LinkedIn Carousel',
    hook: 'Which dashboard do you trust when they all show different numbers?',
    body: 'Slide 1: Bold headline "Which number is right?" showing 4 conflicting dashboards.\nSlide 2: The pain — list of common data misalignments teams experience.\nSlide 3: The solution — unified data layer visual.\nSlide 4: Outcome — 2.3x faster decisions, 41% fewer disputes.\nSlide 5: CTA — Book a 20-min demo.',
    cta: 'Book a Demo',
    format: 'Carousel',
    platform: 'LinkedIn',
    status: 'draft',
    createdAt: '2024-03-14',
    variations: 1,
    visualDirection: 'Clean, professional. Slide 1 uses red/chaos aesthetic, slides 3-5 transition to clean blue/organized. Each slide max 40 words.',
  },
];
