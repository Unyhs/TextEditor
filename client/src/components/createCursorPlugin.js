import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

function createCursorPlugin(cursorsRef) {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations = [];

        cursorsRef.current.forEach(({ from, to, name, color }, userId) => {
          if (from === to) {
            decorations.push(
              Decoration.widget(from, () => {
                const wrapper = document.createElement("span");
                wrapper.style.position = "relative";

                const caret = document.createElement("span");
                caret.style.borderLeft = `2px solid ${color}`;
                caret.style.marginLeft = "-1px";
                caret.style.height = "1em";

                const label = document.createElement("span");
                label.textContent = name;
                label.style.position = "absolute";
                label.style.top = "-1.4em";
                label.style.left = "0";
                label.style.background = color;
                label.style.color = "white";
                label.style.fontSize = "10px";
                label.style.padding = "2px 4px";
                label.style.borderRadius = "4px";
                label.style.whiteSpace = "nowrap";

                wrapper.appendChild(caret);
                wrapper.appendChild(label);

                return wrapper;
              })
            );
          } else {
            // selection highlight
            decorations.push(
              Decoration.inline(from, to, {
                 style: `background-color: ${color}33`,
              })
            );
          }
        });

        return DecorationSet.create(state.doc, decorations);
      },
    },
  });
}

export default createCursorPlugin;
