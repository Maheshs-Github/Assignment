const express = require("express");
const app = express();
const Port = process.env.PORT || 4000;

app.use(express.json());

//
// TODO List Array
let Tasks = [
  {
    id: 1,
    TaskName: "BackEnd Assignment",
    TaskDesc: "Complete the Given BackEnd, u have only 1 day to do ",
  },
  {
    id: 2,
    TaskName: "Take good Sleep",
    TaskDesc: "Well Don't get ill take rest as well",
  },
  {
    id: 3,
    TaskName: "A1",
    TaskDesc: "A1 Desc",
  },
  {
    id: 4,
    TaskName: "B1",
    TaskDesc: "B1 Desc",
  },
  {
    id: 5,
    TaskName: "C1",
    TaskDesc: "C1 Desc",
  },
];

//
//
// Middleware for Authrization on sensitive Endpoints
const IsAuth = (req, res, next) => {
  const Key = req.header("Auth-Key");
  if (Key !== "it's_a_secret") {
    return res.status(400).json({
      msg: "u r Access is Denied, either enter the key & Value in Header or this far u can go ",
    });
  }
  next();
};

//
//
// End point to get the TO DO LIST
app.get("/tasks", IsAuth, (req, res) => {
  if (Tasks.length === 0) {
    return res.status(404).json({ msg: "No Tasks are avaliable" });
  }

  let { page, limit, sortBy, order } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 2;
  sortBy = sortBy || "id";
  order = order || "asc";
  console.log(sortBy, "   ", order);

  //
  //
  // Sorting Logic
  const SortingOpn = ["id", "TaskName", "TaskDesc"];
  if (!SortingOpn.includes(sortBy)) {
    return res.status(400).json({
      msg: "Too bad for u, well we have fields such as (id, TaskName, TaskDesc) only",
    });
  }
  const sortArray = [...Tasks];
  // console.log(sortArray);

  sortArray.sort((a, b) => {
    if (order === "asc") {
      console.log(a[sortBy]);
      return a[sortBy].toString().toLowerCase() >
        b[sortBy].toString().toLowerCase()
        ? 1
        : -1;
    } else {
      return a[sortBy].toString().toLowerCase() <
        b[sortBy].toString().toLowerCase()
        ? 1
        : -1;
    }
  });

  //
  //
  // Pagination logic
  SIndex = (page - 1) * limit;
  EIndex = page * limit;

  OnePageTasks = sortArray.slice(SIndex, EIndex);

  if (Math.ceil(Tasks.length / limit) < page) {
    return res.status(400).json({
      msg: "That's bad, we don't have that much pages",
      "Pages Avliable": Math.ceil(Tasks.length / limit),
    });
  }
  return res.status(200).json({
    "Page No": page,
    "No Of TAsks Per Page": limit,
    "Total Pages": Math.ceil(Tasks.length / limit),
    "To Get next Page Task":
      " Update Endpoint like http://localhost:4000/tasks?page=2&limit=2",
    Task: OnePageTasks,
    // Tasks,
  });
});

//
//
// End Point to get specifc TO DO ITEM by ID
app.get("/tasks/:id", (req, res) => {
  const { id } = req.params;

  // console.log(id);
  // console.log("Id Type: ", typeof id);

  const task = Tasks.find((t) => t.id === parseInt(id));
  // console.log(task);

  if (!task) {
    return res.status(404).json({ msg: "Task not found or some error" });
  }

  return res.status(200).json(task);
});

//
//
// Post EndPoint to add new TODO Task
app.post("/tasks", IsAuth, (req, res) => {
  // console.log(req.body);
  if (!req.body) {
    return res
      .status(400)
      .json({ msg: "I think u forgot to give the body, give something there" });
  }
  const { id, TaskName, TaskDesc } = req.body;
  // console.log("Id: ", id);
  if (!id || !TaskName || !TaskDesc) {
    return res.status(404).json({ msg: "No Data recieved" });
  }
  const AlreadyExists = Tasks.some((T2) => T2.id === parseInt(id));
  // console.log(AlreadyExists);
  if (AlreadyExists) {
    return res.status(404).json({ msg: "The Task With Same ID alredy exists" });
  }

  // console.log(typeof id);
  Tasks.push({ id, TaskName, TaskDesc });
  return res.status(200).json({ msg: "New TODO is added successfully", Tasks });
});

//
//
// Patch Request to update exiting Task
app.patch("/tasks/:id", IsAuth, (req, res) => {
  let { id } = req.params;
  // console.log(id);
  if (!req.body) {
    return res
      .status(400)
      .json({ msg: "u supoose to send the some data u know" });
  }

  let NTaskName = req.body.TaskName;
  let NTaskDesc = req.body.TaskDesc;
  // console.log(NTaskName, NTaskDesc);

  const TaskExists = Tasks.find((T3) => {
    return T3.id === parseInt(id);
  });
  if (TaskExists) {
    // console.log(NTaskName);
    if (NTaskName !== undefined) TaskExists.TaskName = NTaskName;
    if (NTaskDesc !== undefined) TaskExists.TaskDesc = NTaskDesc;
    // if (NTaskName.length !== 0) TaskExists.TaskName = NTaskName;
    // if (NTaskDesc.length !== 0) TaskExists.TaskDesc = NTaskDesc;
    return res.status(200).json({ msg: "Task Updated Successfully", Tasks });
  }
});

//
//
//  Delete Request EndPoint based on the specific ID
app.delete("/tasks/:id", IsAuth, (req, res) => {
  const { id } = req.params;

  // console.log(id);
  const DTask = Tasks.find((T4) => {
    return T4.id === parseInt(id);
  });
  // console.log(DTask);
  if (!DTask) {
    return res.status(400).json({ msg: "The Task is already not there" });
  }
  Tasks = Tasks.filter((T5) => T5.id !== parseInt(id));
  return res.status(200).json({ msg: "Successfully Deleted", Tasks });
});

//
//
// root EndPoint
app.get("/", (req, res) => {
  res.send(
    "Hello There, We able Successfully SetUp and Run the Assignment Work"
  );
});

app.listen(Port, () => console.log(`Listening from the Port ${Port}`));
