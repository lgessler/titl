import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Mongo } from "meteor/mongo";
import { check, Match } from "meteor/check";

export const Sentences = new Mongo.Collection("sentences");

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish tasks that are public or belong to the current user
  Meteor.publish("sentences", function sentencesPublication() {
    return Sentences.find({});
  });
}

function checkSentence(sentence) {
  check(sentence, {
    sentence: String,
    annotations: [Match.Object],
    spanAnnotations: [
      {
        begin: Number,
        end: Number,
        name: String,
        value: String
      }
    ]
  });
}

Meteor.methods({
  "sentences.insert"(sentence) {
    checkSentence(sentence);

    // Make sure the user is logged in before inserting a task
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    const lastDoc = Sentences.findOne({}, { sort: { readableId: -1 } });
    const currentId = (lastDoc && lastDoc.readableId) || 0;

    Sentences.insert({
      ...sentence,
      readableId: currentId + 1,
      createdAt: new Date(),
      owner: this.userId,
      username: Meteor.users.findOne(this.userId).username
    });
  },
  "sentences.remove"(sentenceId) {
    Sentences.remove(sentenceId);
  },
  "sentences.addAnnotation"(sentenceId, name, value) {
    const obj = {};
    obj[name] = value;
    Sentence.update(sentenceId, {
      $push: obj
    });
  },
  "sentences.removeAnnotation"(sentenceId, name, value) {
    const obj = {};
    obj[name] = value;
    Sentences.update(
      {
        _id: sentenceId
      },
      {
        $pull: { annotations: obj }
      }
    );
  },
  "sentences.addSpanAnnotation"(sentenceId, begin, end, name, value) {
    check(sentenceId, String);
    check(begin, Number);
    check(end, Number);
    check(name, String);
    const obj = {};
    obj[name] = value;
    Sentences.update(sentenceId, {
      $push: { spanAnnotations: { ...obj, begin, end }}
    });
  },
  "sentences.removeSpanAnnotation"(sentenceId, begin, end) {
    check(sentenceId, String);
    check(begin, Number);
    check(end, Number);
    Sentences.update(
      {
        _id: sentenceId
      },
      {
        $pull: { spanAnnotations: { begin, end }}
      }
    );
  }
});
