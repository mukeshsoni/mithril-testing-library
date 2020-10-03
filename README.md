### mithril-testing-library

This library provides some helper functions around [@testing-library/dom](https://github.com/testing-library/dom-testing-library) for testing mithril components.

### Installation

```
npm install --dev mithril-testing-library
```

or using `yarn`

```
yarn add --dev mithril-testing-library
```

This library has `peerDependencies` for `mithril`.


### Difference from `react-testing-library`

This library takes a lot of code from [react-testing-library](https://github.com/testing-library/react-testing-library). The main difference is the way the render function is called.

In `mithril-testing-library`, the `render` function is called with the mithril Component and the attributes you want to pass the component as arguments. `react-testing-library` on the other hand works by sending the react element directly to the render function.

That won't work in mithril since if we create mithril element outside of mithril
tree construction, the event callbacks for those elements won't trigger an
automatic redraw in mithril. The reference check for vnode returned by that
element created outside mithril tree would always return the same object.

Here's more information on the mithril documentation site

https://mithril.js.org/components.html#avoid-creating-component-instances-outside-views

### Examples


```
async function wait(waitTime) {
  return new Promise((res) => setTimeout(res, waitTime));
}

const ComponentToTest = {
  view: (vnode) => {
    return m("div", [
      m(
        "button",
        {
          onclick: (e) => {
            e.stopPropagation();
            vnode.state.showList = !vnode.state.showList;
          },
        },
        "Open list"
      ),
      vnode.state.showList &&
        m(
          OnClickOutside,
          {
            onDocumentClick: () => {
              vnode.state.showList = false;
              // since this click handler is outside mithril ecosystem, we 
              // have to force redraw
              m.redraw();
            },
          },
          m("ul", { "data-testid": "the-list" }, [(m("li", 1), m("li", 2))])
        ),
    ]);
  },
};

test("onclickoutside to close dropdown menu", async () => {
  const { getByText, queryByTestId } = render(ComponentToTest);
  expect(queryByTestId("the-list")).toBeNull();
  fireEvent.click(getByText("Open list"));

  await waitFor(() => {
    expect(queryByTestId("the-list")).not.toBeNull();
  });

  await wait(1);
  fireEvent.click(document);

  await waitFor(() => {
    expect(queryByTestId("the-list")).toBeNull();
  });
});
```
