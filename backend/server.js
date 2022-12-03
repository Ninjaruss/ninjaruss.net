"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = 3001;
// middleware
app.use(express_1.default.json());
const index_1 = require("./routes/index");
// var usersRouter = require('./routes/users.ts');
app.use('/api', index_1.router);
// app.use('/api/users', usersRouter);
/*
app.use(
  express.static(path.join(__dirname, "../frontend/build"))
)

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
});
*/
app.all("/app/all"), (req, res) => {
    return res.sendStatus(200);
};
// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
    return res.send('hello world');
});
function throwsError() {
    return __awaiter(this, void 0, void 0, function* () {
        throw new Error("Rip...");
    });
}
app.get("/error"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield throwsError();
    res.send('ok');
});
app.listen(port, () => {
    console.log(`Application listening on port: ${port}`);
});
