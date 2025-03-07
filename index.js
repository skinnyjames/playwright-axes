module.exports = {
  parseRegex,
  convertAttributeRegexToXpath,
  child,
  parent,
  nextSibling,
  prevSibling,
};

function child(attributes, node = "*") {
  if (Object.keys(attributes).length <= 0) {
    return `xpath=//${node}`;
  } else {
    const xpath = convertAllAttributesToXpath(attributes);
    return `xpath=//${node}[${xpath}]`;
  }
}

function parent(attributes, node = "*") {
  if (Object.keys(attributes).length <= 0) {
    return `xpath=ancestor::${node}`;
  } else {
    const xpath = convertAllAttributesToXpath(attributes);
    return `xpath=ancestor::${node}[${xpath}]`;
  }
}

function nextSibling(attributes, node = "*") {
  if (Object.keys(attributes).length <= 0) {
    return `xpath=following-sibling::${node}`;
  } else {
    const xpath = convertAllAttributesToXpath(attributes);
    return `xpath=following-sibling::${node}[${xpath}]`;
  }
}

function prevSibling(attributes, node = "*") {
  if (Object.keys(attributes).length <= 0) {
    return `xpath=preceding-sibling::${node}`;
  } else {
    const xpath = convertAllAttributesToXpath(attributes);
    return `xpath=preceding-sibling::${node}[${xpath}]`;
  }
}

function parseRegex(regex) {
  const ignoreCase = regex.ignoreCase;
  const string = regex
    .toString()
    .replace(/^\//, "")
    .replace(/\/[a-z]*$/, "");
  const startAnchor = /^\^/.test(string);
  const endAnchor = /\$$/.test(string);
  const executed = /(^\^)?([a-zA-Z0-9-_\s]+)(\$$)?/.exec(string);
  const content = executed[2];

  return {
    ignoreCase,
    startAnchor,
    endAnchor,
    content,
  };
}

function convertAllAttributesToXpath(attributes) {
  return Object.keys(attributes)
    .map((key) => convertAttributeToXpath(key, attributes[key]))
    .filter((xpath) => xpath != null)
    .join(` and `);
}

function convertAttributeToXpath(key, value) {
  const type = Object.prototype.toString
    .call(value)
    .match(/\[\w+ (\w+)\]/)[1]
    .toLowerCase();

  switch (type) {
    case "regexp":
      return convertAttributeRegexToXpath(key, value);
    case "string":
      return convertAttributeStringToXpath(key, value);
    default:
      throw new Error(`${key} value must be a regexp or string, not ${type}`);
  }
}

function convertAttributeStringToXpath(key, string) {
  return `@${key}='${string}'`;
}

function convertAttributeRegexToXpath(key, regex) {
  const payload = parseRegex(regex);

  switch (true) {
    case payload.startAnchor:
      if (payload.ignoreCase) {
        return `@${key}[starts-with(normalize-space(translate(.,'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')), '${payload.content.toLowerCase()}')]`;
      } else {
        return `@${key}[starts-with(normalize-space(.),'${payload.content}')]`;
      }
    case payload.endAnchor:
      if (payload.ignoreCase) {
        return `substring(normalize-space(translate(@${key},'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz')), string-length(normalize-space(translate(@${key},'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'))) - string-length('${payload.content.toLowerCase()}') + 1) = '${payload.content.toLowerCase()}'`;
      } else {
        return `substring(normalize-space(@${key}), string-length(normalize-space(@${key})) - string-length('${payload.content}') + 1) = '${payload.content}'`;
      }
    default:
      if (payload.ignoreCase) {
        return `contains(translate(@${key},'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'), '${payload.content.toLowerCase()}')`;
      } else {
        return `contains(@${key}, '${payload.content}')`;
      }
  }
}
