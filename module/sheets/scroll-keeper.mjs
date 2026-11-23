/** Keeps the scroll positions of an actor or item sheet across re-renders and tab changes. */
import { SCROLL_RESTORE_MS } from "../config/index.mjs";

/**
 * Keeps the scroll position of an actor sheet across re-renders and tab changes.
 *
 * A re-render replaces the HTML of the sheet's parts, which resets every scrolled element; switching tabs hides and shows them with the same result. The keeper remembers the position of each scrolled element, keyed by the tab it is in plus its path of child indexes, and puts the positions back after the render.
 */
export default class ScrollKeeper {

  /** @param {ApplicationV2} app the actor or item sheet */
  constructor(app) {
    this.app = app;
    this.positions = new Map();
    this.revision = 0;
    this.restoring = false;
  }

  get root() {
    return this.app.element instanceof HTMLElement ? this.app.element : null;
  }

  /** Id of the tab panel (data-tab, else its first unrelated class, else its id). */
  static tabId(tab) {
    return tab?.dataset.tab
      || [...(tab?.classList ?? [])].find(c => !["tab", "active", "scrollable"].includes(c))
      || tab?.id
      || "none";
  }

  #currentTab(root) {
    return ScrollKeeper.tabId(root.querySelector(".tab.active"));
  }

  /** Stable key of an element: its tab (or the shared frame of the current tab) and its child-index path. */
  #key(root, element) {
    const tab = element.closest(".tab");
    const base = tab && root.contains(tab) ? tab : root;
    const group = base === root ? `shared:${this.#currentTab(root)}` : `tab:${ScrollKeeper.tabId(tab)}`;
    const path = [];
    for (let node = element; node !== base; node = node.parentElement) {
      if (!node?.parentElement) return null;
      path.unshift([...node.parentElement.children].indexOf(node));
    }
    return `${group}|${path.join(".")}`;
  }

  /** Remember the position of one element if it is visible and really scrolls. */
  remember(element) {
    const root = this.root;
    if (!(element instanceof HTMLElement) || !root || (element !== root && !root.contains(element))) return;
    if (!element.getClientRects().length) return;
    if (element.scrollHeight <= element.clientHeight + 1 && element.scrollWidth <= element.clientWidth + 1) return;
    const key = this.#key(root, element);
    if (key !== null) this.positions.set(key, [element.scrollTop, element.scrollLeft]);
  }

  /** Remember every scrolled element of the sheet (call before a render or a tab change). */
  capture() {
    const root = this.root;
    if (!root) return;
    for (const element of [root, ...root.querySelectorAll("*")]) this.remember(element);
  }

  #restore() {
    const root = this.root;
    if (!root) return;
    for (const element of [root, ...root.querySelectorAll("*")]) {
      if (!element.getClientRects().length) continue;
      const saved = this.positions.get(this.#key(root, element));
      if (saved) [element.scrollTop, element.scrollLeft] = saved;
    }
  }

  /** Put the positions back now, after the next two frames and after 100 ms (late layout); a newer call cancels the older ones. */
  afterRender() {
    if (!this.root) return;
    const revision = ++this.revision;
    this.restoring = true;
    const apply = () => { if (this.revision === revision) this.#restore(); };
    apply();
    requestAnimationFrame(() => requestAnimationFrame(apply));
    setTimeout(() => {
      apply();
      if (this.revision === revision) this.restoring = false;
    }, SCROLL_RESTORE_MS);
  }

  /** Track scrolling inside the sheet (scroll events do not bubble, so listen in the capture phase). */
  listen() {
    this.root?.addEventListener("scroll", (event) => {
      if (!this.restoring) this.remember(event.target);
    }, true);
  }
}
