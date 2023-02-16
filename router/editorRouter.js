const express = require("express");
const { json2html } = require("html2json");
const Editor = require("../model/editor");
const html2json = require("html2json").html2json;

const editorRouter = new express.Router();

// *simulate delay situation in real world
// editorRouter.use(function (req, res, next) {
//     console.time('simulate get editor delay...')
//     setTimeout(() => {
//         next()
//         console.timeEnd('simulate get editor delay...')
//     }, 0 * 1000)
// })

function parseTitle(req, res, next) {
  const title = req.body.title ?? null;
  if (typeof title === null) {
    res.title = null;
    next();
    return;
  }
  res.title = title;
  next();
}

function parseTags(req, res, next) {
  // console.log(req.body.tags)
  if (!req.body.tags) {
    res.tags = "";
    next();
    return;
  }
  const tags = req.body.tags;
  const tagArr = (tags + "").split(",");
  res.tags = [];
  tagArr.map((tag) => {
    const t = tag.trim();
    res.tags.push(t);
  });
  next();
}

function parseHTML(req, res, next) {
  if (!req.body.content) {
    res.jsonDataString = "";
    next();
    return;
  }
  const content = req.body.content;
  const jsonData = html2json(content);
  const jsonDataString = JSON.stringify(jsonData);
  // console.log(JSON.stringify(jsonDataString))
  res.jsonDataString = jsonDataString;
  next();
}

function parseJSON(req, res, next) {
  if (res.editor.constructor === Array) {
    res.editor
      .filter((edit) => edit.content !== null)
      .map((edit) => {
        const jsonDataObject = JSON.parse(edit.content);
        const htmlData = json2html(jsonDataObject);
        edit.content = htmlData;
      });
  } else if (typeof res.editor === "object") {
    if (!res.editor.content) {
      res.editor.content = "";
      next();
      return;
    }
    const content = res.editor.content;
    const jsonDataObject = JSON.parse(content);
    const htmlData = json2html(jsonDataObject);

    res.editor.content = htmlData;
  }

  next();
}

async function getEditor(req, res, next) {
  const id = req.params.id;
  // console.log(`getEditor req.params.id: ${req.params.id}`)
  // console.log(req)

  let editor;
  try {
    editor = await Editor.findOne({ _id: id });
    // return res.json(editor)
    if (editor == undefined) {
      return res.status(404).json({ message: "can't find editor!" });
    }
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
  res.editor = editor;
  next();
}

async function getEditorByTitle(req, res, next) {
  const title = req.params.title;
  console.log(title);
  // console.log(req)

  let editor;
  try {
    editor = await Editor.findOne({ title });
    // return res.json(editor)
    if (editor == undefined) {
      return res.status(404).json({ message: "can't find editor!" });
    }
  } catch (e) {
    return res.status(500).send({ message: e.message });
  }
  res.editor = editor;
  next();
}

async function getAllEditor(req, res, next) {
  try {
    const editor = await Editor.find({}).select("-__v -id -thumbUp");

    res.editor = editor;
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
  next();
}

editorRouter.get("/editor", getAllEditor, parseJSON, async (req, res) => {
  const { editor: editorList } = res;
  try {
    res.send(editorList);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

// *get only title & _id field
editorRouter.get("/editor/title", async (req, res) => {
  try {
    const editor = await Editor.find({}).select("id title updatedAt");
    // .limit(10)
    // .sort({ id: 1 })
    res.send(editor);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

// editorRouter.get('/editor/:id'
//     , getEditor
//     , parseJSON
//     , async (req, res, next) => {

//         res.send(res.editor)
//     })

editorRouter.get(
  "/editor/:id",
  getEditor,
  parseJSON,
  async (req, res, next) => {
    res.send(res.editor);
  }
);

editorRouter.patch(
  "/editor/:id",
  parseTitle,
  parseTags,
  parseHTML,
  getEditor,
  async (req, res) => {
    const { title, tags, jsonDataString } = res;

    if (title) res.editor.title = title;
    if (jsonDataString) res.editor.content = jsonDataString;
    if (tags) res.editor.tags = [...tags];

    console.log(res.editor.title);
    console.log(res.editor.content);
    console.log(res.editor.tags);

    try {
      const updateEditor = await res.editor.save();
      res.json(updateEditor);
    } catch (e) {
      res.status(500).send({ message: e.message });
    }
  }
);

editorRouter.post(
  "/editor",
  parseTitle,
  parseTags,
  parseHTML,
  async (req, res, next) => {
    let message = "";
    const { title, tags, jsonDataString } = res;
    if (title === null) {
      message += "title is required\n";
    }
    if (jsonDataString === null) {
      message += "content is required\n";
    }
    if (message) {
      res.status(400).send({ message });
    } else {
      // const editor = new Editor();
      const id =
        (await Editor.find({}).select("-_id id").sort({ id: -1 }))[0]["id"] + 1;

      const editor = new Editor({
        id,
        title,
        content: jsonDataString,
        tags,
      });
      try {
        const saveEditor = await editor.save();

        res.status(201).json({
          _id: saveEditor._id,
          id,
          title,
          content: req.body.content,
          tags,
        });
      } catch (e) {
        return res.status(500).send({ message: e.message });
      }
    }
  }
);

editorRouter.post("/editor/like/:id", getEditor, async (req, res) => {
  if (!(req.body.thumbUp && req.body.thumbUp === "LIKE+1")) {
    res.status(400).send({ message: "format not correct" });
    return;
  }
  try {
    res.editor.thumbUp = res.editor.thumbUp + 1;
    const saveEditor = await res.editor.save();
    res.status(201).json(saveEditor.thumbUp);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

editorRouter.delete(
  "/editor/bunchDeleteByIds",
  // , getEditor
  async (req, res) => {
    try {
      // console.log(req.body.ids)
      await Editor.deleteMany({ _id: req.body.ids });
      res.status(201).json({ message: "Delete editor successful!" });
    } catch (e) {
      res.status(500).send({ message: e.message });
    }
  }
);

editorRouter.delete("/editor/:id", async (req, res) => {
  try {
    await Editor.deleteOne({ _id: req.body.id });
    res.json({ message: "Delete editor successful!" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

editorRouter.delete("/editor/:title", async (req, res) => {
  try {
    await Editor.deleteOne({ title: req.body.title });
    res.json({ message: "Delete editor successful!" });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});
module.exports = editorRouter;
