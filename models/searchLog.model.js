import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  query: { type: String, required: true },
  filtersApplied: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

export const SearchLog = mongoose.model("SearchLog", searchLogSchema);
