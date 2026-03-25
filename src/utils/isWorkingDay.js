// utils/isWorkingDay.js
module.exports = function isWorkingDay(date) {

  if(!(date instanceof Date)){
    date = new Date(date)
  }

  const day = date.getDay()

  const OFF_DAYS = [0,6]

  return !OFF_DAYS.includes(day)
}