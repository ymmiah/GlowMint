import React from 'react';
import { themes } from './theme';

const generateThemeCss = (): string => {
  let css = '';

  // Generate rules for each theme, setting slate as the default on :root
  Object.entries(themes).forEach(([themeName, variables]) => {
    const selector = themeName === 'slate' ? ':root, html[data-theme="slate"]' : `html[data-theme='${themeName}']`;
    css += `${selector} {\n`;
    Object.entries(variables).forEach(([key, value]) => {
      css += `  ${key}: ${value};\n`;
    });
    css += '}\n\n';
  });

  return css;
};

const ThemeStyleSheet: React.FC = () => {
  const css = React.useMemo(() => generateThemeCss(), []);
  return <style>{css}</style>;
};

export default ThemeStyleSheet;
