import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ResearchCover } from "./ResearchCover";

const meta = {
  title: "Research/Cover",
  component: ResearchCover,
  args: { aspectRatio: "4 / 5" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ResearchCover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cream: Story = {
  args: {
    cover: { bg: "cream", shapes: ["blue-large", "ink-small"] },
  },
};

export const Blue: Story = {
  args: {
    cover: { bg: "blue", shapes: ["red-small", "sage-large"] },
  },
};

export const Wide: Story = {
  args: {
    cover: { bg: "sage", shapes: ["blue-small", "red-small"] },
    aspectRatio: "21 / 9",
  },
};
