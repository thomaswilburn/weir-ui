import ElementBase from "./lib/elementBase.js";
import events from "./lib/events.js";
import * as sanitize from "./lib/sanitize.js";

var formatOptions = {
  dateStyle: "medium",
  timeStyle: "medium"
}
var formatter = new Intl.DateTimeFormat("en-US", formatOptions);

class StoryRenderer extends ElementBase {
  static boundMethods = ["onSelect"];

  constructor() {
    super();
    events.on("story-select", this.onSelect);
  }

  onSelect(data) {
    console.log(data);
    var published = new Date(Date.parse(data.published));
    this.elements.metadata.removeAttribute("hidden");
    this.elements.feed.innerHTML = data.feed;
    this.elements.title.innerHTML = data.title;
    this.elements.author.innerHTML = data.author || "Nobody";
    this.elements.published.innerHTML = formatter.format(published);
    this.elements.content.innerHTML = sanitize.html(data.content, data.url);
  }
}

StoryRenderer.define("story-renderer", "story-renderer.html");