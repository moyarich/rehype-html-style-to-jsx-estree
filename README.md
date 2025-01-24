# rehype-html-style-to-jsx-estree

`rehype-html-style-to-jsx-estree` is a powerful Rehype plugin designed to transform HTML `style` strings into JSX-compatible ESTree objects. This plugin is ideal for seamlessly integrating Markdown-generated HTML with React's JSX style syntax, ensuring compatibility and consistency in MDX pipelines.

## Installation

Install the package using your preferred package manager:

```bash
npm install rehype-html-style-to-jsx-estree
```

or

```bash
yarn add rehype-html-style-to-jsx-estree
```

## Features

- Automatically converts inline `style` attributes from strings to JSX-compatible objects.
- Integrates seamlessly with MDX pipelines and React-based rendering systems.
- Simplifies handling of styles in Markdown and HTML within React components.

---

## Usage

### Basic Example

Here’s how to use `rehype-html-style-to-jsx-estree` in an MDX processing pipeline:

```typescript
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { rehypeHtmlStyleToJsxEstree } from "rehype-html-style-to-jsx-estree";

const mdxContent = `
# Hello World

<div style="color: red; font-size: 20px;">This is a styled div.</div>
`;

const compileMDX = async () => {
    const result = await evaluate(mdxContent, {
        ...runtime,
        rehypePlugins: [rehypeHtmlStyleToJsxEstree],
    });

    console.log(result.default); // React component output
};

compileMDX();
```

---

### Using Additional Rehype and Remark Plugins

You can integrate `rehype-html-style-to-jsx-estree` with other plugins for advanced Markdown-to-JSX processing:

```typescript
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { rehypeHtmlStyleToJsxEstree } from "rehype-html-style-to-jsx-estree";

const mdxContent = `
# Styled Code Block

\`\`\`jsx
<div style="color: blue; padding: 10px;">Styled JSX</div>
\`\`\`
`;

const compileMDX = async () => {
    const result = await evaluate(mdxContent, {
        ...runtime,
        remarkPlugins: [remarkParse, remarkGfm],
        rehypePlugins: [rehypePrettyCode, rehypeHtmlStyleToJsxEstree],
    });

    console.log(result.default); // React component output
};

compileMDX();
```

---

### React Integration with `useMDXCompiler`

For dynamic MDX rendering in React, use the plugin alongside the `useMDXCompiler` hook:

```typescript
import { useMDXCompiler } from "./useMDXCompiler";

const App = () => {
    const content = `
# Dynamic Content

<div style="background-color: lightgrey; padding: 15px;">
    This is dynamically compiled MDX content with inline styles.
</div>
`;

    const { MarkdownReactNode } = useMDXCompiler({
        content,
        components: {
            // Add any custom components here
        },
    });

    return <div>{MarkdownReactNode}</div>;
};

export default App;
```

---

## Markdown Example

Here’s an example of Markdown content processed with the plugin:

```md
# Welcome

<div style="color: green; text-align: center; font-weight: bold;">
    Inline styles rendered as React JSX.
</div>

- List item with **bold text**
- Another list item

\`\`\`jsx
<div style="background: #f0f0f0; padding: 10px;">Code block with style</div>
\`\`\`
```

---

## Options

Currently, the plugin does not accept any configuration options. It operates on all `style` attributes found in `mdxJsxFlowElement` and `mdxJsxTextElement` nodes by default.

---

## Example Outputs

### Input Markdown

```md
<div style="margin: 10px; color: red;">Hello</div>
```

### Transformed JSX

```jsx
<div style={{ margin: "10px", color: "red" }}>Hello</div>
```

---

## useMDXCompiler Hook

Below is an example of a `useMDXCompiler` hook that incorporates `rehype-html-style-to-jsx-estree`:

```typescript
import { useState, useEffect } from "react";
import { useMDXComponents } from "@mdx-js/react";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";

import remarkParse from "remark-parse";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { rehypeHtmlStyleToJsxEstree } from "rehype-html-style-to-jsx-estree";
import { rehypeHtmlToReactAttributes } from "rehype-html-to-react-attributes";

export type MDXComponents = Parameters<typeof useMDXComponents>[0];

interface UseMDXCompilerProps {
    content: string;
    components?: MDXComponents;
}

export const useMDXCompiler = ({ content, components = {} }: UseMDXCompilerProps) => {
    const mdxComponents = useMDXComponents();
    const [MarkdownReactNode, setMarkdownReactNode] = useState<React.ReactNode>(<p>Loading...</p>);

    useEffect(() => {
        const compileMDX = async () => {
            const allComponents = { ...mdxComponents, ...components };

            try {
                const result = await evaluate(content, {
                    ...runtime,
                    useMDXComponents: () => allComponents,
                    elementAttributeNameCase: "react",
                    remarkPlugins: [remarkParse, remarkBreaks, remarkGfm],
                    rehypePlugins: [
                        rehypeHtmlStyleToJsxEstree,
                        rehypeHtmlToReactAttributes,
                        [
                            rehypePrettyCode,
                            {
                                theme: "github-light",
                                onVisitLine(node: { children: string | unknown[] }) {
                                    if (node.children.length === 0) {
                                        node.children = [{ type: "text", value: " " }];
                                    }
                                },
                                onVisitHighlightedLine(node: { properties: { className: string[] } }) {
                                    node.properties.className.push("highlighted");
                                },
                                onVisitHighlightedWord(node: { properties: { className: string[] } }) {
                                    node.properties.className = ["word"];
                                },
                            },
                        ],
                    ],
                });

                setMarkdownReactNode(() => <result.default />);
            } catch (error) {
                console.error("Error compiling MDX:", error);
                setMarkdownReactNode(() => <p>Error rendering content</p>);
            }
        };

        compileMDX();
    }, [content, mdxComponents, components]);

    return { MarkdownReactNode };
};
```

---

## License

This project is licensed under the MIT License.

---

## Author

Created by **Moya Richards**.
