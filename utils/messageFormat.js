const dayjs = require("dayjs");

function formatMessage(username, text) {
  return {
    username,
    time: dayjs().format("h:mm a"),
    text,
  }
};

module.exports = formatMessage;