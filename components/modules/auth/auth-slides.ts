export interface Slide {
  id: number;
  src: string;
  type: 'image' | 'video';
  title: string;
  description: string;
}

export const authSlides: Slide[] = [
  {
    id: 1,
    src: '/assets/images/auth-bg/4749805_Woman_Businesswoman_1280x720.mp4',
    type: 'video',
    title: 'Verified Talent, Verified Trust',
    description: 'Employers hire with confidence. Every scientist on Authesci undergoes rigorous credential verification, ensuring your research is in expert hands.',
  },
  {
    id: 2,
    src: '/assets/images/auth-bg/taking-soil-samples-in-nature-selective-focus-2025-12-09-08-42-21-utc.mov',
    type: 'video',
    title: 'From Fieldwork to Breakthroughs',
    description: 'Showcase your hands-on expertise. Whether it\'s soil analysis or environmental sampling, connect with projects that value your field experience.',
  },
  {
    id: 3,
    src: '/assets/images/auth-bg/4112.jpg',
    type: 'image',
    title: 'Precision Research Matching',
    description: 'Stop searching, start discovering. Our AI-driven platform matches specific research needs with the precise specialized skills required.',
  },
  {
    id: 4,
    src: '/assets/images/auth-bg/1473156_People_Nature_1920x1080.mp4',
    type: 'video',
    title: 'Collaborate on What Matters',
    description: 'Build dynamic project teams. From sustainable agriculture to biotechnology, Authesci connects visionaries with world-class executors.',
  },
  {
    id: 5,
    src: '/assets/images/auth-bg/6038141_People_Colleagues_1920x1080.mp4',
    type: 'video',
    title: 'Advance Your Scientific Career',
    description: 'Join a global network of researchers. Access funded opportunities, gain recognition, and take your scientific journey to the next level.',
  },
  {
    id: 6,
    src: '/assets/images/auth-bg/5431021_Coll_wavebreak_People_1920x1080.mp4',
    type: 'video',
    title: 'Turn Research into Revenue',
    description: 'Scientists: Monetize your knowledge. Institutions: Access high-level analysis and data-driven insights without the overhead.',
  },
];
