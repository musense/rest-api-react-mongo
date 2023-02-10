const express = require("express");
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

function parseHTML(htmlData) {
  const jsonData = html2json(htmlData);
  // console.log(jsonData)
  // console.log(jsonData.child)
  let title = "";
  let foundH1 = false;
  for (const node of jsonData.child) {
    // console.log(node)
    if (!foundH1) {
      Object.entries(node).forEach((entry) => {
        const [key, value] = entry;
        console.log(`${key}: ${value}`);
        if (foundH1 && key === "child") {
          title = "";
        }
        if (key === "tag" && value === "h1") {
          foundH1 = true;
        }
      });
    } else {
      break;
    }
  }
}

async function getEditor(req, res, next) {
  const id = req.params.id;
  // console.log(`getEditor req.params.id: ${req.params.id}`)
  // console.log(`getEditor id: ${id}`)

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

editorRouter.get("/editor", async (req, res) => {
  try {
    const editorList = await Editor.find({}).limit(10);
    // .sort({ id: 1 })
    // console.log(`router get editor: ${JSON.stringify(editorList)}`)

    res.send(editorList);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

// *get only title & _id field
editorRouter.get("/editor/title", async (req, res) => {
  try {
    const editor = await Editor.find({})
      .select("id title")
      .limit(10)
      .sort({ id: 1 });
    res.send(editor);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

// * ?id={}
editorRouter.get("/editor/:id", getEditor, async (req, res, next) => {
  res.send(res.editor);
});

// TODO: parse HTML
editorRouter.patch("/editor/:id", getEditor, async (req, res) => {
  const { data } = req.body;
  // console.log(`editorRouter req.body.data: ${req.body.data}`)
  if (data != null) {
    parseHTML(data);
    // data must contain <h1> tag, enclosed as title, and others as content
    // start parsing data from HTML to
    // <h1>{title}</h1> and <others>..</others> as {content}
    return;
  }
  try {
    const updateEditor = await res.editor.save();
    res.json(updateEditor);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

// TODO: parse HTML
editorRouter.post("/editor", async (req, res) => {
  const { id, title, content } = req.body;
  const editor = new Editor({ id, title, content });
  try {
    // throw new Error('add error!!!')
    const saveEditor = await editor.save();
    res.status(201).json(saveEditor);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

// not implemented
// router.delete('/editor/:id', getEditor, async (req, res) => {
//     try {
//         await res.editor.remove()
//         res.json({ message: "Delete editor successful!" })
//     } catch (e) {
//         res.status(500).send({ message: e.message })
//     }
// })

module.exports = editorRouter;
