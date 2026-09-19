/** İstekten dil seçimini okur: ?lang=en → "en", diğer her şey → "tr". */
function langOf(req) {
  return String(req.query?.lang || "").toLowerCase() === "en" ? "en" : "tr";
}
module.exports = { langOf };
