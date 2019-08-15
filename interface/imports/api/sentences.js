import { Meteor } from "meteor/meteor";
import { HTTP } from "meteor/http";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";
import { TSV } from "tsv";

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
        name: String,
        value: {
          begin: Number,
          end: Number
        }
      }
    ],
    spanAnnotations: [
      {
        name: String,
        value: {
          begin: Number,
          end: Number
        }
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
  "sentences.addAnnotation"(sentenceId, name, value) {
    Sentence.update(sentenceId, {
      $push: { name, value }
    });
  },
  "sentences.removeAnnotation"(sentenceId, name, value) {
    Sentences.update(
      {
        _id: sentenceId
      },
      {
        $pull: { annotations: { name, value } }
      }
    );
  },
  "sentences.addSpanAnnotation"(sentenceId, begin, end, type) {
    check(sentenceId, String);
    check(begin, Number);
    check(end, Number);
    check(type, String);
    Sentences.update(sentenceId, {
      $push: { spanAnnotations: { name: type, value: { begin, end } } }
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
        $pull: { spanAnnotations: { name: type, value: { begin, end } } }
      }
    );
  },
  "sentences.importFromTsv"(url, filename) {
    url = url || Meteor.settings.public.defaultUrl;
    if (Meteor.isServer) {
      HTTP.call("GET", url + "/" + filename, {}, (err, resp) => {
        console.log(err, resp);
        const tsv = TSV.parse(resp);
        console.log(tsv);
      });
    }
  }
});
