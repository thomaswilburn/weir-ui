import ElementBase from "./lib/elementBase.js";

class StoryEntry extends ElementBase {

  static boundMethods = ["onClick"];

  constructor() {
    super();
    this.elements.link.addEventListener("click", this.onClick);
  }

  static template = `
<style>
[as=feed] {
  font-size: 80%;
  opacity: .8;
}

[as=story] {

}
</style>
<a as="link">
  <div as="feed">
    <slot name="feed"></slot>
  </div>
  <div as="story">
    <slot name="title"></slot>
  </div>
</a>
  `;

  static observedAttributes = ["story", "feed", "story"];
  static mirroredProps = ["story", "feed"];

  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "story":
        this.elements.link.href = value;
      break;

      case "feed":
        this.elements.feed.innerHTML = value;
      break;
    }
  }

  onClick(e) {
    e.preventDefault();
    this.dispatch("story-click");
  }

}

StoryEntry.define("story-entry");