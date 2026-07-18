// Local "database" of blog articles. In a real deployment these could be
// swapped for markdown files or a headless CMS without changing page code.
//
// `content` uses a lightweight markdown-style convention: paragraphs are
// separated by a blank line, and a line starting with "## " becomes a
// subheading. BlogPost.jsx parses this into real <h2>/<p> elements.
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
    date: '2026-06-01',
    readTime: '8 min read',
    featured: true,
    content: `A good business plan is a working document, not a formality you write once for investors and never open again. The businesses that actually use their plan tend to make better decisions faster, because they've already thought through the hard questions before they're standing in the middle of them.

## Start With a One-Page Summary

Before you write a single financial projection, write one page that explains what you sell, who buys it, and why they'll choose you over the alternatives already available to them. If you can't explain your business in one page, you don't understand it well enough yet to plan around it. This summary becomes the filter for every decision that follows — new ideas either support this core story or they're a distraction.

## Get Specific About Your Customer

"Small business owners" or "young professionals" is not a customer description, it's a demographic label. Go deeper: what does this person do on a Tuesday? What are they frustrated by right now that your product or service fixes? The more specific your picture of the customer, the easier every other part of the plan becomes — pricing, marketing, even hiring.

## Build Financial Projections You Can Defend

Every number in your projections should trace back to something real: a quote you got, a price you've actually charged, a conversion rate you've actually seen. Resist the temptation to work backward from "we need to make $50,000 a month" — that's a wish, not a projection. Build up from unit economics instead: what does it cost you to acquire one customer, and what is that customer worth over time?

## Plan for the Slow Months

Almost every business has a cash flow cycle, and almost every new business plan ignores it. Map out, month by month, when money actually comes in versus when it goes out. If there's a gap, that's not a flaw in your plan — that's exactly the kind of thing a plan is supposed to catch before it becomes an emergency.

## Revisit It Every Quarter

A business plan that never changes was probably wrong from the start, or the business has stopped learning. Set a recurring quarterly appointment with yourself to reread the plan and update it with what you've actually learned. Over a year, that rhythm turns your plan from a static document into a genuine decision-making tool.`,
  },
  {
    image: article2,
    slug: '10-ways-to-improve-cash-flow',
    title: '10 Ways to Improve Cash Flow in Your Business',
    category: 'Finance & Accounting',
    excerpt: 'Proven strategies to keep more cash in your business.',
    date: '2026-05-28',
    readTime: '6 min read',
    featured: true,
    content: `Cash flow problems sink more small businesses than lack of profit does. It's entirely possible to be profitable on paper and still run out of cash to pay rent, because profit is a calculation and cash is a bank balance — they don't move in sync. Here are ten practical ways to keep more cash actually available in your business.

## 1. Invoice the Moment the Work Is Done

Every day between finishing a job and sending the invoice is a day you're financing your customer for free. Send invoices immediately, not at the end of the week or month.

## 2. Shorten Your Payment Terms

If you're currently offering 30 days, consider moving to 14 or even 7 for smaller clients. You can always extend terms for your best, most reliable customers as a relationship perk — it shouldn't be the default for everyone.

## 3. Follow Up on Late Payments Without Hesitation

A polite, prompt reminder is not rude — it's professional. Businesses that chase late invoices quickly get paid faster than those that let it slide out of politeness.

## 4. Negotiate Better Terms With Suppliers

Just as you can ask customers to pay faster, you can ask suppliers to let you pay slower. Longer payment terms on the money going out balance shorter terms on the money coming in.

## 5. Keep a Cash Buffer

Aim to keep at least one to two months of operating expenses in reserve. This buffer is what lets you say no to bad, desperate decisions during a slow patch.

## 6. Track Cash Weekly, Not Just Monthly

Monthly reviews catch problems too late. A simple weekly check of what's in the bank versus what's due out gives you time to react before a shortfall becomes a crisis.

## 7. Offer a Small Discount for Early Payment

A 2% discount for payment within 7 days costs you less than the interest on a loan you might otherwise need to cover the gap.

## 8. Reduce Unnecessary Recurring Costs

Subscriptions and small recurring charges add up quietly. A quarterly audit of everything you're paying for monthly often uncovers real, immediate savings.

## 9. Sell Off Slow-Moving Inventory

Stock that isn't moving is cash sitting on a shelf. Even a discounted sale converts it back into working capital you can actually use.

## 10. Separate Cash Flow Planning From Profit Planning

Keep a simple cash flow forecast alongside your profit and loss statement. They answer different questions, and a business that only watches profit is flying with half the instrument panel covered.`,
  },
  {
    image: article3,
    slug: 'get-more-customers-without-spending-more',
    title: 'How to Get More Customers Without Spending More Money',
    category: 'Sales & Marketing',
    excerpt: 'Effective marketing ideas for small businesses on a budget.',
    date: '2026-05-25',
    readTime: '7 min read',
    featured: true,
    content: `It's tempting to believe that more customers requires a bigger ad budget. In practice, some of the most reliable growth channels for small businesses cost nothing but consistency and a bit of nerve to actually ask.

## Referrals Are Still the Best Marketing Channel

A referral from a happy customer converts better than almost any paid ad, because trust is already built in before the conversation even starts. Most businesses never ask for referrals directly — they wait and hope. Ask explicitly, right after a good experience, when the customer's goodwill is highest.

## Show Up Consistently in One or Two Places

You don't need to be everywhere. Pick the one or two platforms or locations where your actual customers already spend their time, and show up there reliably — not spectacularly, just reliably. A simple, regular presence beats an occasional brilliant one because trust is built through repetition, not one-off impressions.

## Make It Easy to Leave a Review

Most satisfied customers won't leave a review unless you make it almost effortless — a direct link, sent at the right moment, with a short explanation of why it matters to a small business. Reviews compound: each one makes the next customer's decision to trust you a little easier.

## Partner With Complementary Businesses

Find businesses that serve the same customer but aren't your competitor, and find a simple way to send business to each other. A caterer and an event photographer, a gym and a nutritionist, a bookkeeper and a business coach — these partnerships cost nothing and put you in front of an audience that's already pre-qualified.

## Solve a Problem in Public

Answering questions, sharing genuinely useful tips, or breaking down how you solved a specific problem for a client builds more credibility over time than a sales pitch ever will. People remember who helped them before they needed anything in return.

## Reactivate Past Customers

It's far cheaper to win back someone who already trusted you once than to find a completely new customer. A simple, honest check-in message to past customers — no hard sell, just a genuine "how are things going" — often reopens business relationships that had simply gone quiet, not cold.`,
  },
  {
    image: article4,
    slug: '5-productivity-hacks-for-busy-owners',
    title: '5 Productivity Hacks for Busy Business Owners',
    category: 'Operations',
    excerpt: 'Save time and get more done every single day.',
    date: '2026-05-22',
    readTime: '5 min read',
    featured: true,
    content: `Running a small business means there's always more to do than hours to do it in. The goal isn't to work faster at everything — it's to be deliberate about where your limited time actually goes.

## 1. Batch Similar Tasks Together

Context-switching is expensive. Every time you jump from answering emails to making calls to reviewing invoices, you pay a mental tax in refocusing. Group similar tasks into blocks — one block for communication, one for admin, one for deep work — and you'll get through all of them faster than if you scattered them across the day.

## 2. Protect Your First Hour for Deep Work

Before email, before messages, before the day's fires start — spend the first hour on the one task that actually moves the business forward. This is the work that gets crowded out by everything else if you don't protect it deliberately.

## 3. Automate Anything You Repeat Three Times

If you find yourself doing the same task manually a third time — the same reminder, the same follow-up, the same calculation — that's your signal to build a template, a recurring calendar block, or a simple automation. The time invested pays back almost immediately.

## 4. Delegate What Only Feels Faster to Do Yourself

Many business owners hold onto tasks because "it's faster if I just do it," without accounting for the fact that this is true every single week, forever, unless something changes. If a task doesn't require your specific judgment, it's a candidate for delegation — even if training someone else takes longer the first few times.

## 5. End Each Day by Planning the Next

Five minutes at the end of the day, deciding the one or two things that matter most tomorrow, saves far more than five minutes the next morning. You start the day already knowing where to focus instead of deciding it cold.`,
  },
  {
    image: article5,
    slug: 'small-business-legal-basics',
    title: "Small Business Legal Basics You Shouldn't Ignore",
    category: 'Legal & Compliance',
    excerpt: 'Important legal tips to protect your business and avoid costly mistakes.',
    date: '2026-05-18',
    readTime: '6 min read',
    featured: true,
    content: `Legal issues rarely feel urgent until the day they suddenly are. Most of the problems below are cheap and simple to prevent, and expensive and stressful to fix after the fact.

## Register Your Business Properly

Operating without proper registration might feel fine while you're small, but it limits your options later — for opening business bank accounts, applying for financing, or even just being taken seriously by bigger clients. Register early, even if your business is still modest in size.

## Put Everything in Writing

Verbal agreements feel fine until there's a disagreement about what was actually agreed. This applies to clients, contractors, and even informal partnerships with friends. A simple written agreement — what's being delivered, by when, for how much — protects both sides and prevents the kind of misunderstanding that damages relationships.

## Understand What Licenses You Actually Need

Requirements vary significantly by industry and location, and "I didn't know" is rarely an accepted excuse if you're found operating without a required license. A short conversation with a local business advisor or a quick check with your local regulatory office early on is far cheaper than discovering a gap later.

## Separate Personal and Business Finances

Mixing personal and business money is one of the most common early mistakes. It makes bookkeeping harder, complicates your taxes, and in some business structures can even undermine the legal protection that separates your personal assets from business liabilities.

## Protect Your Business Name and Ideas

If your business name, logo, or a specific product idea is genuinely central to your value, look into what protection is available to you — trademark registration, for instance — before a competitor with more resources gets there first.

## Know When to Bring in a Professional

You don't need a lawyer for every decision, but certain moments genuinely call for one: signing a lease, bringing on a business partner, or facing a dispute with a client or supplier. A short paid consultation at the right moment is consistently cheaper than the cost of getting it wrong.`,
  },
  {
    image: article6,
    slug: 'start-online-business-no-money',
    title: 'How to Start an Online Business with No Money',
    category: 'Online Business',
    excerpt: 'Practical steps to launch and grow your online business.',
    date: '2026-05-15',
    readTime: '7 min read',
    featured: true,
    content: `You don't need capital to start testing a business idea — you need a way to find out, cheaply and quickly, whether anyone actually wants what you're planning to sell.

## Validate Before You Build

The biggest waste of time in a new business isn't spending too little — it's spending months building something nobody asked for. Before you build anything, find a way to sell the idea itself: a simple description, a pre-order, a waitlist, a direct conversation with potential customers. If people won't commit to something that doesn't exist yet, that's valuable information, not a failure.

## Use Free Tools While You Prove the Model

There is a genuinely free or low-cost tool for nearly every part of running an early-stage online business — storefronts, invoicing, email marketing, scheduling, bookkeeping. Resist the urge to pay for premium tools before you've proven the underlying business works; the tools rarely fix a business model problem.

## Start With One Distribution Channel

Trying to be present on every platform at once spreads your limited time too thin to build real traction anywhere. Pick the one channel where your specific customers already spend time, and go deep there before expanding.

## Reinvest Early Revenue Deliberately

When the first sales start coming in, it's tempting to reinvest in whatever feels exciting. Instead, reinvest in whatever you can clearly trace back to bringing in those first sales — that's your actual growth engine, and it's usually less glamorous than it sounds.

## Keep Overheads Near Zero for as Long as Possible

Every recurring cost you take on before the business has proven itself is a bet you're making on an unproven idea. Stay lean until the revenue itself is telling you it's time to invest further — the business will tell you when it's ready to grow, and it's a much safer signal than ambition alone.`,
  },
  {
    image: article7,
    slug: '7-growth-strategies-scale-small-business',
    title: '7 Growth Strategies to Scale Your Small Business',
    category: 'Growth Strategies',
    excerpt: 'Practical approaches for taking your business to the next level.',
    date: '2026-06-10',
    readTime: '6 min read',
    featured: false,
    content: `Growth rarely comes from a single big idea. It usually comes from methodically doing more of what's already working, while removing the things that only you can do.

## 1. Double Down on What's Already Working

Look honestly at where your revenue is actually coming from, and put more resources there before chasing something new and untested. It's tempting to diversify early, but most growth comes from depth, not breadth.

## 2. Find More of Your Best Customers

Your best customers — the ones who pay well, refer others, and stick around — share traits. Study them, and use what you learn to find more people just like them, rather than trying to appeal to everyone.

## 3. Systemize Your Most Repeatable Process

Whatever you do most often should have a documented, repeatable system behind it. This is what allows the business to run without depending entirely on you personally for every single instance of that task.

## 4. Expand Distribution Before Expanding Products

Adding new products before you've fully tapped your existing distribution channels usually spreads a team thin without adding proportional revenue. Get more out of what you already have before adding complexity.

## 5. Invest in Retention, Not Just Acquisition

It's almost always cheaper to keep an existing customer than to win a new one. A small investment in the experience of existing customers often produces a bigger return than the equivalent spent chasing new leads.

## 6. Hire for Your Weakest Link, Not Your Interest

Business owners tend to hire for the parts of the business they find interesting, when the highest-leverage hire is usually for whatever is currently the biggest bottleneck — even if it's unglamorous.

## 7. Review the Numbers Monthly, Not Just at Year-End

Growth strategies that aren't checked against real numbers regularly tend to drift. A monthly look at what's actually moving the needle keeps growth efforts honest and lets you redirect quickly when something isn't working.`,
  },
  {
    image: article8,
    slug: 'how-to-provide-excellent-customer-service',
    title: 'How to Provide Excellent Customer Service',
    category: 'Customer Service',
    excerpt: 'Build loyalty and trust with every customer interaction.',
    date: '2026-06-08',
    readTime: '5 min read',
    featured: false,
    content: `Excellent customer service isn't really about grand gestures. It's mostly about consistently getting the small, everyday interactions right.

## Respond Quickly, Even Without a Full Answer

Speed matters more than most business owners realize. If you can't fully resolve something immediately, a quick acknowledgment — "I've seen this, I'm looking into it" — reassures a customer far more than silence while you prepare the perfect response.

## Own Mistakes Plainly

Every business makes mistakes eventually. What separates good service from bad service is how the mistake is handled: acknowledged plainly, fixed without the customer having to fight for it, and not buried in excuses. Customers usually forgive an honest mistake handled well far more readily than businesses expect.

## Remember the Personal Details

Remembering a name, a past order, or a small detail from a previous conversation signals that a customer is a person to you, not a transaction. This kind of attention is rare enough now that it stands out, and it builds loyalty that discounts alone rarely achieve.

## Set Realistic Expectations, Then Meet Them

Overpromising to close a sale or smooth over a complaint creates a bigger problem down the line. It's almost always better to be honest about timelines and limitations upfront than to disappoint later after raising hopes too high.

## Ask for Feedback and Actually Use It

Asking customers how you're doing shows you care about improving, but it only builds trust if you visibly act on what you hear. Even sharing "you told us X, so we changed Y" turns feedback into a relationship-building moment rather than a formality.`,
  },
  {
    image: article9,
    slug: 'ultimate-guide-small-business-budgeting',
    title: 'The Ultimate Guide to Small Business Budgeting',
    category: 'Finance & Accounting',
    excerpt: 'Everything you need to know to budget wisely.',
    date: '2026-06-05',
    readTime: '7 min read',
    featured: false,
    content: `A budget isn't a restriction on your business — it's a plan for where your money is going to work hardest. Without one, spending tends to drift toward whatever feels urgent that week rather than what actually matters most.

## Separate Fixed Costs From Variable Costs

Fixed costs — rent, salaries, subscriptions — happen whether you make a sale or not. Variable costs scale with activity, like materials or shipping. Understanding this split is what lets you calculate your true break-even point: the minimum you need to bring in each month just to stay afloat.

## Budget Conservatively for Revenue

It's natural to budget for the revenue you hope for. It's safer to budget for the revenue you can reasonably count on, and treat anything above that as a bonus rather than a baseline you're depending on to cover fixed costs.

## Budget Generously for Expenses

Unexpected costs are the rule in business, not the exception. Build a buffer into your expense budget for the surprises that inevitably show up — equipment repairs, a late supplier price increase, an unplanned compliance requirement.

## Review Actual Spend Against Budget Monthly

A budget that's set once a year and never revisited stops being useful within a few months. A short monthly review — what did we actually spend versus what we planned — catches problems early and keeps the budget realistic rather than aspirational.

## Give Every Dollar a Job

Rather than treating leftover cash at the end of the month as "extra," decide in advance where it's going: a cash reserve, reinvestment, debt repayment, or owner pay. A budget with a plan for every dollar tends to build financial stability faster than one that just tracks spending after the fact.

## Revisit the Budget When the Business Changes

A new hire, a new product line, a big new client — any significant change in the business should trigger a budget review, not wait for the next scheduled one. Budgets that lag behind the actual business quickly become disconnected from reality.`,
  },
  {
    image: article6,
    slug: 'social-media-marketing-tips-small-business',
    title: 'Social Media Marketing Tips for Small Businesses',
    category: 'Marketing & Sales',
    excerpt: 'Grow your brand and get customers using social media the smart way.',
    date: '2026-06-03',
    readTime: '6 min read',
    featured: false,
    content: `Social media rewards consistency and responsiveness far more than production value. A small business posting regularly with a real voice will usually outperform one posting occasionally with polished but generic content.

## Pick One or Two Platforms, Not All of Them

Every platform you add is another commitment you need to sustain. Choose the one or two where your actual customers already spend time, and resist the pressure to maintain a presence everywhere just because it's possible.

## Post Consistently Rather Than Perfectly

A simple, regular post beats an occasional highly polished one, because social platforms and audiences both reward consistency. Waiting for the perfect post often means posting far too rarely to build any real momentum.

## Show the Real Business, Not Just the Product

Behind-the-scenes moments, the people doing the work, the small decisions that go into what you make — this kind of content tends to build more genuine connection than polished product shots alone. People follow businesses they feel they know.

## Engage With Comments and Messages Promptly

Social media platforms reward responsiveness in how widely they show your content, and customers notice it directly too. A business that replies quickly signals that there's a real, attentive person behind the account.

## Use What's Actually Working, Not What's Trendy

It's easy to get pulled into chasing every new trend or format. Pay attention instead to what your own audience actually responds to — the comments, shares, and messages you're already getting — and do more of that specifically, rather than more of whatever's generically popular.

## Track a Few Simple Numbers

You don't need elaborate analytics to improve. Tracking which posts lead to actual inquiries or sales — not just likes — tells you far more about what's working than vanity metrics ever will.`,
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
