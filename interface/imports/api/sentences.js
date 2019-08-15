import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

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
    annotations: [
      {
        type: String,
        value: {
          begin: Number,
          end: Number
        }
      }
    ],
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
    const currReadable = Sentences.findOne(sentenceId).readableId;
    Sentences.find({
      readableId: { $gt: currReadable }
    }).forEach(element =>
      Sentences.update(element._id, {
        $set: { ...element, readableId: element.readableId - 1 }
      })
    );
    Sentences.remove(sentenceId);
  },
  "sentences.addAnnotation"(sentenceId, type, value) {
    Sentence.update(sentenceId, { $push: { type, value } });
  },
  "sentences.removeAnnotation"(sentenceId, type, value) {
    Sentences.update(sentenceId, { $pull: { annotations: { type, value } } });
  },
  "sentences.addSpanAnnotation"(sentenceId, type, begin, end) {
    check(sentenceId, String);
    check(begin, Number);
    check(end, Number);
    check(type, String);
    Sentences.update(sentenceId, {
      $push: { spanAnnotations: { type, begin, end } }
    });
  },
  "sentences.removeSpanAnnotation"(sentenceId, type, begin, end) {
    check(sentenceId, String);
    check(begin, Number);
    check(end, Number);
    check(type, String);
    Sentences.update(sentenceId, {
      $pull: { spanAnnotations: { type, begin, end } }
    });
  },
  "sentences.importFromTsv"(url, filename) {
    if (Meteor.isServer) {
      url = url || Meteor.settings.public.defaultUrl;
      HTTP.call("GET", url + "/" + filename, {}, (err, resp) => {
        const lines = [];
        for (let line of resp.contents.trim().split("\n")) {
          lines.push(line.split("\t"));
        }
        console.log(lines);
      });
    }
  }
});
