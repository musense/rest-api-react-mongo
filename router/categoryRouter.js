const express = require("express");
const Categories = require("../model/categories");
const Sitemap = require("../model/sitemap");

const categoryRouter = new express.Router();

async function parseCategoryName(req, res, next) {
  let category = req.body.name;
  let upperCategory = req.body.upperCategory;

  let existingCategory;
  if (
    req.method === "POST" ||
    (req.method === "PATCH" && category && upperCategory)
  ) {
    existingCategory = await Categories.findOne({
      name: category,
      upperCategory: upperCategory,
    }).select("-_id name upperCategory");
  }
  if (existingCategory && req.method === "POST") {
    res.status(400).send({ message: "The category name already exists." });
    return;
  }
  if (!existingCategory && req.method === "PATCH") {
    res.status(400).send({ message: "Category name error." });
    return;
  }

  res.name = category;
  res.upperCategory = upperCategory;
  next();
}

function parseRequestBody(req, res, next) {
  const { headTitle, headKeyword, headDescription, originalUrl, manualUrl } =
    req.body;

  res.originalUrl = originalUrl;
  res.headTitle = headTitle ?? null;
  res.headKeyword = headKeyword ?? null;
  res.headDescription = headDescription ?? null;
  res.manualUrl = manualUrl ?? null;

  next();
}

function isPositiveInteger(input) {
  return typeof input === "number" && Number.isInteger(input) && input > 0;
}

function parseQuery(req, res, next) {
  let pageNumber = req.query.pageNumber;
  let limit = req.query.limit;

  if (pageNumber !== undefined) {
    pageNumber = parseInt(pageNumber, 10);
    if (!isPositiveInteger(pageNumber)) {
      return res.status(400).send({
        message: "Invalid pageNumber. It must be a positive integer.",
      });
    }
  }
  if (limit !== undefined) {
    limit = parseInt(limit, 10);
    if (!isPositiveInteger(limit)) {
      return res.status(400).send({
        message: "Invalid limit. It must be a positive integer.",
      });
    }
  }

  req.pageNumber = pageNumber;
  req.limit = limit;
  next();
}

async function getCategory(req, res, next) {
  const id = req.params.id;

  let category;
  try {
    category = await Categories.findOne({ _id: id }).select(
      "-updatedAt -createdAt -__v"
    );
    if (category === undefined) {
      return res.status(404).json({ message: "can't find editor!" });
    }
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
  res.category = category;
  next();
}

//Menubar列出上層文章分類與子分類
categoryRouter.get("/categories/upper_category", async (req, res) => {
  try {
    const categories = await Categories.find().select("name upperCategory");
    const upperCategories = {};

    categories.forEach((category) => {
      const upperCategory = category.upperCategory;
      if (!upperCategories[upperCategory]) {
        upperCategories[upperCategory] = [];
      }
      upperCategories[upperCategory].push({
        _id: category._id,
        name: category.name,
      });
    });

    const result = {
      data: upperCategories,
    };

    res.send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

//點選上層分類後列出子分類所有文章
categoryRouter.get("/categories/:upperCategory", async (req, res) => {
  const upperName = req.params.upperCategory;
  try {
    const categoriesName = await Categories.find({
      upperCategory: upperName,
    }).select("-_id name");

    const totalDocs = await Categories.countDocuments({
      upperCategory: upperName,
    }).exec();

    const result = {
      data: categoriesName,
      totalCount: totalDocs,
    };

    res.send(result);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

//後台文章分類編輯處列出所有文章分類
categoryRouter.get("/categories", parseQuery, async (req, res) => {
  try {
    const { pageNumber, limit } = req;
    const skip = pageNumber ? (pageNumber - 1) * 10 : 0;

    const allCategories = await Categories.find()
      .select("-__v")
      .skip(skip)
      .limit(limit);

    const totalDocs = await Categories.countDocuments().exec();
    const result = {
      data: allCategories,
      totalCount: totalDocs,
      totalPages: Math.ceil(totalDocs / limit),
      limit: limit,
      currentPage: pageNumber,
    };
    res.send(result);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

//新增文章分類
categoryRouter.post(
  "/categories",
  parseRequestBody,
  parseCategoryName,
  async (req, res) => {
    const {
      headTitle,
      headKeyword,
      headDescription,
      name,
      upperCategory,
      originalUrl,
      manualUrl,
    } = res;

    let message = "";
    if (name === null) {
      message += "name is required\n";
    }
    if (upperCategory === null) {
      message += "upperCategory is required\n";
    }
    if (originalUrl === "") {
      message += "originalUrl is required\n";
    }
    if (message) {
      res.status(400).send({ message });
    }

    try {
      const newCategory = new Categories({
        headTitle,
        headKeyword,
        headDescription,
        name,
        upperCategory,
        originalUrl,
        manualUrl,
      });

      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }
);

categoryRouter.patch(
  "/categories/:id",
  parseRequestBody,
  parseCategoryName,
  getCategory,
  async (req, res) => {
    const {
      headTitle,
      headKeyword,
      headDescription,
      name,
      upperCategory,
      manualUrl,
    } = res;

    if (name) res.category.name = name;
    if (upperCategory) res.category.upperCategory = upperCategory;
    if (headTitle) res.category.headTitle = headTitle;
    if (headKeyword) res.category.headKeyword = headKeyword;
    if (headDescription) res.category.headDescription = headDescription;
    if (manualUrl) res.category.manualUrl = manualUrl;

    // console.log(res.category);
    try {
      const updateCategory = await res.category.save();
      res.status(201).json(updateCategory);
    } catch (e) {
      res.status(500).send({ message: e.message });
    }
  }
);

categoryRouter.delete("/categories/bunchDeleteByIds", async (req, res) => {
  try {
    const ids = req.body.ids;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid data." });
    }

    const existingCategories = await Categories.find({
      _id: { $in: ids },
    }).select("_id");

    if (existingCategories.length !== ids.length) {
      return res
        .status(400)
        .json({ message: "Some of the provided Category IDs do not exist." });
    }

    const deleteCategories = await Categories.deleteMany({
      _id: { $in: ids },
    });
    if (deleteCategories.deletedCount === 0) {
      return res.status(404).json({ message: "No matching Category found" });
    }

    res.status(200).json({
      message: `Deleted ${deleteCategories.deletedCount} categories successfully!`,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = categoryRouter;
