const paginate = (query) => {
  const page  = Math.max(0, parseInt(query.page)  || 0);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  return { take: limit, skip: page * limit, page, limit };
};

module.exports = { paginate };