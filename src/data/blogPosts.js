// Local "database" of blog articles. In a real deployment these could be
// swapped for markdown files or a headless CMS without changing page code.
import article1 from '../assets/plan.jpeg'
import article2 from '../assets/laptop.jpeg'
import article3 from '../assets/article.jpeg'
import article4 from '../assets/hacks.jpeg'
import article5 from '../assets/targets.jpeg'
import article6 from '../assets/media.jpeg'
import article7 from '../assets/goals.jpeg'
import article8 from '../assets/tags.jpeg'
import article9 from '../assets/cash.jpeg'

const blogPosts = [
  {
    image: article1,
    slug: 'how-to-write-a-business-plan-that-works',
    title: 'How to Write a Business Plan That Actually Works',
    category: 'Starting a Business',
    excerpt: 'A simple step-by-step guide to create a business plan that gets results.',
    date: '2025-06-01',
    readTime: '8 min read',
    featured: true,
    content: `A good business plan is a working document, not a formality for investors. Start with a one-page summary of what you sell, who buys it, and why they'll choose you over alternatives. Follow that with realistic financial projections built from numbers you can defend, not aspirational guesses. Revisit the plan every quarter and adjust it as you learn what's actually working in the market.`,
  },
  {
    image: article2,
    slug: '10-ways-to-improve-cash-flow',
    title: '10 Ways to Improve Cash Flow in Your Business',
    category: 'Finance & Accounting',
    excerpt: 'Proven strategies to keep more cash in your business.',
    date: '2025-05-28',
    readTime: '6 min read',
    featured: true,
    content: `Cash flow problems sink more small businesses than lack of profit does. Invoice promptly and follow up on late payments without hesitation. Negotiate better payment terms with suppliers, and keep a cash buffer for slow months. Track your cash position weekly, not just at month-end, so problems don't sneak up on you.`,
  },
  {
    image: article3,
    slug: 'get-more-customers-without-spending-more',
    title: 'How to Get More Customers Without Spending More Money',
    category: 'Sales & Marketing',
    excerpt: 'Effective marketing ideas for small businesses on a budget.',
    date: '2025-05-25',
    readTime: '7 min read',
    featured: true,
    content: `Referrals from happy customers cost nothing and convert better than paid ads. Ask directly for reviews and introductions after a good experience. Show up consistently in the same one or two places your customers already spend time, rather than spreading thin across every platform. Consistency beats a bigger budget for most small businesses.`,
  },
  {
    image: article4,
    slug: '5-productivity-hacks-for-busy-owners',
    title: '5 Productivity Hacks for Busy Business Owners',
    category: 'Operations',
    excerpt: 'Save time and get more done every single day.',
    date: '2025-05-22',
    readTime: '5 min read',
    featured: true,
    content: `Batch similar tasks together instead of context-switching all day. Block your calendar for deep work before opening email. Automate anything you do the same way more than three times. Delegate the tasks only you don't need to be doing, even if it feels faster to just do it yourself.`,
  },
  {
    image: article5,
    slug: 'small-business-legal-basics',
    title: "Small Business Legal Basics You Shouldn't Ignore",
    category: 'Legal & Compliance',
    excerpt: 'Important legal tips to protect your business and avoid costly mistakes.',
    date: '2025-05-18',
    readTime: '6 min read',
    featured: true,
    content: `Register your business properly before you start trading at scale. Put agreements with clients and contractors in writing, even for small jobs. Understand which licenses your industry requires locally. A short consultation with a professional early on is usually cheaper than fixing a problem later.`,
  },
  {
    image: article6,
    slug: 'start-online-business-no-money',
    title: 'How to Start an Online Business with No Money',
    category: 'Online Business',
    excerpt: 'Practical steps to launch and grow your online business.',
    date: '2025-05-15',
    readTime: '7 min read',
    featured: true,
    content: `Start by validating demand before building anything — sell the idea before the product exists if you can. Use free tools for your storefront, marketing and bookkeeping while you're proving the model. Reinvest early revenue into the parts of the business that clearly move the needle, not the parts that feel exciting.`,
  },
  {
    image: article7,
    slug: '7-growth-strategies-scale-small-business',
    title: '7 Growth Strategies to Scale Your Small Business',
    category: 'Growth Strategies',
    excerpt: 'Practical approaches for taking your business to the next level.',
    date: '2025-06-10',
    readTime: '6 min read',
    featured: false,
    content: `Growth usually comes from doubling down on what already works rather than chasing something new. Look at your best customers and find more people like them. Systemize your most repeatable process so it doesn't depend on you personally. Expand distribution before expanding product lines.`,
  },
  {
    image: article8,
    slug: 'how-to-provide-excellent-customer-service',
    title: 'How to Provide Excellent Customer Service',
    category: 'Customer Service',
    excerpt: 'Build loyalty and trust with every customer interaction.',
    date: '2025-06-08',
    readTime: '5 min read',
    featured: false,
    content: `Respond quickly, even if the full answer takes longer to prepare. Acknowledge mistakes plainly and fix them without making the customer fight for it. Personal touches — remembering names, following up after a purchase — build loyalty that discounts alone never will.`,
  },
  {
    image: article9,
    slug: 'ultimate-guide-small-business-budgeting',
    title: 'The Ultimate Guide to Small Business Budgeting',
    category: 'Finance & Accounting',
    excerpt: 'Everything you need to know to budget wisely.',
    date: '2025-06-05',
    readTime: '7 min read',
    featured: false,
    content: `Separate fixed costs from variable costs so you know your true break-even point. Budget conservatively for revenue and generously for expenses — surprises tend to run in that direction. Review actual spend against budget monthly and adjust rather than waiting until year-end.`,
  },
  {
    image: article6,
    slug: 'social-media-marketing-tips-small-business',
    title: 'Social Media Marketing Tips for Small Businesses',
    category: 'Marketing & Sales',
    excerpt: 'Grow your brand and get customers using social media the smart way.',
    date: '2025-06-03',
    readTime: '6 min read',
    featured: false,
    content: `Pick one or two platforms where your customers actually spend time rather than trying to be everywhere. Post consistently rather than perfectly — a simple regular post beats an occasional polished one. Engage with comments and messages promptly; social media rewards responsiveness as much as content quality.`,
  },
];

export function getFeaturedPosts() {
  return blogPosts.filter((p) => p.featured);
}

export function getPostBySlug(slug) {
  return blogPosts.find((p) => p.slug === slug);
}

export const blogCategories = [...new Set(blogPosts.map((p) => p.category))];

export default blogPosts;
