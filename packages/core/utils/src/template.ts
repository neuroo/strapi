/**
 * Create a strict interpolation RegExp based on the given variables' name
 */
const createStrictInterpolationRegExp = (allowedVariableNames: string[], flags: string) => {
  // Sanitize allowedVariableNames to prevent ReDoS
  const sanitizedVariableNames = allowedVariableNames.map(name =>
    name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const oneOfVariables = sanitizedVariableNames.join('|');

  // Sanitize flags to prevent ReDoS
  const sanitizedFlags = flags.replace(/[^gimsuy]/g, '');

  // 1. We need to match the delimiters: <%= ... %>
  // 2. We accept any number of whitespaces characters before and/or after the variable name: \s* ... \s*
  // 3. We only accept values from the variable list as interpolation variables' name: : (${oneOfVariables})
  return new RegExp(`<%=\\s*(${oneOfVariables})\\s*%>`, sanitizedFlags);
};

/**
 * Create a loose interpolation RegExp to match as many groups as possible
 */
const createLooseInterpolationRegExp = (flags: string) => {
  // Sanitize flags to prevent ReDoS
  const sanitizedFlags = flags.replace(/[^gimsuy]/g, '');
  return new RegExp(/<%=([\s\S]+?)%>/, sanitizedFlags);
};

export { createStrictInterpolationRegExp, createLooseInterpolationRegExp };
