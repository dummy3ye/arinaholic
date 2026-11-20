import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ResearchMeta } from "@/lib/research";
import { ResearchCard } from "./ResearchCard";

const item = {
  slug: "example-research-one",
  title: "A tiny kernel fix with a long tail",
  summary: "What a five-line patch taught us about sleeping in probe paths.",
  date: "2026-10-12",
  category: "kernel",
  tags: ["kernel", "debugging"],
  status: "published",
  span: 1,
  offset: 0,
  cover: { bg: "blue", shapes: ["red-small", "sage-large"] },
  links: [],
} satisfies ResearchMeta;

const meta = {
  title: "Research/Card",
  component: ResearchCard,
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 620 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResearchCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: { item },
};

export const Wide: Story = {
  args: {
    item: {
      ...item,
      span: 2,
      title: "Mapping a terminal from the scrollback up",
    },
  },
};
