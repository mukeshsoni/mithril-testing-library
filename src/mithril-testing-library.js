import m from "mithril";
import { getQueriesForElement, prettyDOM } from "@testing-library/dom";

const mountedContainers = new Set();
/*
 * Most of it is copied from https://github.com/testing-library/react-testing-library
 * The main difference is that instead of taking the element created by
 * m() call, we send in the component and it's props as arguments.
 * This is because if the mithril created element is sent as an argument and
 * then directly used inside the component we mount, mithril cannot track
 * changes to that component's render tree since it's not created new when
 * mithril creates the vdom to diff. More details here
 * https://mithril.js.org/components.html#avoid-creating-component-instances-outside-views
 */
export function render(Component, attrs, { container, baseElement } = {}) {
  if (!baseElement) {
    // default to document.body instead of documentElement to avoid output of potentially-large
    // head elements (such as JSS style blocks) in debug output
    baseElement = document.body;
  }

  if (!container) {
    container = baseElement.appendChild(document.createElement("div"));
  }
  // we'll add it to the mounted containers regardless of whether it's actually
  // added to document.body so the cleanup method works regardless of whether
  // they're passing us a custom container or not.
  mountedContainers.add(container);
  const component = {
    view: () => {
      return m(Component, attrs);
    },
  };
  m.mount(container, component);
  return {
    container,
    debug: (el = baseElement, maxLength, options) =>
      Array.isArray(el)
        ? // eslint-disable-next-line no-console
          el.forEach((e) => console.log(prettyDOM(e, maxLength, options)))
        : // eslint-disable-next-line no-console,
          console.log(prettyDOM(el, maxLength, options)),
    unmount: () => m.mount(container, null),
    rerender: (Comp, attrs) => {
      render(Comp, attrs, { container, baseElement });
    },
    ...getQueriesForElement(container),
  };
}

// the cleanup code is mostly copied from @testing-library/react repo
// https://github.com/testing-library/react-testing-library
export function cleanup() {
  mountedContainers.forEach(cleanupAtContainer);
}

export function cleanupAtContainer(container) {
  // passing null to second argument of m.mount unmounts the tree
  // and cleans up the internal state
  // https://mithril.js.org/mount.html#signature
  try {
    m.mount(container, null);
  } catch (e) {
    console.log("Error in unmounting the container");
  }
  if (container.parentNode === document.body) {
    document.body.removeChild(container);
  }
  mountedContainers.delete(container);
}

// just re-export everything from dom-testing-library
export * from "@testing-library/dom";
