import ElementBase from "./lib/elementBase.js";
import { get, post } from "./lib/api.js";
import events from "./lib/events.js";
import h from "./lib/dom.js";

import "./story-entry.js";
import "./action-button.js";

const CHECK_INTERVAL = 2 * 60 * 1000;

class StoryList extends ElementBase {
  static boundMethods = [
    "onSelect",
    "updateCounts",
    "getStories",
    "getCounts",
    "markAll",
    "selectOffset"
  ];

  constructor() {
    super();

    this.stories = [];
    this.addEventListener("story-click", this.onSelect);

    events.on("stream:counts", this.updateCounts);
    events.on("connection:established", this.getStories);

    events.on("stream:refresh", this.getStories);
    events.on("stream:mark-all", this.markAll);

    events.on("stream:next", () => this.selectOffset(1));
    events.on("stream:previous", () => this.selectOffset(-1));

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
    events.fire("stream:loading");
    this.elements.refreshButton.classList.add("working");
    this.elements.refreshButton.disabled = true;
    try {
      var response = await get("/stream/unread", { limit: 10 });
      var { total, unread, items } = response;
      events.fire("stream:counts", { total, unread });
      this.updateStoryList(items);
    } catch (err) {
      // throw a status toast if it fails
    }
    this.elements.refreshButton.disabled = false;
    this.elements.refreshButton.classList.remove("working");
  }

  async markAll() {}

  updateStoryList(items) {
    var listed = items.map((item) => {
      return h(
        "story-entry",
        {
          story: item.id,
        },
        [
          h("span", { slot: "feed" }, item.feed),
          h("span", { slot: "title" }, item.title),
        ]
      );
    });

    this.replaceChildren(...listed);

    this.stories = items;
    this.selectStory(items[0]);
  }

  onSelect(e) {
    var matching = this.stories.find((s) => s.id == e.target.story);
    if (!matching) return;
    this.selectStory(matching);
  }

  selectStory(story) {
    this.selected = story;
    events.fire("reader:render", story);
    for (var c of this.children) {
      var selected = c.story == story.id;
      c.classList.toggle("selected", selected);
      if (selected) c.scrollIntoView({ block: "nearest" });
    }
  }

  selectOffset(offset = 1) {
    if (!this.selected) return;
    var currentIndex = this.stories.indexOf(this.selected);
    if (currentIndex == -1) return;
    var index = currentIndex + offset;
    if (index >= this.stories.length) {
      return this.markAll();
    }
    if (index < 0) return;
    var shifted = this.stories[index];
    this.selectStory(shifted);
  }

  updateCounts(e) {
    var { unread, total } = e;
    this.elements.unread.innerHTML = unread;
    this.elements.total.innerHTML = total;

    document.title = `Weir (${unread})`;
  }
}

StoryList.define("story-list", "story-list.html");
