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
      event.preventDefault();
      pushUrl(currentTarget.href);
      return;
    }

    currentTarget = currentTarget.parentElement;
  }
}

export function pushUrl(url: URL | string): void {
  if (typeof url == "string") {
    url = new URL(url, document.documentURI);
  }

  let {
    pathname,
    search,
  } = url;

  let to: To = {
    pathname,
    search: search.length > 1 ? search : "",
  };

  history.push(to);
}

export function replaceUrl({ pathname, search }: URL): void {
  let to: To = {
    pathname,
    search: search.length > 1 ? search : "",
  };

  history.replace(to);
}
