import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Hero } from "./Hero";

const meta = {
  title: "Content/Hero",
  component: Hero,
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "say hi.",
    lede: "email is best for kernel and project questions.",
  },
};

export const Small: Story = {
  args: {
    title: "works.",
    lede: "drivers, terminals and painful debugging.",
    small: true,
  },
};
