import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

// import Editor from'ckeditor5-custom-build'

const TextEditor = ({ value, setValue }: { value: any; setValue: any }) => {
  const editorRef = useRef(null);
  const [editorLoaded, setEditorLoaded] = useState(false);
  const { CKEditor,Editor }: any = editorRef.current || {};

  // For Import Without SSR
  useEffect(() => {
    editorRef.current = {
      CKEditor: require('@ckeditor/ckeditor5-react').CKEditor, // v3+
      Editor: require('ckeditor5-custom-build'), // v3+
    } as any;
    setEditorLoaded(true);
  }, []);

  const editorConfiguration = {
    toolbar: [
      'heading',
      'bold',
      'italic',
      'underline',
      'alignment',
      'insertTable',
      'undo',
      'redo',
    ]
  };
  return editorLoaded ? (
    <CKEditor
      editor={Editor}
      data={value}
      onChange={(_, editor) => setValue(editor.getData())}
      config={editorConfiguration}

    />
  ) : null;
};

export default TextEditor;
