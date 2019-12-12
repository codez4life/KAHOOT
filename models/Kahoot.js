const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Kahoot Schema is a complete collection with questions and answers
const KahootSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  title: {
    type: String,
    required: true,
    max: 40
  },
  description: {
    type: String,
    required: true
  },

  questions: [
    {
      ask: {
        type: String,
        required: true
      },
      answers: [
        {
          reply: {
            type: String
          },
          isCorrect: {
            type: Boolean,
            default: false
          }
        }
      ]
    }
  ],

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Kahoot = mongoose.model("kahoot", KahootSchema);
