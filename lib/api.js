import config from "../config.js";
import { fire } from "./events.js";

var { endpoint } = config;

export var get = async function(path, params = {}) {
  var url = new URL(endpoint + "/" + path);
  for (var k in params) {
    url.searchParams.set(k, params[k]);
  }
  var response = await fetch(url.toString(), { credentials: "include" });
  return response.json();
}

export var post = async function(path, data) {
  var url = new URL(endpoint + "/" + path);
  var response = await fetch(url.toString(), {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include"
  });
  return response.json();
}