const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

admin.initializeApp({
  credential: admin.credential.cert("./permissions.json"),
});

const db = admin.firestore();

app.post("/api/canva", async (req, res) =>{
  await db.collection("tasksCanvas")
      .doc()
      .create({
        description: req.body.description,
        status: req.body.status || "todo"});
  return res.status(200).json();
} );

app.get("/hello-word", (req, res)=>{
  return res.status(200).json({msg: "Hello Word"});
});

app.get("/api/canva", async (req, res) =>{
  try {
    const query = db.collection("tasksCanvas");
    const querySnapShot = await query.get();
    const docs = querySnapShot.docs;

    const response = docs.map( (doc) => ({
      description: doc.data().description,
      id: doc.id,
      status: doc.data().status,
    }));

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

app.get("/api/canva/:tasksCanvas_id", async (req, res) =>{
  try {
    const doc = db.collection("tasksCanvas").doc(req.params.tasksCanvas_id);
    const item = await doc.get();
    const response = item.data();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).send(error);
  }
});

app.delete("/api/canva/:tasksCanvas_id", async (req, res) =>{
  try {
    // eslint-disable-next-line max-len
    const document = db.collection("tasksCanvas").doc(req.params.tasksCanvas_id);
    await document.delete();
    return res.status(200).json();
  } catch (error) {
    return res.status(500).json();
  }
});

app.put("/api/canva/:tasksCanvas_id", async (req, res) =>{
  try {
    // eslint-disable-next-line max-len
    const document = db.collection("tasksCanvas").doc(req.params.tasksCanvas_id);
    await document.update({
      description: req.body.description,
    });
    return res.status(200).json( {message: "Task updated successfully"});
  } catch (error) {
    console.error("Error updating task status:", error);
    return res.status(500).json({error: error.message});
  }
});
app.put("/api/canva/:tasksCanvas_id/status", async (req, res) => {
  try {
    const {status} = req.body;

    if (!status) {
      return res.status(400).json({error: "Status is required."});
    }

    // eslint-disable-next-line max-len
    const document = db.collection("tasksCanvas").doc(req.params.tasksCanvas_id);
    await document.update({status});
    return res.status(200).json({message: "Task status updated successfully"});
  } catch (error) {
    console.error("Error updating task status:", error);
    return res.status(500).json({error: error.message});
  }
});

exports.app = functions.https.onRequest(app);


