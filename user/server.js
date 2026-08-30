const app = require('./app');
const cors = require('cors');

app.use(cors());

const PORT = process.env.PORT || 300;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhOTQ3ODhhZTI4NzBiNGFlYThkMDRiZCIsImlhdCI6MTc4ODExNTA4MiwiZXhwIjoxNzg4MTE4NjgyfQ.jj55hh6Dq4CYU1l9xdLQ29OzwqWEqeg6XxV_KfjarFg