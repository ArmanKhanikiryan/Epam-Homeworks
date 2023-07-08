import express from 'express';
import route from "./routes/route";
import cors from 'cors'

const app = express();
const port = process.env.PORT || 9999;

app.use(express.json());
app.use(cors)
app.use('/', route);

app.listen(port, () => {
  console.log(`Server is up adn running on port ${port}`);
});
