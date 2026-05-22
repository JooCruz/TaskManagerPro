import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import taskmanagerApiRoutes from "./routes/taskmanagerApi";


const app = express();

app.use(cors());
app.use(express.json());

app.use((request: Request, response: Response, next: NextFunction) => {
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (request.method === "OPTIONS") {
    response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    return response.status(200).json({});
  }

  next();
});

app.get("/health", (_request: Request, response: Response) => {
  response.json({ status: "sucesso", message: "TaskManager backend online." });
});

app.use("/taskmanager_api", taskmanagerApiRoutes);

app.use((_request: Request, response: Response) => {
  response.status(404).json({ message: "Not found." });
});

export default app;
