import { URL } from "url";

import sizeOf from "image-size";
import fetch from "node-fetch";
import { parse } from "node-html-parser";

const TYPE_SVG = "image/svg+xml";

export interface PageInfo {
  title: string | undefined;
  icons: Icon[];
}

export interface Icon {
  url: URL;
  size: number | null;
}

async function loadIcon(url: URL): Promise<Icon[]> {
  let response = await fetch(url);
  if (!response.ok) {
    return [];
  }

  let type = response.headers.get("Content-Type");
  if (!type) {
    return [];
  }

  if (!type.startsWith("image/")) {
    return [];
  }

  if (type == TYPE_SVG) {
    return [{
      url,
      size: null,
    }];
  }

  let icons: Icon[] = [];

  let buffer = await response.buffer();
  let size = sizeOf(buffer);
  for (let icon of size.images ?? [size]) {
    if (!icon.width || !icon.height) {
      continue;
    }

    icons.push({
      url,
      size: Math.max(icon.width, icon.height),
    });
  }

  return icons;
}

export async function loadPageInfo(pageUrl: URL): Promise<PageInfo> {
  let response = await fetch(pageUrl);
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  let html = await response.text();
  let root = parse(html);

  let icons: Icon[] = [];

  let elements = root.querySelectorAll("link[rel~=\"icon\"]");
  for (let link of elements) {
    let href = link.getAttribute("href");
    if (!href) {
      continue;
    }

    let url = new URL(href, pageUrl);
    icons = icons.concat(await loadIcon(url));
  }

  let favicon = new URL("/favicon.ico", pageUrl);
  icons = icons.concat(await loadIcon(favicon));

  let title = root.querySelector("title");

  return {
    title: title.textContent,
    icons,
  };
}
