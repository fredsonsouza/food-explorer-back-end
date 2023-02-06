import axios from "axios";
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3333",
});

api.get.get("/users/id");
