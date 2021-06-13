import ElementBase from "./lib/elementBase.js";
import { get, post } from "./lib/api.js";
import events from "./lib/events.js";
import h from "./lib/dom.js";

import "./story-entry.js";

const CHECK_INTERVAL = 2 * 60 * 1000;

class StoryList extends ElementBase {

  static boundMethods = ["onSelect", "updateCounts", "getStories", "getCounts"];

  constructor() {
    super();

    this.stories = [];
    this.addEventListener("story-click", this.onSelect);

    events.on("stream:counts", this.updateCounts);
    events.on("connection:established", this.getStories);

    this.timeout = null;
    this.selected = null;
  }

  connectedCallback() {
    this.getStories();
    window.setTimeout(this.getCounts, CHECK_INTERVAL);
  }

  async getCounts() {
    // cancel any pending timeout
    if (this.timeout) window.clearTimeout(this.timeout);
    // schedule the next check
    this.timeout = window.setTimeout(this.getCounts, CHECK_INTERVAL);
    // actually get the counts
    var response = await get("/stream/status");
    var { total, unread, items } = response;
    events.fire("stream:counts", { total, unread });
  }

  async getStories() {
    var response = await get("/stream/unread", { limit: 10 });
    var { total, unread, items } = response;
    events.fire("stream:counts", { total, unread });
    this.updateStoryList(items);
  }

  updateStoryList(items) {
    var listed = items.map(item => {
       return h("story-entry", {
        story: item.id,
      }, [
        h("span", { slot: "feed" }, item.feed),
        h("span", { slot: "title" }, item.title)
      ]);
    });

    this.replaceChildren(...listed);

    this.stories = items;
    this.selectStory(items[0]);
  }

  onSelect(e) {
    var matching = this.stories.find(s => s.id == e.target.story);
    if (!matching) return;
    this.selectStory(matching);
  }

  selectStory(story) {
    this.selected = story;
    events.fire("stream:selected", story);
    for (var c of this.children) {
      c.classList.toggle("selected", c.story == story.id);
    }
  }

  updateCounts(e) {
    var { unread, total } = e;
    this.elements.unread.innerHTML = unread;
    this.elements.total.innerHTML = total;

    document.title = `Weir (${unread})`;
  }
}

StoryList.define("story-list", "story-list.html");