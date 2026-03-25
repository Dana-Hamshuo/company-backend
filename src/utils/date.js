//utils//date.js

const isWorkingDay = require("./isWorkingDay")

exports.addWorkingDay = (date) => {
  let d = new Date(date)
  d.setDate(d.getDate() + 1)

  while(!isWorkingDay(d)){
    d.setDate(d.getDate() + 1)
  }

  return d
}