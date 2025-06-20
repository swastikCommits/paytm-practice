const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/v1", rootRouter);
app.use("/api/v1/user", userRouter);

app.use(cors());


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
