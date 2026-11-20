// Main projects shown on /works, straight from the GitHub API plus linguist
// colors, fetched 2026-11-20. Language entries are the top entries of each
// repository's languages endpoint, sorted by bytes; no stars, no forks.
type WorkLanguage = { name: string; color: string };

export type WorkProject = {
  name: string;
  href: string;
  title: string;
  summary?: string;
  languages: WorkLanguage[];
};

export const mainProjects: WorkProject[] = [
  {
    name: "postharvest",
    href: "https://github.com/teampostharvest/postharvest",
    title: "harvest posts from any public facebook instance.",
    languages: [
      { name: "python", color: "#3572A5" },
      { name: "typescript", color: "#3178c6" },
      { name: "html", color: "#e34c26" },
      { name: "go", color: "#00ADD8" },
      { name: "css", color: "#663399" },
    ],
  },
  {
    name: "blackholegl",
    href: "https://github.com/dummy3ye/blackholegl",
    title: "a simulation of gargantua.",
    summary: "in c++ and opengl.",
    languages: [
      { name: "c++", color: "#f34b7d" },
      { name: "cmake", color: "#DA3434" },
      { name: "powershell", color: "#012456" },
      { name: "makefile", color: "#427819" },
      { name: "shell", color: "#89e051" },
    ],
  },
  {
    name: "lostdock",
    href: "https://github.com/dummy3ye/lostdock",
    title: "a gui dorking tool.",
    summary: "made for osint.",
    languages: [
      { name: "python", color: "#3572A5" },
      { name: "shell", color: "#89e051" },
      { name: "makefile", color: "#427819" },
    ],
  },
  {
    name: "yanker",
    href: "https://github.com/dummy3ye/yanker",
    title: "download videos from youtube.",
    summary: "from a single tui. 500+ other sites included.",
    languages: [
      { name: "typescript", color: "#3178c6" },
      { name: "shell", color: "#89e051" },
      { name: "javascript", color: "#f1e05a" },
    ],
  },
  {
    name: "topscreen",
    href: "https://github.com/dummy3ye/topscreen",
    title: "a tool for screens over adb and scrcpy.",
    summary:
      "made for win, linux and macos. has a gui and press feature on the screen.",
    languages: [
      { name: "python", color: "#3572A5" },
      { name: "go", color: "#00ADD8" },
      { name: "powershell", color: "#012456" },
      { name: "batchfile", color: "#C1F12E" },
    ],
  },
  {
    name: "anily",
    href: "https://github.com/dummy3ye/anily",
    title: "a blazing fast tui for watching anime.",
    summary: "in rust.",
    languages: [
      { name: "rust", color: "#dea584" },
      { name: "makefile", color: "#427819" },
      { name: "nix", color: "#7e7eff" },
      { name: "shell", color: "#89e051" },
    ],
  },
  {
    name: "flamerjs",
    href: "https://github.com/dummy3ye/flamer",
    title: "a fast sanity checker for ai-assisted codebases.",
    languages: [
      { name: "typescript", color: "#3178c6" },
      { name: "rust", color: "#dea584" },
      { name: "c++", color: "#f34b7d" },
      { name: "shell", color: "#89e051" },
      { name: "javascript", color: "#f1e05a" },
    ],
  },
];

// The leftover smaller repos, held until the owner decides which stay.
export const smallProjects = [
  {
    name: "notebook",
    href: "https://github.com/dummy3ye/notebook",
    summary:
      "scientific publishing. built with bun, next.js, marked and katex.",
  },
  {
    name: "shell",
    href: "https://github.com/dummy3ye/shell",
    summary:
      "my desktop shell. my own mix of caelestia shell — a fluid, morphing shell for the linux desktop.",
  },
  {
    name: "waytosea",
    href: "https://github.com/dummy3ye/waytosea",
    summary: "a pastel theme. based on a stormy sea.",
  },
  {
    name: "libcreate",
    href: "https://github.com/dummy3ye/libcreate",
    summary: "finally adds an “e” to the unix creat().",
  },
  {
    name: "prism",
    href: "https://github.com/dummy3ye/prism",
    summary: "a pretty, cozy and frosty neovim configuration.",
  },
  {
    name: "forest",
    href: "https://github.com/dummy3ye/forest",
    summary:
      "an idle, moving 2d forest written in c. for any cli from pwsh to bash and zsh.",
  },
];
