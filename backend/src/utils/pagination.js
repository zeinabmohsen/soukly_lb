const { paginationLimit, paginationMaxLimit } = require("../config");

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 0 ? fallback : parsed;
}

function buildPaginationParams(query = {}) {
  const limit = Math.min(
    parsePositiveInt(query.limit, paginationLimit),
    paginationMaxLimit
  );
  const offset = parsePositiveInt(query.offset, 0);

  return { limit, offset };
}

function buildPaginationMeta({ total, limit, offset }) {
  return {
    total,
    limit,
    offset,
    has_more: offset + limit < total,
  };
}

module.exports = {
  buildPaginationParams,
  buildPaginationMeta,
};
