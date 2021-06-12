import ElementBase from "./lib/elementBase.js";
import { get, post } from "./lib/api.js";
import events from "./lib/events.js";
import h from "./lib/dom.js";

import "./story-entry.js";

class StoryList extends ElementBase {

  static boundMethods = ["onSelect", "updateCounts", "getStories"];

  constructor() {
    super();

    this.stories = [];
    this.getStories();
    this.addEventListener("story-click", this.onSelect);

    events.on("counts", this.updateCounts);
    events.on("connection-established", this.getStories);
  }

  async getStories() {
    var response = await get("/stream/unread", { limit: 10 });
    if (response.challenge) {
      return events.fire("totp-challenge");
    }
    var { total, unread, items } = response;
    events.fire("counts", { total, unread })
    this.updateStoryList(items);
  }

  updateStoryList(items) {
    this.innerHTML = items.length ? "" : "No unread items";
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

  updateCounts(e) {
    var { unread, total } = e;
    this.elements.unread.innerHTML = unread;
    this.elements.total.innerHTML = total;
  }
}

StoryList.define("story-list", "story-list.html");