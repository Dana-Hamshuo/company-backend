// utils/dateFormat.js

exports.toDateKey = (date)=>{
    const d = new Date(date)
    return d.toISOString().slice(0,10)
  }