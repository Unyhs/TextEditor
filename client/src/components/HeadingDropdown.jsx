import React, { useEffect, useState } from "react";
import { useEditorState } from "@tiptap/react";

function HeadingDropdown({ editor}) {
  const [open, setOpen] = useState(false);

   if(!editor){
        return null
    }

  const getCurrentHeading = () => {
    if (editor.isActive("heading", { level: 1 })) return 1;
    if (editor.isActive("heading", { level: 2 })) return 2;
    if (editor.isActive("heading", { level: 3 })) return 3;
    return null;
  };

  const currentHeading = getCurrentHeading();

  const applyHeading = (level) => {
    editor.chain().focus().toggleHeading({ level }).run();
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
      >
        {currentHeading ? `H${currentHeading}` : "Normal  ▾"}
      </button>

      {open && (
        <div className="absolute mt-1 w-32 border bg-white shadow rounded z-10">
          {[1, 2, 3].map((level) => (
            <button
              key={level}
              className={`block w-full text-left px-2 py-1 hover:bg-gray-100 ${
                currentHeading === level ? "bg-gray-200" : ""
              }`}
              onClick={() => applyHeading(level)}
            >
              Heading {level}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default HeadingDropdown;