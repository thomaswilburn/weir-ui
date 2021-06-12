import ElementBase from "./lib/elementBase.js";
import events from "./lib/events.js";

class StoryRenderer extends ElementBase {
  static boundMethods = ["onSelect"];

  constructor() {
    super();
    events.on("story-select", this.onSelect);
  }

  onSelect(data) {
    console.log(data);
    this.elements.feed.innerHTML = data.feed;
    this.elements.title.innerHTML = data.title;
    this.elements.content.innerHTML = data.content;
  }

  static template = `
<h4 as="feed"></h4>
<h3 as="title"></h3>

<div as="content"></div>
  `
}

StoryRenderer.define("story-renderer");