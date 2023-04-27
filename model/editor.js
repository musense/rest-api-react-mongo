const mongoose = require("mongoose");

const editorSchema = mongoose.Schema(
  {
    serialNumber: {
      type: Number,
      trim: true,
      unique: true,
      required: true,
      default: 0,
    },
    headTitle: {
      type: String,
      trim: true,
    },
    headKeyword: {
      type: String,
      trim: true,
    },
    headDescription: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    content: {
      type: Array,
      trim: true,
      required: true,
    },
    htmlContent: {
      type: String,
      trim: true,
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "categories",
        trim: true,
      },
    ],
    originalUrl: {
      type: String,
      trim: true,
    },
    manualUrl: {
      type: String,
      trim: true,
    },
    altText: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tags",
        trim: true,
      },
    ],
    pageView: {
      type: Number,
      trim: true,
      default: 0,
    },
    topSorting: {
      type: Number,
      trim: true,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    recommendSorting: {
      type: Number,
      trim: true,
    },
    popularSorting: {
      type: Number,
      trim: true,
    },
    homeImagePath: {
      type: String,
      trim: true,
    },
    contentImagePath: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Editor = mongoose.model("editor", editorSchema);

module.exports = Editor;
