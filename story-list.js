import ElementBase from "./lib/elementBase.js";
import { get, post } from "./lib/api.js";
import events from "./lib/events.js";
import h from "./lib/dom.js";

import "./story-entry.js";

class StoryList extends ElementBase {

  static boundMethods = ["onSelect"];

  constructor() {
    super();

    this.stories = [];
    this.getStories();
    this.addEventListener("story-click", this.onSelect);
  }

  async getStories() {
    var { total, unread, items } = await get("/stream/unread", { limit: 10 });
    events.fire("counts", { total, unread })
    this.innerHTML = "";
    items.forEach(item => {
      this.appendChild(h("story-entry.test", {
        story: item.id,
      }, [
        h("span", { slot: "feed" }, item.feed),
        h("span", { slot: "title" }, item.title)
      ]));
    });

    this.stories = items;
  }

  onSelect(e) {
    var matching = this.stories.find(s => s.id == e.target.story);
    events.fire("story-select", matching);
  }
}

StoryList.define("story-list");