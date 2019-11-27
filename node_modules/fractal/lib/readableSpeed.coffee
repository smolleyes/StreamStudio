module.exports = (size) ->
  units = ["MHz", "GHz", "THz", "PHz", "EHz", "ZHz", "YHz"]
  i = 0
  while size >= 1000
    size /= 1000
    ++i
  return "#{size.toFixed(2)} #{units[i]}"