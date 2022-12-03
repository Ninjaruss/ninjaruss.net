import express, {Request, Response} from "express";
import path from "path";
const app = express();
const port = 3001;

// middleware
app.use(express.json());

import {router as indexRouter} from './routes/index';
// var usersRouter = require('./routes/users.ts');

app.use('/api', indexRouter);
// app.use('/api/users', usersRouter);

app.use(
  express.static(path.join(__dirname, "../frontend/build"))
)

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});


app.all("/app/all"), (req: Request, res: Response) => {
  return res.sendStatus(200);
}

async function throwsError(){
  throw new Error("Rip...");
}

app.get("/error"), async (req: Request, res: Response) => {
  await throwsError();
  res.send('ok');
}

app.listen(port, () => {
  console.log(`Application listening on port: ${port}`);
})