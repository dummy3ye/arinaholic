import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Shapes } from "./Shapes";

const meta = {
  title: "Decor/Shapes",
  component: Shapes,
  decorators: [
    (Story) => (
      <div style={{ minHeight: 320, overflow: "hidden", position: "relative" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Shapes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  args: { route: "home" },
};

export const Contact: Story = {
  args: { route: "contact" },
};
