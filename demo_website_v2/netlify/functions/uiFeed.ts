import { proxyUI, NetlifyEvent } from "./_lib/uiProxy";

export async function handler(event: NetlifyEvent) {
  return proxyUI(event, "/ui/feed");
}
