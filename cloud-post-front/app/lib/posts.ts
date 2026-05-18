export type PostCategory =
  | "Idea"
  | "Design"
  | "Product"
  | "Journal"
  | "Question";

export type Comment = {
  id: number;
  author: string;
  body: string;
  publishedAt: string;
};

export type Post = {
  id: number;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  category: PostCategory;
  readTime: string;
  publishedAt: string;
  reactions: number;
  comments: Comment[];
  accent: "violet" | "sun" | "mint" | "rose";
};

export const categories: Array<PostCategory | "All"> = [
  "All",
  "Idea",
  "Design",
  "Product",
  "Journal",
  "Question",
];

export const initialPosts: Post[] = [
  {
    id: 1,
    title: "Small ideas deserve a public shelf too",
    excerpt:
      "A short note about public drafts, imperfect thinking, and the relief of publishing without a profile.",
    body: "Publishing anonymously removes part of the social theater. What remains is the idea, its clarity, its rhythm, and the way readers respond to it.\n\nThat makes small posts feel lighter. You do not have to arrive with a finished essay or a polished identity. You can share a thought while it is still warm and let the feed test whether it has a pulse.\n\nThe best part is that the post can stand on its own. No follower count, no biography, no reputation management. Just a title, a few paragraphs, and a chance for someone else to recognize the shape of the thought.",
    author: "Anonymous",
    category: "Idea",
    readTime: "3 min",
    publishedAt: "12 min ago",
    reactions: 48,
    comments: [
      {
        id: 1,
        author: "Quiet Reader",
        body: "This is exactly why anonymous spaces can feel more honest.",
        publishedAt: "8 min ago",
      },
      {
        id: 2,
        author: "Anonymous",
        body: "I like the idea of testing a thought before attaching identity to it.",
        publishedAt: "3 min ago",
      },
    ],
    accent: "violet",
  },
  {
    id: 2,
    title: "A feed should make people slow down",
    excerpt:
      "Less friction, more breathing room: a design proposal for reading without the usual noise.",
    body: "The best feeds do not simply stack cards. They create a cadence, give the eye a place to rest, and make each post feel like it has enough space to be considered.\n\nThat means hierarchy matters. Tags should help readers orient themselves, not shout for attention. Reaction counts should be available, but not louder than the writing. Search should feel like a tool, not a command center.\n\nA good feed is not empty minimalism. It is a confident editing decision: show the writing, reduce the ceremony, and let readers move at a human pace.",
    author: "Cloud 402",
    category: "Design",
    readTime: "5 min",
    publishedAt: "1 h ago",
    reactions: 91,
    comments: [
      {
        id: 1,
        author: "Pixel Guest",
        body: "The vertical layout already helps. It feels more like reading and less like browsing.",
        publishedAt: "42 min ago",
      },
    ],
    accent: "rose",
  },
  {
    id: 3,
    title: "Why I write product specs like letters",
    excerpt:
      "A simple method for turning product constraints into readable intent.",
    body: "A spec gets better when it gives context before solutions. The reader understands the direction, not just the checklist.\n\nWriting it like a letter changes the tone. You explain what changed, what you noticed, what still feels uncertain, and what decision needs to happen next. It creates a little room for judgment.\n\nThe result is still practical. Requirements are clearer because they are attached to a reason. Tradeoffs become easier to discuss because everyone can see the original intent.",
    author: "Anonymous",
    category: "Product",
    readTime: "4 min",
    publishedAt: "Yesterday",
    reactions: 67,
    comments: [
      {
        id: 1,
        author: "Spec Fan",
        body: "A narrative spec is so much easier to review than a giant list.",
        publishedAt: "Yesterday",
      },
    ],
    accent: "mint",
  },
  {
    id: 4,
    title: "Open question: should drafts be signed?",
    excerpt:
      "A pseudonym protects the writer, but a signature creates accountability. Where should the line sit?",
    body: "I like anonymity because it makes a thought easier to test. But I wonder whether an idea grows better when someone is willing to stand beside it.\n\nMaybe the answer depends on the stage. Early drafts may need privacy. Mature arguments may need a name. The tricky part is designing a space where both can exist without forcing every post into the same social contract.",
    author: "Masked Reader",
    category: "Question",
    readTime: "2 min",
    publishedAt: "Yesterday",
    reactions: 33,
    comments: [
      {
        id: 1,
        author: "Anonymous",
        body: "Maybe signing should be a later step, not a requirement at creation.",
        publishedAt: "Yesterday",
      },
      {
        id: 2,
        author: "Draft Keeper",
        body: "This is a product question as much as a writing question.",
        publishedAt: "Yesterday",
      },
    ],
    accent: "sun",
  },
];

export function getPostById(id: string) {
  return initialPosts.find((post) => post.id.toString() === id);
}
