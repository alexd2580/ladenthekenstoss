
type ElementBuilder<TIntrinsicElements, TNode> = (
  constructText: (text: string) => TNode,
  constructTag: <TTag extends keyof TIntrinsicElements, >(tag: TTag, attributes: TIntrinsicElements[TTag]) => TNode,
  insertChild: (node: TNode, child: TNode, index: number) => void
) => TNode;

export const element = <TIntrinsicElements, TNode, TTag extends keyof TIntrinsicElements>(
  tag: TTag,
  attributes: TIntrinsicElements[TTag],
  // Regular text is not wrapped in `element`.
  ...children: (string | ElementBuilder<TIntrinsicElements, TNode>)[]
) => (
  constructText: (text: string) => TNode,
  constructTag: <TTagChild extends keyof TIntrinsicElements, >(tag: TTagChild, attributes: TIntrinsicElements[TTagChild]) => TNode,
  insertChild: (node: TNode, child: TNode, index: number) => void
) => {
    const node = constructTag(tag, attributes);

    function buildChildNode(textOrRenderer: string | ElementBuilder<TIntrinsicElements, TNode>): TNode {
      console.log(textOrRenderer);
      if (typeof (textOrRenderer) === "string") {
        return constructText(textOrRenderer);
      }
      return textOrRenderer(constructText, constructTag, insertChild);
    }

    children.forEach((textOrRenderer, index) => {
      const child = buildChildNode(textOrRenderer);
      insertChild(node, child, index);
    });

    return node;
  };

// Render to DOM.
interface CommonAttributes {
  class?: string;
  style?: string;
};

interface SpecificTagAttributes {
  div: {},
  p: {},
  span: {},
  header: {}
};

type Tag = keyof SpecificTagAttributes;

type IntrinsicTagAttributes = {
  [tag in Tag]: SpecificTagAttributes[tag] & CommonAttributes;
};


declare global {
  namespace JSX {
    type IntrinsicElements = IntrinsicTagAttributes;
  }
}

export type HTMLElementBuilder = ElementBuilder<IntrinsicTagAttributes, Node>;

export function render(elementBuilder: HTMLElementBuilder, appDivId: string): void {
  const constructText = (text: string): Node => new Text(text);
  const constructTag = <TTag extends keyof IntrinsicTagAttributes,>(tag: TTag, attributes: IntrinsicTagAttributes[TTag]): Node => {
    const node = document.createElement(tag);
    if (attributes.class) {
      node.className = attributes.class;
    }
    return node;
  };
  const insertChild = (node: Node, child: Node, _index: number): void => {
    node.appendChild(child);
  };

  const appDiv = document.getElementById(appDivId)!;
  const rendered = elementBuilder(constructText, constructTag, insertChild);
  appDiv.appendChild(rendered);
}

// function getOrAppend(parent: HTMLElement, tag: "div" | "p", id: string): HTMLElement {
//   let element = document.getElementById(id);
//   if (element === null) {
//     element = document.createElement(tag);
//     element.setAttribute("id", id);
//     parent.appendChild(element);
//   }
//   return element;
// }
