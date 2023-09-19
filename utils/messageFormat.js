const dayjs = require("dayjs");

function formatMessage(username, text, colorClass = "bg-info") {
  return {
    username,
    time: dayjs().format("h:mm a"),
    text,
    colorClass
  }
};

module.exports = formatMessage;