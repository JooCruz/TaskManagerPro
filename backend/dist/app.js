"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const taskmanagerApi_1 = __importDefault(require("./routes/taskmanagerApi"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((request, response, next) => {
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (request.method === "OPTIONS") {
        response.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        return response.status(200).json({});
    }
    next();
});
app.get("/health", (_request, response) => {
    response.json({ status: "sucesso", message: "TaskManager backend online." });
});
app.use("/taskmanager_api", taskmanagerApi_1.default);
app.use((_request, response) => {
    response.status(404).json({ message: "Not found." });
});
exports.default = app;
