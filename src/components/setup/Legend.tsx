import styles from "@/app/setup/setup.module.scss";

export function Legend() {
  return (
    <ul className={styles.details} data-details>
      <li className={styles.detailsBlock} data-details-block="languages">
        <h3 className={styles.detailsHeading}>languages</h3>
        <p className={styles.detailsText}>
          c, c++, rust, go, typescript, javascript, python, shell, plus a few
          more{" "}
          <a className={styles.link} href="https://github.com/dummy3ye">
            on github
          </a>
          .
        </p>
      </li>

      <li className={styles.detailsBlock} data-details-block="compilers">
        <h3 className={styles.detailsHeading}>compilers and build</h3>
        <p className={styles.detailsText}>
          clang and llvm first, then rustc, gc, cmake, ninja, make, cargo.
        </p>
      </li>

      <li className={styles.detailsBlock} data-details-block="debug">
        <h3 className={styles.detailsHeading}>debug and kernel</h3>
        <p className={styles.detailsText}>
          gdb, lldb. for the kernel: qemu, virtme-ng, kselftest, b4, git
          send-email. works from mainline, linux-next and stable.
        </p>
      </li>

      <li className={styles.detailsBlock} data-details-block="runtimes">
        <h3 className={styles.detailsHeading}>runtimes</h3>
        <p className={styles.detailsText}>bun, next.js, vite.</p>
      </li>

      <li
        className={`${styles.detailsBlock} ${styles.detailsWide}`}
        data-details-block="systems"
      >
        <h3 className={styles.detailsHeading}>systems</h3>
        <p className={styles.detailsText}>
          arch (hyprland, kitty, fish, neovim with my own config), ubuntu, win11
          (wsl, visual studio for game and graphics dev, embedded toolchains).
        </p>
      </li>
    </ul>
  );
}
