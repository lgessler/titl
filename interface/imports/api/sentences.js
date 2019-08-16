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
    annotations: Match.Object,
    spanAnnotations: [
      {
        begin: Number,
        end: Number,
        name: String,
        value: String,
        checked: Boolean
      }
    ]
  });
}

Meteor.methods({
  "sentences.insert"(sentence) {
    //checkSentence(sentence);

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
  "sentences.addAnnotation"(sentenceId, name, value) {
    const obj = {};
    obj[name] = value;
    Sentences.update(sentenceId, {
      $set: { annotations: obj }
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
  "sentences.addSpanAnnotation"(sentenceId, begin, end, name, value, checked) {
    check(sentenceId, String);
    check(begin, Number);
    check(end, Number);
    check(name, String);
    check(checked, Boolean);
    const obj = {};
    obj[name] = value;
    Sentences.update(sentenceId, {
      $push: { spanAnnotations: { ...obj, begin, end, checked } }
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
        $pull: { spanAnnotations: { begin, end } }
      }
    );
  },
  "sentences.updateSpanChecked"(sentenceId, begin, checked) {
    check(sentenceId, String);
    check(checked, Boolean);
    Sentences.update(
      {
        _id: sentenceId
      },
      {
        $set: {
          spanAnnotations: [
            ...Sentences.findOne({ _id: sentenceId }).spanAnnotations.map(s =>
              s.begin === begin ? { ...s, checked } : s
            )
          ]
        }
      }
    );
  },
  "sentences.removeAll"() {
    Sentences.remove({});
  },
  "sentences.populateFromQuery"() {
    if (Meteor.isServer) {
      console.log(Sentences.find().fetch());
      // make call
      HTTP.post(
        Meteor.settings.public.defaultUrl,
        {
          data: {
            sentences: Sentences.find().fetch()
          }
        },
        (err, resp) => {
          if (err) {
            return;
          }
          for (let [sentence, distance] of Object.entries(resp.data)) {
            console.log(
              "Adding sentence '",
              sentence,
              "', distance: ",
              distance
            );
            Meteor.call("sentences.insert", {
              sentence: sentence,
              annotations: { relevant: false },
              spanAnnotations: []
            });
          }
        }
      );
    }
  }
});
