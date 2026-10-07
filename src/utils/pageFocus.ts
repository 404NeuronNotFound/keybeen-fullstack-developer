/** Announce the destination without disrupting its restored scroll position. */
export function focusPageHeading(main: HTMLElement, preventScroll = true) {
  const target = main.querySelector<HTMLElement>('h1') ?? main;
  target.tabIndex = -1;
  target.focus({ preventScroll });
}
