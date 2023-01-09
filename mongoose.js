
const mongoose = require('mongoose')

mongoose
    .connect('mongodb+srv://WilsonWann:tEhqamjcaKAqpwQx@cluster0.njkxljd.mongodb.net/Next?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// const todoSchema = new mongoose.Schema({
//     task: String,
//     completed: Boolean
// });

// const Todo = mongoose.model('Todo', todoSchema);

// app.post('/todos', (req, res) => {
//     const todo = new Todo({ task: req.body.task, completed: false });
//     todo.save((error) => {
//         if (error) {
//             res.send(error);
//         } else {
//             res.send('Todo added successfully');
//         }
//     });
// });