import type { Preview } from "@storybook/nextjs-vite";
import "../src/styles/globals.css";
import "../src/styles/styles.scss";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
