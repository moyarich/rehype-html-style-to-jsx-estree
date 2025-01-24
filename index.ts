import { visit } from "unist-util-visit";
import type * as H from "hast";
import {
    MdxJsxAttribute,
    MdxJsxAttributeValueExpression,
    MdxJsxExpressionAttribute,
    MdxJsxFlowElementHast,
} from "mdast-util-mdx-jsx";
import type { Program, ObjectExpression, Property } from "estree";

/**
 * Logs debug information to the console with a delay.
 * Helps avoid rapid output issues by batching logs.
 *
 * @param message - The main debug message to log.
 * @param optionalParams - Additional parameters for detailed inspection.
 */
export function debugLog(message: any, optionalParams: any): void {
    setTimeout(() => {
        console.log(message);
        console.dir(optionalParams, { depth: null });
    }, 0);
}

/**
 * Converts a CSS string into a React-compatible style object.
 *
 * @param style - A CSS string (e.g., "color: red; font-size: 20px;").
 * @returns A React-compatible style object (e.g., `{ color: "red", fontSize: "20px" }`).
 */
const styleToDomObject = (style: string): Record<string, string> => {
    return style
        .split(";")
        .filter(Boolean)
        .reduce(
            (acc, rule) => {
                const [property, value] = rule.split(":").map((s) => s.trim());
                if (property && value) {
                    const camelCaseProperty = property.replace(/-([a-z])/g, (_, g) =>
                        g.toUpperCase(),
                    );
                    acc[camelCaseProperty] = value;
                }
                return acc;
            },
            {} as Record<string, string>,
        );
};

/**
 * A Rehype plugin to transform `style` strings in MDX JSX nodes into
 * ESTree-compatible objects for React JSX compatibility.
 *
 * Addresses the following error:
 * "Uncaught Error: The `style` prop expects a mapping from style properties
 * to values, not a string."
 *
 * Usage Example:
 * Input: `<div style="color: red; font-size: 20px;">Hello</div>`
 * Output: `<div style={{ color: "red", fontSize: "20px" }}>Hello</div>`
 *
 * @returns A transformer function to process the HAST syntax tree.
 */
export const rehypeHtmlStyleToJsxEstree = () => {
    return (tree: H.Root) => {
        visit(tree, "mdxJsxFlowElement", (node: MdxJsxFlowElementHast) => {
            if (!node.attributes) return;

            node.attributes = node.attributes.map(
                (attr: MdxJsxAttribute | MdxJsxExpressionAttribute) => {
                    if (attr.type === "mdxJsxAttribute" && attr.name === "style" && typeof attr.value === "string") {
                        debugLog("Transforming style attribute:", attr.value);

                        // Convert CSS string to React-compatible object
                        const styleObject = styleToDomObject(attr.value);

                        // Convert the object into an ESTree-compatible structure
                        const properties: Property[] = Object.entries(styleObject).map(
                            ([key, value]) => ({
                                type: "Property",
                                method: false,
                                shorthand: false,
                                computed: false,
                                key: { type: "Identifier", name: key },
                                value: { type: "Literal", value },
                                kind: "init",
                            }),
                        );

                        const objectExpression: ObjectExpression = {
                            type: "ObjectExpression",
                            properties,
                        };

                        const program: Program = {
                            type: "Program",
                            sourceType: "module",
                            body: [
                                {
                                    type: "ExpressionStatement",
                                    expression: objectExpression,
                                },
                            ],
                        };

                        // Replace the string value with an ESTree-compatible object
                        attr.value = {
                            type: "mdxJsxAttributeValueExpression",
                            value: `{${JSON.stringify(styleObject)}}`,
                            data: { estree: program },
                        } as MdxJsxAttributeValueExpression;
                    }
                    return attr;
                },
            );
        });
    };
};
