# Quill.Blazor

A wrapper who allow easy usage of the Quill editor in Blazor.

This wrapper do also allow for some custom handlers for toolbar.

## Getting Started

It is extreamly simple to get started.

1. Add the nuget-package to your project.
2. Add this to yuur site where you want the editor: `<QuillEditor></QuillEditor>`.

With only these two steps, you will get a basic editor with the default toolbar-options. No need to manually include css and javascript. The needed css and javascript is automatically loaded when needed.

## What is supported

### Setting "toolbarOptions"

One of the basic features is that you can change the toolbar to fit your needs.

This you do by setting the ToolbarOptions-parameter in the QuillEditor. This should be defined with lists and Dictionarys in the same way it is defined in javascript.

See QuillJS documentation to see what toolbar-buttons is built in.

#### Example

If you want to define what in javascript is this:

```javascript
[
  [{ 'font': [] }, { 'size': [] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'script': 'sub' }, { 'script': 'super' }],
  [{ 'header': 1 }, { 'header': 2 }, 'blockquote', 'code-block'],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
  [{ 'direction': 'rtl' }, { 'align': [] }],
  ['link', 'image', 'video'],
  ['clean']
];
```

You can write this in C#:

```csharp
new object[]
{
    new object[] { new Dictionary<string, object> { { "font", new object[] { } } }, new Dictionary<string, object> { { "size", new object[] { } } } },
    new object[] { "bold", "italic", "underline", "strike" },
    new object[] { new Dictionary<string, object> { { "color", new object[] { } } }, new Dictionary<string, object> { { "background", new object[] { } } } },
    new object[] { new Dictionary<string, object> { { "script", "sub" } }, new Dictionary<string, object> { { "script", "super" } } },
    new object[] { new Dictionary<string, object> { { "header", 1 } }, new Dictionary<string, object> { { "header", 2 } }, "blockquote", "code-block" },
    new object[] { new Dictionary<string, object> { { "list", "ordered" } }, new Dictionary<string, object> { { "list", "bullet" } }, new Dictionary<string, object> { { "indent", "-1" } }, new Dictionary<string, object> { { "indent", "+1" } } },
    new object[] { new Dictionary<string, object> { { "direction", "rtl" } }, new Dictionary<string, object> { { "align", new object[] { } } } },
    new object[] { "link", "image", "video" },
    new object[] { "clean" }
};
```

### History

The history-api in Quill is available by calling methods on the editor-object. To enable this you need to add a HistoryOptions-object to the parameter HistoryOptions.

The history-api us available through these methods:

- ClearHistory()
- CutoffHistory()
- UndoHistory()
- RedoHistory()

#### Custom toolbar-buttons

Quill do not have built in toolbar buttons for undo and redo. But we have added the custom toolbar-buttons `undo` and `redo`, which you can use if you want to have theese buttons in the toolbar.

These is available if you add the HistoryOptions-object to the editor.

### Add your own blots

One of the things this implementation of Quill for Blazor do that others lack, is allow you to define your own custom blots, which is building blocks that let you make custom functionality.

#### Embed

Currently, the only type that is implemented is the "Embed"-type. This let you add something that are recognized as one object, and can be set inline.

To create this you add a `IQuillToken` (either by creating an object of the basic `QillToken` or some other implementation). You then add it to the QuillEditor's parameter `CustomTokens`.

#### IQuillToken

The IQuillToken let youu define theese properties

- `Id`, which is the blots name, which you use to add it to toolbar and other references.
- `ToolbarButtonHtmlContent`, which let you write html-code as string to add what the button on the toolbar will look like (for example add an svg-node with svg-code).
- `OnToolbarButtonClicked`, which is an async Func. It is called when the Toolbar-button to create an instance of this token-type. The Func that let you return a response that contains what the initial value that is saved in the token is, and a `HtmlElement`, that defines how the `span` that is created as the visual representation should look like (mark that youu need to add the style `Display` with the value `inline-flex` if you want it to flow in the midle of a line correctly). If you for some reasson will not add a token to the text (for instance if the user abort some input you ask for), you can return null.
- `OnTokenClicked`, which is an async Func. It is called when the user clicks on an instance of the token type that has been added to the editor. This is thought of as creating the possibillity to let usser edit the contents of the element withhot needing to delete it and add a new one. The Func gets the current value of the clicked token, and let you update both the vale and how the token will look like in the editor.

### The general api.

Much of the api to do things in the editor is available. This includes both functions and some events.

### Themes

Both of the two officially supported themes (snow and bubble), is supported by just specify the wanted theme in the QillEditor (defalt is snow). This you can do without needing to specify any css, the needed css is atomatically loaded if needed. And while not tested, it should be able to support other themes if yo add the needed css-files manually.

# More specific documentation

Much of this wrapper has properties and methods that mirrors the features in the original javascript library as close as posssible (but with PascalCase instead of camelCase to use C#-annotation). This means that you will understand most of the available functionality by checking the documentation at [Quill's webpage](https://quilljs.com).

# Remarks

- The code has code to add syntax-module, but as syntax is not working according to multiple isses that is not resolved, it is commented out.