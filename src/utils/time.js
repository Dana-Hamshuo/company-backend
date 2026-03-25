//utils/time.js
exports.toMinutes = (time) => {
    const [h,m] = time.split(":").map(Number);
    return h*60 + m;
  }
  
  exports.toTime = (minutes)=>{
    const h = Math.floor(minutes/60);
    const m = minutes % 60;
  
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  }
  
  exports.isOverlap = (aStart,aEnd,bStart,bEnd)=>{
  
    const startA = exports.toMinutes(aStart)
    const endA = exports.toMinutes(aEnd)
  
    const startB = exports.toMinutes(bStart)
    const endB = exports.toMinutes(bEnd)
  
    return startA < endB && startB < endA
  }