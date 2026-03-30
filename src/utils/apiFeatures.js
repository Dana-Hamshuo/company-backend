class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString; 
    }
  
    filter() {
      const queryObj = { ...this.queryString };
  
      const excludedFields = ["page", "sort", "limit", "search"];
      excludedFields.forEach(el => delete queryObj[el]);
  
      this.query = this.query.find(queryObj);
  
      return this;
    }
  
    search(fields) {
      if (this.queryString.search) {
        const keyword = {
          $or: fields.map(field => ({
            [field]: { $regex: this.queryString.search, $options: "i" }
          }))
        };
  
        this.query = this.query.find(keyword);
      }
  
      return this;
    }
  
    sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(",").join(" ");
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort("-createdAt");
      }
  
      return this;
    }
  
    paginate() {
      const page = parseInt(this.queryString.page) || 1;
      const limit = parseInt(this.queryString.limit) || 10;
  
      const skip = (page - 1) * limit;
  
      this.query = this.query.skip(skip).limit(limit);
  
      this.pagination = { page, limit };
  
      return this;
    }
  }
  
  module.exports = APIFeatures;