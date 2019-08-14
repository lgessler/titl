import { Meteor } from "meteor/meteor";
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
    spanAnnotations: [
      {
        type: String,
        begin: Number,
        end: Number
      }
    ],
    zScore: Number
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
  "sentences.addSpanAnnotation"(sentenceId, begin, end, type) {
    check(sentenceId, String);
    check(begin, Number);
    check(end, Number);
    check(type, String);
    Sentences.update(sentenceId, {
      $push: { spanAnnotations: { begin, end, type } }
    });
  },
  "sentences.removeSpanAnnotation"(sentenceId, begin, end, type) {
    check(sentenceId, String);
    check(begin, Number);
    check(end, Number);
    check(type, String);
    Sentences.update(
      {
        _id: sentenceId
      },
      {
        $pull: { spanAnnotations: { begin, end, type } }
      }
    );
  }
});
