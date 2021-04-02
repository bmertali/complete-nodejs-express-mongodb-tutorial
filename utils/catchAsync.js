// We will pass in a function  (get rid our try catch blocks)
module.exports = fn => {
    return (req,res,next) => {
      fn(req,res,next).catch(next);
    }
  }
  