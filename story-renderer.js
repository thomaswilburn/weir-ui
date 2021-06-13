import ElementBase from "./lib/elementBase.js";
import events from "./lib/events.js";
import * as sanitize from "./lib/sanitize.js";

var formatOptions = {
  dateStyle: "medium",
  timeStyle: "medium"
}
var formatter = new Intl.DateTimeFormat("en-US", formatOptions);

class StoryRenderer extends ElementBase {
  static boundMethods = ["onSelect", "onShare", "onOpen"];

  constructor() {
    super();
    events.on("reader:render", this.onSelect);
    events.on("reader:share", this.onShare);
    events.on("reader:open-tab", this.onOpen);
    this.current = null;
    this.placeholder = this.elements.content.innerHTML;
  }

  clear() {
    this.current = null;
    this.elements.metadata.toggleattribute("hidden", true);
    this.elements.title.innerHTML = "";
    this.elements.content.innerHTML = this.placeholder;
  }

  onSelect(data) {
    this.current = data;
    var published = new Date(Date.parse(data.published));
    this.elements.metadata.removeAttribute("hidden");
    this.elements.feed.innerHTML = data.feed;
    this.elements.title.innerHTML = data.title;
    this.elements.author.innerHTML = data.author || "Nobody";
    this.elements.published.innerHTML = formatter.format(published);
    this.elements.content.innerHTML = sanitize.html(data.content, data.url);
    this.scrollTop = 0;
    this.scrollIntoView({ behavior: "smooth" });
    this.elements.title.focus({ preventScroll: true });
  }

  onShare() {
    if (!this.current) return;
    if (!("share" in navigator)) return;
    var { url, title } = this.current;
    navigator.share({ url, title });
  }

  onOpen() {
    if (!this.current) return;
    var { url } = this.current;
    window.open(url, "_blank");
  }
}

StoryRenderer.define("story-renderer", "story-renderer.html");