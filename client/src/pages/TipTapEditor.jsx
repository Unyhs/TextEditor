import React, { useEffect } from 'react'
import {useEditor,EditorContent, useEditorState, Extension} from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { FaBold,FaItalic,FaListOl,FaListUl,FaUnderline } from "react-icons/fa";
import HeadingDropdown from '../components/HeadingDropdown';
import { socket } from '../services/index';
import { useAuth } from '../hooks/AuthContext';
import { Step } from "prosemirror-transform";
import createCursorPlugin from '../components/createCursorPlugin.js';

function MenuBar({editor}) {
    if(!editor){
        return null
    }

    return (<div className="mb-2 gap-2">
        
        <fieldset
        disabled={!editor.isEditable} 
        className="inline-flex gap-2 border-none p-0 m-0">
          <HeadingDropdown editor={editor} />
          <button 
              onClick={()=>editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
          >
          <FaBold size={16} color='black' />
          </button>
          <button 
              onClick={()=>editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
          >
          <FaItalic size={16} color='black' />
          </button>
          <button
              onClick={()=>editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}>
              <FaUnderline size={16} color='black'/>
          </button>
          <button
              onClick={()=>editor.chain().focus().toggleBulletList().run()}
              disabled={!editor.can().chain().focus().toggleBulletList().run()}
          >
            <FaListUl size={16} color='black' />
          </button>
          <button
              onClick={()=>editor.chain().focus().toggleOrderedList().run()}
              disabled={!editor.can().chain().focus().toggleOrderedList().run()}
          >
            <FaListOl size={16} color='black' />
          </button>
        </fieldset>
       </div>)
}

function TipTapEditor({content,setContent,isAuthorizedToEdit,documentId,setActiveUsers,cursorsRef}) {
    const {user}=useAuth();
    const editor=useEditor({
        extensions:[StarterKit,Extension.create({ 
          addProseMirrorPlugins(){
            return [createCursorPlugin(cursorsRef)];
          }
        })],
        content:content,
        editable:isAuthorizedToEdit,
        onUpdate:({editor,transaction})=>{

            if(isAuthorizedToEdit && transaction.docChanged===false) return;

            if(transaction.getMeta("isRemote")) return;

            if (isAuthorizedToEdit) {
              const html=editor.getHTML()
              setContent(html)

              const steps = transaction.steps.map(step => step.toJSON());
              socket.emit("text-change", { steps });               
            }
        },
        onSelectionUpdate:({editor})=>{
          const { from, to } = editor.state.selection;
          socket.emit('cursor-update', { from, to, name: user.name,color:user.cursorColor });
        }
    })

    useEffect(() => {
        if (!documentId) return;
        
        socket.emit('join-document', documentId, (response) => {
            if (response.success) {
                setActiveUsers(response.activeUsers || []);
                console.log(`Joined room: ${response.docId}`);
            }
        });

        socket.on('text-change', (data) => {

          console.log('Received text-change:', data);

          if(!editor || !data.steps) return;

          const {state} = editor;
          let tr=state.tr;

          data.steps.forEach(stepJSON => {
              const step = Step.fromJSON(state.schema,stepJSON);
              tr = tr.step(step);
          });

          tr.setMeta("isRemote", true);
            
          editor.view.dispatch(tr);
        });
        
        socket.on('user-joined', (data) => {
            console.log(`User ${data.userId} has joined.`);
            setActiveUsers(prev => {
            if (!prev.includes(data.userId)) {
                return [...prev, data.userId];
            }
            return prev;
            });
        });

        socket.on('user-left', (data) => {
            console.log(`User ${data.userId} has left.`);
            setActiveUsers(prev=>prev.filter(u=>u!==data.userId));
        });

        socket.on('cursor-update', ({ userId, from, to,name,color }) => {
          cursorsRef.current.set(userId, { from,to,name,color });
          editor.view.dispatch(editor.state.tr);
        });
        
        return () => {
            socket.off('text-change');
            socket.off('user-joined');
            socket.off('user-left');
            socket.emit('leave-document');
            setActiveUsers(prev=>prev.filter(u=>u!==user.userId));
        };
    }, [documentId, isAuthorizedToEdit]); 

  return (
    <div className="border rounded min-h-[200px] p-2">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

export default TipTapEditor