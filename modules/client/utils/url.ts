import type { To } from "history";
import { createBrowserHistory } from "history";

export const history = createBrowserHistory();

export function pushClickedLink(event: React.MouseEvent<HTMLElement>): void {
  if (event.button != 0) {
    return;
  }

  let currentTarget: HTMLElement | null = event.currentTarget;
  while (currentTarget) {
    if (currentTarget instanceof HTMLAnchorElement) {
      let page = new URL(document.documentURI);
      let target = new URL(currentTarget.href, page);
      if (page.origin != target.origin) {
        return;
      }

      event.preventDefault();
      pushUrl(target);
    }

    currentTarget = currentTarget.parentElement;
  }
}

export function pushUrl(url: URL | string): void {
  if (!(url instanceof URL)) {
    url = new URL(url);
  }

  let { pathname, search } = url;

  let to: To = {
    pathname,
    search: search.length > 1 ? search : "",
  };

  history.push(to);
}

export function replaceUrl(url: URL | string): void {
  if (!(url instanceof URL)) {
    url = new URL(url);
  }

  let to: To = {
    pathname: url.pathname,
    search: url.search.length > 1 ? url.search : "",
  };

  history.replace(to);
}
